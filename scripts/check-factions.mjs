import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { factionGuides, factionSides } from '../dist/faction-data.js';
import { factionRecommendation, renderFactionGuide, initFactionGuide } from '../dist/faction-guide.js';
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
    const { enemy, mode, row, weapon, reference } = factionRecommendation(unit, choice);
    assert(row, `${unit.enemy}/${choice} must have a verified recommended route`);
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
    if (enemy.shield) assert.match(html, /보호막 제거에 필요한 공격|조종사 보호막과 기체/);
    cases++;
  }
}
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
