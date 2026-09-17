import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { factionGuides, factionSides } from '../dist/faction-data.js';
import { factionRecommendation, factionRouteText, renderFactionGuide, initFactionGuide } from '../dist/faction-guide.js';
import { calculateMatchup } from '../dist/combat.js';
import { stratagems } from '../dist/data.js';
import { wikiIcons } from '../dist/wiki-icons.js';
import { initCombat } from '../dist/combat-ui.js';
import { TestDocument } from './test-dom.mjs';

let cases = 0;
assert.equal(new Set(factionGuides.map(item => item.id)).size, factionGuides.length);
for (const guide of factionGuides) {
  assert(factionSides.some(side => side.id === guide.side));
  const html = renderFactionGuide(guide, stratagems, wikiIcons);
  assert.doesNotMatch(html, /undefined|NaN/);
  assert(html.includes(guide.source));
  for (const unit of guide.units) for (const choice of unit.weapons) {
    const { enemy, mode, row, weapon, reference, tactic } = factionRecommendation(unit, choice);
    if (!row) {
      assert(tactic?.source && mode.unsupported, `${unit.enemy}/${choice} needs source-backed advice and an explicit calculation limitation`);
      assert(html.includes(mode.unsupported));
      cases++;
      continue;
    }
    const actual = calculateMatchup(enemy, mode, { shieldCleared: true }).rows.find(item => item.target.id === row.target.id);
    assert.deepEqual(row, actual);
    assert(['kill', 'bleed', 'down'].includes(row.outcome));
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
  const amr = factionRecommendation(unit(id), 'anti-materiel');
  assert.equal(amr.row.target.id, 'head');
  assert.equal(amr.row.hits, 1);
  assert.equal(amr.alternatives.find(row => row.target.id === 'jetpack').hits, 3);
  assert.equal(factionRecommendation(unit(id), 'heavy-machine-gun').row.hits, 4);
}
const gate = factionRecommendation(unit('gatekeeper'), 'autocannon');
assert.equal(gate.row.target.id, 'rear-weakspot');
assert.equal(gate.row.hits, 3);
assert.equal(gate.alternatives.find(row => row.target.id === 'chassis').hits, 10);
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
  click('[data-faction-id="cyborgs"]');
  assert.match(root.innerHTML, /몸통 명중 시 1발 처치 가능/);
  click('[data-faction-combat="vox-engine"]');
  assert.match(doc.querySelector('#combat-answer').innerHTML, /몸통 명중 시 1발 처치 가능/);
} finally {
  if (previous === undefined) delete globalThis.document; else globalThis.document = previous;
}
console.log(`PASS: ${factionGuides.length} faction guides, ${cases} shared-engine recommendations, shield conditions, Vox reference distinction and calculator handoff.`);
