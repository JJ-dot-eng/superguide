import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stratagems, categories } from '../dist/data.js';
import { wikiIcons } from '../dist/wiki-icons.js';
import { structures, demolitionProfiles } from '../dist/demolition-data.js';
import { calculateDemolition, calculateStructureDamage, evaluateForce } from '../dist/demolition.js';
import { featureFromHash, featureIds } from '../dist/features.js';
import { openingRouteNote, renderDemolitionWeaponCard } from '../dist/demolition-ui.js';
import { getDemolitionSelection, initialDemolitionSelection } from '../dist/demolition-selection.js';

const target = id => structures.find(item => item.id === id);
const attack = (id, modeId) => demolitionProfiles[id].modes.find(mode => !modeId || mode.id === modeId);
const calc = (structureId, weaponId, modeId, options) => calculateDemolition(target(structureId), demolitionProfiles[weaponId], attack(weaponId, modeId), options);
const wikiSource = url => assert.equal(new URL(url).hostname, 'helldivers.wiki.gg');
const validForce = value => value == null || typeof value === 'number' && Number.isFinite(value) && value >= 0 || value && typeof value === 'object' && Number.isFinite(value.min) && Number.isFinite(value.max) && value.min >= 0 && value.max >= value.min;
assert.equal(new Set(structures.map(item => item.id)).size, structures.length);
for (const structure of structures) {
  assert(structure.name && structure.faction && structure.tip && structure.routes.length);
  wikiSource(structure.source);
  assert.equal(new Set(structure.routes.map(route => route.id)).size, structure.routes.length);
  for (const route of structure.routes) assert(route.threshold > 0 && route.threshold <= 60);
  if (structure.health) {
    const { hp, armor, durability, exdr } = structure.health;
    assert(hp > 0 && armor >= 0 && durability >= 0 && durability <= 100 && Number.isFinite(exdr) && exdr <= 100);
    wikiSource(structure.healthSource);
  }
}
let combinations = 0;
for (const [id, profile] of Object.entries(demolitionProfiles)) {
  assert(stratagems.some(item => item.id === id), `Unknown stratagem: ${id}`);
  wikiSource(profile.source);
  assert(profile.modes.length && new Set(profile.modes.map(mode => mode.id)).size === profile.modes.length);
  for (const mode of profile.modes) {
    assert(mode.name && validForce(mode.direct) && validForce(mode.explosion), `Invalid force: ${id}/${mode.id}`);
    if (mode.damage) for (const field of ['standard', 'durable', 'ap', 'explosion', 'explosionAp']) assert(Number.isFinite(mode.damage[field]) && mode.damage[field] >= 0, `${id}/${mode.id}: ${field}`);
    for (const structure of structures) for (const cleared of [false, true]) {
      const result = calculateDemolition(structure, profile, mode, { shieldCleared: cleared, jammerDisabled: cleared });
      assert(['demolish', 'health', 'conditional', 'blocked', 'unknown'].includes(result.outcome));
      assert.equal(result.routes.length, structure.routes.length);
      assert(result.reason && (result.hits === null || Number.isInteger(result.hits) && result.hits > 0));
      if (result.health) for (const key of ['direct', 'explosion', 'total']) assert(Number.isFinite(result.health[key]) && result.health[key] >= 0);
      if (result.outcome === 'conditional') assert(result.conditions.length > 0 && result.method);
      if (result.method === 'force') assert(result.routes.some(row => row.route === result.route && row.outcome === 'pass'));
      combinations++;
    }
  }
}

