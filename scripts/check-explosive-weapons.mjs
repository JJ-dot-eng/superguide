import assert from 'node:assert/strict';
import { enemies, weaponProfiles } from '../dist/combat-data.js';
import { damageBreakdown, damagePerHit, calculateRoute, calculateMatchup, explosionComponents } from '../dist/combat.js';
import { combatTerms, combatCount, combatOutcome, combatAssumption, combatModeStats, combatShieldNotice, combatSummary } from '../dist/combat-presentation.js';
import { renderCombatRoute, initCombat } from '../dist/combat-ui.js';
import { stratagems } from '../dist/data.js';
import { wikiIcons } from '../dist/wiki-icons.js';
import { demolitionProfiles } from '../dist/demolition-data.js';

const mode = (id, modeId) => weaponProfiles[id].modes.find(item => !modeId || item.id === modeId);
const enemy = id => enemies.find(item => item.id === id);
const route = (enemyId, partId, firingMode) => calculateRoute(enemy(enemyId), enemy(enemyId).parts.find(part => part.id === partId), firingMode, { shieldCleared: true });
const ids = ['grenade-launcher', 'belt-fed-gl', 'breaching-hammer', 'leveller', 'epoch', 'expendable-napalm', 'solo-silo'];
assert.equal(Object.keys(demolitionProfiles).length, 59, 'Combat-only profiles must not expand demolition calculation scope');
assert.equal(demolitionProfiles['expendable-napalm'], undefined, 'Do not silently infer building damage from newly reviewed combat damage');

// Reviewed individual Wiki weapon tables: direct normal/durable/AP, then
// explosion normal/durable/AP and inner/outer radius. Zero is intentional.
for (const [id, modeId, values] of [
  ['grenade-launcher', 'standard', [0, 0, 4, 400, 400, 3, 3.5, 7.5]],
  ['belt-fed-gl', 'standard', [0, 0, 4, 150, 150, 4, 2, 4]],
  ['breaching-hammer', 'explosive', [300, 150, 3, 2200, 2200, 6, 0.5, 3]],
  ['leveller', 'standard', [1000, 1000, 6, 2500, 2500, 6, 10, 25]],
  ['epoch', 'standard', [400, 200, 4, 500, 500, 4, 2.3, 3]],
  ['epoch', 'charged', [800, 400, 5, 800, 800, 5, 3, 4]],
  ['expendable-napalm', 'standard', [500, 500, 3, 250, 250, 6, 1.6, 8]],
]) {
  const shot = mode(id, modeId);
  assert.deepEqual(['standard', 'durable', 'ap', 'explosion', 'explosionDurable', 'explosionAp', 'innerRadius', 'radius'].map(key => shot[key]), values, `${id}/${modeId}: Wiki values`);
  const catalog = stratagems.find(item => item.id === id);
  if (modeId !== 'charged') {
    assert.equal(shot.standard, catalog.direct);
    assert.equal(shot.explosion, catalog.splash);
    assert.equal(shot.explosionAp, catalog.splashAp);
    if (catalog.innerRadius != null) assert.equal(shot.innerRadius, catalog.innerRadius);
    if (catalog.radius != null) assert.equal(shot.radius, catalog.radius);
  }
}
for (const id of ids) {
  assert.equal(weaponProfiles[id].source, stratagems.find(item => item.id === id).source);
  assert.equal(weaponProfiles[id].checkedAt, '2026-09-16');
  assert(weaponProfiles[id].modes.every(item => item.reviewedExplosive && !item.unsupported));
}
const gl = mode('grenade-launcher'), belt = mode('belt-fed-gl');
const melee = mode('breaching-hammer', 'melee'), hammer = mode('breaching-hammer', 'explosive');
const ordinary = mode('epoch', 'standard'), charged = mode('epoch', 'charged');
const napalm = mode('expendable-napalm'), silo = mode('solo-silo');
assert.deepEqual([melee.standard, melee.durable, melee.ap, melee.explosion], [300, 150, 3, 0]);
assert.deepEqual(weaponProfiles.epoch.modes.map(item => item.id), ['standard', 'charged'], 'Self-destruction must not be selectable');
assert.equal(silo.directKind, 'none', 'Wiki lists two explosion attacks, no kinetic projectile attack');
assert.equal(silo.standard, 0);
assert.deepEqual(silo.explosions.map(item => [item.standard, item.durable, item.ap, item.innerRadius, item.radius]), [[1500, 1500, 9, 3, 6], [2500, 2500, 7, 10, 25]]);
assert.equal(explosionComponents(napalm).length, 1, 'Do not add an assumed number of submunitions or fire ticks');
assert.match(weaponProfiles['expendable-napalm'].note, /주탄 기준·자탄과 화염 제외/);
assert.match(weaponProfiles['expendable-napalm'].note, /50 \/ AP 3/);
assert.match(weaponProfiles['expendable-napalm'].note, /자료 미확인/);

