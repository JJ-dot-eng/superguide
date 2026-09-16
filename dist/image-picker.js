import { searchItems } from './search.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const controllers = new WeakMap();
export const syncImagePicker = select => controllers.get(select)?.sync();
export const focusImagePicker = select => (controllers.get(select)?.trigger || select).focus();

export const filterPickerItems = (items, query = '', group = '') => searchItems(items.filter(item => !group || item.group === group).map(item => ({ ...item, tags: item.tags || [] })), query);
export const pickerFocusIndex = (index, key, length) => Math.max(0, Math.min(length - 1, key === 'Home' ? 0 : key === 'End' ? length - 1 : index + ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }[key] || 0)));

const artwork = (item, allIcon) => {
  if (item.id === 'all') return `<span class="picker-all-icon" aria-hidden="true">${allIcon}</span>`;
  const framing = item.id.startsWith('voteless-') ? ' picker-bust-voteless'
    : ['rocket-devastator', 'heavy-devastator'].includes(item.id) ? ' picker-bust-devastator'
    : ['scout-strider', 'reinforced-strider'].includes(item.id) ? ' picker-raised-strider' : '';
  return `<span class="picker-image-frame${framing}"><img src="${escape(item.image.src)}" alt="" width="120" height="90" loading="lazy" decoding="async"></span>`;
};

export function renderPickerItems(items, selected, allIcon = '') {
  const focusId = items.some(item => item.id === selected) ? selected : items[0]?.id;
  return items.map(item => `<button type="button" class="picker-tile" role="option" data-picker-value="${escape(item.id)}" data-faction="${escape(item.faction || '')}" data-kind="${escape(item.image?.kind || 'stratagem')}" aria-selected="${item.id === selected}" tabindex="${item.id === focusId ? 0 : -1}" aria-label="${escape(item.name)}${item.image?.note ? ` · ${escape(item.image.note)}` : ''}">
    <span class="picker-art">${artwork(item, allIcon)}<span class="picker-selected" aria-hidden="true">선택됨</span></span>
    <span class="picker-name">${escape(item.name)}</span><span class="picker-caption">${escape(item.caption || item.group || '전체 보기')}</span>
  </button>`).join('');
}

// Enhance the existing selects: their values and change handlers remain the
// source of truth for both calculators and their cross-feature shortcuts.
export function initImagePickers(configs, { allIcon = '', document: doc = document } = {}) {
  const dialog = doc.createElement('dialog');
  dialog.id = 'image-picker';
  dialog.className = 'picker-dialog';
  dialog.setAttribute('aria-labelledby', 'picker-title');
  dialog.innerHTML = `<div class="picker-header"><div><span class="picker-eyebrow">이미지로 골라보세요</span><h2 id="picker-title"></h2></div><button type="button" class="picker-close">닫기</button></div>
    <div class="picker-tools"><label class="picker-search"><span class="sr-only">목록에서 이름 검색</span><input type="search" placeholder="이름으로 찾기" autocomplete="off" spellcheck="false"></label><div class="picker-groups" role="group" aria-label="목록 분류"></div><p class="picker-count" role="status" aria-live="polite"></p></div>
    <div class="picker-scroll"><div class="picker-grid" role="listbox" aria-labelledby="picker-title"></div><div class="picker-empty" hidden><p>일치하는 항목이 없습니다.</p><button type="button">검색 초기화</button></div></div>
    <div class="picker-footer"><span>방향키로 이동 · Enter로 선택</span><a class="picker-source" target="_blank" rel="noopener noreferrer">위키 이미지 출처 ↗</a></div>`;
  doc.body.append(dialog);
  const find = selector => dialog.querySelector(selector);
  const search = find('input');
  const groups = find('.picker-groups');
  const grid = find('.picker-grid');
  const scroller = find('.picker-scroll');
  let active = null;

  function render() {
    if (!active) return;
    const items = filterPickerItems(active.items, search.value, active.group);
    grid.innerHTML = renderPickerItems(items, active.select.value, allIcon);
    find('.picker-empty').hidden = items.length !== 0;
    find('.picker-count').textContent = `${items.length}개 항목`;
    groups.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pickerGroup === active.group)));
    scroller.scrollTop = 0;
    const selected = active.items.find(item => item.id === active.select.value);
    const source = selected?.image?.source;
    find('.picker-source').hidden = !source;
    if (source) find('.picker-source').href = source;
  }

  function open(entry) {
    active = entry;
    active.group = '';
    search.value = '';
    find('#picker-title').textContent = `${entry.title} 선택`;
    groups.innerHTML = ['', ...new Set(entry.items.map(item => item.group).filter(Boolean))].map(group => `<button type="button" data-picker-group="${escape(group)}" aria-pressed="${!group}">${escape(group || '전체')}</button>`).join('');
    render();
    dialog.showModal();
    entry.trigger.setAttribute('aria-expanded', 'true');
    search.focus();
  }

  const entries = configs.map(config => {
    const select = doc.getElementById(config.id);
    const trigger = doc.createElement('button');
    trigger.type = 'button';
    trigger.id = `${config.id}-picker`;
    trigger.className = 'picker-trigger';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', dialog.id);
    trigger.setAttribute('aria-expanded', 'false');
    const entry = { ...config, select, trigger, group: '' };
    const sync = () => {
      const selected = entry.items.find(item => item.id === select.value);
      if (!selected) return;
      trigger.innerHTML = `<span class="picker-trigger-art" data-kind="${escape(selected.image?.kind || 'stratagem')}">${artwork(selected, allIcon)}</span><span class="picker-trigger-name">${escape(selected.name)}</span><span class="picker-trigger-change" aria-hidden="true">변경</span>`;
      trigger.setAttribute('aria-label', `${entry.title}: ${selected.name}, 선택 변경`);
      trigger.dataset.faction = selected.faction || '';
      trigger.disabled = select.disabled;
    };
    select.after(trigger);
    if (select.labels?.[0]) select.labels[0].htmlFor = trigger.id;
    select.hidden = true;
    select.addEventListener('change', sync);
    controllers.set(select, { sync, trigger });
    trigger.addEventListener('click', () => open(entry));
    sync();
    return entry;
  });

  search.addEventListener('input', render);
  search.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); grid.querySelector('[tabindex="0"]')?.focus(); }
  });
  groups.addEventListener('click', event => {
    const button = event.target.closest('[data-picker-group]');
    if (!button || !active) return;
    active.group = button.dataset.pickerGroup;
    render();
  });
  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-picker-value]');
    if (!button || !active || !active.items.some(item => item.id === button.dataset.pickerValue)) return;
    active.select.value = button.dataset.pickerValue;
    active.select.dispatchEvent(new Event('change', { bubbles: true }));
    dialog.close();
  });
  grid.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const buttons = [...grid.querySelectorAll('[data-picker-value]')];
    const index = buttons.indexOf(event.target.closest('[data-picker-value]'));
    if (index < 0) return;
    event.preventDefault();
    const next = buttons[pickerFocusIndex(index, event.key, buttons.length)];
    buttons.forEach(button => button.tabIndex = button === next ? 0 : -1);
    next.focus();
  });
  find('.picker-close').addEventListener('click', () => dialog.close());
  find('.picker-empty button').addEventListener('click', () => { search.value = ''; active.group = ''; render(); search.focus(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    active?.trigger.setAttribute('aria-expanded', 'false');
    active?.trigger.focus();
    active = null;
  });
  return { entries, dialog };
}