// Force is a per-component threshold, not additive damage or a hit counter.
const wall = { id: 'wall', threshold: 50 };
assert.equal(evaluateForce(wall, { direct: 30, explosion: 30 }).outcome, 'insufficient');
assert.equal(evaluateForce(wall, { direct: 50, explosion: null }).outcome, 'pass');
assert.equal(evaluateForce(wall, { direct: { min: 40, max: 50 }, explosion: null }).outcome, 'unknown');
assert.equal(evaluateForce({ threshold: 40 }, { direct: { min: 40, max: 50 }, explosion: null }).outcome, 'pass');
assert.equal(calc('bug-hole', 'laser-cannon').outcome, 'blocked', 'A beam is not an internal explosion');
assert.equal(calc('container', 'laser-cannon').outcome, 'demolish');
assert.equal(calc('fabricator', 'autocannon', 'aphet').outcome, 'conditional');
assert.equal(calc('fabricator', 'autocannon', 'aphet').route.id, 'vent');
assert.equal(calc('fabricator', 'autocannon', 'aphet').health.total, 0, 'AP 4 must not damage an AV 5 outer wall');
assert.equal(calc('bug-hole', 'autocannon', 'flak').route.id, 'inner');
assert.equal(calc('detector', 'eagle-500kg').outcome, 'demolish');
assert.equal(calc('detector', 'eagle-500kg').component, 'explosion', 'Use the agreed blast value, not the disputed direct value');
assert.equal(calc('gunship-facility', 'eagle-500kg').outcome, 'blocked');
assert.equal(calc('gunship-facility', 'hellbomb').outcome, 'demolish');

// Verified body HP remains a separate destruction path when force is low.
assert.equal(calc('fabricator', 'recoilless', 'heat').hits, 1);
assert.equal(calc('fabricator', 'recoilless', 'heat').method, 'health');
assert.equal(calc('fabricator', 'recoilless', 'he').hits, 4, 'Equal AP: floor(750 × 0.65) = 487, explosion AP too low');
assert.equal(calc('fabricator', 'commando').hits, 2);
assert.equal(calc('bulk-fabricator', 'recoilless', 'heat').hits, 2);
assert.equal(calc('shrieker-nest', 'autocannon', 'aphet').hits, 7, '2500 / (260 durable + 150 blast), rounded up');
assert.equal(calc('warp-ship', 'quasar', null, { shieldCleared: true }).hits, 3);
assert.equal(calc('warp-ship', 'recoilless', 'heat', { shieldCleared: true }).hits, 2);
assert.equal(calculateStructureDamage(target('warp-ship'), attack('eagle-500kg')).total, 5750, 'Negative explosion resistance gives 2.5× blast damage');
assert.equal(calc('shrieker-nest', 'grenade-launcher').outcome, 'unknown', 'Unknown HP attack must not mean impossible');
assert.equal(calc('fabricator', 'machine-gun').outcome, 'unknown', 'Unknown force must not be treated as zero');
assert.equal(calc('spore-spewer', 'machine-gun').outcome, 'health', 'Known HP damage remains usable with unknown force');
assert.equal(calculateDemolition(target('container'), undefined, undefined).outcome, 'unknown');

// Conditions change the result, not the structure HP or attack damage.
assert.equal(calc('warp-ship', 'quasar').outcome, 'conditional');
assert.equal(calc('warp-ship', 'quasar', null, { shieldCleared: true }).outcome, 'health');
assert.equal(calc('warp-ship', 'orbital-precision').outcome, 'demolish');
assert.equal(calc('warp-ship', 'c4-pack').outcome, 'health', 'A reviewed C4 blast bypasses the ship shield');
assert.equal(calc('warp-ship', 'c4-pack').hits, 1);
assert.equal(calc('warp-ship', 'c4-pack').unit, '개');
assert.equal(calc('warp-ship', 'seaf-artillery', 'he').outcome, 'demolish');
assert.equal(calc('warp-ship', 'seaf-artillery', 'smoke').outcome, 'conditional');
assert.equal(calc('warp-ship', 'seaf-artillery', 'smoke', { shieldCleared: true }).outcome, 'demolish');
assert.equal(calc('warp-ship', 'seaf-artillery', 'smoke', { shieldCleared: true }).component, 'direct');
assert.equal(calc('warp-ship', 'orbital-smoke').outcome, 'unknown', 'Unconfirmed non-explosive hull path must remain uncertain');
assert.equal(calc('jammer', 'orbital-precision').outcome, 'conditional');
assert.equal(calc('jammer', 'orbital-precision', null, { jammerDisabled: true }).outcome, 'demolish');
assert.equal(calc('jammer', 'portable-hellbomb').outcome, 'demolish', 'An already carried bomb does not need a call-in');
assert.equal(calc('container', 'autocannon-sentry').outcome, 'conditional', 'Numeric force is not a promise of automatic target acquisition');
assert.equal(calc('gunship-facility', 'seaf-artillery', 'he').outcome, 'blocked');
assert.equal(calc('gunship-facility', 'seaf-artillery', 'mini-nuke').outcome, 'demolish');

