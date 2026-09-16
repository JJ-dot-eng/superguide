import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { enemies, enemyTypeCount, weaponProfiles, combatCheckedAt, damageSource } from '../dist/combat-data.js';
import { armorMultiplier, damagePerHit, calculateRoute, calculateMatchup } from '../dist/combat.js';
import { stratagems } from '../dist/data.js';

const source = url => assert.equal(new URL(url).hostname, 'helldivers.wiki.gg');
source(damageSource);
assert.match(combatCheckedAt, /^\d{4}-\d{2}-\d{2}$/);
assert.equal(enemies.length, 28, 'Use high-difficulty entries while retaining distinct body sizes');
assert.equal(enemyTypeCount, 26, 'Variants must not inflate the enemy species counter');
assert.equal(new Set(enemies.map(enemy => enemy.id)).size, enemies.length);
assert(!enemies.some(enemy => ['hunter', 'warrior', 'bile-spewer'].includes(enemy.id)), 'Low-difficulty entries must not be selectable');
const validateMain = pool => {
  for (const key of ['hp', 'armor', 'durability', 'exdr', 'constitution']) assert(Number.isFinite(pool[key]) && pool[key] >= 0, `Invalid main pool: ${key}`);
  assert(pool.hp > 0 && pool.armor <= 10 && pool.durability <= 100 && pool.exdr <= 100);
};
const validatePart = target => {
  for (const key of ['hp', 'armor', 'durability', 'exdr', 'toMain']) assert(Number.isFinite(target[key]) && target[key] >= 0, `${target.id}: ${key}`);
  assert(target.hp > 0 && target.armor <= 10 && target.durability <= 100 && target.exdr <= 100);
  assert(['kill', 'bleed', 'break', 'armor'].includes(target.effect));
  assert.equal(typeof target.overflowCap, 'boolean');
  if (target.main) { validateMain(target.main); assert(target.main.name); }
  if (target.next) { assert.equal(target.effect, 'armor'); validatePart(target.next); }
};
for (const enemy of enemies) {
  source(enemy.source);
  assert(enemy.name && enemy.note && enemy.parts.length);
  assert.equal(new Set(enemy.parts.map(part => part.id)).size, enemy.parts.length);
  validateMain(enemy.main);
  if (enemy.sourceRevision) assert(Number.isSafeInteger(enemy.sourceRevision) && enemy.sourceRevision > 0);
  enemy.parts.forEach(validatePart);
}
assert.equal(Object.keys(weaponProfiles).length, 27);
for (const [id, profile] of Object.entries(weaponProfiles)) {
  assert(stratagems.some(item => item.id === id && item.category === 'support'), `Unknown weapon: ${id}`);
  source(profile.source);
  assert.equal(new Set(profile.modes.map(mode => mode.id)).size, profile.modes.length);
  for (const mode of profile.modes) {
    assert(mode.name);
    if (mode.unsupported) continue;
    for (const key of ['standard', 'durable', 'ap', 'explosion', 'explosionAp']) assert(Number.isFinite(mode[key]) && mode[key] >= 0, `${id}: ${key}`);
    assert(mode.durable <= mode.standard && mode.ap <= 10 && mode.explosionAp <= 10);
    if (mode.explosionDurable != null) assert(Number.isFinite(mode.explosionDurable) && mode.explosionDurable >= 0);
    if (mode.explosions) {
      assert.equal(new Set(mode.explosions.map(blast => blast.id)).size, mode.explosions.length);
      for (const blast of mode.explosions) {
        for (const key of ['standard', 'durable', 'ap', 'innerRadius', 'radius']) assert(Number.isFinite(blast[key]) && blast[key] >= 0, `${id}/${blast.id}: ${key}`);
        assert(blast.durable <= blast.standard && blast.ap <= 10 && blast.innerRadius <= blast.radius);
      }
    }
  }
}

assert.equal(armorMultiplier(3, 4), 0);
assert.equal(armorMultiplier(4, 4), 0.65);
assert.equal(armorMultiplier(5, 4), 1);
const plain = { standard: 95, durable: 23, ap: 4, explosion: 0, explosionAp: 0 };
assert.equal(damagePerHit(plain, { armor: 2, durability: 30, exdr: 0 }, {}).direct, 73, 'Wiki durability example rounds 73.4 down to 73');

