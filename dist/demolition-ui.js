import { structures, demolitionProfiles, demolitionCheckedAt, demolitionSource, structureDamageSource } from './demolition-data.js?v=epoch-1';
import { calculateDemolition, forceBounds } from './demolition.js?v=epoch-1';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const number = value => value.toLocaleString('ko-KR');
const option = (id, name) => `<option value="${escape(id)}">${escape(name)}</option>`;
const link = (url, label) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a>`;
const outcomes = { demolish: '철거 가능', health: '체력 파괴', conditional: '조건부 가능', blocked: '조건 미충족', unknown: '자료 미확인' };
const forceText = (value, unknown = false) => {
  if (unknown) return '미확인';
  const force = forceBounds(value);
  return !force ? '없음' : force.min === force.max ? String(force.min) : `${force.min}–${force.max} · 자료 불일치`;
};

export function openingRouteNote(row) {
  if (row.method !== 'health') return '';
  const openings = row.routes.filter(result => result.outcome === 'pass' && result.route.opening).map(result => result.route.name);
  if (!openings.length) return '';
  const shield = row.structure.condition === 'shield' ? '보호막 제거 후 ' : '';
  return `입구 철거 경로: ${shield}${openings.join(' 또는 ')}에 폭발이 들어가야 합니다. 위의 본체 체력 소진 탄수와 별도로, 내부 폭발의 철거력으로 판정합니다.`;
}

export function initDemolition({ stratagems, categories, wikiIcons }) {
  const $ = selector => document.querySelector(selector);
  const structureSelect = $('#demolition-structure');
  const weaponSelect = $('#demolition-weapon');
  const modeSelect = $('#demolition-mode');
  const state = { structure: 'all', weapon: 'orbital-precision', mode: 'standard', shieldCleared: false, jammerDisabled: false };
  structureSelect.innerHTML = option('all', '모든 건물 · 한눈에 보기') + [...new Set(structures.map(item => item.faction))].map(faction => `<optgroup label="${escape(faction)}">${structures.filter(item => item.faction === faction).map(item => option(item.id, item.name)).join('')}</optgroup>`).join('');
  weaponSelect.innerHTML = categories.filter(category => category.id !== 'all').map(category => `<optgroup label="${escape(category.name)}">${stratagems.filter(item => item.category === category.id).map(item => option(item.id, item.name)).join('')}</optgroup>`).join('');
  structureSelect.value = state.structure;
  weaponSelect.value = state.weapon;
  const reviewed = Object.values(demolitionProfiles).filter(profile => profile.modes.some(mode => !mode.forceUnknown)).length;
  $('#demolition-coverage').textContent = `시설 ${structures.length}종 · 철거력 확인 ${reviewed}종`;

  function updateModes() {
    const modes = demolitionProfiles[state.weapon]?.modes;
    modeSelect.innerHTML = modes?.length ? modes.map(mode => option(mode.id, mode.name)).join('') : option('unsupported', '철거 자료 미확인');
    modeSelect.disabled = !modes || modes.length < 2;
    state.mode = modeSelect.value;
  }

  function resultTitle(row) {
    if (row.method === 'health') return `${number(row.hits)}${row.unit} · 본체 체력 소진`;
    if (row.method === 'force') return `${row.route.name} · ${row.component === 'explosion' ? '폭발' : '직접 명중'}`;
    return row.outcome === 'blocked' ? '파괴 조건에 미달' : '확인된 자료로 판정 보류';
  }

  function resultCard(row) {
    const structure = row.structure;
    const mode = demolitionProfiles[state.weapon]?.modes.find(item => item.id === state.mode);
    const openingNote = openingRouteNote(row);
    const routeEvidence = row.routes.map(result => {
      const components = result.components.filter(item => item.outcome !== 'inapplicable').map(item => `${item.component === 'direct' ? '직접 명중' : '폭발'} ${forceText(mode[item.component], mode.forceUnknown)}: ${item.outcome === 'pass' ? '충족' : item.outcome === 'unknown' ? '판정 보류' : '미충족'}`).join(' / ');
      return `<li>${escape(result.route.name)}: 철거력 ${result.route.threshold}${result.route.explosiveOnly ? ' 이상의 내부 폭발' : ' 이상'}<br>${escape(components)}</li>`;
    }).join('');
    const hpEvidence = row.health ? `<p>본체 공격 1회 피해: 직격 ${number(row.health.direct)} + 폭발 ${number(row.health.explosion)} = ${number(row.health.total)}${row.health.hits ? `<br>체력 ${number(structure.health.hp)} ÷ 피해 ${number(row.health.total)} → ${number(row.health.hits)}${row.unit} (올림)` : '<br>본체에 계산상 피해 없음'}</p>` : structure.health ? '<p>체력 파괴: 자료 미확인. 확인된 피해 자료만으로는 이 공격의 탄수를 계산할 수 없습니다.</p>' : '';
    return `<article class="combat-route demolition-card" data-outcome="${row.outcome}"><div class="combat-route-top"><h3>${escape(structure.name)}</h3><span class="outcome-tag">${outcomes[row.outcome]}</span></div><span class="demolition-faction">${escape(structure.faction)}</span><p class="demolition-result-title">${escape(resultTitle(row))}</p><p class="demolition-reason">${escape(row.reason)}</p>${row.conditions.length ? `<ul class="demolition-requirements">${row.conditions.map(text => `<li>${escape(text)}</li>`).join('')}</ul>` : ''}${openingNote ? `<p class="combat-row-note">${escape(openingNote)}</p>` : ''}<dl class="demolition-thresholds">${structure.routes.map(route => `<div><dt>${escape(route.name)}${route.explosiveOnly ? ' · 폭발' : ''}</dt><dd>철거력 ${route.threshold}</dd></div>`).join('')}</dl><p class="demolition-tip">${escape(structure.tip)}</p>${structure.health ? `<p class="demolition-health">본체 체력 ${number(structure.health.hp)} · 장갑 ${structure.health.armor} · 내구도 ${structure.health.durability}%${structure.health.exdr < 0 ? ' · 폭발 피해 ×2.5' : ''}</p>` : ''}<details class="combat-breakdown"><summary>판정 근거와 조준 조건</summary>${routeEvidence ? `<ul>${routeEvidence}</ul>` : '<p>해당 장비의 철거 자료가 아직 없습니다.</p>'}${hpEvidence}${structure.note ? `<p class="combat-row-note">${escape(structure.note)}</p>` : ''}${mode?.falloff || mode?.damage?.falloff ? '<p>거리 감쇠 전 최대 피해 기준입니다. 실전 탄수는 늘어날 수 있습니다.</p>' : ''}<p class="combat-sources">${link(structure.source, '시설 철거 조건')}${structure.healthSource ? ` · ${link(structure.healthSource, '시설 체력 수치')}` : ''}</p></details></article>`;
  }

  function render() {
    const weapon = stratagems.find(item => item.id === state.weapon);
    const profile = demolitionProfiles[state.weapon];
    const mode = profile?.modes.find(item => item.id === state.mode);
    const visibleStructures = structures.filter(item => state.structure === 'all' || item.id === state.structure);
    const rows = visibleStructures.map(structure => calculateDemolition(structure, profile, mode, state));
    const possible = rows.filter(row => ['demolish', 'health'].includes(row.outcome)).length;
    const conditional = rows.filter(row => row.outcome === 'conditional').length;
    const unknown = rows.filter(row => row.outcome === 'unknown').length;
    const blocked = rows.filter(row => row.outcome === 'blocked').length;
    const all = state.structure === 'all';
    const answer = $('#demolition-answer');
    answer.dataset.tone = possible ? 'positive' : 'neutral';
    answer.innerHTML = `<span class="combat-answer-label">${escape(weapon.name)} × ${all ? '모든 건물·시설' : escape(rows[0].structure.name)}</span><h3>${all ? `철거 가능 ${possible}종 · 조건부 ${conditional}종` : escape(resultTitle(rows[0]))}</h3><p>${all ? `시설 ${rows.length}종 중 조건 미충족 ${blocked}종 · 자료 미확인 ${unknown}종. 아래에서 조준 위치와 조건을 확인하세요.` : escape(rows[0].conditions.join(' ') || rows[0].reason)}</p>`;
    $('#demolition-shield-option').hidden = !visibleStructures.some(item => item.condition === 'shield');
    $('#demolition-jammer-option').hidden = !profile?.requiresCallIn || !visibleStructures.some(item => item.condition === 'jammer');
    $('#demolition-conditions').hidden = $('#demolition-shield-option').hidden && $('#demolition-jammer-option').hidden;
    $('#demolition-loadout').innerHTML = `<div class="combat-weapon-title"><img src="${escape(wikiIcons[weapon.id].src)}" alt="" width="40" height="40"><div><strong>${escape(weapon.name)}</strong><span>${escape(mode?.name || '철거 자료 미확인')}</span></div></div><dl class="demolition-force"><div><dt>${escape(mode?.directLabel || '직격')} 철거력</dt><dd>${escape(forceText(mode?.direct, !mode || mode.forceUnknown))}</dd></div><div><dt>폭발 철거력 · 중심부</dt><dd>${escape(forceText(mode?.explosion, !mode || mode.forceUnknown))}</dd></div></dl>${profile?.note || mode?.note ? `<p class="combat-row-note">${escape([profile?.note, mode?.note].filter(Boolean).join(' '))}</p>` : ''}${mode?.damage?.falloff ? '<p class="combat-row-note">탄수는 거리 감쇠 전의 최대 피해 기준입니다.</p>' : ''}${mode?.shieldBypass ? '<p class="demolition-special">워프 함선: 본체에 공격이 닿으면 보호막 제거 전에도 철거할 수 있는 공격입니다.</p>' : ''}`;
    $('#demolition-results').innerHTML = rows.map(resultCard).join('');
    $('#demolition-sources').innerHTML = `${link(demolitionSource, '철거력·시설 임계값')} · ${link(profile?.source || weapon.source, '공격 수치')} · ${link(structureDamageSource, '시설 체력·피해 규칙')}${profile?.damageSource ? ` · ${link(profile.damageSource, '탄종 피해 수치')}` : ''}${profile?.conflictingSource ? ` · ${link(profile.conflictingSource, '엇갈리는 종합표')}` : ''}<br>자료 확인 ${demolitionCheckedAt} · 커뮤니티 위키 검색 색인 기준 · 실시간 패치 동기화 아님`;
  }

  structureSelect.addEventListener('change', () => { state.structure = structureSelect.value; render(); });
  weaponSelect.addEventListener('change', () => { state.weapon = weaponSelect.value; updateModes(); render(); });
  modeSelect.addEventListener('change', () => { state.mode = modeSelect.value; render(); });
  $('#demolition-shield-cleared').addEventListener('change', event => { state.shieldCleared = event.target.checked; render(); });
  $('#demolition-jammer-disabled').addEventListener('change', event => { state.jammerDisabled = event.target.checked; render(); });
  updateModes();
  render();
}
