import assert from 'node:assert/strict';
import { enemies, weaponProfiles } from '../dist/combat-data.js';
import { stratagems } from '../dist/data.js';
import { wikiIcons } from '../dist/wiki-icons.js';
import { calculateMatchup, calculateRoute, damagePerHit } from '../dist/combat.js';
import { combatAssumption, combatModeStats, combatRouteNotes, combatSummary } from '../dist/combat-presentation.js';
import { initCombat, renderCombatRoute } from '../dist/combat-ui.js';

// Wiki page revision 134789: 2,600 DPS, ~1.4 s, max 3,640 per burst,
// 40% damage falloff at 15 m, no ignition. Attack data revision 134890:
// normal/durable 2,600/2,600, AP 7. No guessed intermediate falloff curve.
const profile = weaponProfiles.meltagun;
const [near, far] = profile.modes;
assert.equal(profile.combatOnly, true);
assert.equal(profile.checkedAt, '2026-09-16');
assert.equal(profile.sourceRevision, 134789);
assert.equal(profile.damageRevision, 134890);
assert.match(profile.source, /40-K_Meltagun$/);
assert.match(profile.extraSource, /weapons_data.json$/);
assert.deepEqual(profile.modes.map(mode => [mode.id, mode.standard, mode.durable, mode.ap, mode.explosion, mode.range]), [
  ['near', 3640, 3640, 7, 0, 15], ['max-range', 2184, 2184, 7, 0, 15],
]);
for (const mode of profile.modes) {
  assert.equal(mode.beam.duration, 1.4);
  assert.equal(mode.standard, Math.round(mode.beam.standardPerSecond * mode.beam.duration));
  assert.equal(mode.durable, Math.round(mode.beam.durablePerSecond * mode.beam.duration));
  assert.equal(mode.conditionalImpact, true);
}
const item = stratagems.find(item => item.id === 'meltagun');
assert.equal(item.name, '멜타건');
assert.deepEqual([item.direct, item.splash, item.ap, item.range, item.damageKind], [2600, 0, 7, 15, 'dps']);
assert.match(item.notes, /3,640/);
assert.match(item.notes, /2,184/);
assert.match(item.rangeNote, /자료 미확인/);

const main = { hp: 10000, armor: 0, durability: 0, exdr: 0, constitution: 0 };
const part = { id: 'test', name: '시험 부위', hp: 2700, armor: 0, durability: 0, exdr: 0, toMain: 0, overflowCap: false, effect: 'kill', tip: '같은 부위' };
const fixture = (mode = near, overrides = {}, mainOverrides = {}) => calculateRoute({ main: { ...main, ...mainOverrides } }, { ...part, ...overrides }, mode);
const close = (actual, expected) => assert(Math.abs(actual - expected) < 1e-8, `${actual} differs from ${expected}`);
assert.equal(fixture().hits, 1, 'DPS 2,600 must not be treated as total damage per burst');
assert.equal(fixture(far).hits, 2, 'Range-end damage must use 60%, not full damage');
assert.equal(fixture(near, { hp: 3640 }).hits, 1);
assert.equal(fixture(near, { hp: 3641 }).hits, 2);
assert.equal(fixture(near, { armor: 8 }).outcome, 'blocked');
assert.equal(fixture(near, { armor: 7 }).stages[0].damage.direct, 2366);
assert.equal(fixture(far, { armor: 7 }).stages[0].damage.direct, 1419);
assert.deepEqual(damagePerHit(near, { ...part, exdr: 100 }, main), damagePerHit(near, part, main), 'A beam does not use explosion resistance or redirect damage');
const mixedBeam = { ...near, standard: 1400, durable: 700, beam: { duration: 1.4, standardPerSecond: 1000, durablePerSecond: 500 } };
assert.equal(fixture(mixedBeam, { durability: 50 }).stages[0].damage.direct, 1050);

let result = fixture(near, { hp: 3000, toMain: 50, effect: 'break' }, { hp: 1000, armor: 10 });
assert.equal(result.outcome, 'kill');
assert.equal(result.via, 'main');
close(result.stages[0].appliedDirect, 2000);
close(result.stages[0].mainTransfer, 1000);
assert(Math.abs(result.stages[0].contactSeconds - 2000 / 2600) < 1e-9);
result = fixture(near, { hp: 1000, toMain: 200, overflowCap: true, effect: 'break' }, { hp: 1500 });
assert.equal(result.outcome, 'break', 'A full burst cannot bypass the shared transfer cap');
assert.equal(result.stages[0].mainTransfer, 1000);
assert.equal(fixture(near, { hp: 1000, toMain: 200, effect: 'break' }, { hp: 1500 }).via, 'main');
result = fixture(near, { hp: 100, toMain: 100, effect: 'break' }, { hp: 1500 });
assert.equal(result.outcome, 'break', 'Unused beam damage must not kill Main through a destroyed hitbox');
close(result.stages[0].appliedDirect, 100);
close(result.stages[0].mainTransfer, 100);
assert.equal(fixture(near, { hp: 100, effect: 'bleed', constitution: 200 }).outcome, 'bleed', 'A continuous beam first reaches bleed onset, not instant overkill');
assert.equal(fixture(near, { hp: 3000, toMain: 100, effect: 'break' }, { hp: 1000, constitution: 200 }).outcome, 'bleed');
assert.equal(fixture(near, { hp: 1000, toMain: 100, effect: 'kill' }, { hp: 1000, constitution: 200 }).outcome, 'kill', 'Fatal destruction bypasses Main constitution');
assert.equal(fixture(near, { hp: 4000, isolated: true, toMain: 100 }, { hp: 100 }).hits, 2);
result = calculateRoute({ main }, { ...part, toMain: 100, main: { ...main, hp: 500 } }, near);
assert.equal(result.via, 'main');
close(result.stages[0].mainTransfer, 500);
result = fixture(near, { hp: 800, effect: 'armor', next: { ...part, hp: 800 } });
assert.equal(result.outcome, 'armor');
assert.equal(result.stages.length, 1);
assert.match(result.reason, /최종 처치 탄수는 계산 보류/);
assert(combatRouteNotes(result, near).some(note => note.includes('자료 미확인')));
assert.equal(fixture({ ...near, beam: { ...near.beam, duration: null } }).outcome, 'unknown');
assert.equal(fixture({ ...near, durable: null }, { durability: 100 }).outcome, 'unknown');
assert.equal(calculateRoute({ main }, part, near, { directHit: false }).outcome, 'blocked');

