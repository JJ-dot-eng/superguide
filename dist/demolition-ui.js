import { structures, demolitionProfiles, demolitionCheckedAt, demolitionSource, structureDamageSource } from './demolition-data.js?v=explosive-weapons-1';
import { forceBounds } from './demolition.js?v=epoch-1';
import { getDemolitionSelection, initialDemolitionSelection } from './demolition-selection.js?v=explosive-weapons-1';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const number = value => value.toLocaleString('ko-KR');
const option = (id, name) => `<option value="${escape(id)}">${escape(name)}</option>`;
const link = (url, label) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a>`;
const outcomes = { demolish: '철거 가능', health: '체력 파괴 가능', conditional: '조건부 가능', unknown: '자료 미확인' };
const resultLabel = row => row.method === 'health' ? `체력 파괴 가능${row.outcome === 'conditional' ? ' · 조건부' : ''}` : outcomes[row.outcome];
const forceText = (value, unknown = false) => {
  if (unknown) return '미확인';
  const force = forceBounds(value);
  return !force ? '없음' : force.min === force.max ? String(force.min) : `${force.min}–${force.max} · 자료 불일치`;
};

export function openingRouteNote(row) {
  if (row.method !== 'health') return '';
  const openings = row.routes.filter(result => result.outcome === 'pass' && result.route.opening).map(result => result.route.name);
  const shield = row.structure.condition === 'shield' ? ' (보호막 제거 후)' : '';
  return openings.map(name => `1${row.unit} · ${name} 폭발 가능${shield}`).join(' / ');
}

function resultTitle(row) {
  if (row.method === 'health') return [`${number(row.hits)}${row.unit} · 체력 파괴 가능`, openingRouteNote(row)].filter(Boolean).join(' / ');
  if (row.method === 'force') return `${row.route.name} · ${row.component === 'explosion' ? '폭발' : '직접 명중'}`;
  return '확인된 자료로 판정 보류';
}

function attackOpeningNote(row) {
  if (row.route?.opening) return `조준 조건: ${row.route.name}에 폭발을 넣어야 합니다.`;
  return '';
}

export function renderDemolitionWeaponCard(entry, { categories, wikiIcons }) {
  const { weapon, profile, attacks, outcome } = entry;
  const category = categories.find(item => item.id === weapon.category)?.name || '';
  const label = attacks.every(attack => attack.result.method === 'health') ? `체력 파괴 가능${outcome === 'conditional' ? ' · 조건부' : ''}` : outcome === 'conditional' ? '조건부 가능' : '파괴 가능';
  const modes = attacks.map(({ mode, result }) => {
    const openingNote = attackOpeningNote(result);
    const conditions = result.conditions.filter(text => text !== `${result.route?.name}에 폭발을 넣어야 합니다.` && !(profile.conditionalAim && text === profile.note));
    return `<li class="demolition-weapon-mode" data-mode="${escape(mode.id)}" data-outcome="${result.outcome}">
      <div class="demolition-mode-heading"><h4>${escape(mode.name)}</h4><button type="button" class="text-button" data-demolition-weapon="${escape(weapon.id)}" data-demolition-mode="${escape(mode.id)}" aria-label="${escape(weapon.name)} ${escape(mode.name)} 철거 계산 자세히 보기">자세히 ↗</button></div>
      <p class="demolition-result-title">${escape(resultTitle(result))}</p>
      <p class="demolition-mode-force">${escape(mode.directLabel || '직격')} 철거력 ${escape(forceText(mode.direct, mode.forceUnknown))} · 폭발 철거력 ${escape(forceText(mode.explosion, mode.forceUnknown))}</p>
      ${openingNote ? `<p class="demolition-aim-note">${escape(openingNote)}</p>` : ''}
      ${conditions.map(text => `<p class="demolition-extra-condition">${escape(text.replace('아래 탄수에는', '표시 탄수에는'))}</p>`).join('')}
    </li>`;
  }).join('');
  return `<article class="combat-route demolition-card demolition-weapon-card" data-weapon="${escape(weapon.id)}" data-outcome="${outcome}">
    <div class="combat-route-top"><div class="combat-weapon-title"><img src="${escape(wikiIcons[weapon.id].src)}" alt="" width="40" height="40"><div><h3>${escape(weapon.name)}</h3><span>${escape(category)}</span></div></div><span class="outcome-tag">${label}</span></div>
    <ul class="demolition-weapon-modes">${modes}</ul>
    ${profile.conditionalAim ? '<p class="demolition-extra-condition">명중 조건: 자동 조준·기폭 방식에 따라 실제 타격 여부가 달라집니다. 자세히에서 확인하세요.</p>' : ''}
  </article>`;
}

export function initDemolition({ stratagems, categories, wikiIcons }) {
  const $ = selector => document.querySelector(selector);
  const structureSelect = $('#demolition-structure');
  const weaponSelect = $('#demolition-weapon');
  const modeSelect = $('#demolition-mode');
  const state = { ...initialDemolitionSelection };
  structureSelect.innerHTML = option('all', '모든 건물 · 한눈에 보기') + [...new Set(structures.map(item => item.faction))].map(faction => `<optgroup label="${escape(faction)}">${structures.filter(item => item.faction === faction).map(item => option(item.id, item.name)).join('')}</optgroup>`).join('');
  weaponSelect.innerHTML = option('all', '모든 스트라타젬') + categories.filter(category => category.id !== 'all').map(category => `<optgroup label="${escape(category.name)}">${stratagems.filter(item => item.category === category.id).map(item => option(item.id, item.name)).join('')}</optgroup>`).join('');
  structureSelect.value = state.structure;
  weaponSelect.value = state.weapon;
  const reviewed = Object.values(demolitionProfiles).filter(profile => profile.modes.some(mode => !mode.forceUnknown)).length;
  $('#demolition-coverage').textContent = `시설 ${structures.length}종 · 철거력 확인 ${reviewed}종`;

  function updateModes() {
    const modes = demolitionProfiles[state.weapon]?.modes;
    modeSelect.innerHTML = state.weapon === 'all' ? option('all', '모든 탄종·공격') : modes?.length ? modes.map(mode => option(mode.id, mode.name)).join('') : option('unsupported', '철거 자료 미확인');
    modeSelect.disabled = !modes || modes.length < 2;
    state.mode = modeSelect.value;
  }

  function resultCard(row) {
    const structure = row.structure;
    const mode = demolitionProfiles[state.weapon]?.modes.find(item => item.id === state.mode);
    const routeEvidence = row.routes.map(result => {
      const components = result.components.filter(item => item.outcome !== 'inapplicable').map(item => `${item.component === 'direct' ? '직접 명중' : '폭발'} ${forceText(mode[item.component], mode.forceUnknown)}: ${item.outcome === 'pass' ? '충족' : item.outcome === 'unknown' ? '판정 보류' : '미충족'}`).join(' / ');
      return `<li>${escape(result.route.name)}: 철거력 ${result.route.threshold}${result.route.explosiveOnly ? ' 이상의 내부 폭발' : ' 이상'}<br>${escape(components)}</li>`;
    }).join('');
    const hpEvidence = row.health ? `<p>본체 공격 1회 피해: 직격 ${number(row.health.direct)} + 폭발 ${number(row.health.explosion)} = ${number(row.health.total)}${row.health.hits ? `<br>체력 ${number(structure.health.hp)} ÷ 피해 ${number(row.health.total)} → ${number(row.health.hits)}${row.unit} (올림)` : '<br>본체에 계산상 피해 없음'}</p>` : structure.health ? '<p>체력 파괴: 자료 미확인. 확인된 피해 자료만으로는 이 공격의 탄수를 계산할 수 없습니다.</p>' : '';
    return `<article class="combat-route demolition-card" data-outcome="${row.outcome}" data-faction="${escape(structure.faction)}"><div class="combat-route-top"><h3>${escape(structure.name)}</h3><span class="outcome-tag">${resultLabel(row)}</span></div><span class="demolition-faction">${escape(structure.faction)}</span><p class="demolition-result-title">${escape(resultTitle(row))}</p><p class="demolition-reason">${escape(row.reason)}</p>${row.conditions.length ? `<ul class="demolition-requirements">${row.conditions.map(text => `<li>${escape(text)}</li>`).join('')}</ul>` : ''}<dl class="demolition-thresholds">${structure.routes.map(route => `<div><dt>${escape(route.name)}${route.explosiveOnly ? ' · 폭발' : ''}</dt><dd>철거력 ${route.threshold}</dd></div>`).join('')}</dl><p class="demolition-tip">${escape(structure.tip)}</p>${structure.health ? `<p class="demolition-health">본체 체력 ${number(structure.health.hp)} · 장갑 ${structure.health.armor} · 내구도 ${structure.health.durability}%${structure.health.exdr < 0 ? ' · 폭발 피해 ×2.5' : ''}</p>` : ''}<details class="combat-breakdown"><summary>판정 근거와 조준 조건</summary>${routeEvidence ? `<ul>${routeEvidence}</ul>` : '<p>해당 장비의 철거 자료가 아직 없습니다.</p>'}${hpEvidence}${structure.note ? `<p class="combat-row-note">${escape(structure.note)}</p>` : ''}${mode?.falloff || mode?.damage?.falloff ? '<p>거리 감쇠 전 최대 피해 기준입니다. 실전 탄수는 늘어날 수 있습니다.</p>' : ''}<p class="combat-sources">${link(structure.source, '시설 철거 조건')}${structure.healthSource ? ` · ${link(structure.healthSource, '시설 체력 수치')}` : ''}</p></details></article>`;
  }

  function render() {
    const selection = getDemolitionSelection(state, stratagems);
    const answerBox = $('#demolition-answer');
    const results = $('#demolition-results');
    const loadout = $('#demolition-loadout');
    const empty = selection.view === 'empty';
    $('#demolition-assumption').hidden = empty;
    loadout.hidden = empty;
    results.hidden = empty;
    results.dataset.view = selection.view;

    if (empty || selection.view === 'weapons') {
      const { structure, entries = [] } = selection;
      $('#demolition-shield-option').hidden = structure?.condition !== 'shield';
      $('#demolition-jammer-option').hidden = structure?.condition !== 'jammer' || !entries.some(entry => entry.profile.requiresCallIn);
      $('#demolition-conditions').hidden = $('#demolition-shield-option').hidden && $('#demolition-jammer-option').hidden;
      $('#demolition-sources').innerHTML = `${link(demolitionSource, '철거력·시설 임계값')} · ${link(structureDamageSource, '시설 체력·피해 규칙')}${structure ? ` · ${link(structure.source, '선택한 시설 자료')}` : ''}<br>자료 확인 ${demolitionCheckedAt} · 커뮤니티 위키 검색 색인 기준 · 실시간 패치 동기화 아님`;
      if (empty) {
        answerBox.dataset.tone = 'neutral';
        answerBox.innerHTML = '<p>건물이나 스트라타젬을 선택해 주세요.</p>';
        loadout.innerHTML = '';
        results.innerHTML = '';
        return;
      }

      const { possible, conditional, unknown } = selection;
      answerBox.dataset.tone = possible ? 'positive' : 'neutral';
      answerBox.innerHTML = `<span class="combat-answer-label">${escape(structure.name)} × 모든 스트라타젬</span><h3>${entries.length ? `파괴 가능 ${possible}종 · 조건부 ${conditional}종` : '파괴 가능한 스트라타젬이 아직 확인되지 않았습니다.'}</h3><p>파괴 가능한 탄종·공격만 표시합니다. 자료 미확인 ${unknown}종은 목록에서 제외하며, 파괴 불가능을 뜻하지 않습니다.</p>`;
      loadout.innerHTML = `<div class="combat-weapon-title"><div><strong>${escape(structure.name)}</strong><span>${escape(structure.faction)}</span></div></div><dl class="demolition-force">${structure.routes.map(route => `<div><dt>${escape(route.name)}${route.explosiveOnly ? ' · 내부 폭발' : ''}</dt><dd>철거력 ${route.threshold} 이상</dd></div>`).join('')}</dl><p>${escape(structure.tip)}</p>${structure.health ? `<p class="demolition-health">본체 체력 ${number(structure.health.hp)} · 장갑 ${structure.health.armor} · 내구도 ${structure.health.durability}% · 체력 파괴는 철거력과 별도로 계산합니다.</p>` : ''}`;
      results.innerHTML = entries.map(entry => renderDemolitionWeaponCard(entry, { categories, wikiIcons })).join('');
      return;
    }

    const { weapon, profile, mode, rows } = selection;
    const visibleRows = rows.filter(row => row.outcome !== 'blocked');
    const visibleStructures = visibleRows.map(row => row.structure);
    const possible = rows.filter(row => ['demolish', 'health'].includes(row.outcome)).length;
    const conditional = rows.filter(row => row.outcome === 'conditional').length;
    const unknown = rows.filter(row => row.outcome === 'unknown').length;
    const all = state.structure === 'all';
    const answer = $('#demolition-answer');
    answer.dataset.tone = possible ? 'positive' : 'neutral';
    answer.innerHTML = `<span class="combat-answer-label">${escape(weapon.name)} × ${all ? '모든 건물·시설' : escape(rows[0].structure.name)}</span><h3>${!visibleRows.length ? '표시할 파괴 결과가 없습니다.' : all ? `파괴 가능 ${possible}종 · 조건부 ${conditional}종` : escape(resultTitle(rows[0]))}</h3><p>${!visibleRows.length ? '건물이나 스트라타젬을 바꿔 선택해 주세요.' : all ? `아래에서 파괴 경로와 조준 조건을 확인하세요. 자료 미확인 ${unknown}종은 별도로 표시합니다.` : escape(rows[0].conditions.join(' ') || rows[0].reason)}</p>`;
    $('#demolition-shield-option').hidden = !visibleStructures.some(item => item.condition === 'shield');
    $('#demolition-jammer-option').hidden = !profile?.requiresCallIn || !visibleStructures.some(item => item.condition === 'jammer');
    $('#demolition-conditions').hidden = $('#demolition-shield-option').hidden && $('#demolition-jammer-option').hidden;
    $('#demolition-loadout').innerHTML = `<div class="combat-weapon-title"><img src="${escape(wikiIcons[weapon.id].src)}" alt="" width="40" height="40"><div><strong>${escape(weapon.name)}</strong><span>${escape(mode?.name || '철거 자료 미확인')}</span></div></div><dl class="demolition-force"><div><dt>${escape(mode?.directLabel || '직격')} 철거력</dt><dd>${escape(forceText(mode?.direct, !mode || mode.forceUnknown))}</dd></div><div><dt>폭발 철거력 · 중심부</dt><dd>${escape(forceText(mode?.explosion, !mode || mode.forceUnknown))}</dd></div></dl>${profile?.note || mode?.note ? `<p class="combat-row-note">${escape([profile?.note, mode?.note].filter(Boolean).join(' '))}</p>` : ''}${mode?.damage?.falloff ? '<p class="combat-row-note">탄수는 거리 감쇠 전의 최대 피해 기준입니다.</p>' : ''}${mode?.shieldBypass ? '<p class="demolition-special">워프 함선: 본체에 공격이 닿으면 보호막 제거 전에도 철거할 수 있는 공격입니다.</p>' : ''}`;
    $('#demolition-results').dataset.view = all ? 'all' : 'single';
    results.hidden = !visibleRows.length;
    results.innerHTML = visibleRows.map(resultCard).join('');
    $('#demolition-sources').innerHTML = `${link(demolitionSource, '철거력·시설 임계값')} · ${link(profile?.source || weapon.source, '공격 수치')} · ${link(structureDamageSource, '시설 체력·피해 규칙')}${profile?.damageSource ? ` · ${link(profile.damageSource, '탄종 피해 수치')}` : ''}${profile?.conflictingSource ? ` · ${link(profile.conflictingSource, '엇갈리는 종합표')}` : ''}<br>자료 확인 ${demolitionCheckedAt} · 커뮤니티 위키 검색 색인 기준 · 실시간 패치 동기화 아님`;
  }

  structureSelect.addEventListener('change', () => { state.structure = structureSelect.value; render(); });
  weaponSelect.addEventListener('change', () => { state.weapon = weaponSelect.value; updateModes(); render(); });
  modeSelect.addEventListener('change', () => { state.mode = modeSelect.value; render(); });
  $('#demolition-shield-cleared').addEventListener('change', event => { state.shieldCleared = event.target.checked; render(); });
  $('#demolition-jammer-disabled').addEventListener('change', event => { state.jammerDisabled = event.target.checked; render(); });
  $('#demolition-results').addEventListener('click', event => {
    const button = event.target.closest('[data-demolition-weapon]');
    if (!button) return;
    state.weapon = button.dataset.demolitionWeapon;
    weaponSelect.value = state.weapon;
    updateModes();
    state.mode = button.dataset.demolitionMode;
    modeSelect.value = state.mode;
    render();
    weaponSelect.focus();
  });
  updateModes();
  render();
}
