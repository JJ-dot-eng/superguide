// Small in-memory DOM for exercising calculator controls without a browser.
// It parses rendered markup and dispatches actual registered handlers; layout,
// native dialog focus trapping and painting remain the browser's responsibility.
const decode = text => String(text).replace(/&(?:amp|lt|gt|quot|#39);/g, entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" }[entity]));
const voidTags = new Set(['AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR']);

class Element {
  constructor(tag, doc) {
    this.tagName = tag.toUpperCase(); this.ownerDocument = doc; this.children = []; this.attributes = {}; this.dataset = {}; this.handlers = {};
    this.value = ''; this.checked = false; this.disabled = false; this.hidden = false; this.open = false; this.scrollTop = 0; this.html = ''; this.text = '';
  }
  get id() { return this.attributes.id || ''; }
  set id(value) { this.setAttribute('id', value); }
  get className() { return this.attributes.class || ''; }
  set className(value) { this.setAttribute('class', value); }
  get htmlFor() { return this.attributes.for || ''; }
  set htmlFor(value) { this.setAttribute('for', value); }
  get tabIndex() { return Number(this.attributes.tabindex || 0); }
  set tabIndex(value) { this.setAttribute('tabindex', value); }
  get labels() { return this.ownerDocument.querySelectorAll('label').filter(label => label.htmlFor === this.id); }
  get innerHTML() { return this.html; }
  set innerHTML(html) {
    this.html = String(html); this.children = []; this.text = '';
    parse(this.html, this);
    if (this.tagName === 'SELECT') this.value = this.querySelector('option')?.value || '';
  }
  get textContent() { return this.text + this.children.map(child => child.textContent).join(''); }
  set textContent(value) { this.children = []; this.text = String(value); }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, char) => char.toUpperCase())] = String(value);
    if (name === 'value') this.value = String(value);
    if (['hidden', 'checked', 'disabled', 'open'].includes(name)) this[name] = true;
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  append(child) { child.parentElement = this; this.children.push(child); }
  after(child) { const parent = this.parentElement; child.parentElement = parent; parent.children.splice(parent.children.indexOf(this) + 1, 0, child); }
  matches(selector) {
    const tag = selector.match(/^[a-z][\w-]*/i)?.[0];
    if (tag && this.tagName !== tag.toUpperCase()) return false;
    const id = selector.match(/#([\w-]+)/)?.[1];
    if (id && this.id !== id) return false;
    for (const [, name] of selector.matchAll(/\.([\w-]+)/g)) if (!this.className.split(/\s+/).includes(name)) return false;
    for (const [, name, value] of selector.matchAll(/\[([^=\]]+)(?:="([^"]*)")?\]/g)) {
      if (!(name in this.attributes) || value !== undefined && this.attributes[name] !== value) return false;
    }
    return true;
  }
  querySelectorAll(selector) {
    const parts = selector.trim().split(/\s+/);
    let parents = [this];
    for (const part of parts) {
      const found = [];
      const visit = node => { for (const child of node.children) { if (child.matches(part)) found.push(child); visit(child); } };
      parents.forEach(visit); parents = [...new Set(found)];
    }
    return parents;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { for (let node = this; node; node = node.parentElement) if (node.matches(selector)) return node; return null; }
  addEventListener(type, callback) { (this.handlers[type] ||= []).push(callback); }
  dispatchEvent(event) {
    const delivered = { type: event.type, target: event.target || this, key: event.key, clientX: event.clientX, clientY: event.clientY, preventDefault() { this.defaultPrevented = true; } };
    for (const callback of this.handlers[event.type] || []) callback(delivered);
    return !delivered.defaultPrevented;
  }
  focus() { this.ownerDocument.activeElement = this; }
  showModal() { this.open = true; }
  close() { this.open = false; this.dispatchEvent({ type: 'close' }); }
  getBoundingClientRect() { return { left: 10, top: 10, right: 610, bottom: 710 }; }
}

function parse(html, root) {
  const stack = [root];
  for (const token of html.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) || []) {
    if (token.startsWith('<!')) continue;
    const closing = token.match(/^<\/([\w-]+)/);
    if (closing) {
      const index = stack.findLastIndex(node => node.tagName === closing[1].toUpperCase());
      if (index > 0) stack.length = index;
      continue;
    }
    const opening = token.match(/^<([\w-]+)([\s\S]*?)\/?\s*>$/);
    if (!opening) { stack.at(-1).text += decode(token); continue; }
    const element = root.ownerDocument.createElement(opening[1]);
    for (const [, name, double, single, bare] of opening[2].matchAll(/([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+)))?/g)) element.setAttribute(name, decode(double ?? single ?? bare ?? ''));
    stack.at(-1).append(element);
    if (!voidTags.has(element.tagName) && !token.endsWith('/>')) stack.push(element);
  }
}

export class TestDocument extends Element {
  constructor(html) { super('document'); this.ownerDocument = this; this.innerHTML = html; }
  get body() { return this.querySelector('body'); }
  createElement(tag) { return new Element(tag, this); }
  getElementById(id) { return this.querySelector('#' + id); }
}
