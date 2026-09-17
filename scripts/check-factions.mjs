import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { factionGuides, factionSides } from '../dist/faction-data.js';
import { factionRecommendation, factionRouteText, renderFactionGuide, initFactionGuide } from '../dist/faction-guide.js';
import { calculateMatchup } from '../dist/combat.js';
import { stratagems } from '../dist/data.js';
import { wikiIcons } from '../dist/wiki-icons.js';
import { initCombat } from '../dist/combat-ui.js';
import { TestDocument } from './test-dom.mjs';
import { factionLoadouts } from '../dist/faction-loadouts.js';

let cases = 0;
assert.equal(new Set(factionGuides.map(item => item.id)).size, factionGuides.length);
for (const guide of factionGuides) {
  assert(factionSides.some(side => side.id === guide.side));
  const html = renderFactionGuide(guide, stratagems, wikiIcons);
  assert.doesNotMatch(html, /대물소총|data-weapon="anti-materiel"/);
  assert.doesNotMatch(html, /undefined|NaN/);
  assert(html.includes(guide.source));
  for (const unit of guide.units) for (const choice of unit.weapons) {
    const selection = factionLoadouts[unit.enemy].find(item => item.weapon === choice);
    assert(selection?.label && selection.note);
    assert(html.includes(selection.note), 'Show the actual matchup-specific benefit and limitation');
    const { enemy, mode, row, weapon, reference, tactic, approach } = factionRecommendation(unit, choice);
    if (!row) {
      assert(tactic?.source && mode.unsupported, `${unit.enemy}/${choice} needs source-backed advice and an explicit calculation limitation`);
      assert(html.includes(mode.unsupported));
      cases++;
      continue;
    }
    const actual = calculateMatchup(enemy, mode, { shieldCleared: true, ...(approach ? { directHit: approach.directHit } : {}) }).rows.find(item => item.target.id === row.target.id);
    assert.deepEqual(row, actual);
    assert(['kill', 'bleed', 'down'].includes(row.outcome));
    assert(selection.targets.includes(row.target.id), 'Do not silently replace practical aim with the lowest-count part');
    assert(!row.conditional);
    if (enemy.id === 'wretch') assert.equal(row.target.id, 'leg');
    if (enemy.id === 'vox-engine' && ['leveller', 'solo-silo'].includes(weapon)) {
      assert(reference); assert.equal(row.hits, 3);
      assert.match(html, /몸통 명중 시 1발 처치 가능/);
      assert.match(html, /별도의 단일 부위 계산/);
    }
    if (enemy.shield) assert.match(html, /보호막 제거에 쓴 탄수|보호막 제거에 필요한 공격|조종사 보호막과 기체|방패/);
    cases++;
  }
}
const unit = id => factionGuides.flatMap(guide => guide.units).find(item => item.enemy === id);
for (const id of ['jet-brigade-hulk-bruiser', 'jet-brigade-hulk-scorcher']) {
  assert.deepEqual(unit(id).weapons.slice(0, 2), ['grenade-launcher', 'epoch:charged']);
  assert.equal(unit(id).weapons.at(-1), 'autocannon');
  for (const [choice, hits, damage] of [['grenade-launcher', 3, 260], ['epoch:charged', 1, 800]]) {
    const recommendation = factionRecommendation(unit(id), choice);
    assert.equal(recommendation.row.target.id, 'jetpack');
    assert.equal(recommendation.row.hits, hits);
    assert.equal(recommendation.row.stages[0].damage.direct, 0, 'Frontal splash must not invent a direct jetpack hit');
    assert.equal(recommendation.row.stages[0].damage.explosion, damage);
    assert.equal(recommendation.approach.directHit, false);
  }
  const amr = factionRecommendation(unit(id), 'anti-materiel');
  assert.equal(amr.row.target.id, 'head');
  assert.equal(amr.row.hits, 1);
  assert.equal(amr.alternatives.find(row => row.target.id === 'jetpack').hits, 3);
  assert.equal(factionRecommendation(unit(id), 'heavy-machine-gun').row.hits, 4);
}
for (const guide of factionGuides) for (const item of guide.units) {
  assert(!item.weapons.includes('anti-materiel'));
}
assert.equal(factionRecommendation(unit('predator-stalker'), 'machine-gun').row.target.id, 'body-armor');
assert.equal(factionRecommendation(unit('predator-stalker'), 'machine-gun').row.hits, 12, 'Do not automatically promote the 2-shot small head');
assert.equal(factionRecommendation(unit('overseer'), 'machine-gun').row.target.id, 'chest-armor');
assert.equal(factionRecommendation(unit('elevated-overseer'), 'machine-gun').row.target.id, 'chest-armor');
assert.equal(factionRecommendation(unit('agitator'), 'grenade-launcher').row.target.id, 'pelvis-left-leg');
assert.equal(factionRecommendation(unit('hulk-firebomber'), 'autocannon').row.target.id, 'heatsink');
const jetHTML = renderFactionGuide(factionGuides.find(guide => guide.id === 'jet-brigade'), stratagems, wikiIcons);
assert.match(jetHTML, /정면 상부에 착탄 → 뒤쪽 제트팩에 폭발/);
assert.match(jetHTML, /3발 · 제트팩 파괴로 처치/);
assert.match(jetHTML, /1발 · 제트팩 파괴로 처치/);
assert.match(jetHTML, /정면 어디에 맞혀도 같은 결과가 나오는 것은 아니며/);
assert.match(jetHTML, /제트팩 직격을 제외/);
assert.match(jetHTML, /완전 충전 필요/);
assert.match(jetHTML, /과도|지나치게|자폭/);
const gate = factionRecommendation(unit('gatekeeper'), 'autocannon');
assert.equal(gate.row.target.id, 'rear-weakspot');
assert.equal(gate.row.hits, 3);
assert.equal(calculateMatchup(gate.enemy, gate.mode, { shieldCleared: true }).rows.find(row => row.target.id === 'chassis').hits, 10);
assert.equal(factionRecommendation(unit('gatekeeper'), 'recoilless').row.target.id, 'chassis');
assert.equal(factionRecommendation(unit('rupture-spewer'), 'grenade-launcher').row.target.id, 'butt');
const flesh = factionRecommendation(unit('fleshmob'), 'grenade-launcher');
assert.equal(flesh.row.hits, 13, 'Do not overwrite the existing single-pool calculation with a Wiki tactic');
assert.match(flesh.tactic.title, /4발/);
const fleshText = factionRouteText(flesh.row, flesh.mode);
assert.equal(fleshText.title, '본체 폭발 피해 · 단일 판정 가정');
assert.doesNotMatch(fleshText.tip, /팔 한쪽의 파괴입니다/);
assert.match(fleshText.tip, /조준하는 것이 가장 효과적이라는 뜻은 아닙니다/);
const crusher = factionRecommendation(unit('crusher'), 'autocannon');
assert.equal(crusher.row.hits, 3);
assert.deepEqual(crusher.row.stages.map(stage => stage.hits), [2, 1]);
const mindlessHTML = renderFactionGuide(factionGuides.find(guide => guide.id === 'mindless'), stratagems, wikiIcons);
assert.match(mindlessHTML, /대공포탄 모드/);
assert.match(mindlessHTML, /별도의 단일 부위 계산 보기/);
assert.match(mindlessHTML, /어느 부위든 4발 처치를 보장/);
const incinerationHTML = renderFactionGuide(factionGuides.find(guide => guide.id === 'incineration'), stratagems, wikiIcons);
assert.match(incinerationHTML, /소이 산탄총/);
assert.doesNotMatch(incinerationHTML, /보호막 제거에 필요한 공격/);
const previous = globalThis.document;
try {
  const doc = new TestDocument(await readFile(new URL('../dist/index.html', import.meta.url), 'utf8'));
  globalThis.document = doc;
  let route;
  const combat = initCombat({ stratagems, wikiIcons, navigate: view => { route = view; } });
  initFactionGuide({ stratagems, wikiIcons, openMatchup: combat.openMatchup });
  const root = doc.querySelector('#factions-view');
  const click = selector => { const button = root.querySelector(selector); assert(button, selector); root.dispatchEvent({ type: 'click', target: button }); };
  click('[data-faction-side="illuminate"]');
  click('[data-faction-id="mindless"]');
  assert.match(root.innerHTML, /마인드리스 매스/);
  click('[data-faction-combat="harvester"]');
  assert.equal(route, 'combat');
  assert.equal(doc.querySelector('#combat-enemy').value, 'harvester');
  assert.equal(doc.querySelector('#combat-weapon').value, 'heavy-machine-gun');
  assert.equal(doc.querySelector('#combat-shield-cleared').checked, true);
  click('[data-faction-combat="fleshmob"][data-weapon="autocannon"]');
  assert.equal(doc.querySelector('#combat-mode').value, 'flak');
  assert.match(doc.querySelector('#combat-answer').innerHTML, /파편|근접 신관/);
  combat.openMatchup({ enemy: 'charger', weapon: 'epoch', mode: 'charged' });
  assert.equal(doc.querySelector('#combat-mode').value, 'charged');
  assert.equal(doc.querySelector('#combat-shield-cleared').checked, false);
  click('[data-faction-side="automaton"]');
  click('[data-faction-combat="jet-brigade-hulk-bruiser"][data-weapon="epoch"]');
  assert.equal(doc.querySelector('#combat-enemy').value, 'jet-brigade-hulk-bruiser');
  assert.equal(doc.querySelector('#combat-mode').value, 'charged');
  click('[data-faction-id="cyborgs"]');
  assert.match(root.innerHTML, /몸통 명중 시 1발 처치 가능/);
  click('[data-faction-combat="vox-engine"]');
  assert.match(doc.querySelector('#combat-answer').innerHTML, /몸통 명중 시 1발 처치 가능/);
} finally {
  if (previous === undefined) delete globalThis.document; else globalThis.document = previous;
}
console.log(`PASS: ${factionGuides.length} faction guides, ${cases} shared-engine recommendations, shield conditions, Vox reference distinction and calculator handoff.`);
