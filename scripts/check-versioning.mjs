import assert from 'node:assert/strict';
import { readSources, versionFiles, localReferences } from './version-assets.mjs';

const sources = await readSources();
const { files, versions } = versionFiles(sources);

// Every local module/stylesheet URL is versioned, and one file always gets one
// URL, so browsers never download or instantiate the same module twice.
const urls = new Map();
for (const [name, text] of files) {
  for (const match of text.matchAll(/['"]\.\/([a-z0-9-]+\.(?:js|css))(\?v=[0-9a-f]{12})?['"]/g)) {
    assert(match[2], `${name}: unversioned reference to ${match[1]}`);
    assert.equal(match[2], `?v=${versions.get(match[1])}`, `${name}: stale version for ${match[1]}`);
    urls.set(match[1], (urls.get(match[1]) || new Set()).add(match[2]));
  }
}
for (const [name, seen] of urls) assert.equal(seen.size, 1, `${name} is requested under more than one URL`);
assert(localReferences(sources.get('index.html')).includes('app.js') && localReferences(sources.get('index.html')).includes('styles.css'));

// A dependency change must change every importer's URL, and versioning twice changes nothing.
const edited = new Map(sources);
edited.set('combat-conditions.js', `${sources.get('combat-conditions.js')}\n// changed`);
const next = versionFiles(edited).versions;
for (const name of ['combat-conditions.js', 'combat-presentation.js', 'combat-ui.js', 'app.js']) assert.notEqual(next.get(name), versions.get(name), `${name} must be refreshed when combat-conditions.js changes`);
assert.equal(next.get('search.js'), versions.get('search.js'), 'Unrelated modules keep their cache key');
assert.deepEqual(versionFiles(files).files, files, 'Versioning must be idempotent');

console.log(`PASS: ${versions.size} content-hashed assets, one URL per module, dependency propagation and idempotent deploy versioning.`);