const main = { hp: 10000, armor: 8, durability: 100, exdr: 50, constitution: 0 };
const fixture = { main, parts: [] };
const limb = { id: 'limb', name: '부위', hp: 1000, armor: 3, durability: 0, exdr: 50, toMain: 25, overflowCap: false, effect: 'break' };
assert.deepEqual(damagePerHit(gl, limb, main), { direct: 0, explosion: 130, mainExplosion: 0 }, 'AP 3 vs AV 3 gives 65%, then 50% explosion resistance');
assert.equal(damagePerHit(gl, { ...limb, armor: 4 }, main).explosion, 0, 'Projectile AP 4 must not be used as the grenade explosion AP');
assert.equal(damagePerHit(belt, { ...limb, armor: 4 }, main).explosion, 48, 'Belt-fed blast has AP 4');
assert.equal(damagePerHit(gl, { ...limb, armor: 2, durability: 100 }, main).explosion, 200, 'Explosions always use durable damage');
assert.equal(damagePerHit({ ...gl, explosionDurable: 100 }, { ...limb, armor: 2, durability: 0 }, main).explosion, 50, 'Normal blast damage must not replace explicit durable damage');
assert.equal(damagePerHit(ordinary, { ...limb, armor: 4, durability: 75 }, main).direct, 162);
assert.equal(damagePerHit(charged, { ...limb, armor: 4, durability: 75 }, main).direct, 500);
assert.equal(damagePerHit(ordinary, { ...limb, armor: 5 }, main).explosion, 0);
assert.equal(damagePerHit(charged, { ...limb, armor: 5 }, main).explosion, 260);
assert.deepEqual(damagePerHit(napalm, { ...limb, armor: 0, exdr: 0 }, main), { direct: 500, explosion: 250, mainExplosion: 0 });
assert.deepEqual(damagePerHit(napalm, { ...limb, armor: 4, exdr: 0 }, main), { direct: 0, explosion: 250, mainExplosion: 0 }, 'Napalm projectile and main blast must use different AP');

// Apply each explosion's AP/resistance/rounding before adding damage.
let breakdown = damageBreakdown(silo, { ...limb, armor: 8 }, main);
assert.deepEqual(breakdown.explosions.map(blast => blast.partDamage), [750, 0]);
assert.equal(breakdown.damage.explosion, 750, 'AP 7 main blast cannot borrow AP 9 from the impact explosion');
breakdown = damageBreakdown(silo, { ...limb, armor: 7 }, main);
assert.deepEqual(breakdown.explosions.map(blast => blast.partDamage), [750, 812]);
assert.equal(breakdown.damage.explosion, 1562, 'Equal armor applies only to the AP 7 component');
assert.deepEqual(damagePerHit(silo, { ...limb, armor: 9 }, main), { direct: 0, explosion: 487, mainExplosion: 0 });
const immune = { ...limb, armor: 0, exdr: 100 };
breakdown = damageBreakdown(silo, immune, main);
assert.deepEqual(breakdown.explosions.map(blast => [blast.partDamage, blast.mainDamage]), [[0, 750], [0, 0]]);
assert.deepEqual(breakdown.damage, { direct: 0, explosion: 0, mainExplosion: 750 }, 'An immune limb redirects each blast once against Main AV/ExDR');
assert.equal(calculateRoute(fixture, immune, silo).via, 'main');
assert.equal(calculateRoute(fixture, immune, gl).outcome, 'blocked');
assert.equal(damagePerHit(silo, immune, { ...main, exdr: 100 }).mainExplosion, 0);

// Different inner/outer radii, falloff and outer AP must stay independent.
const unarmored = { ...limb, armor: 0, exdr: 0 };
for (const [distance, amounts] of [[0, [1500, 2500]], [3, [1500, 2500]], [4, [1000, 2500]], [6, [0, 2500]], [10, [0, 2500]], [17.5, [0, 1250]], [25, [0, 0]]]) {
  const parts = damageBreakdown(silo, unarmored, main, { blastDistance: distance }).explosions;
  assert.deepEqual(parts.map(blast => blast.partDamage), amounts, `Explosion distance ${distance}m`);
}
breakdown = damageBreakdown(silo, { ...unarmored, armor: 8 }, main, { blastDistance: 4 });
assert.deepEqual(breakdown.explosions.map(blast => [blast.effectiveAp, blast.partDamage]), [[8, 650], [7, 0]]);
assert.equal(damagePerHit(silo, { ...unarmored, armor: 7 }, main, { blastDistance: 17.5 }).explosion, 0);

