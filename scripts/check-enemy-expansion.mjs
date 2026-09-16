import assert from 'node:assert/strict';
import { enemies, weaponProfiles } from '../dist/combat-data.js';
import { expandedEnemies } from '../dist/combat-enemies-expanded.js';
import { calculateMatchup, calculateRoute } from '../dist/combat.js';
import { spearCannotLock } from '../dist/combat-conditions.js';
import { combatSummary, combatRouteNotes } from '../dist/combat-presentation.js';
import { renderCombatRoute } from '../dist/combat-ui.js';
import { pickerEnemyImages } from '../dist/selector-images.js';
import { initCombat } from '../dist/combat-ui.js';
import { stratagems } from '../dist/data.js';
import { wikiIcons } from '../dist/wiki-icons.js';
import { readFile } from 'node:fs/promises';
import { TestDocument } from './test-dom.mjs';

const expected = [
  'alpha-commander', 'alpha-warrior', 'bile-warrior', 'spore-charger', 'predator-stalker', 'rupture-warrior', 'rupture-spewer', 'rupture-charger', 'spore-burst-warrior', 'spore-burst-bile-titan', 'dragonroach', 'hive-lord',
  'hulk-bruiser', 'hulk-obliterator', 'hulk-firebomber', 'shredder-tank', 'barrager-tank', 'factory-strider', 'war-strider', 'dropship', 'conflagration-devastator', 'incendiary-mg-devastator', 'jet-brigade-devastator', 'jet-brigade-hulk-bruiser', 'jet-brigade-hulk-scorcher', 'radical', 'agitator', 'vox-engine',
  'crescent-overseer', 'fleshmob', 'stingray', 'leviathan', 'warp-ship', 'veracitor', 'gatekeeper', 'wretch', 'crusher',
];
assert.deepEqual(expandedEnemies.map(e => e.id).sort(), expected.sort());
assert(!enemies.some(e => /overship|오버쉽/i.test(e.id + e.name)));
const factions = ['테르미니드', '오토마톤', '일루미닛'];
assert.deepEqual(enemies.map(e => factions.indexOf(e.faction)), enemies.map(e => factions.indexOf(e.faction)).sort((a, b) => a - b));
for (const group of [['charger', 'behemoth', 'spore-charger', 'rupture-charger'], ['devastator', 'rocket-devastator', 'heavy-devastator', 'conflagration-devastator', 'incendiary-mg-devastator', 'jet-brigade-devastator'], ['overseer', 'elevated-overseer', 'crescent-overseer']]) {
  const start = enemies.findIndex(e => e.id === group[0]);
  assert.deepEqual(enemies.slice(start, start + group.length).map(e => e.id), group);
}
for (const e of expandedEnemies) {
  assert(Number.isSafeInteger(e.sourceRevision) && e.sourceRevision > 0, e.id);
  assert.equal(e.checkedAt, '2026-09-16');
  assert.equal(new URL(e.source).hostname, 'helldivers.wiki.gg');
  assert(pickerEnemyImages[e.id], e.id);
  assert.equal(typeof e.spearLock, 'boolean');
}

const enemy = id => enemies.find(e => e.id === id);
const part = (id, target) => enemy(id).parts.find(p => p.id === target);
const hit = (damage = 1000, ap = 10) => ({ standard: damage, durable: damage, ap, explosion: 0, explosionAp: 0 });
const route = (id, target, mode = hit(), options = { shieldCleared: true }) => calculateRoute(enemy(id), part(id, target), mode, options);

assert.equal(route('dragonroach', 'wing').hits, 4, 'Wing includes 2,500 non-decaying extra HP, not a timed bleedout');
assert.equal(route('dragonroach', 'wing').outcome, 'kill');
assert.equal(route('factory-strider', 'belly-panel').hits, 3, 'Belly threshold is 1,200 + 1,200');
assert.equal(route('factory-strider', 'leg-assembly').hits, 4, 'Leg threshold is 1,500 + 2,000');
assert.equal(route('warp-ship', 'beamer').hits, 3, 'Beamer threshold is 1,000 + 1,500');
assert.equal(part('hive-lord', 'dorsal-armor').staticConstitution, 35000);
assert.equal(route('hive-lord', 'dorsal-armor').stages[0].hits, 50);
assert.equal(route('spore-burst-bile-titan', 'front-left-leg-flesh').hits, 4);
assert.equal(route('hulk-bruiser', 'leg', hit(500)).hits, 1, 'Leg impairment starts before the extra static pool is exhausted');
assert.equal(route('hulk-bruiser', 'leg', hit(500)).outcome, 'break');
assert.equal(part('hulk-bruiser', 'leg').resultLabel, '다리 기능 상실');

assert.equal(route('stingray', 'gun-ports').via, 'main', 'Main aliases do not invent an independent part-break threshold');
assert.equal(route('predator-stalker', 'body-armor').via, 'main');
assert.equal(part('spore-charger', 'torso-armor').next.toMain, 300);
assert.equal(route('spore-charger', 'torso-armor', hit(300)).hits, 5, 'Armor then shared Main flesh applies 300% direct transfer');
assert.equal(route('spore-charger', 'torso-armor', hit(300)).outcome, 'bleed');

