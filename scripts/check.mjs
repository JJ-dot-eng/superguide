import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { categories, stratagems } from '../dist/data.js';
import { wikiIcons } from '../dist/wiki-icons.js';
import { createSearchMatcher, searchItems } from '../dist/search.js';
import { server } from '../server.mjs';
import './check-combat.mjs';
import './check-demolition.mjs';

const categoryIds = new Set(categories.map(item => item.id));
const ids = new Set();
for (const item of stratagems) {
  assert(item && !ids.has(item.id), `Missing or duplicate entry: ${item?.id}`);
  ids.add(item.id);
  assert(categoryIds.has(item.category) && item.category !== 'all', `Invalid category: ${item.id}`);
  for (const key of ['id', 'name', 'en', 'summary', 'usage', 'warning', 'source']) {
    assert.equal(typeof item[key], 'string', `${item.id}: missing ${key}`);
    assert(item[key].trim().length > 0, `${item.id}: empty ${key}`);
  }
  assert(item.tags.length > 0, `${item.id}: missing role tags`);
  const source = new URL(item.source);
  assert.equal(source.protocol, 'https:');
  assert.equal(source.hostname, 'helldivers.wiki.gg');
  if (item.extraSource) {
    const extraSource = new URL(item.extraSource);
    assert.equal(extraSource.protocol, 'https:');
    assert.equal(extraSource.hostname, 'helldivers.wiki.gg');
  }
  for (const key of ['direct', 'splash', 'range', 'radius', 'innerRadius', 'ap', 'splashAp']) {
    assert(item[key] == null || (Number.isFinite(item[key]) && item[key] >= 0), `${item.id}: invalid ${key}`);
  }
  if (item.ap != null) assert(Number.isInteger(item.ap) && item.ap <= 10, `${item.id}: invalid AP`);
  if (item.innerRadius != null) assert(item.radius >= item.innerRadius, `${item.id}: inverted blast radii`);
  if (item.utility) assert(item.direct == null && item.splash == null && item.ap == null, `${item.id}: utility damage must be N/A`);
  if (item.range != null) assert(item.rangeType, `${item.id}: numeric range needs its measurement type`);
  if (item.damageKind) assert.equal(item.damageKind, 'dps', `${item.id}: invalid rate unit`);
  if (item.input) assert(/^[↑↓←→]+$/.test(item.input), `${item.id}: invalid call code`);
}
assert.equal(stratagems.length, 110, 'Reviewed inventory must contain 110 distinct entries');
for (const category of categories.filter(item => item.id !== 'all')) assert(stratagems.some(item => item.category === category.id));

const precision = stratagems.find(item => item.id === 'orbital-precision');
for (const query of ['격타밀정도궤', '도밀격', '도밀타', ' 격 타 밀 정 도 궤 ', '궤도 정밀', 'ＯＰＳ']) {
  assert(createSearchMatcher(query)(precision), `Precision Strike should match: ${query}`);
}
assert(!createSearchMatcher('도밀양')(precision), 'Every search character must be present');
assert(!createSearchMatcher('도밀타')(stratagems.find(item => item.id === 'eagle-500kg')), 'A partial character overlap must not match');
assert(createSearchMatcher('AC-8')(stratagems.find(item => item.id === 'autocannon')), 'Equipment code search must still work');
assert(createSearchMatcher('대전차')(precision), 'Role keyword search must still work');
assert(!createSearchMatcher('차전대')(precision), 'Unordered matching must not pull characters from role tags');
assert.equal(stratagems.filter(createSearchMatcher('   ')).length, stratagems.length, 'Empty search should show all items');