// Epoch's ordinary and fully charged projectiles are separate attacks. The
// weapon's overcharge self-destruction explosion is not a selectable shot.
assert.deepEqual(demolitionProfiles.epoch.modes.map(mode => [mode.id, mode.name, mode.direct, mode.explosion]), [
  ['standard', '일반 발사', 10, 10],
  ['charged', '완전 충전 발사', 10, 30],
]);
assert.equal(demolitionProfiles.epoch.source, 'https://helldivers.wiki.gg/wiki/PLAS-45_Epoch');
const standardEpoch = attack('epoch', 'standard');
const chargedEpoch = attack('epoch', 'charged');
assert.deepEqual(standardEpoch.damage, { standard: 400, durable: 200, ap: 4, explosion: 500, explosionAp: 4 });
assert.deepEqual(chargedEpoch.damage, { standard: 800, durable: 400, ap: 5, explosion: 800, explosionAp: 5 });
assert.equal(calc('container', 'epoch', 'standard').outcome, 'blocked', '10 direct + 10 blast must not meet force 20');
assert.equal(calc('container', 'epoch', 'charged').outcome, 'demolish');
assert.equal(calc('titan-hole', 'epoch', 'charged').outcome, 'blocked', '10 direct + 30 blast must not meet force 40');
assert.equal(calc('bug-hole', 'epoch', 'standard').outcome, 'blocked');
const chargedHole = calc('bug-hole', 'epoch', 'charged');
assert.equal(chargedHole.outcome, 'conditional');
assert.equal(chargedHole.route.id, 'inner');
assert.equal(chargedHole.component, 'explosion');
assert(chargedHole.conditions.some(condition => condition.includes('굴 안쪽') && condition.includes('폭발')));
assert.equal(chargedHole.routes.find(row => row.route.id === 'outer').outcome, 'insufficient');

assert.equal(calc('fabricator', 'epoch', 'standard').outcome, 'blocked', 'Known AP 4 damage cannot penetrate the AV 5 wall');
const chargedFactory = calc('fabricator', 'epoch', 'charged');
assert.equal(chargedFactory.method, 'health');
assert.equal(chargedFactory.hits, 2);
assert.deepEqual(chargedFactory.health, { direct: 260, explosion: 520, total: 780, hits: 2 });
assert.equal(chargedFactory.routes.find(row => row.route.id === 'outer').outcome, 'insufficient');
assert.equal(chargedFactory.routes.find(row => row.route.id === 'vent').outcome, 'pass');
assert.match(openingRouteNote(chargedFactory), /환풍구 안쪽에 폭발이 들어가야/);
assert.match(openingRouteNote(chargedFactory), /체력 소진 탄수와 별도로/);
assert.equal(openingRouteNote(calc('fabricator', 'epoch', 'standard')), '');
assert.equal(calc('bulk-fabricator', 'epoch', 'charged').hits, 6);
assert.match(openingRouteNote(calc('bulk-fabricator', 'epoch', 'charged')), /상단 환풍구 안쪽/);
for (const id of ['spore-spewer', 'shrieker-nest']) {
  const standard = calc(id, 'epoch', 'standard');
  const charged = calc(id, 'epoch', 'charged');
  assert.equal(standard.method, 'health'); assert.equal(standard.hits, 4);
  assert.equal(charged.method, 'health'); assert.equal(charged.hits, 3);
  assert(standard.routes.every(row => row.outcome === 'insufficient') && charged.routes.every(row => row.outcome === 'insufficient'), 'HP destruction must work despite insufficient demolition force');
}
assert.equal(calc('warp-ship', 'epoch', 'charged').outcome, 'conditional');
assert.equal(calc('warp-ship', 'epoch', 'charged', { shieldCleared: true }).hits, 4);