const enemy = id => enemies.find(item => item.id === id);
const mode = (id, modeId) => weaponProfiles[id].modes.find(item => !modeId || item.id === modeId);
const route = (enemyId, partId, weaponId, modeId) => calculateRoute(enemy(enemyId), enemy(enemyId).parts.find(part => part.id === partId), mode(weaponId, modeId), { shieldCleared: true });
let result = route('hulk', 'head', 'autocannon');
assert.equal(result.hits, 2, 'Autocannon needs two direct eye hits, not one direct-plus-blast hit');
assert.deepEqual(result.stages[0].damage, { direct: 200, explosion: 0, mainExplosion: 0 });
assert.equal(route('hulk', 'head', 'anti-materiel').hits, 1, 'AMR near-range maximum damage can cross the 250 eye-HP threshold');
assert.equal(route('hulk', 'heatsink', 'autocannon').outcome, 'bleed', 'Heatsink health depletion is not instant death');
assert.equal(route('hulk', 'heatsink', 'recoilless').outcome, 'kill', 'Sufficient overkill exhausts heatsink constitution');
assert.equal(route('harvester', 'joint', 'autocannon').hits, 4, 'Wiki tactical example: four APHET hits at one hip joint');
assert.equal(route('harvester', 'joint', 'anti-materiel').hits, 4, 'Wiki tactical example: four AMR hits at one hip joint');
assert.equal(route('harvester', 'joint', 'heavy-machine-gun').hits, 15);
assert.equal(route('harvester', 'joint', 'commando').hits, 1);
assert.equal(route('harvester', 'joint', 'stalwart').outcome, 'blocked');
assert.equal(route('harvester', 'eye', 'expendable-at').outcome, 'break', 'Breaking the eye is not itself fatal');
result = route('harvester', 'eye', 'recoilless');
assert.equal(result.outcome, 'kill', 'Uncapped eye overkill can kill through Main transfer');
assert.equal(result.via, 'main');
assert.equal(result.hits, 1);
assert.equal(calculateMatchup(enemy('harvester'), mode('recoilless')).best, null, 'An intact shield must gate body kill counts');
assert(calculateMatchup(enemy('harvester'), mode('recoilless')).rows.every(row => row.outcome === 'shield' && row.hits === null));
assert.equal(calculateMatchup(enemy('overseer'), mode('recoilless')).best, null, 'The arm-shield sight line must be explicit');

result = route('charger', 'front-leg', 'recoilless');
assert.equal(result.hits, 2, 'Armor overkill cannot destroy the flesh in the same shot');
assert.deepEqual(result.stages.map(stage => stage.hits), [1, 1]);
assert.equal(result.outcome, 'kill');
result = route('charger', 'butt', 'autocannon');
assert.equal(result.hits, 3);
assert.equal(result.outcome, 'bleed');
assert.equal(result.stages[0].damage.explosion, 112, '25% explosion resistance is applied separately');
assert.equal(route('bile-titan', 'sac', 'autocannon').outcome, 'break', 'A bile sac is not a fatal body part');
assert.equal(route('bile-titan', 'underside', 'autocannon').conditional, true, 'Exposed underside requires a prerequisite');
assert.equal(calculateMatchup(enemy('bile-titan'), mode('stalwart')).best, null, 'Do not recommend a still-covered weak point as an available kill route');
assert.equal(route('devastator', 'head', 'autocannon').stages[0].damage.mainExplosion, 150, 'Explosion-immune limbs redirect to Main once, without adding limb blast damage');
assert.equal(route('overseer', 'chest-armor', 'autocannon').hits, 2, 'Body transfer persists between armor and exposed flesh');

const safe = route('behemoth', 'head', 'railgun', 'safe');
const charged = route('behemoth', 'head', 'railgun', 'unsafe-max');
assert(charged.hits < safe.hits);
assert.equal(mode('railgun', 'unsafe-max').ap, 5, 'Railgun overcharge does not increase AP or add self-destruction splash');
assert.equal(mode('railgun', 'unsafe-max').explosion, 0);
assert.equal(calculateMatchup(enemy('charger'), mode('autocannon', 'flak')).best, null);
assert(calculateMatchup(enemy('charger'), undefined).rows.every(row => row.outcome === 'unknown' && row.hits === null));