assert.equal(part('shredder-tank', 'turret').main.hp, 2100);
assert.equal(part('shredder-tank', 'hull-front').main.hp, 4000);
assert.equal(route('shredder-tank', 'turret').hits, 3);
assert.equal(route('shredder-tank', 'hull-front').hits, 4);
assert.equal(route('barrager-tank', 'launch-tubes').outcome, 'unknown');
assert.match(route('barrager-tank', 'launch-tubes').reason, /충돌/);
assert.equal(route('hulk-firebomber', 'head', hit(300)).hits, 1);
assert.equal(part('hulk-firebomber', 'head').overflowCap, null, 'Comparison of cap scenarios must not overwrite unknown source data');
assert.equal(route('hulk-firebomber', 'arm', hit(4000)).outcome, 'unknown', 'Cap-dependent kill/break results must remain unresolved');
assert.equal(route('jet-brigade-hulk-bruiser', 'jetpack', hit(750)).outcome, 'kill');
assert.equal(route('jet-brigade-devastator', 'jetpack', hit(2000)).outcome, 'break');
assert.equal(route('vox-engine', 'torso', hit(9000)).outcome, 'bleed', '50,000 constitution is a bleedout pool, not initial HP');
const vent = part('vox-engine', 'vent');
const bonusFixture = { ...enemy('vox-engine'), main: { ...enemy('vox-engine').main, hp: 1000, constitution: 0 } };
assert.equal(calculateRoute(bonusFixture, vent, hit(300)).outcome, 'kill', 'Vent destruction adds 700 Main damage after the 300 transferred damage');
assert.equal(route('vox-engine', 'hatch').outcome, 'unknown', 'Thrown-grenade hatch mechanic is not assigned to support weapon explosions');
const vox = enemy('vox-engine');
const leveller = weaponProfiles.leveller.modes[0];
const voxMatchup = calculateMatchup(vox, leveller);
const beforeTacticalSummary = structuredClone(voxMatchup);
const voxSummary = combatSummary(vox, leveller, voxMatchup, { weapon: 'leveller' });
assert.equal(voxSummary.title, '몸통 명중 시 1발 처치 가능 · 위키 기준');
assert.match(voxSummary.body, /단일 부위 이론값/);
assert.match(voxSummary.body, /함께 피격되는 부위와 피해 합계는 자료 미확인/);
assert.equal(voxSummary.reference.source, `${vox.source}#Tactical_Information`);
assert.equal(voxSummary.reference.sourceRevision, 134993);
assert.equal(voxSummary.reference.checkedAt, '2026-09-16');
assert.deepEqual(voxMatchup, beforeTacticalSummary, 'Wiki tactics must not overwrite any calculated route');
assert.equal(voxMatchup.best.hits, 3);
assert.equal(voxMatchup.best.target.id, 'sarcophagus');
assert.equal(voxMatchup.best.outcome, 'bleed');
assert.equal(voxMatchup.rows.find(row => row.target.id === 'torso').hits, 5);
assert.match(renderCombatRoute(voxMatchup.best, vox, leveller, { singlePartTheory: true }), /<strong>3<\/strong><span>발 · 단일 부위 이론값/);
assert.equal(combatSummary(vox, { ...leveller, id: 'unreviewed' }, voxMatchup, { weapon: 'leveller' }).reference, undefined, 'Tactics apply only to the reviewed firing mode');
assert.equal(combatSummary(vox, leveller, voxMatchup, { weapon: 'leveller', unsupported: '자료 미확인' }).reference, undefined);
for (const selected of enemies) for (const [weapon, profile] of Object.entries(weaponProfiles)) for (const mode of profile.modes) {
  const summary = combatSummary(selected, mode, calculateMatchup(selected, mode), { weapon });
  assert.equal(Boolean(summary.reference), selected.id === 'vox-engine' && weapon === 'leveller' && mode.id === 'standard', 'Tactical advice must not leak into other enemy, weapon or mode selections');
}
assert.equal(route('dropship', 'thruster').outcome, 'down');
assert.match(combatRouteNotes(route('dropship', 'thruster'), hit()).join(' '), /탑승 병력 처치까지 보장하지/);