// Any unverified damage component keeps HP destruction unknown; it must not be
// silently converted to zero, including when a known opening path still works.
for (const key of ['standard', 'durable', 'ap', 'explosion', 'explosionAp']) for (const missing of [null, undefined, NaN]) {
  const incomplete = { ...standardEpoch, damage: { ...standardEpoch.damage, [key]: missing } };
  const result = calculateDemolition(target('spore-spewer'), demolitionProfiles.epoch, incomplete);
  assert.equal(result.outcome, 'unknown'); assert.equal(result.health, null); assert.equal(result.hits, null);
}
const unknownChargedDamage = calculateDemolition(target('fabricator'), demolitionProfiles.epoch, { ...chargedEpoch, damage: undefined });
assert.equal(unknownChargedDamage.outcome, 'conditional');
assert.equal(unknownChargedDamage.route.id, 'vent');
assert.equal(unknownChargedDamage.health, null);
assert(unknownChargedDamage.conditions.some(condition => condition.includes('환풍구 안쪽')));

// Either selector can drive the calculator. No arbitrary weapon is chosen on
// entry, and reverse lookup includes only independently verified firing modes.
assert.deepEqual(getDemolitionSelection(initialDemolitionSelection, stratagems), { view: 'empty' });
const select = overrides => getDemolitionSelection({ ...initialDemolitionSelection, ...overrides }, stratagems);
const weaponEntry = (structure, weapon, options = {}) => select({ structure, ...options }).entries.find(entry => entry.weapon.id === weapon);
const card = entry => renderDemolitionWeaponCard(entry, { categories, wikiIcons });
const selectedPrecision = select({ weapon: 'orbital-precision', mode: 'standard' });
assert.equal(selectedPrecision.view, 'all');
assert.equal(selectedPrecision.rows.length, structures.length);
for (const result of selectedPrecision.rows) assert.deepEqual(result, calc(result.structure.id, 'orbital-precision'));
const selectedEpoch = select({ structure: 'fabricator', weapon: 'epoch', mode: 'charged' });
assert.equal(selectedEpoch.view, 'single');
assert.deepEqual(selectedEpoch.rows, [chargedFactory]);
const unreviewed = stratagems.find(item => !demolitionProfiles[item.id]);
assert.equal(select({ structure: 'fabricator', weapon: unreviewed.id, mode: 'unsupported' }).rows[0].outcome, 'unknown');

let reverseViews = 0;
for (const structure of structures) for (const cleared of [false, true]) {
  const options = { shieldCleared: cleared, jammerDisabled: cleared };
  const selection = select({ structure: structure.id, ...options });
  assert.equal(selection.view, 'weapons');
  assert.equal(selection.possible + selection.conditional, selection.entries.length);
  assert.equal(selection.entries.length + selection.unknown + selection.blocked, stratagems.length, 'Counts must be per stratagem, not per firing mode');
  const entries = new Map(selection.entries.map(entry => [entry.weapon.id, entry]));
  assert.equal(entries.size, selection.entries.length, 'A stratagem must appear only once');
  for (const weapon of stratagems) {
    const profile = demolitionProfiles[weapon.id];
    const expected = (profile?.modes || []).map(mode => ({ mode, result: calculateDemolition(structure, profile, mode, options) })).filter(attack => ['demolish', 'health', 'conditional'].includes(attack.result.outcome));
    assert.deepEqual(entries.get(weapon.id)?.attacks || [], expected, `Reverse lookup changed a calculation: ${structure.id}/${weapon.id}`);
    if (expected.length) {
      assert.equal(entries.get(weapon.id).outcome === 'conditional', expected.every(attack => attack.result.outcome === 'conditional'));
      const markup = card(entries.get(weapon.id));
      assert(markup.includes(wikiIcons[weapon.id].src), 'Use the existing Wiki icon');
      assert.doesNotMatch(markup, /undefined|NaN|Infinity/);
      for (const attack of expected) {
        assert(markup.includes(`data-demolition-mode="${attack.mode.id}"`), 'Details must open the firing mode being shown');
        const detail = select({ structure: structure.id, weapon: weapon.id, mode: attack.mode.id, ...options });
        assert.deepEqual(detail.rows[0], attack.result, 'The details selection must retain the reverse lookup result');
      }
    }
  }
  reverseViews++;
}

