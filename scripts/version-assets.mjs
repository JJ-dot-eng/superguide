// Adds content-hash cache keys to every local module and stylesheet URL in dist/.
// Source files reference plain paths ('./combat.js'); the deploy workflow runs
// this before publishing so each URL changes exactly when the file, or any
// module it imports, changes. Usage: node scripts/version-assets.mjs [--dry-run]
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dist = new URL('../dist/', import.meta.url);
// Static imports/exports, dynamic import() and HTML src/href attributes.
const specifier = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|(?:src|href)=)(['"])\.\/([a-z0-9-]+\.(?:js|css))(?:\?v=[^'"]*)?\2/g;
const digest = text => createHash('sha256').update(text.replaceAll('\r\n', '\n')).digest('hex').slice(0, 12);

export function localReferences(text) {
  return [...text.matchAll(specifier)].map(match => match[3]);
}

// Returns { files: Map(name -> rewritten text), versions: Map(name -> hash) }.
export function versionFiles(sources) {
  const versions = new Map();
  const rewritten = new Map();
  const visiting = new Set();
  const rewrite = text => text.replace(specifier, (_, prefix, quote, name) => {
    if (!sources.has(name)) throw new Error(`Missing local asset: ${name}`);
    return `${prefix}${quote}./${name}?v=${version(name)}${quote}`;
  });
  function version(name) {
    if (versions.has(name)) return versions.get(name);
    if (visiting.has(name)) throw new Error(`Circular module import through ${name}`);
    visiting.add(name);
    const text = rewrite(sources.get(name));
    visiting.delete(name);
    rewritten.set(name, text);
    versions.set(name, digest(text));
    return versions.get(name);
  }
  for (const name of sources.keys()) if (!name.endsWith('.html')) version(name);
  for (const name of sources.keys()) if (name.endsWith('.html')) rewritten.set(name, rewrite(sources.get(name)));
  return { files: rewritten, versions };
}

export async function readSources(directory = dist) {
  const names = (await readdir(directory)).filter(name => /\.(?:js|css|html)$/.test(name));
  return new Map(await Promise.all(names.map(async name => [name, await readFile(new URL(name, directory), 'utf8')])));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const sources = await readSources();
  const { files, versions } = versionFiles(sources);
  const changed = [...files].filter(([name, text]) => text !== sources.get(name));
  if (!process.argv.includes('--dry-run')) for (const [name, text] of changed) await writeFile(new URL(name, dist), text);
  console.log(`${process.argv.includes('--dry-run') ? 'Would version' : 'Versioned'} ${versions.size} assets; ${changed.length} files updated.`);
}
