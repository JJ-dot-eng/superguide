import assert from 'node:assert/strict';
import { enemies, weaponProfiles, unsupportedWeapons } from '../dist/combat-data.js';
import { calculateRoute, calculateMatchup, damagePerHit } from '../dist/combat.js';
import { resolveCombatCondition, combatConditionText, spearCannotLock } from '../dist/combat-conditions.js';
import { combatCount, combatSummary, combatAssumption, combatModeStats } from '../dist/combat-presentation.js';
import { renderCombatRoute, initCombat } from '../dist/combat-ui.js';
import { stratagems } from '../dist/data.js';
import { wikiIcons } from '../dist/wiki-icons.js';

const ids = ['arc-thrower', 'spear', 'one-true-flag', 'speargun', 'de-escalator', 'airburst-launcher'];
const raw = id => weaponProfiles[id].modes[0];
const selected = (id, hitCount, extra = {}) => resolveCombatCondition(raw(id), { hitCount, ...extra });
const enemy = id => enemies.find(item => item.id === id);
const route = (id, partId, mode) => calculateRoute(enemy(id), enemy(id).parts.find(item => item.id === partId), mode, { shieldCleared: true });
const stats = mode => [mode.standard, mode.durable, mode.ap, mode.explosion, mode.explosionAp];
assert.deepEqual(stats(raw('arc-thrower')), [250, 100, 7, 0, 0]);
assert.deepEqual(stats(raw('spear')), [4000, 4000, 7, 200, 3]);
assert.deepEqual(stats(raw('one-true-flag')), [200, 100, 3, 0, 0]);
assert.deepEqual(stats(raw('speargun')), [650, 275, 5, 0, 0]);
assert.deepEqual(stats(raw('de-escalator')), [100, 70, 4, 0, 0]);
assert.deepEqual(stats(raw('airburst-launcher')), [350, 350, 3, 150, 3]);
assert.deepEqual(stats(raw('airburst-launcher').bomblet), [150, 150, 3, 500, 3]);
assert.deepEqual([raw('spear').innerRadius, raw('spear').radius], [1.5, 3]);
assert.deepEqual([raw('airburst-launcher').innerRadius, raw('airburst-launcher').radius], [3, 5]);
assert.deepEqual([raw('airburst-launcher').bomblet.innerRadius, raw('airburst-launcher').bomblet.radius], [4, 6]);
assert.deepEqual(weaponProfiles['airburst-launcher'].modes.map(mode => mode.id), ['flak', 'cluster']);
for (const id of ids) {
  assert.equal(weaponProfiles[id].checkedAt, '2026-09-16');
  assert.equal(weaponProfiles[id].combatOnly, true, 'New combat profiles must not alter building calculations');
  assert.equal(new URL(weaponProfiles[id].source).hostname, 'helldivers.wiki.gg');
  assert(!unsupportedWeapons[id]);
}

// No guessed default of ten arcs or twenty-five bomblets. The user must choose
// an explicitly labelled scenario before a grenade/rocket count is displayed.
const original = JSON.stringify(weaponProfiles);
for (const id of ['de-escalator', 'airburst-launcher']) {
  for (const value of ['', null, -1, 1.5, 'abc', Infinity, 26]) {
    const mode = selected(id, value);
    assert(mode.conditionPending);
    assert.equal(route('charger', 'head', mode).hits, null);
    assert.equal(calculateMatchup(enemy('charger'), mode).best, null);
  }
  assert.equal(route('charger', 'head', raw(id)).outcome, 'unknown');
}
assert(selected('de-escalator', 0).conditionPending);
assert(selected('de-escalator', 11).conditionPending);
assert(!selected('de-escalator', 10).conditionPending);
assert(!selected('airburst-launcher', 25).conditionPending);
assert.equal(route('hulk', 'head', resolveCombatCondition(selected('de-escalator', 5), { hitCount: '' })).hits, null, 'Clearing a condition must discard previously resolved impacts');
assert.equal(JSON.stringify(weaponProfiles), original, 'Resolving a condition must not mutate source statistics');

assert.equal(route('charger', 'head', raw('arc-thrower')).hits, 9);
assert.equal(route('charger', 'head', raw('arc-thrower')).stages[0].damage.direct, 137);
assert.equal(route('warrior-hardened', 'head', raw('arc-thrower')).outcome, 'bleed');
assert.equal(route('charger', 'head', raw('one-true-flag')).outcome, 'blocked');
assert.equal(route('charger', 'butt', raw('one-true-flag')).outcome, 'bleed');
assert.equal(route('charger', 'head', raw('speargun')).hits, 4);
assert.deepEqual(route('charger', 'head', raw('speargun')).stages[0].damage, { direct: 368, explosion: 0, mainExplosion: 0 });
assert.match(weaponProfiles.speargun.note, /가스 영역 피해와 가스 지속 피해는 모두 제외/);
assert.equal(route('charger', 'head', raw('spear')).hits, 1);
assert.deepEqual(route('charger', 'head', raw('spear')).stages[0].damage, { direct: 4000, explosion: 0, mainExplosion: 0 });
assert(spearCannotLock(enemy('warrior-hardened'), raw('spear')));
assert(!spearCannotLock(enemy('charger'), raw('spear')));