const tinyPart = { ...unarmored, hp: 100, toMain: 150, overflowCap: true };
const weakMain = { main: { ...main, hp: 1000, armor: 10, exdr: 100 }, parts: [] };
assert.equal(calculateRoute(weakMain, tinyPart, silo).outcome, 'break', 'Both blasts share one cumulative transfer cap for this part');
assert.equal(calculateRoute(weakMain, { ...tinyPart, overflowCap: false }, silo).outcome, 'kill', 'Uncapped part transfer ignores Main armor/resistance');
assert.equal(calculateRoute(weakMain, { ...tinyPart, effect: 'kill' }, silo).via, 'part');
const armor = { ...unarmored, name: '장갑', hp: 800, armor: 4, toMain: 0, effect: 'armor', next: { ...unarmored, name: '살점', hp: 800, toMain: 0, effect: 'kill' } };
assert.deepEqual(calculateRoute(fixture, armor, silo).stages.map(stage => stage.hits), [1, 1], 'Do not invent a same-missile second blast into newly exposed flesh');
const isolated = { ...tinyPart, isolated: true, prerequisite: '장갑 제거 후', overflowCap: false };
assert.equal(calculateRoute(weakMain, isolated, silo).outcome, 'break', 'Unknown previous Main damage cannot be invented for exposed parts');
assert.equal(calculateRoute(weakMain, isolated, silo).conditional, true);
const bleeding = { main: { ...main, hp: 3500, armor: 0, exdr: 0, constitution: 1000 } };
assert.equal(calculateRoute(bleeding, immune, silo).outcome, 'bleed', 'Main constitution distinguishes bleed from immediate death');

assert.equal(route('charger', 'head', gl).outcome, 'blocked');
assert.equal(route('charger', 'butt', gl).hits, 4);
assert.equal(route('charger', 'butt', gl).outcome, 'bleed');
assert.equal(route('charger', 'head', belt).hits, 17);
assert.equal(route('charger', 'head', melee).outcome, 'blocked');
assert.equal(route('charger', 'head', hammer).hits, 1);
assert.equal(route('charger', 'head', ordinary).hits, 3);
assert.equal(route('charger', 'head', charged).hits, 2);
assert.equal(route('bile-titan', 'sac', silo).outcome, 'break');
assert.equal(route('hulk', 'head', silo).via, 'main');
assert.equal(route('hulk', 'head', silo).stages[0].damage.explosion, 0);

// Unknown values block only dependent results, preserving known components.
const incomplete = { ...gl, explosionDurable: null };
assert.equal(calculateRoute(fixture, limb, incomplete).outcome, 'unknown');
assert.equal(calculateRoute(fixture, { ...limb, armor: 4 }, incomplete).outcome, 'blocked', 'Insufficient AP is conclusive even if blast damage is unverified');
const partlyKnown = { ...silo, explosions: silo.explosions.map(blast => blast.id === 'main' ? { ...blast, durable: null } : blast) };
assert.deepEqual(damageBreakdown(partlyKnown, unarmored, main).explosions.map(blast => blast.partDamage), [1500, null]);
assert.equal(calculateRoute(fixture, unarmored, partlyKnown).hits, null);
assert.equal(calculateRoute(fixture, { ...unarmored, armor: 8 }, partlyKnown).hits, 1, 'Unknown nonpenetrating component must not disable verified impact damage');
const unknownDirect = { ...ordinary, durable: null };
assert.deepEqual(damagePerHit(unknownDirect, { ...unarmored, durability: 50 }, main), { direct: null, explosion: 500, mainExplosion: 0 });
assert.equal(damagePerHit(unknownDirect, unarmored, main).direct, 400, 'A 0% durable target does not depend on unverified durable damage');
assert.equal(damageBreakdown({ ...gl, innerRadius: null }, unarmored, main, { blastDistance: 1 }).damage.explosion, null);
const incompleteRow = route('charger', 'butt', partlyKnown);
const incompleteHtml = renderCombatRoute(incompleteRow, enemy('charger'), partlyKnown);
assert.match(incompleteHtml, /자료 미확인/);
assert.match(incompleteHtml, /부위 폭발 1,125/);
assert.doesNotMatch(incompleteHtml, /NaN|undefined/);

