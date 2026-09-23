import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { stratagems, categories } from '../dist/data.js';
import { wikiIcons } from '../dist/wiki-icons.js';
import { pickerConfigs } from '../dist/picker-content.js';
import { pickerEnemyImages, pickerStructureImages } from '../dist/selector-images.js';
import { initImagePickers, filterPickerItems, renderPickerItems, pickerFocusIndex } from '../dist/image-picker.js';
import { initCombat } from '../dist/combat-ui.js';
import { initDemolition } from '../dist/demolition-ui.js';
import { TestDocument } from './test-dom.mjs';

const configs = pickerConfigs({ stratagems, categories, wikiIcons });
assert.deepEqual(configs.map(config => [config.id, config.items.length]), [['combat-enemy', 84], ['combat-weapon', 33], ['demolition-structure', 19], ['demolition-weapon', 111]]);
for (const config of configs) {
  assert.equal(new Set(config.items.map(item => item.id)).size, config.items.length);
  const html = renderPickerItems(config.items, config.items[0].id);
  assert.equal([...html.matchAll(/role="option"/g)].length, config.items.length);
  assert.equal([...html.matchAll(/aria-selected="true"/g)].length, 1);
  assert.equal([...html.matchAll(/tabindex="0"/g)].length, 1);
  assert.doesNotMatch(html, /undefined|NaN/);
}
assert.equal(filterPickerItems(configs[3].items, '도밀타')[0].id, 'orbital-precision');
assert.equal(filterPickerItems(configs[3].items, '반톤')[0].id, 'eagle-500kg');
assert.equal(filterPickerItems(configs[0].items, '존재하지않는적').length, 0);
assert(filterPickerItems(configs[0].items, '', '오토마톤').every(item => item.faction === '오토마톤'));
assert.equal(filterPickerItems(configs[2].items, '', '테르미니드').some(item => item.id === 'all'), false);
assert.match(renderPickerItems([{ id: 'unsafe', name: '<img src=x>', group: '"test"', image: { src: './safe.png' } }], ''), /&lt;img src=x&gt;/);
for (const [start, key, length, expected] of [[0, 'ArrowUp', 10, 0], [1, 'ArrowDown', 10, 4], [4, 'ArrowUp', 10, 1], [2, 'ArrowRight', 10, 3], [8, 'ArrowDown', 10, 9], [4, 'Home', 10, 0], [4, 'End', 10, 9]]) assert.equal(pickerFocusIndex(start, key, length), expected);