// Current Wiki anatomy examples and mechanically distinct new routes.
assert.deepEqual([enemy('hunter-hardened').main.hp, ...enemy('hunter-hardened').parts.map(part => part.hp)], [160, 40, 60, 60], 'Retain high-difficulty Hunter health');
assert.deepEqual([enemy('warrior-hardened').main.hp, ...enemy('warrior-hardened').parts.map(part => part.hp)], [325, 150, 100, 100], 'Retain high-difficulty Warrior health');
for (const family of ['hunter', 'warrior', 'bile-spewer']) assert.equal(enemies.filter(enemy => enemy.family === family).length, 1, 'Each difficulty-dependent enemy appears once');
assert.equal(route('warrior-hardened', 'head', 'maxigun').hits, 3, 'Difficulty 4 increases Warrior head HP');
assert.equal(route('warrior-hardened', 'head', 'maxigun').outcome, 'bleed', 'Decapitated Warriors can still attack');
assert.equal(route('brood-commander', 'head', 'machine-gun').outcome, 'bleed');
assert.equal(route('brood-commander', 'head', 'recoilless').outcome, 'kill', 'Sufficient head overkill exhausts the bleed pool');
assert.equal(route('hive-guard', 'head', 'stalwart').outcome, 'blocked');
assert.equal(route('hive-guard', 'head', 'machine-gun').outcome, 'bleed');
assert.equal(route('bile-spewer-armored', 'head', 'stalwart').outcome, 'blocked', 'Difficulty 6 head armor blocks AP 2');
assert.equal(route('bile-spewer-armored', 'mouth', 'stalwart').outcome, 'kill', 'Mouth armor does not increase with head armor');
assert.equal(route('bile-spewer-armored', 'head', 'machine-gun').hits, 6);
assert.equal(route('nursing-spewer', 'head', 'machine-gun').hits, 4);
assert.equal(route('stalker', 'head', 'anti-materiel').hits, 1);
assert.equal(route('stalker', 'body-armor', 'anti-materiel').via, 'main');
assert.equal(route('impaler', 'head', 'autocannon').conditional, true);
assert.equal(route('impaler', 'head', 'autocannon').hits, 3);
assert.equal(calculateMatchup(enemy('impaler'), mode('autocannon')).best.target.id, 'leg-armor', 'A covered face is not an unconditional best route');
assert.equal(route('impaler', 'tentacle', 'autocannon').outcome, 'break');
assert.deepEqual(route('impaler', 'leg-armor', 'recoilless').stages.map(stage => stage.hits), [1, 1]);
assert.equal(route('shrieker', 'wing', 'stalwart').hits, 1);
assert.equal(route('rocket-devastator', 'rocket-pod', 'anti-materiel').outcome, 'break', 'Disarming a rocket pod does not imply killing');
assert(calculateMatchup(enemy('heavy-devastator'), mode('autocannon')).rows.every(row => row.outcome === 'shield' && row.hits === null));
assert.equal(route('heavy-devastator', 'backpack', 'anti-materiel').hits, 2);
assert.equal(route('scout-strider', 'waist', 'autocannon').hits, 1);
assert.equal(route('reinforced-strider', 'waist', 'autocannon').hits, 1);
assert(!enemy('reinforced-strider').parts.some(part => /rocket/.test(part.id)), 'Do not promise kills through the Wiki-documented rocket detonation bug');
assert.equal(route('gunship', 'front-thruster', 'autocannon').hits, 2);
assert.equal(route('gunship', 'rear-thruster', 'anti-materiel').hits, 2);
assert.equal(route('gunship', 'front-thruster', 'heavy-machine-gun').hits, 8);
assert.equal(route('gunship', 'front-thruster', 'railgun', 'unsafe-max').hits, 1);
assert.equal(route('gunship', 'fuselage', 'railgun', 'unsafe-max').hits, 2);
assert.equal(route('annihilator-tank', 'turret-front', 'recoilless').hits, 1);
assert.equal(route('annihilator-tank', 'hull-front', 'recoilless').hits, 2, 'Hull HP must not reuse turret HP');
assert.equal(route('annihilator-tank', 'heatsink', 'autocannon').hits, 3);
assert.equal(route('annihilator-tank', 'engine', 'autocannon').hits, 9, 'Hull engine is not the turret heatsink');
const tank = enemy('annihilator-tank');
const turretBlast = calculateRoute(tank, tank.parts.find(part => part.id === 'turret-front'), { standard: 0, durable: 0, ap: 0, explosion: 1800, explosionAp: 5 });
assert.equal(turretBlast.hits, 2, 'Blast transfer must use the independent 2,100 HP turret pool');
assert.equal(turretBlast.via, 'main');
assert.equal(turretBlast.stages[0].damage.mainExplosion, 1170);
const scout = enemy('scout-strider');
const pilotBlast = calculateRoute(scout, scout.parts.find(part => part.id === 'pilot-head'), { standard: 0, durable: 0, ap: 0, explosion: 100, explosionAp: 1 });
assert.equal(pilotBlast.hits, 3, 'Pilot blast uses 125 HP and 50% resistance, not the walker hull armor');
assert.equal(pilotBlast.stages[0].damage.mainExplosion, 50);
const bodySizeShot = { standard: 50, durable: 50, ap: 2, explosion: 0, explosionAp: 0 };
for (const [id, hits] of [['voteless-light', 1], ['voteless-medium', 1], ['voteless-heavy', 2]]) {
  const target = enemy(id);
  assert.equal(calculateRoute(target, target.parts.find(part => part.id === 'head'), bodySizeShot).hits, hits);
  assert.equal(route(id, 'leg', 'machine-gun').outcome, 'break', 'A Voteless with destroyed legs can keep crawling');
}
assert.equal(route('watcher', 'body', 'anti-materiel').hits, 1);
assert.equal(route('watcher', 'eye', 'anti-materiel').outcome, 'break', 'Eye is not fatal and caps transferred damage');
assert.equal(route('watcher', 'upper-fin', 'anti-materiel').outcome, 'break');
assert.equal(route('elevated-overseer', 'head', 'stalwart').outcome, 'kill');
assert.equal(route('overseer', 'head', 'stalwart').outcome, 'blocked', 'Ground Overseer head armor remains different');
assert.equal(route('elevated-overseer', 'jetpack', 'heavy-machine-gun').hits, 2);
assert.equal(route('elevated-overseer', 'chest-armor', 'anti-materiel').hits, 2);
assert.equal(route('elevated-overseer', 'chest-armor', 'anti-materiel').via, 'main', '450 main HP may run out before the exposed torso part HP');