// A synthetic part with explicit anatomy isolates rounding, transfer and armor
// from changes to a real enemy's Wiki entry.
const main = { hp: 10000, armor: 0, durability: 0, exdr: 0, constitution: 0 };
const part = { id: 'test', name: '시험 부위', hp: 1000, armor: 0, durability: 0, exdr: 0, toMain: 0, overflowCap: false, effect: 'kill', tip: '선택 부위' };
const fixture = (mode, overrides = {}, mainOverrides = {}) => calculateRoute({ main: { ...main, ...mainOverrides } }, { ...part, ...overrides }, mode);
const arc = raw('arc-thrower');
assert.deepEqual(damagePerHit(arc, { ...part, exdr: 100 }, main), damagePerHit(arc, part, main), 'Arc damage must ignore explosion resistance');
assert.equal(damagePerHit(arc, { ...part, armor: 7 }, main).direct, 162, 'Equal armor applies 65% and integer rounding');
assert.equal(damagePerHit(arc, { ...part, armor: 8 }, main).direct, 0);
assert.deepEqual(damagePerHit(raw('speargun'), { ...part, exdr: 100 }, main), damagePerHit(raw('speargun'), part, main));
assert.equal(fixture(selected('de-escalator', 1), { exdr: 100 }).stages[0].damage.direct, 100);
assert.equal(route('hulk', 'head', selected('de-escalator', 1)).hits, 5);
assert.equal(route('hulk', 'head', selected('de-escalator', 5)).hits, 1);
assert.equal(route('hulk', 'head', selected('de-escalator', 4)).hits, 2, 'Round 59 per arc, not after summing four raw arcs');
const fractional = fixture(selected('de-escalator', 10), { armor: 4, toMain: 1, effect: 'break' }, { hp: 5 });
assert.equal(fractional.outcome, 'break', '65 damage transfers floor(0.65)=0 per arc, not floor(650*1%)=6');
assert.equal(fractional.hits, 2);
assert.equal(fixture(selected('de-escalator', 2), { hp: 100, armor: 4, toMain: 200, overflowCap: true, effect: 'break' }, { hp: 150 }).outcome, 'break', 'Arcs share one part transfer cap');

let mode = selected('airburst-launcher', 2);
let result = fixture(mode, { hp: 9999, armor: 3, exdr: 50, toMain: 33 }, { hp: 122 });
assert.equal(result.stages[0].damage.explosion, 372);
assert.equal(result.hits, 2, 'Main transfer rounds each explosion: 15 + 53 + 53, not 122');
assert.equal(result.via, 'main');
mode = selected('airburst-launcher', 2, { primaryHit: 'direct', bombletDirect: true });
assert.deepEqual(fixture(mode).stages[0].damage, { direct: 650, explosion: 1150, mainExplosion: 0 });
mode = selected('airburst-launcher', 1, { primaryHit: 'none' });
assert.deepEqual(fixture(mode).stages[0].damage, { direct: 0, explosion: 500, mainExplosion: 0 }, 'Bomblet-only hits must not gain rocket damage');
assert.equal(fixture(selected('airburst-launcher', 0, { primaryHit: 'none' })).outcome, 'blocked');
assert.deepEqual(fixture(selected('airburst-launcher', 2), { exdr: 100 }).stages[0].damage, { direct: 0, explosion: 0, mainExplosion: 1150 }, 'Each blast redirects to Main once, not into the immune limb');
assert.equal(fixture(selected('airburst-launcher', 2), { exdr: 100 }, { armor: 4 }).outcome, 'blocked');
assert.equal(fixture(selected('airburst-launcher', 1), { hp: 100, toMain: 100, effect: 'break' }, { hp: 200 }).outcome, 'break', 'Remaining bomblets cannot continue hitting an unverified destroyed hitbox');
const ranged = calculateRoute({ main }, part, selected('airburst-launcher', 1), { blastDistance: 4.5 });
assert.equal(ranged.stages[0].damage.explosion, 412, 'Main and bomblet blasts use their own falloff radii');
const plating = { hp: 65, armor: 4, effect: 'armor', next: { ...part, id: 'flesh', hp: 100 } };
assert.equal(fixture(selected('de-escalator', 1), plating).hits, 2);
result = fixture(selected('de-escalator', 2), plating);
assert.equal(result.hits, null);
assert.match(result.reason, /장갑 파괴 후 같은 발/);
const unverified = selected('airburst-launcher', 1);
unverified.impactEvents[1].attack = { ...unverified.impactEvents[1].attack, explosionDurable: null };
assert.equal(fixture(unverified).outcome, 'unknown');