const paths = new Set();
for (const asset of [...Object.values(pickerEnemyImages), ...Object.values(pickerStructureImages)]) {
  if (asset.sourceType === 'user-provided') {
    assert.equal(asset.source, null);
    assert.equal(asset.assetUrl, null);
    assert.equal(asset.originalUrl, null);
    assert.equal(asset.uploader, null);
  } else {
    const wikiHost = new URL(asset.source).hostname;
    assert(['helldivers.wiki.gg', 'helldivers.fandom.com'].includes(wikiHost));
    const assetHost = wikiHost === 'helldivers.fandom.com' ? 'static.wikia.nocookie.net' : wikiHost;
    assert.equal(new URL(asset.assetUrl).hostname, assetHost);
    assert.equal(new URL(asset.originalUrl).hostname, assetHost);
    assert(asset.uploader);
  }
  assert.match(asset.retrievedAt, /^2026-09-(16|17)$/);
  assert(asset.width > 0 && asset.height > 0);
  const bytes = await readFile(new URL('../dist/' + asset.src.slice(2), import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
  if (asset.src.endsWith('.svg')) assert.match(bytes.toString(), /<svg/);
  else if (asset.src.endsWith('.webp')) {
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 16), 'WEBPVP8X');
    assert.equal(bytes.readUInt32LE(4) + 8, bytes.length);
    assert.equal(bytes.readUIntLE(24, 3) + 1, asset.width);
    assert.equal(bytes.readUIntLE(27, 3) + 1, asset.height);
  }
  else {
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), asset.width);
    assert.equal(bytes.readUInt32BE(20), asset.height);
  }
  paths.add(asset.src.split('/').at(-1));
}
assert.deepEqual((await readdir(new URL('../dist/assets/pickers/', import.meta.url))).sort(), [...paths].sort());
assert.equal(Object.values(pickerStructureImages).filter(image => image.kind === 'map').length, 12);
assert.equal(Object.values(pickerStructureImages).filter(image => image.kind === 'faction').length, 6);
for (const id of ['bug-hole', 'titan-hole', 'fabricator', 'bulk-fabricator', 'warp-ship', 'lightning-spire']) assert.equal(pickerStructureImages[id].note, '진영 공통 아이콘');

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const doc = new TestDocument(html);
const previous = globalThis.document;
try {
  globalThis.document = doc;
  const combat = initCombat({ stratagems, wikiIcons, navigate() {} });
  initDemolition({ stratagems, categories, wikiIcons });
  const { dialog } = initImagePickers(configs, { document: doc });
  const get = id => doc.getElementById(id);
  const inside = selector => dialog.querySelector(selector);
  const click = (node, target = node) => node.dispatchEvent({ type: 'click', target });
  const type = query => { inside('input').value = query; inside('input').dispatchEvent({ type: 'input' }); };
  const select = id => click(inside('.picker-grid'), inside('.picker-grid').querySelectorAll('button').find(button => button.dataset.pickerValue === id));
  for (const config of configs) {
    const native = get(config.id);
    assert.deepEqual(new Set(native.querySelectorAll('option').map(option => option.value)), new Set(config.items.map(item => item.id)), 'Every existing option must remain selectable');
    assert.equal(native.hidden, true);
    assert.equal(get(config.id + '-picker').getAttribute('aria-haspopup'), 'dialog');
  }
  click(get('combat-enemy-picker'));
  assert.equal(dialog.open, true);
  assert.equal(doc.activeElement, inside('input'));
  assert.match(inside('#picker-title').textContent, /적 유닛 선택/);
  type('차저');
  assert.equal(inside('.picker-grid').querySelectorAll('button').length, 4);
  select('behemoth');
  assert.equal(get('combat-enemy').value, 'behemoth');
  assert.match(get('combat-answer').innerHTML, /베히모스 차저/);
  assert.match(get('combat-enemy-picker').innerHTML, /베히모스 차저/);
  assert.equal(dialog.open, false);
  assert.equal(doc.activeElement, get('combat-enemy-picker'));
  assert.equal(get('combat-enemy-picker').getAttribute('aria-expanded'), 'false');
  click(get('combat-weapon-picker')); type('멜타건'); select('meltagun');
  assert.equal(get('combat-mode').value, 'near');
  assert.match(get('combat-loadout').innerHTML, /3,640/);
  combat.openWeapon('speargun');
  assert.match(get('combat-weapon-picker').innerHTML, /작살총/);
  assert.equal(doc.activeElement, get('combat-enemy-picker'));

  click(get('demolition-structure-picker')); type('제조소'); select('fabricator');
  assert.equal(get('demolition-results').dataset.view, 'weapons');
  assert.match(get('demolition-answer').innerHTML, /모든 스트라타젬/);
  click(get('demolition-weapon-picker')); type('일회성 대전차'); select('expendable-at');
  assert.match(get('demolition-results').innerHTML, /체력 파괴 가능/);
  assert.match(get('demolition-weapon-picker').innerHTML, /일회성 대전차/);
  click(get('demolition-structure-picker')); select('all');
  assert.match(get('demolition-structure-picker').innerHTML, /모든 건물/);
  click(get('demolition-weapon-picker')); select('all');
  assert.match(get('demolition-answer').innerHTML, /건물이나 스트라타젬을 선택해 주세요/);

  click(get('combat-enemy-picker'));
  const group = inside('.picker-groups').querySelectorAll('button').find(button => button.dataset.pickerGroup === '오토마톤');
  click(inside('.picker-groups'), group);
  assert(inside('.picker-grid').querySelectorAll('button').every(button => button.dataset.faction === '오토마톤'));
  type('존재하지않음');
  assert.equal(inside('.picker-empty').hidden, false);
  click(inside('.picker-empty button'));
  assert.equal(inside('.picker-grid').querySelectorAll('button').length, 84);
  inside('input').dispatchEvent({ type: 'keydown', key: 'ArrowDown' });
  const buttons = inside('.picker-grid').querySelectorAll('button');
  const current = buttons.indexOf(doc.activeElement);
  inside('.picker-grid').dispatchEvent({ type: 'keydown', key: 'ArrowDown', target: doc.activeElement });
  assert.equal(doc.activeElement, buttons[Math.min(current + 3, buttons.length - 1)]);
  dialog.dispatchEvent({ type: 'click', target: dialog, clientX: 0, clientY: 0 });
  assert.equal(dialog.open, false);
  click(get('combat-enemy-picker'));
  click(inside('.picker-close'));
  assert.equal(doc.activeElement, get('combat-enemy-picker'));
} finally {
  if (previous === undefined) delete globalThis.document;
  else globalThis.document = previous;
}
const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8');
assert.match(css, /\.picker-grid\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
assert.match(css, /\.picker-scroll\{[^}]*overflow-y:auto[^}]*overscroll-behavior:contain/);
console.log(`PASS: four image pickers, ${configs.reduce((sum, config) => sum + config.items.length, 0)} options, search/groups, selection synchronization, keyboard/focus/close behavior, both calculators and ${paths.size} source image assets.`);
