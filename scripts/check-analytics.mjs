import assert from 'node:assert/strict';
import { initAnalytics } from '../dist/analytics.js';

function fixture(url) {
  const scripts = [];
  const win = { location: new URL(url) };
  const doc = {
    createElement: tag => ({ tag }),
    head: { appendChild: script => scripts.push(script) },
  };
  return { win, doc, scripts };
}

for (const url of [
  'http://127.0.0.1:4173/#combat', 'http://localhost:4173/',
  'https://superguide.jjknown.chatgpt.site/',
  'https://jj-dot-eng.github.io/another-project/',
  'https://jj-dot-eng.github.io/superguide-other/',
]) {
  const { win, doc, scripts } = fixture(url);
  initAnalytics(win, doc)('combat');
  assert.equal(scripts.length, 0, `Preview must not load GA: ${url}`);
  assert.equal(win.dataLayer, undefined);
}

const { win, doc, scripts } = fixture('https://jj-dot-eng.github.io/superguide/#combat');
const track = initAnalytics(win, doc);
assert.equal(scripts.length, 1);
assert.equal(scripts[0].async, true);
assert.equal(scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-5XFT3VQ054');
assert.equal(win.dataLayer[1][0], 'config');
assert.equal(win.dataLayer[1][1], 'G-5XFT3VQ054');
assert.equal(win.dataLayer[1][2].allow_google_signals, false);
// Works while the external script is pending or blocked: events stay queued.
for (const feature of ['combat', 'combat', 'demolition', 'factions', 'catalog', 'unknown', 'combat']) track(feature);
const events = win.dataLayer.filter(args => args[0] === 'event');
assert.deepEqual(events.map(args => args[2].feature), ['combat', 'demolition', 'factions', 'catalog', 'combat']);
assert(events.every(args => args[1] === 'view_feature' && args[2].send_to === 'G-5XFT3VQ054'));
assert(!events.some(args => args[1] === 'page_view'), 'Do not duplicate enhanced measurement pageviews');
console.log('Analytics checks passed: production-only tag and deduplicated tab events.');