let cards = 0;
for (const enemy of enemies) for (const mode of profile.modes) {
  const matchup = calculateMatchup(enemy, mode, { shieldCleared: true });
  if (enemy.shield) assert(calculateMatchup(enemy, mode).rows.filter(row => !enemy.shield.partial || row.target.requiresShieldClear).every(row => row.outcome === 'shield' && row.hits === null));
  for (const row of matchup.rows) {
    const html = renderCombatRoute(row, enemy, mode);
    assert.doesNotMatch(html, /undefined|NaN|폭발 중심 3m/);
    assert.match(html, /조준 유지 부위/);
    if (row.hits) assert.match(html, /발 이상/);
    if (row.target.next && row.outcome === 'armor') assert.match(html, /최종 처치 탄수는 계산 보류/);
    cards++;
  }
}
assert.match(combatAssumption(near), /1.4초/);
assert.match(combatAssumption(near), /실제 최소 처치 탄수를 보장하지 않습니다/);
assert.match(combatModeStats(near).join(' '), /초당 일반 피해 2,600.*한 발 최대 일반·내구 피해 3,640/);
assert.match(combatModeStats(far).join(' '), /초당 일반 피해 1,560.*한 발 최대 일반·내구 피해 2,184/);
const charger = enemies.find(enemy => enemy.id === 'charger');
assert.match(combatSummary(charger, near, calculateMatchup(charger, near)).title, /1발 이상 · 머리 조준 유지 시 · 처치/);

// Real event handlers and renderer, without browser automation.
const controls = new Map();
class Control {
  value = ''; handlers = {}; html = ''; dataset = {}; checked = false;
  set innerHTML(value) { this.html = value; const first = value.match(/<option value="([^"]*)"/); if (first) this.value = first[1]; }
  get innerHTML() { return this.html; }
  addEventListener(name, callback) { this.handlers[name] = callback; }
  focus() {}
}
const control = id => { if (!controls.has(id)) controls.set(id, new Control()); return controls.get(id); };
const savedDocument = globalThis.document;
try {
  globalThis.document = { querySelector: control };
  const api = initCombat({ stratagems, wikiIcons, navigate() {} });
  const choose = (id, value) => { control(id).value = value; control(id).handlers.change({ target: control(id) }); };
  api.openWeapon('meltagun');
  assert.equal(control('#combat-mode-label').textContent, '거리별 피해 기준');
  assert.equal(control('#combat-mode').value, 'near');
  assert.equal(control('#combat-mode').disabled, false);
  assert.equal(control('#combat-hit-conditions').hidden, true);
  assert.match(control('#combat-loadout').innerHTML, /3,640/);
  assert.match(control('#combat-loadout').innerHTML, /meltagun-stratagem-icon-background.svg/);
  assert.match(control('#combat-sources').innerHTML, /40-K_Meltagun/);
  assert.match(control('#combat-sources').innerHTML, /2026-09-16/);
  choose('#combat-mode', 'max-range');
  assert.match(control('#combat-loadout').innerHTML, /2,184/);
  assert.doesNotMatch(control('#combat-loadout').innerHTML, /3,640/);
  choose('#combat-enemy', 'harvester');
  assert.doesNotMatch(control('#combat-routes').innerHTML, /<strong>\d+<\/strong><span>발/);
  control('#combat-shield-cleared').handlers.change({ target: { checked: true } });
  assert.match(control('#combat-routes').innerHTML, /발 이상/);
  choose('#combat-weapon', 'autocannon');
  assert.equal(control('#combat-mode-label').textContent, '발사·기폭 방식');
  assert.equal(control('#combat-mode').value, 'aphet');
} finally {
  if (savedDocument === undefined) delete globalThis.document;
  else globalThis.document = savedDocument;
}
console.log(`PASS: Meltagun DPS/burst units, range conditions, armor, continuous transfer caps, destruction/bleed stops, shields, UI events and ${cards} result cards.`);