for (const enemyId of ['harvester', 'overseer', 'heavy-devastator']) for (const id of ids) for (const shot of weaponProfiles[id].modes) {
  const selected = enemy(enemyId);
  const gated = calculateMatchup(selected, shot);
  assert.equal(gated.best, null);
  assert(gated.rows.every(row => row.outcome === 'shield' && row.hits === null));
  assert.match(combatShieldNotice(selected, shot).note, /제거|우회/);
  assert(calculateMatchup(selected, shot, { shieldCleared: true }).rows.every(row => row.outcome !== 'shield'));
}
assert.equal(combatCount(2, melee), '2회');
assert.equal(combatCount(2, hammer), '2회');
assert.equal(combatCount(2, gl), '2발');
assert.equal(combatOutcome('bleed', gl), '출혈 유발');
assert.match(combatModeStats(silo).join(' '), /충돌 폭발 일반 피해 1,500/);
assert.match(combatModeStats(silo).join(' '), /주폭발 일반 피해 2,500/);
let cards = 0;
for (const selected of enemies) for (const id of ids) for (const shot of weaponProfiles[id].modes) {
  const result = calculateMatchup(selected, shot, { shieldCleared: true });
  const summary = combatSummary(selected, shot, result, { shieldCleared: true });
  if (explosionComponents(shot).length) assert.match(combatAssumption(shot), /최대 폭발 피해가 들어가는 조건의 이론값/);
  if (result.best) assert.match(summary.title, result.best.lowerBound ? /이상/ : /이론값/);
  for (const row of result.rows) {
    const html = renderCombatRoute(row, selected, shot);
    assert.doesNotMatch(html, /undefined|NaN/);
    if (row.hits) assert(html.includes(`<span>${combatTerms(shot).unit}${row.lowerBound ? ' 이상 · 재생 제외' : ' · 이론값'}`));
    if (id === 'breaching-hammer') assert.doesNotMatch(html, /<span>발|한 발|\d+발|탄수/);
    if (id === 'solo-silo' && row.stages.length) { assert.match(html, /충돌 폭발:/); assert.match(html, /주폭발:/); }
    cards++;
  }
}

// Exercise the actual UI event wiring with small in-memory controls. No browser
// or live user page is needed to check weapon/mode selection and stale results.
const controls = new Map();
class Control {
  value = ''; handlers = {}; html = '';
  set innerHTML(value) { this.html = value; const first = value.match(/<option value="([^"]*)"/); if (first) this.value = first[1]; }
  get innerHTML() { return this.html; }
  dataset = {};
  addEventListener(name, callback) { this.handlers[name] = callback; }
  focus() {}
}
const control = id => { if (!controls.has(id)) controls.set(id, new Control()); return controls.get(id); };
const savedDocument = globalThis.document;
try {
  globalThis.document = { querySelector: control };
  initCombat({ stratagems, wikiIcons, navigate() {} });
  for (const id of ids) assert(control('#combat-weapon').innerHTML.includes(`value="${id}"`));
  const choose = (id, value) => { control(id).value = value; control(id).handlers.change({ target: control(id) }); };
  choose('#combat-weapon', 'epoch');
  assert.equal(control('#combat-mode').value, 'standard');
  assert.match(control('#combat-routes').innerHTML, /<strong>3<\/strong><span>발/);
  const standardHtml = control('#combat-routes').innerHTML;
  choose('#combat-mode', 'charged');
  assert.match(control('#combat-loadout').innerHTML, /완전 충전 발사/);
  assert.notEqual(control('#combat-routes').innerHTML, standardHtml);
  assert.match(control('#combat-routes').innerHTML, /<strong>2<\/strong><span>발/);
  choose('#combat-mode', 'standard');
  assert.equal(control('#combat-routes').innerHTML, standardHtml);
  choose('#combat-weapon', 'breaching-hammer');
  assert.equal(control('#combat-mode').value, 'melee', 'Changing weapons resets incompatible mode IDs');
  assert.match(control('#combat-routes').innerHTML, /관통·피해 조건 미충족/);
  choose('#combat-mode', 'explosive');
  assert.match(control('#combat-routes').innerHTML, /<strong>1<\/strong><span>회/);
  assert.match(control('#combat-loadout').innerHTML, /매번 폭약을 다시 장착/);
  choose('#combat-weapon', 'expendable-napalm');
  assert.equal(control('#combat-mode').disabled, true);
  assert.match(control('#combat-loadout').innerHTML, /주탄 기준·자탄과 화염 제외/);
  assert(control('#combat-sources').innerHTML.includes(weaponProfiles['expendable-napalm'].source));
  assert.match(control('#combat-sources').innerHTML, /2026-09-16/);
  choose('#combat-weapon', 'c4-pack');
  assert.match(control('#combat-routes').innerHTML, /<span>개 · 이론값/);
  choose('#combat-weapon', 'autocannon');
  assert.equal(control('#combat-mode').value, 'aphet');
  assert.match(control('#combat-loadout').innerHTML, /철갑고폭예광탄/);
} finally {
  if (savedDocument === undefined) delete globalThis.document;
  else globalThis.document = savedDocument;
}
console.log(`PASS: 7 explosive weapons, verified zero direct damage, independent blasts/radii/AP/resistance, transfer caps, armor layers, shield gates, partial unknowns, mode selection and ${cards} result cards.`);