let cards = 0;
for (const id of ids) for (const baseMode of weaponProfiles[id].modes) for (const targetEnemy of enemies) {
  const mode = resolveCombatCondition(baseMode, { hitCount: 1 });
  const matchup = calculateMatchup(targetEnemy, mode, { shieldCleared: true });
  assert.match(combatAssumption(mode), /이론값/);
  assert.match(combatAssumption(mode), /실제 최소 처치 횟수나 최대 탄수를 보장하지 않습니다/);
  for (const row of matchup.rows) {
    const html = renderCombatRoute(row, targetEnemy, mode);
    assert.doesNotMatch(html, /undefined|NaN/);
    if (row.hits) assert.match(html, /(?:발|회) 이상/);
    if (id === 'one-true-flag') assert.doesNotMatch(html, /\d+발|<span>발|한 발 피해/);
    cards++;
  }
  if (targetEnemy.shield) assert(calculateMatchup(targetEnemy, mode).rows.every(row => row.outcome === 'shield' && row.hits === null));
}
assert.equal(combatCount(2, raw('spear')), '2발 이상');
assert.equal(combatCount(2, raw('one-true-flag')), '2회 이상');
assert.equal(combatCount(2, weaponProfiles.autocannon.modes[0]), '2발');
assert.equal(combatCount(2, weaponProfiles['c4-pack'].modes[0]), '2개');
assert.match(combatModeStats(raw('de-escalator')).join(' '), /전격 1회 일반 피해 100/);
assert.match(combatSummary(enemy('charger'), raw('spear'), calculateMatchup(enemy('charger'), raw('spear'))).title, /1발 이상 · 머리 착탄 시 · 처치/);
assert.match(combatConditionText(selected('airburst-launcher', 1, { primaryHit: 'none' })), /주탄 피해 제외/);

// Exercise real rendering and event handlers without browser automation.
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
  for (const id of ids) assert(control('#combat-weapon').innerHTML.includes(`value="${id}"`));
  choose('#combat-weapon', 'arc-thrower');
  assert.equal(control('#combat-hit-conditions').hidden, true);
  assert.match(control('#combat-routes').innerHTML, /9<\/strong><span>발 이상 · 머리 타격 시/);
  choose('#combat-weapon', 'de-escalator');
  assert.equal(control('#combat-hit-conditions').hidden, false);
  assert.equal(control('#combat-primary-control').hidden, true);
  assert.match(control('#combat-answer').innerHTML, /명중 조건을 선택/);
  assert.doesNotMatch(control('#combat-routes').innerHTML, /<strong>\d+<\/strong><span>발/);
  choose('#combat-impact-count', '1');
  const singleHtml = control('#combat-routes').innerHTML;
  choose('#combat-impact-count', '5');
  assert.notEqual(control('#combat-routes').innerHTML, singleHtml);
  assert.match(control('#combat-condition-note').textContent, /전격 5회 명중 가정/);
  choose('#combat-enemy', 'hulk');
  assert.equal(control('#combat-impact-count').value, '', 'A new enemy must not inherit an unreviewed hit-count assumption');
  choose('#combat-weapon', 'airburst-launcher');
  assert.equal(control('#combat-primary-control').hidden, false);
  choose('#combat-impact-count', '2');
  choose('#combat-primary-hit', 'none');
  assert.match(control('#combat-condition-note').textContent, /주탄 피해 제외 · 자탄 2개/);
  control('#combat-bomblet-direct').checked = true;
  control('#combat-bomblet-direct').handlers.change({ target: control('#combat-bomblet-direct') });
  assert.match(control('#combat-condition-note').textContent, /직격과 폭발/);
  choose('#combat-impact-count', '0');
  assert.equal(control('#combat-bomblet-direct').checked, false);
  assert.equal(control('#combat-bomblet-direct').disabled, true);
  choose('#combat-mode', 'cluster');
  assert.equal(control('#combat-impact-count').value, '');
  assert.equal(control('#combat-primary-hit').value, 'blast');
  choose('#combat-weapon', 'one-true-flag');
  assert.equal(control('#combat-hit-conditions').hidden, true);
  assert.match(control('#combat-routes').innerHTML, /회 이상/);
  api.openWeapon('speargun');
  assert.equal(control('#combat-weapon').value, 'speargun');
  assert.match(control('#combat-loadout').innerHTML, /가스 피해 제외/);
  assert.match(control('#combat-sources').innerHTML, /S-11_Speargun/);
  assert.match(control('#combat-sources').innerHTML, /2026-09-16/);
  choose('#combat-weapon', 'spear');
  choose('#combat-enemy', 'warrior-hardened');
  assert.match(control('#combat-answer').innerHTML, /직접 락온 불가/);
  choose('#combat-weapon', 'c4-pack');
  assert.match(control('#combat-routes').innerHTML, /개 · 이론값/);
  choose('#combat-weapon', 'autocannon');
  assert.equal(control('#combat-mode').value, 'aphet');
  assert.doesNotMatch(control('#combat-routes').innerHTML, /발 이상/);
} finally {
  if (savedDocument === undefined) delete globalThis.document;
  else globalThis.document = savedDocument;
}
console.log(`PASS: 6 conditional weapons, source values, per-event rounding/transfer, selected hit counts, armor transitions, shield/lock conditions, melee units, gas exclusion, UI events and ${cards} result cards.`);