const epochFactory = weaponEntry('fabricator', 'epoch');
assert.deepEqual(epochFactory.attacks.map(attack => attack.mode.id), ['charged']);
assert.equal(epochFactory.attacks[0].result.hits, 2);
assert.match(card(epochFactory), /2발 · 본체 체력 소진/);
assert.match(card(epochFactory), /<p class="demolition-aim-note">별도 입구 철거: 환풍구 안쪽에 폭발/);
assert.doesNotMatch(card(epochFactory), /data-mode="standard"/);
const epochHole = weaponEntry('bug-hole', 'epoch');
assert.deepEqual(epochHole.attacks.map(attack => attack.mode.id), ['charged']);
assert.match(card(epochHole), /<p class="demolition-aim-note">조준 조건: 굴 안쪽에 폭발/);
assert.equal(weaponEntry('bug-hole', 'laser-cannon'), undefined);
assert.equal(weaponEntry('fabricator', 'machine-gun'), undefined, 'Unverified force must not appear as a viable weapon');
assert.deepEqual(weaponEntry('shrieker-nest', 'epoch').attacks.map(attack => [attack.mode.id, attack.result.hits]), [['standard', 4], ['charged', 3]]);
assert.deepEqual(weaponEntry('gunship-facility', 'seaf-artillery').attacks.map(attack => attack.mode.id), ['mini-nuke']);
assert.match(card(weaponEntry('fabricator', 'autocannon')), /조준 조건: 환풍구 안쪽에 폭발/);
assert.equal(weaponEntry('warp-ship', 'quasar').outcome, 'conditional');
assert.equal(weaponEntry('warp-ship', 'quasar', { shieldCleared: true }).outcome, 'health');
assert.equal(weaponEntry('jammer', 'orbital-precision').outcome, 'conditional');
assert.equal(weaponEntry('jammer', 'orbital-precision', { jammerDisabled: true }).outcome, 'demolish');
const c4Ship = weaponEntry('warp-ship', 'c4-pack');
assert.equal(c4Ship.outcome, 'health');
assert.match(card(c4Ship), /1개 · 본체 체력 소진/);
assert.doesNotMatch(card(c4Ship), /<p class="demolition-extra-condition">워프 함선의 보호막을 먼저/);
assert.deepEqual(getDemolitionSelection(initialDemolitionSelection, stratagems), { view: 'empty' }, 'Other selections must not mutate the initial state');

for (const id of featureIds) assert.equal(featureFromHash(`#${id}`), id);
for (const hash of ['', '#unknown', '#combat-extra']) assert.equal(featureFromHash(hash), 'catalog');
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const ui = await readFile(new URL('../dist/demolition-ui.js', import.meta.url), 'utf8');
for (const [, id] of ui.matchAll(/\$\('#([a-z-]+)'\)/g)) assert(html.includes(`id="${id}"`), `Missing demolition control: ${id}`);
for (const id of featureIds) assert(html.includes(`id="${id}-view"`) && html.includes(`data-feature="${id}"`));
console.log(`PASS: ${structures.length} facilities, ${Object.keys(demolitionProfiles).length} weapon profiles, ${combinations} demolition/HP cases, openings, shields, jammer conditions, uncertain data and 3 feature routes.`);
console.log(`PASS: ${reverseViews} building-to-stratagem views, separate firing modes, opening notes, Wiki icons and matching detail calculations.`);