const strikeIds = searchItems(stratagems, '타격').map(item => item.id);
assert.equal(strikeIds[0], 'orbital-precision', 'Name matches should retain their catalog order');
for (const id of ['autocannon', 'breaching-hammer']) {
  assert(strikeIds.includes(id), `Description matches should remain searchable: ${id}`);
  assert(strikeIds.indexOf('orbital-airburst') >= 0 && strikeIds.indexOf('orbital-airburst') < strikeIds.indexOf(id), 'Airburst Strike must precede description-only matches');
}
assert(strikeIds.indexOf('autocannon') < strikeIds.indexOf('breaching-hammer'), 'Description matches should retain their catalog order');
assert.deepEqual(searchItems(stratagems, '   '), stratagems, 'Clearing the search must restore the original order');
for (const [query, id] of [['도밀타', 'orbital-precision'], ['반톤', 'eagle-500kg'], ['톤반', 'eagle-500kg']]) {
  assert.equal(searchItems(stratagems, query)[0]?.id, id, `Unordered names and aliases must still work: ${query}`);
}
const aliasExample = Object.freeze([
  { ...stratagems.find(item => item.id === 'autocannon'), summary: '반톤 폭탄과 함께 쓰는 무기' },
  stratagems.find(item => item.id === 'eagle-500kg'),
]);
assert.deepEqual(searchItems(aliasExample, '반톤').map(item => item.id), ['eagle-500kg', 'autocannon'], 'Aliases must precede description-only matches without reordering source data');

assert.deepEqual(Object.keys(wikiIcons).sort(), [...ids].sort(), 'Every stratagem must have a Wiki icon');
const iconPaths = new Map();
for (const [id, icon] of Object.entries(wikiIcons)) {
  assert(/^\.\/assets\/stratagems\/[a-z0-9-]+\.svg$/.test(icon.src), `${id}: invalid icon path`);
  for (const key of ['source', 'originalUrl']) {
    const url = new URL(icon[key]);
    assert.equal(url.protocol, 'https:');
    assert.equal(url.hostname, 'helldivers.wiki.gg', `${id}: icon must come from the Wiki`);
  }
  assert(icon.title.endsWith('.svg'), `${id}: missing original file title`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(icon.retrievedAt), `${id}: missing retrieval date`);
  const bytes = await readFile(new URL(`../dist/${icon.src}`, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), icon.sha256, `${id}: original icon bytes changed`);
  assert(bytes.toString('utf8').includes('<svg'), `${id}: invalid SVG`);
  if (iconPaths.has(icon.src)) assert.equal(iconPaths.get(icon.src), icon.sha256, `${id}: inconsistent shared icon`);
  iconPaths.set(icon.src, icon.sha256);
}
const assetFiles = await readdir(new URL('../dist/assets/stratagems/', import.meta.url));
assert.deepEqual(assetFiles.sort(), [...iconPaths.keys()].map(path => path.split('/').at(-1)).sort(), 'No missing or unused icon files');

const files = await readdir(new URL('../dist/', import.meta.url));
for (const file of files.filter(name => name.endsWith('.js'))) {
  const result = spawnSync(process.execPath, ['--check', fileURLToPath(new URL(`../dist/${file}`, import.meta.url))], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
try {
  const base = `http://127.0.0.1:${server.address().port}`;
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)].map(match => match[1]);
  for (const path of ['/', ...refs, ...files.filter(name => name.endsWith('.js'))]) {
    const response = await fetch(`${base}/${path.replace(/^\//, '')}`);
    assert.equal(response.status, 200, `Broken local resource: ${path}`);
    if (path.endsWith('.js')) assert(response.headers.get('content-type').includes('javascript'));
  }
  for (const [path, sha256] of iconPaths) {
    const response = await fetch(new URL(path, base + '/'));
    assert.equal(response.status, 200, `Broken Wiki icon: ${path}`);
    assert(response.headers.get('content-type').includes('image/svg+xml'), `Incorrect icon MIME type: ${path}`);
    assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'), sha256, `Incorrect icon response: ${path}`);
  }
  for (const path of ['/missing', '/.git/config', '/..%2Fpackage.json', '/..%2F..%2F']) {
    const response = await fetch(base + path);
    assert([403, 404].includes(response.status), `Private path served: ${path}`);
  }
  assert.equal((await fetch(base, { method: 'POST' })).status, 405);
  assert.equal((await fetch(base, { method: 'HEAD' })).status, 200);
  console.log(`PASS: ${stratagems.length} records, 7 categories, name-first ranking, unordered names and aliases, ${iconPaths.size} original Wiki icons, ${files.filter(name => name.endsWith('.js')).length} JavaScript files, local assets and HTTP boundaries.`);
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
