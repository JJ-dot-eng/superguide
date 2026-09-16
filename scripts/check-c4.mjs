import assert from 'node:assert/strict';
import { enemies, weaponProfiles } from '../dist/combat-data.js';
import { damagePerHit, calculateRoute, calculateMatchup } from '../dist/combat.js';
import { renderCombatRoute } from '../dist/combat-ui.js';
import { combatTerms, combatCount, combatOutcome, combatAssumption, combatTargetTip, combatShieldNotice, combatSummary, combatModeStats } from '../dist/combat-presentation.js';
import { structures, demolitionProfiles } from '../dist/demolition-data.js';
import { calculateDemolition } from '../dist/demolition.js';

const profile = weaponProfiles['c4-pack'];
assert.equal(profile.source, 'https://helldivers.wiki.gg/wiki/B/MD_C4_Pack');
assert.equal(profile.sourceRevision, 133871);
assert.equal(profile.checkedAt, '2026-09-16');
assert.equal(profile.modes.length, 1, 'Deploying is not a second damage mode');
const charge = profile.modes[0];
assert.deepEqual(charge, {
  id: 'charge', name: '장약 한 개 기폭', standard: 0, durable: 0, ap: 0,
  explosion: 2000, explosionAp: 7, explosionDurable: 2000,
  innerRadius: 3, radius: 7, unit: '개', delivery: 'adhesive',
});
assert.equal(charge.shieldBypass, undefined, 'A building-specific shield exception must not carry into enemy combat');
const enemy = id => enemies.find(item => item.id === id);
const route = (enemyId, partId, mode = charge) => {
  const selected = enemy(enemyId);
  return calculateRoute(selected, selected.parts.find(part => part.id === partId), mode, { shieldCleared: true });
};

// 25% part resistance means 1,500 blast damage, not a 2,000 HP division.
const head = route('charger', 'head');
assert.deepEqual(head.stages[0].damage, { direct: 0, explosion: 1500, mainExplosion: 0 });
assert.equal(head.hits, 1);
assert.equal(head.outcome, 'kill');
assert.equal(head.via, 'part');
assert.equal(route('behemoth', 'head').hits, 2, '1,600 head HP survives one resisted C4 blast');
assert.equal(route('charger', 'butt').outcome, 'bleed', 'Destroying the abdomen starts bleeding, not an instant kill');
assert.equal(route('bile-titan', 'sac').hits, 1);
assert.equal(route('bile-titan', 'sac').outcome, 'break', 'Destroying one sac is not a kill');
assert.equal(route('bile-titan', 'head').hits, 2, '50% explosion resistance yields 1,000 damage per charge');
assert.equal(route('bile-titan', 'underside').conditional, true);
assert.deepEqual(route('charger', 'front-leg').stages.map(stage => stage.hits), [1, 1], 'Armor excess cannot be reused on flesh in the same charge');
assert.equal(route('charger', 'front-leg').hits, 2);
assert.equal(route('hulk', 'heatsink').outcome, 'kill', 'Overkill may exhaust the part bleed pool');

// Explosion-immune parts keep their HP. The single redirected explosion is
// checked against the appropriate Main pool instead of destroying a weak eye.
assert.deepEqual(route('hulk', 'head').stages[0].damage, { direct: 0, explosion: 0, mainExplosion: 2000 });
assert.equal(route('hulk', 'head').via, 'main');
assert.equal(route('harvester', 'joint').hits, 2, 'A single-route model does not multiply damage across all four parts');
assert.equal(route('harvester', 'joint').via, 'main');
assert.equal(route('annihilator-tank', 'turret-front').hits, 2, 'The turret has its own 2,100 HP pool');
assert.equal(route('annihilator-tank', 'heatsink').hits, 1, 'Fatal vent destruction bypasses remaining turret HP');
assert.equal(route('annihilator-tank', 'hull-front').stages[0].damage.explosion, 1300);
assert.equal(route('annihilator-tank', 'hull-front').hits, 4, 'Hull resistance and 4,000 HP do not reuse the turret count');

const fixture = { main: { hp: 5000, armor: 8, durability: 100, exdr: 75 }, parts: [] };
const limb = { id: 'limb', name: '부위', hp: 1000, armor: 7, durability: 0, exdr: 50, toMain: 25, overflowCap: false, effect: 'break' };
assert.deepEqual(damagePerHit(charge, limb, fixture.main), { direct: 0, explosion: 650, mainExplosion: 0 }, 'Equal AP is 65%; then 50% blast resistance applies');
assert.equal(calculateRoute(fixture, limb, charge).hits, 2);
assert.equal(calculateRoute(fixture, limb, charge).outcome, 'break');
const immune = { ...limb, armor: 0, exdr: 100 };
assert.equal(calculateRoute(fixture, immune, charge).outcome, 'blocked', 'Redirected blast must penetrate Main armor, not the weak limb armor');
assert.equal(calculateRoute(fixture, immune, charge).hits, null);
const smallPart = { ...limb, hp: 100, armor: 0, exdr: 0, toMain: 150, overflowCap: true };
const weakMain = { main: { hp: 1000, armor: 8, durability: 100, exdr: 100 }, parts: [] };
assert.equal(calculateRoute(weakMain, smallPart, charge).outcome, 'break', 'Transferred damage is capped at 100, so the nonfatal part can break without killing');
assert.equal(calculateRoute(weakMain, { ...smallPart, overflowCap: false }, charge).outcome, 'kill', 'Uncapped transfer kills even when Main rejects direct explosions');
assert.equal(calculateRoute(weakMain, { ...smallPart, effect: 'kill' }, charge).via, 'part', 'Fatal part destruction does not require Main HP depletion');
const bleedMain = { main: { hp: 1500, armor: 0, durability: 0, exdr: 0, constitution: 1000 }, parts: [] };
assert.equal(calculateRoute(bleedMain, immune, charge).outcome, 'bleed', 'A surviving Main constitution pool produces bleedout');
assert.equal(damagePerHit({ ...charge, explosion: 2000, explosionDurable: 1000 }, { ...limb, armor: 0, exdr: 0 }, fixture.main).explosion, 1000, 'Explosion damage uses durable damage, independently of part durability');

