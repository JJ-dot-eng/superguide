import { categories, stratagems, checkedAt } from './data.js?v=meltagun-1';
import { renderDefenseStats, renderDefenseSource, defenseComparisonRows } from './defense-stats.js?v=shield-generators-1';
import { wikiIcons } from './wiki-icons.js';
import { searchItems } from './search.js';
import { initCombat } from './combat-ui.js?v=meltagun-1';
import { initFeatureNavigation } from './features.js?v=all-stratagems-1';
import { initDemolition } from './demolition-ui.js?v=demolition-paths-2';

const $ = (selector) => document.querySelector(selector);
const state = { category: 'all', search: '', penetration: 'all', view: 'grid', selected: new Set() };
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const number = value => typeof value === 'number' ? value.toLocaleString('ko-KR') : value;
const stratagemIcon = item => `<img class="wiki-stratagem-icon" src="${escape(wikiIcons[item.id].src)}" alt="" width="40" height="40">`;
const icons = {
  grid: '<rect x="3" y="3" width="6" height="6"/><rect x="15" y="3" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/><rect x="15" y="15" width="6" height="6"/>',
  crosshair: '<circle cx="12" cy="12" r="7"/><path d="M12 1v6m0 10v6M1 12h6m10 0h6"/>',
  orbit: '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-35 12 12)"/><path d="M9 2a10 10 0 0 1 10 17M15 22A10 10 0 0 1 5 5"/>',
  eagle: '<path d="m3 5 9 5 9-5M3 11l9 5 9-5M7 18l5 3 5-3M12 10v6"/>',
  defense: '<path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6zM8 12h8M12 8v8"/>',
  backpack: '<rect x="6" y="5" width="12" height="16" rx="2"/><path d="M9 5V2h6v3M6 11h12M9 15h6M2 9v9m20-9v9"/>',
  vehicle: '<rect x="3" y="7" width="18" height="11" rx="2"/><path d="m6 7 2-4h8l2 4M7 18v3m10-3v3M3 13h18M6 10h1m10 0h1"/>',
  flag: '<path d="M5 22V2m0 1h14l-3 5 3 5H5"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.crosshair}</svg>`;
const cat = id => categories.find(category => category.id === id);
const apLabel = ap => ap >= 5 ? '대전차' : ap === 4 ? '중장갑' : ap === 3 ? '일반 장갑' : ap >= 1 ? '경장갑' : '비장갑';

function statValues(item) {
  const range = item.range != null ? `${number(item.range)}<small>m</small>` : item.radius != null ? `${number(item.radius)}<small>m</small>` : escape(item.rangeLabel || '미확인');
  const rangeCaption = item.range != null ? (item.rangeType || '사거리') : item.radius != null ? '폭발 외곽 반경' : (item.rangeNoteShort || '확정 거리 없음');
  const damage = (key, textKey) => item[textKey] ? escape(item[textKey]) : item.utility ? '해당 없음' : item[key] == null ? '미확인' : `${number(item[key])}${item.damageKind === 'dps' && key === 'direct' ? '<small>/s</small>' : ''}`;
  return [
    { label: '사거리 / 범위', value: range, caption: rangeCaption, style: item.range == null && item.radius == null ? 'word' : '' },
    { label: item.damageKind === 'dps' ? '지속 피해' : '직격 피해', value: damage('direct', 'directText'), caption: item.directNoteShort || (item.utility ? '지원 장비' : item.damageKind === 'dps' ? '초당 · 표기 기준' : item.unit || '탄 / 포탄 1발'), style: item.utility || item.direct == null && !item.directText ? 'unknown' : item.directText ? 'word' : '' },
    { label: '폭발 피해', value: damage('splash', 'splashText'), caption: item.splashNoteShort || (item.utility ? '피해 목적 아님' : item.splash === 0 ? '폭발 없음' : '중심부 최대'), style: item.utility || item.splash == null && !item.splashText ? 'unknown' : item.splashText ? 'word' : '' },
    { label: '장갑 관통', value: item.ap != null ? `AP ${item.ap}` : item.utility ? '해당 없음' : '미확인', caption: item.ap != null ? item.apNoteShort || apLabel(item.ap) + (item.splashAp != null && item.splashAp !== item.ap ? ` · 폭발 AP ${item.splashAp}` : '') : item.utility ? '지원 장비' : '확인된 수치 없음', style: item.ap == null ? 'unknown' : 'ap' },
  ];
}

function renderStats(item, context = 'card') {
  if (item.defense) return renderDefenseStats(item, context);
  const detailed = context === 'detail';
  return `<div class="${detailed ? 'detail-stats' : 'stats-grid'}">${statValues(item).map(stat => `<div class="${detailed ? 'detail-stat' : 'stat'}"><span class="stat-label">${stat.label}</span><span class="stat-value ${stat.style}">${stat.value}</span><span class="stat-caption">${escape(stat.caption)}</span></div>`).join('')}</div>`;
}

function renderCategories() {
  $('#categories').innerHTML = categories.map(category => `<button class="category-button ${state.category === category.id ? 'active' : ''}" data-category="${category.id}" aria-pressed="${state.category === category.id}">${icon(category.icon)}<span>${category.name}</span><span class="nav-count">${category.id === 'all' ? stratagems.length : stratagems.filter(item => item.category === category.id).length}</span></button>`).join('');
}
function matchesPenetration(item) {
  switch (state.penetration) {
    case 'tank': return item.ap >= 5;
    case 'heavy': return item.ap === 4;
    case 'medium': return item.ap === 3;
    case 'light': return item.ap != null && item.ap >= 0 && item.ap <= 2;
    case 'none': return Boolean(item.utility);
    case 'unknown': return item.ap == null && !item.utility;
    default: return true;
  }
}
function filteredItems() {
  const items = stratagems.filter(item => (state.category === 'all' || item.category === state.category) && matchesPenetration(item));
  return searchItems(items, state.search);
}
function card(item) {
  return `<article class="stratagem-card ${state.selected.has(item.id) ? 'selected' : ''}" data-category="${item.category}" data-id="${item.id}"><button class="card-open" data-open="${item.id}" aria-label="${escape(item.name)} 상세 보기"><div class="card-top"><span class="strat-icon">${stratagemIcon(item)}</span><div class="card-code"><span>${cat(item.category).name}</span>${escape(item.code || cat(item.category).label)}</div></div><h3>${escape(item.name)}</h3><p class="card-en">${escape(item.en)}</p><p class="card-summary">${escape(item.summary)}</p><div class="card-tags">${item.tags.slice(0, 3).map(tag => `<span class="tag">${escape(tag)}</span>`).join('')}</div>${renderStats(item)}</button>${renderDefenseSource(item)}<div class="card-footer"><label class="compare-check"><input type="checkbox" data-compare="${item.id}" ${state.selected.has(item.id) ? 'checked' : ''} aria-label="${escape(item.name)} 비교에 추가">비교 담기</label><button class="detail-link" data-open="${item.id}" aria-label="${escape(item.name)} 자세히 보기" aria-haspopup="dialog" aria-controls="detail-dialog">자세히 <span aria-hidden="true">↗</span></button></div></article>`;
}
function renderCards() {
  const items = filteredItems();
  $('#cards').innerHTML = items.map(card).join('');
  $('#cards').classList.toggle('list-view', state.view === 'list');
  const total = stratagems.filter(item => state.category === 'all' || item.category === state.category).length;
  $('#total-count').textContent = total;
  $('#results-count').innerHTML = `<b>${items.length}개</b> 표시 중 <span class="slash">/</span> 총 ${total}개`;
  $('#section-title').textContent = cat(state.category).name;
  $('#category-caption').textContent = cat(state.category).description;
  $('#empty').hidden = items.length > 0;
  $('#reset').hidden = !state.search && state.penetration === 'all' && state.category === 'all';
}
function resetFilters() {
  state.category = 'all'; state.search = ''; state.penetration = 'all';
  $('#search').value = ''; $('#penetration').value = 'all';
  renderCategories(); renderCards();
}
function showToast(message) {
  $('#toast').textContent = message; $('#toast').hidden = false;
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => { $('#toast').hidden = true; }, 3500);
}
function renderComparisonState() {
  const visible = state.selected.size > 0 && !$('#catalog-view').hidden;
  $('#compare-bar').hidden = !visible;
  document.body.classList.toggle('has-comparison', visible);
  $('#compare-names').textContent = [...state.selected].map(id => stratagems.find(item => item.id === id).name).join(' · ');
  $('#compare-count').textContent = `${state.selected.size}/3`;
  $('#compare-open').disabled = state.selected.size < 2;
  $('#compare-open').title = state.selected.size < 2 ? '2개 이상 선택하면 비교할 수 있습니다.' : '선택한 스트라타젬 비교';
  document.querySelectorAll('[data-compare]').forEach(input => { input.checked = state.selected.has(input.dataset.compare); });
  document.querySelectorAll('.stratagem-card').forEach(card => card.classList.toggle('selected', state.selected.has(card.dataset.id)));
}
const dialogTop = label => `<div class="dialog-top"><span>${label}</span><button class="close-button" data-close aria-label="닫기">×</button></div>`;
function openDetail(id) {
  const item = stratagems.find(item => item.id === id);
  if (!item) return;
  $('#detail-content').innerHTML = `<div class="dialog-inner">${dialogTop(cat(item.category).label + ' / FIELD NOTES')}<div class="dialog-identity"><span class="strat-icon">${stratagemIcon(item)}</span><div><h2 id="detail-title">${escape(item.name)}</h2><p class="dialog-en">${escape(item.en)}</p></div></div><p class="dialog-summary">${escape(item.summary)}</p>${item.input ? `<div class="input-sequence"><span>호출 코드</span>${escape(item.input)}</div>` : ''}${renderStats(item, 'detail')}<div class="detail-block"><h3>이렇게 사용하세요</h3><p>${escape(item.usage)}</p></div>${item.notes || item.rangeNote || item.modes ? `<div class="detail-block"><h3>수치와 운용 기준</h3><ul>${[item.rangeNote, item.notes, ...(item.modes || [])].filter(Boolean).map(note => `<li>${escape(note)}</li>`).join('')}</ul></div>` : ''}${item.radius && item.innerRadius ? `<div class="detail-block"><h3>폭발 범위</h3><div class="blast-figure"><svg viewBox="0 0 140 140" role="img" aria-label="중심 ${item.innerRadius}미터, 외곽 ${item.radius}미터의 폭발 반경"><path d="M70 0v140M0 70h140" stroke="#344429"/><circle cx="70" cy="70" r="57" fill="#a3ad4420" stroke="#a5b572" stroke-dasharray="3 4"/><circle cx="70" cy="70" r="${Math.max(10, 57 * item.innerRadius / item.radius)}" fill="#e4d95435" stroke="#e4d954"/><circle cx="70" cy="70" r="3" fill="#f4e454"/></svg><p><strong>중심 ${item.innerRadius} m</strong> 안쪽이 최대 피해 구간입니다.<br>외곽 ${item.radius} m까지 피해가 감소합니다.<br>그림은 충격파·함선 모듈을 제외한 반경입니다.</p></div></div>` : ''}${item.warning ? `<p class="detail-caution">${escape(item.warning)}</p>` : ''}<div class="source-note"><p><strong>자료 열람 ${escape(item.defense ? item.defense.checkedAt || '자료 미확인' : checkedAt)}</strong>${item.patch ? ` · 페이지 갱신 패치 ${escape(item.patch)}` : ''}</p><p>${item.verified ? '표시된 수치는 커뮤니티 위키의 세부 통계에서 확인했습니다.' : '확인된 정보만 표시하며, 미확인 수치는 임의로 추정하지 않습니다.'} ${item.utility ? '지원 기능의 피해량은 해당 없음으로 표시합니다.' : '실제 피해는 타격 부위, 내구도, 각도, 거리의 영향을 받습니다.'}</p><p><a href="${escape(item.source)}" target="_blank" rel="noopener noreferrer">Helldivers Wiki · 항목 원문 ↗</a></p></div></div>`;
  $('#detail-dialog').setAttribute('aria-labelledby', 'detail-title');
  const iconLink = document.createElement('a');
  iconLink.href = wikiIcons[item.id].source;
  iconLink.target = '_blank'; iconLink.rel = 'noopener noreferrer';
  iconLink.textContent = 'Helldivers Wiki · 아이콘 원본 ↗';
  const iconSource = document.createElement('p'); iconSource.append(iconLink);
  $('#detail-content .source-note').append(iconSource);
  if (item.extraSource) {
    const link = document.createElement('a');
    link.href = item.extraSource; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.textContent = '추가 수치 근거 ↗';
    const paragraph = document.createElement('p'); paragraph.append(link);
    $('#detail-content .source-note').append(paragraph);
  }
  if (item.category === 'support') {
    const button = document.createElement('button');
    button.className = 'primary-button combat-detail-button';
    button.textContent = '이 무기로 적 대응 계산 ↗';
    button.addEventListener('click', () => { $('#detail-dialog').close(); combat.openWeapon(item.id); });
    $('#detail-content .dialog-summary').after(button);
  }
  $('#detail-dialog').showModal();
}
function openInfo() {
  $('#info-content').innerHTML = `<div class="dialog-inner">${dialogTop('DATA REFERENCE / 2026.09.16')}<h2 id="info-title">화력을 읽는 법</h2><div class="info-row"><strong>사거리 / 범위</strong><p>무기는 확인된 사거리, 폭격은 폭발 외곽 반경을 표시합니다. ‘투하 지점’은 숫자로 정해진 무기 사거리가 아닙니다. 폭격 구역, 탐지 거리, 조준경 영점은 구분해 설명합니다.</p></div><div class="info-row"><strong>직격 피해</strong><p>탄 또는 포탄 1발이 직접 맞았을 때의 기본 피해입니다. 한 번 호출한 스트라타젬 전체 피해가 아닙니다. 빔·화염은 초당 피해(/s)를 따로 표시합니다.</p></div><div class="info-row"><strong>폭발 피해</strong><p>폭발 중심의 최대값입니다. 가장자리로 갈수록 감소하고 장애물에 가릴 수 있습니다. 지속 화염, 가스, 추가 파편은 단순한 폭발 피해와 구분합니다. 직격과 폭발 수치를 더한 값이 항상 실제 체력 감소량은 아닙니다.</p></div><div class="info-row"><strong>장갑 관통</strong><div><p>AP는 관통 단계입니다. 적의 맞은 부위 장갑보다 낮으면 관통하지 못합니다. 입사각이나 탄종에 따라 결과가 달라집니다. 직격과 폭발의 AP가 다른 경우 둘 다 표시합니다.</p><div class="ap-legend"><span>AP 2 · 경장갑</span><span>AP 3 · 일반 장갑</span><span>AP 4 · 중장갑</span><span>AP 5+ · 대전차</span></div></div></div><div class="info-row"><strong>미확인 / 없음</strong><p>‘미확인’은 신뢰할 수 있는 수치를 확보하지 못했다는 뜻입니다. 0은 피해가 없음을 확인한 값이며, ‘해당 없음’은 보급·방어막처럼 피해를 목적으로 하지 않는 장비에 사용합니다.</p></div><div class="info-note"><strong>자료 출처 및 확인 기준</strong><br>Helldivers Wiki의 항목별 통계와 검색 색인에서 2026년 9월 16일 확인한 자료입니다. 공식 실시간 데이터가 아니며, 패치 반영 시점은 항목마다 다릅니다. 함선 모듈·행성 효과를 제외한 기본값을 사용합니다. 사용법은 이 도감을 위한 요약이며 공식 한국어 표기와 다른 통용명이 있을 수 있습니다.<br><a href="https://helldivers.wiki.gg/wiki/Stratagems" target="_blank" rel="noopener noreferrer">스트라타젬 목록 ↗</a> · <a href="https://helldivers.wiki.gg/wiki/Damage" target="_blank" rel="noopener noreferrer">피해·장갑 시스템 ↗</a></div></div>`;
  $('#info-dialog').setAttribute('aria-labelledby', 'info-title'); $('#info-dialog').showModal();
}
function openComparison() {
  const items = [...state.selected].map(id => stratagems.find(item => item.id === id));
  if (items.length < 2) return;
  const defenseOnly = items.every(item => item.defense);
  const rows = [
    ['종류', item => cat(item.category).name],
    ...['사거리 / 범위', '직격 / 지속 피해', '폭발 피해', '장갑 관통'].filter((_, index) => !defenseOnly || index === 0).map((label, index) => [label, item => { const stat = statValues(item)[index]; return `<span class="comparison-value">${stat.value}</span><small>${escape(stat.caption)}</small>`; }]),
    ...defenseComparisonRows(items),
    ['주요 용도', item => escape(item.tags.join(' · '))],
    ['사용법', item => escape(item.usage)],
    ['주의', item => escape(item.warning || '항목의 세부 기준을 확인하세요.')],
    ['자료 확인일', item => escape(item.defense ? item.defense.checkedAt || '자료 미확인' : checkedAt)],
    ['자료 출처', item => `<a href="${escape(item.source)}" target="_blank" rel="noopener noreferrer">위키 원문 ↗</a>`],
  ];
  $('#comparison-content').innerHTML = `<div class="dialog-inner">${dialogTop('SIDE BY SIDE / STRATAGEM COMPARISON')}<h2 id="comparison-title">${defenseOnly ? '방어 성능, 나란히 비교.' : '필요한 화력, 나란히 비교.'}</h2><div class="compare-scroller" tabindex="0" role="region" aria-label="스트라타젬 비교표. 작은 화면에서는 가로로 스크롤할 수 있습니다."><table class="comparison-table"><thead><tr><th scope="col">비교 항목</th>${items.map(item => `<th scope="col">${escape(item.name)}<small>${escape(item.en)}</small></th>`).join('')}</tr></thead><tbody>${rows.map(([label, value]) => `<tr><td>${label}</td>${items.map(item => `<td>${value(item)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="source-note">${defenseOnly ? '보호막 용량과 장치 본체 체력은 별개입니다. 재생 대기시간과 완전 회복 시간도 구분해 확인하세요.' : '사거리와 폭발 반경, 탄당 피해와 초당 피해는 서로 다른 단위입니다. 각 값 아래의 기준을 함께 확인하세요.'}</p></div>`;
  $('#compare-dialog').setAttribute('aria-labelledby', 'comparison-title'); $('#compare-dialog').showModal();
}

$('#categories').addEventListener('click', event => { const button = event.target.closest('[data-category]'); if (!button) return; combat.showCatalog(); state.category = button.dataset.category; renderCategories(); renderCards(); });
$('#search').addEventListener('input', event => { state.search = event.target.value; renderCards(); });
$('#penetration').addEventListener('change', event => { state.penetration = event.target.value; renderCards(); });
$('#cards').addEventListener('click', event => { const button = event.target.closest('[data-open]'); if (button) openDetail(button.dataset.open); });
$('#cards').addEventListener('change', event => {
  const input = event.target.closest('[data-compare]'); if (!input) return;
  if (!input.checked) state.selected.delete(input.dataset.compare);
  else if (state.selected.size < 3) state.selected.add(input.dataset.compare);
  else showToast('비교는 최대 3개까지 가능합니다. 하나를 해제해 주세요.');
  renderComparisonState();
});
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { state.view = button.dataset.view; document.querySelectorAll('[data-view]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); }); renderCards(); }));
['#reset', '#empty-reset'].forEach(selector => $(selector).addEventListener('click', resetFilters));
['#guide-button', '#notice-guide', '#sources-button'].forEach(selector => $(selector).addEventListener('click', openInfo));
$('#compare-clear').addEventListener('click', () => { state.selected.clear(); renderComparisonState(); });
$('#compare-open').addEventListener('click', openComparison);
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => { if (event.target.closest('[data-close]')) dialog.close(); else if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
});
document.addEventListener('keydown', event => { if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !document.querySelector('dialog[open]') && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) { event.preventDefault(); combat.showCatalog(); $('#search').focus(); } });
renderCategories(); renderCards();
const navigate = initFeatureNavigation(renderComparisonState);
const combat = initCombat({ stratagems, wikiIcons, navigate });
initDemolition({ stratagems, categories, wikiIcons });

// The optional browser API uses the same filters as the visible catalog.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const penetrationValues = ['all', 'tank', 'heavy', 'medium', 'light', 'none', 'unknown'];
  try {
    Promise.resolve(document.modelContext.registerTool({
      name: 'filter_stratagem_catalog',
      title: '스트라타젬 도감 필터',
      description: '종류, 검색어, 카드에 표시된 관통 등급으로 화면의 도감 목록을 좁힙니다. 비교 선택은 유지합니다.',
      inputSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: categories.map(item => item.id) },
          query: { type: 'string', maxLength: 200 },
          penetration: { type: 'string', enum: penetrationValues },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute(input) {
        if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(key => !['category', 'query', 'penetration'].includes(key))) throw new Error('필터는 category, query, penetration만 포함한 객체여야 합니다.');
        const { category = 'all', query = '', penetration = 'all' } = input;
        if (!categories.some(item => item.id === category) || !penetrationValues.includes(penetration) || typeof query !== 'string' || query.length > 200) throw new Error('유효하지 않은 종류, 검색어 또는 관통 등급입니다.');
        combat.showCatalog();
        Object.assign(state, { category, search: query, penetration });
        $('#search').value = query; $('#penetration').value = penetration;
        renderCategories(); renderCards();
        const items = filteredItems();
        return { count: items.length, items: items.map(({ id, name, category, ap }) => ({ id, name, category, ap })) };
      },
    }, { signal: lifecycle.signal })).catch(error => console.warn('Optional catalog tool registration failed:', error.message));
  } catch (error) { console.warn('Optional catalog tool registration failed:', error.message); }
  window.addEventListener('pagehide', () => lifecycle.abort(), { once: true });
}
