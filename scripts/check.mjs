import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { categories, stratagems } from '../dist/data.js';
import { server } from '../server.mjs';

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
  for (const path of ['/missing', '/.git/config', '/..%2Fpackage.json', '/..%2F..%2F']) {
    const response = await fetch(base + path);
    assert([403, 404].includes(response.status), `Private path served: ${path}`);
  }
  assert.equal((await fetch(base, { method: 'POST' })).status, 405);
  assert.equal((await fetch(base, { method: 'HEAD' })).status, 200);
  console.log(`PASS: ${stratagems.length} records, 7 categories, ${files.filter(name => name.endsWith('.js')).length} JavaScript files, local assets and HTTP boundaries.`);
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