for (const id of ['veracitor', 'gatekeeper']) {
  assert.equal(route(id, 'pilot', hit(), {}).outcome, 'shield');
  assert.equal(route(id, 'pilot').outcome, 'kill');
  assert.equal(route(id, 'chassis', hit(), {}).outcome, 'kill', 'Pilot-only shield must not block an exposed chassis');
  assert(calculateMatchup(enemy(id), hit()).best);
}
assert(calculateMatchup(enemy('warp-ship'), hit()).rows.every(r => r.outcome === 'shield'));
assert.equal(route('crusher', 'helmet').hits, 2);
assert.equal(route('crusher', 'helmet').lowerBound, undefined, 'Helmet/head do not regenerate');
assert.equal(route('crusher', 'torso').lowerBound, true);
assert.match(combatSummary(enemy('crusher'), hit(), { best: route('crusher', 'torso'), rows: [] }).title, /6발 이상/);
assert.match(renderCombatRoute(route('crusher', 'torso'), enemy('crusher'), hit()), /재생 제외/);
assert.match(renderCombatRoute(route('crusher', 'helmet'), enemy('crusher'), hit()), /부위 사진<br>자료 미확인/);
assert.equal(route('wretch', 'head', hit(100)).outcome, 'break', 'Wretch head destruction is not fatal');
assert.equal(route('alpha-commander', 'head', hit(250)).outcome, 'bleed');
assert.equal(route('alpha-commander', 'head', hit(550)).outcome, 'kill');

const spear = weaponProfiles.spear.modes[0];
for (const id of ['hive-lord', 'dragonroach', 'war-strider', 'vox-engine', 'crusher', 'leviathan', 'warp-ship']) assert.equal(spearCannotLock(enemy(id), spear), false);
for (const id of ['alpha-warrior', 'wretch', 'crescent-overseer']) assert.equal(spearCannotLock(enemy(id), spear), true);

// Exercise enemy changes and the shield checkbox through the actual UI handlers.
const documentBefore = globalThis.document;
try {
  const doc = new TestDocument(await readFile(new URL('../dist/index.html', import.meta.url), 'utf8'));
  globalThis.document = doc;
  initCombat({ stratagems, wikiIcons, navigate() {} });
  const get = id => doc.getElementById(id);
  const select = (id, value) => { get(id).value = value; get(id).dispatchEvent({ type: 'change', target: get(id) }); };
  assert.deepEqual(get('combat-enemy').querySelectorAll('optgroup').map(group => group.getAttribute('label')), factions);
  select('combat-weapon', 'c4-pack');
  select('combat-enemy', 'veracitor');
  assert.match(get('combat-routes').innerHTML, /data-outcome="shield"/);
  assert.match(get('combat-routes').innerHTML, /data-outcome="kill"/);
  assert.match(get('combat-shield-note').textContent, /1,300 \/ 장갑 2/);
  get('combat-shield-cleared').checked = true;
  get('combat-shield-cleared').dispatchEvent({ type: 'change', target: get('combat-shield-cleared') });
  assert.doesNotMatch(get('combat-routes').innerHTML, /data-outcome="shield"/);
  select('combat-enemy', 'warp-ship');
  assert.equal(get('combat-shield-cleared').checked, false, 'Changing enemies resets shield prerequisites');
  assert.match(get('combat-shield-note').textContent, /2,500 \/ 장갑 0/);
  assert.match(get('combat-answer').innerHTML, /보호막 제거/);
  select('combat-enemy', 'crusher');
  assert.equal(get('combat-shield').hidden, true);
  assert.match(get('combat-routes').innerHTML, /재생 제외/);
  for (const e of expandedEnemies) {
    select('combat-enemy', e.id);
    assert(get('combat-enemy-info').innerHTML.includes(e.name));
    assert(get('combat-sources').innerHTML.includes(e.source));
    assert.doesNotMatch(get('combat-routes').innerHTML, /undefined|NaN|자료 미확인%/);
  }
  select('combat-enemy', 'vox-engine');
  select('combat-weapon', 'leveller');
  assert.match(get('combat-answer').innerHTML, /몸통 명중 시 1발 처치 가능 · 위키 기준/);
  assert.match(get('combat-answer').innerHTML, /href="https:\/\/helldivers\.wiki\.gg\/wiki\/Vox_Engine#Tactical_Information"/);
  assert.match(get('combat-answer').innerHTML, /자료 확인 2026-09-16/);
  assert.doesNotMatch(get('combat-answer').innerHTML, /출혈 유발 이론값 3발/);
  assert.match(get('combat-routes').innerHTML, /<strong>3<\/strong><span>발 · 단일 부위 이론값/);
  select('combat-weapon', 'c4-pack');
  assert.doesNotMatch(get('combat-answer').innerHTML, /위키 기준|위키 전술 설명/);
  assert.doesNotMatch(get('combat-routes').innerHTML, /단일 부위 이론값/);
  select('combat-weapon', 'leveller');
  assert.match(get('combat-answer').innerHTML, /몸통 명중 시 1발 처치 가능 · 위키 기준/);
  select('combat-enemy', 'charger');
  assert.doesNotMatch(get('combat-answer').innerHTML, /위키 기준|위키 전술 설명/);
  assert.doesNotMatch(get('combat-routes').innerHTML, /단일 부위 이론값/);
} finally {
  if (documentBefore === undefined) delete globalThis.document;
  else globalThis.document = documentBefore;
}

console.log('PASS: 37 reviewed enemies, faction/family ordering, static HP, Main aliases, independent tank pools, unknown caps, destruction bonuses, partial shields, regeneration bounds, drop outcomes and Spear targets.');
