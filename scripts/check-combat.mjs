import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { enemies, weaponProfiles, combatCheckedAt, damageSource } from '../dist/combat-data.js';
import { armorMultiplier, damagePerHit, calculateRoute, calculateMatchup } from '../dist/combat.js';
import { stratagems } from '../dist/data.js';

const source = url => assert.equal(new URL(url).hostname, 'helldivers.wiki.gg');
source(damageSource);
assert.match(combatCheckedAt, /^\d{4}-\d{2}-\d{2}$/);
assert.equal(enemies.length, 8);
assert.equal(new Set(enemies.map(enemy => enemy.id)).size, enemies.length);
const validatePart = target => {
  for (const key of ['hp', 'armor', 'durability', 'exdr', 'toMain']) assert(Number.isFinite(target[key]) && target[key] >= 0, `${target.id}: ${key}`);
  assert(target.hp > 0 && target.armor <= 10 && target.durability <= 100 && target.exdr <= 100);
  assert(['kill', 'bleed', 'break', 'armor'].includes(target.effect));
  assert.equal(typeof target.overflowCap, 'boolean');
  if (target.next) { assert.equal(target.effect, 'armor'); validatePart(target.next); }
};
for (const enemy of enemies) {
  source(enemy.source);
  assert(enemy.name && enemy.note && enemy.parts.length);
  assert.equal(new Set(enemy.parts.map(part => part.id)).size, enemy.parts.length);
  for (const key of ['hp', 'armor', 'durability', 'exdr', 'constitution']) assert(Number.isFinite(enemy.main[key]));
  enemy.parts.forEach(validatePart);
}
assert.equal(Object.keys(weaponProfiles).length, 12);
for (const [id, profile] of Object.entries(weaponProfiles)) {
  assert(stratagems.some(item => item.id === id && item.category === 'support'), `Unknown weapon: ${id}`);
  source(profile.source);
  assert.equal(new Set(profile.modes.map(mode => mode.id)).size, profile.modes.length);
  for (const mode of profile.modes) {
    assert(mode.name);
    if (mode.unsupported) continue;
    for (const key of ['standard', 'durable', 'ap', 'explosion', 'explosionAp']) assert(Number.isFinite(mode[key]) && mode[key] >= 0, `${id}: ${key}`);
    assert(mode.durable <= mode.standard && mode.ap <= 10 && mode.explosionAp <= 10);
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