for (const id of ['harvester', 'overseer', 'heavy-devastator']) {
  const shielded = calculateMatchup(enemy(id), charge);
  assert.equal(shielded.best, null);
  assert(shielded.rows.every(row => row.outcome === 'shield' && row.hits === null));
  const notice = combatShieldNotice(enemy(id), charge);
  assert(!/탄수|한 발/.test(notice.note));
  assert.match(combatSummary(enemy(id), charge, shielded).title, /보호막|방패/);
}
assert.match(combatShieldNotice(enemy('harvester'), charge).note, /보호막을 먼저 제거/);
assert.match(combatShieldNotice(enemy('overseer'), charge).note, /방패 자체에 붙이거나/);

const regular = weaponProfiles.autocannon.modes[0];
assert.equal(combatCount(2, charge), '2개');
assert.equal(combatCount(2, regular), '2발');
assert.equal(combatTerms(charge).one, '장약 한 개');
assert.equal(combatOutcome('bleed', charge), '출혈 유발');
assert.equal(combatOutcome('break', charge), '부위 파괴');
assert.match(combatAssumption(charge), /해당 부위에 최대 폭발 피해가 들어가는 조건의 이론값/);
assert.match(combatAssumption(charge), /여러 부위를 동시에/);
assert.match(combatAssumption(charge), /실제 최소 처치 개수로 단정할 수 없습니다/);
assert.match(combatAssumption(regular), /표시 탄수/);
const facts = combatModeStats(charge).join(' · ');
for (const fact of ['직격 피해 0', '폭발 일반 피해 2,000', '폭발 내구 피해 2,000', '폭발 AP 7', '최대 피해 반경 3m', '외곽 폭발 반경 7m']) assert(facts.includes(fact));
assert(!facts.includes('AP 0'), 'The inactive direct channel is not presented as a weapon AP stat');
assert.match(combatTargetTip(route('charger', 'front-leg').target, charge, route('charger', 'front-leg')), /장갑 제거 후/);
assert.match(combatTargetTip(route('bile-titan', 'underside').target, charge), /복부 외피 제거 후/);

let cards = 0;
for (const selected of enemies) {
  const matchup = calculateMatchup(selected, charge, { shieldCleared: true });
  const summary = combatSummary(selected, charge, matchup, { shieldCleared: true });
  if (matchup.best) assert.match(summary.title, matchup.best.lowerBound ? /\d+개 이상/ : /이론값 \d+개/);
  assert(!/\d+발|한 발|탄수|최소/.test(summary.title));
  for (const row of matchup.rows) {
    const html = renderCombatRoute(row, selected, charge);
    if (row.hits != null) assert.match(html, row.lowerBound ? /<span>개 이상 · 재생 제외/ : /<span>개 · 이론값/);
    assert.match(html, /부착 후보/);
    if (row.stages.length) assert.match(html, /장약 한 개 피해와 계산 과정/);
    assert(!/한 발|\d+발|<span>발|탄수|undefined|NaN/.test(html));
    assert(html.includes(`data-outcome="${row.outcome}"`));
    cards++;
  }
}
assert.match(renderCombatRoute(route('charger', 'head', regular), enemy('charger'), regular), /<span>발 · 이론값/);
assert.match(renderCombatRoute(route('charger', 'head', regular), enemy('charger'), regular), /한 발 피해와 계산 과정/);
assert.match(renderCombatRoute(route('charger', 'butt'), enemy('charger'), charge), /출혈을 시작시키는 장약 개수/);
assert.match(renderCombatRoute(route('bile-titan', 'sac'), enemy('bile-titan'), charge), /처치에 필요한 장약 개수가 아닙니다/);
assert.match(renderCombatRoute(route('hulk', 'head'), enemy('hulk'), charge), /부위 파괴가 아닌 본체/);

// The existing C4 building rule remains independent, including its explicit
// Grounded Warp Ship shield exception and its one-charge health route.
const buildingProfile = demolitionProfiles['c4-pack'];
const buildingMode = buildingProfile.modes[0];
const warpShip = structures.find(item => item.id === 'warp-ship');
const buildingResult = calculateDemolition(warpShip, buildingProfile, buildingMode);
assert.equal(buildingResult.hits, 1);
assert.equal(buildingResult.unit, '개');
assert.equal(buildingResult.outcome, 'health');
assert.equal(buildingMode.explosion, 40);
assert.equal(buildingMode.shieldBypass, true);
console.log(`PASS: C4 source values, armor/resistance, Main transfer/caps, lethal/bleed/break routes, shield gates, ${cards} attachment cards, charge units, and existing C4 demolition.`);