// A transfer-capped nonfatal part must not gain repeated hits after destruction.
const fixture = { main: { hp: 1000, armor: 3, durability: 0, exdr: 0, constitution: 0 }, parts: [] };
const limb = { id: 'limb', name: '부위', hp: 100, armor: 0, durability: 0, exdr: 100, toMain: 100, overflowCap: true, effect: 'break' };
const largeShot = { standard: 2000, durable: 2000, ap: 5, explosion: 0, explosionAp: 0 };
assert.equal(calculateRoute(fixture, limb, largeShot).outcome, 'break');
assert.equal(calculateRoute(fixture, { ...limb, overflowCap: false }, largeShot).outcome, 'kill');

let combinations = 0;
for (const target of enemies) for (const profile of Object.values(weaponProfiles)) for (const firingMode of profile.modes) {
  const results = calculateMatchup(target, firingMode, { shieldCleared: true });
  for (const row of results.rows) {
    assert(row.hits === null || Number.isInteger(row.hits) && row.hits > 0 && row.hits < 20000);
    assert(!['kill', 'bleed'].includes(row.outcome) || row.hits !== null);
    for (const stage of row.stages) for (const damage of Object.values(stage.damage)) assert(Number.isFinite(damage) && damage >= 0);
  }
  combinations++;
}
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const ui = await readFile(new URL('../dist/combat-ui.js', import.meta.url), 'utf8');
for (const [, id] of ui.matchAll(/\$\('#([a-z-]+)'\)/g)) assert(html.includes(`id="${id}"`), `Missing UI control: ${id}`);
const htmlIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(htmlIds.length, new Set(htmlIds).size, 'UI ids must remain unique');
console.log(`PASS: enemy anatomy, weapon modes, ${combinations} matchups, armor/durability, explosion routing, fatal parts, bleedout, armor layers and shield prerequisites.`);
