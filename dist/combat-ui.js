import { enemies, weaponProfiles, unsupportedWeapons, combatCheckedAt, damageSource } from './combat-data.js';
import { calculateMatchup } from './combat.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const number = value => value.toLocaleString('ko-KR');
const outcomes = { kill: '처치', bleed: '출혈 처치 유발', break: '부위 파괴', armor: '장갑 파괴', blocked: '피해 없음', unknown: '계산 보류', shield: '사선 조건 확인' };
const sourceLink = (url, label) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;

export function initCombat({ stratagems, wikiIcons, onViewChange }) {
  const $ = selector => document.querySelector(selector);
  const enemySelect = $('#combat-enemy');
  const weaponSelect = $('#combat-weapon');
  const modeSelect = $('#combat-mode');
  const support = stratagems.filter(item => item.category === 'support');
  const state = { enemy: 'charger', weapon: 'autocannon', mode: 'aphet', shieldCleared: false };
  const option = (id, name) => `<option value="${escape(id)}">${escape(name)}</option>`;
  enemySelect.innerHTML = [...new Set(enemies.map(enemy => enemy.faction))].map(faction => `<optgroup label="${faction}">${enemies.filter(enemy => enemy.faction === faction).map(enemy => option(enemy.id, enemy.name)).join('')}</optgroup>`).join('');
  weaponSelect.innerHTML = [true, false].map(supported => `<optgroup label="${supported ? '탄수 계산 지원' : '정밀 계산 미지원'}">${support.filter(item => Boolean(weaponProfiles[item.id]) === supported).map(item => option(item.id, item.name)).join('')}</optgroup>`).join('');
  enemySelect.value = state.enemy;
  weaponSelect.value = state.weapon;
  $('#combat-coverage').textContent = `적 ${enemies.length}종 · 무기 ${Object.keys(weaponProfiles).length}종`;

  function updateModes() {
    const modes = weaponProfiles[state.weapon]?.modes;
    modeSelect.innerHTML = modes ? modes.map(mode => option(mode.id, mode.name)).join('') : option('unsupported', '정밀 계산 미지원');
    modeSelect.disabled = !modes || modes.length === 1;
    state.mode = modeSelect.value;
  }

  function routeCard(row) {
    const target = row.target;
    const outcome = outcomes[row.outcome];
    const hasHits = row.hits != null;
    const stages = row.stages;
    const stageExplanation = stages.map((stage, index) => {
      const { direct, explosion, mainExplosion } = stage.damage;
      return `<li><strong>${escape(stage.name)}</strong>: 직격 ${number(direct)} + 부위 폭발 ${number(explosion)}${mainExplosion ? ` · 본체로 전달되는 폭발 ${number(mainExplosion)}` : ''}${stages.length > 1 ? ` → ${stage.hits}발` : ''}${index < stages.length - 1 ? ' 후 다음 부위 공격' : ''}</li>`;
    }).join('');
    return `<article class="combat-route" data-outcome="${row.outcome}"><div class="combat-route-top"><h3>${escape(target.name)}</h3><span class="outcome-tag">${outcome}</span></div><div class="combat-hit-count">${hasHits ? `<strong>${number(row.hits)}</strong><span>발${target.prerequisite ? ` · ${escape(target.prerequisite)}` : ' · 이론값'}</span>` : `<strong class="combat-no-count">${row.outcome === 'blocked' ? '관통·피해 조건 미충족' : '—'}</strong>`}</div><dl class="combat-part-stats"><div><dt>부위 체력</dt><dd>${number(target.hp)}${target.next ? ` → ${number(target.next.hp)}` : ''}</dd></div><div><dt>장갑 수치</dt><dd>${target.armor}${target.next ? ` → ${target.next.armor}` : ''}</dd></div><div><dt>내구도</dt><dd>${target.durability}%${target.next && target.next.durability !== target.durability ? ` → ${target.next.durability}%` : ''}</dd></div><div><dt>폭발 저항</dt><dd>${target.exdr}%</dd></div></dl><p class="combat-target-tip">${escape(target.tip)}</p>${row.outcome === 'bleed' ? '<p class="combat-row-note">출혈을 시작시키는 탄수입니다. 사망까지 시간이 걸릴 수 있습니다.</p>' : ''}${row.outcome === 'break' || row.outcome === 'armor' ? '<p class="combat-row-note">이 탄수는 처치 탄수가 아닙니다. 파괴 후 살아 있을 수 있습니다.</p>' : ''}${row.via === 'main' ? '<p class="combat-row-note">해당 부위에서 전달된 피해로 본체 체력이 소진되는 경로입니다.</p>' : ''}${row.conditional ? '<p class="combat-row-note">외피 제거 탄수와 이전 피해는 제외한, 노출 부위 자체의 체력 기준입니다.</p>' : ''}${stageExplanation ? `<details class="combat-breakdown"><summary>한 발 피해와 계산 과정</summary><ul>${stageExplanation}</ul><p>일반 피해에 내구도·장갑을 적용한 값입니다. 폭발은 중심부 최대값이며 본체 전달 피해를 부위 피해에 중복으로 더하지 않습니다.</p></details>` : ''}</article>`;
  }

  function render() {
    const enemy = enemies.find(item => item.id === state.enemy);
    const weapon = support.find(item => item.id === state.weapon);
    const profile = weaponProfiles[state.weapon];
    const mode = profile?.modes.find(item => item.id === state.mode);
    const unsupported = mode?.unsupported || (!profile && (unsupportedWeapons[weapon.id] || '이 무기의 내구 피해와 부위별 적용 조건을 아직 검증하지 않았습니다.'));
    const { best, rows } = calculateMatchup(enemy, mode, state);
    const answer = $('#combat-answer');
    let title, body;
    if (unsupported) {
      answer.dataset.tone = 'neutral'; title = '이 무기·모드의 탄수는 계산 보류'; body = `${unsupported} 처치 불가능이라는 뜻은 아닙니다.`;
    } else if (enemy.shield && !state.shieldCleared) {
      answer.dataset.tone = 'neutral'; title = enemy.id === 'harvester' ? '보호막 제거 여부를 먼저 확인하세요' : '방패를 피한 사격인지 확인하세요'; body = enemy.shield.note;
    } else if (best) {
      answer.dataset.tone = 'positive'; title = `${best.target.name} · ${number(best.hits)}발로 ${best.outcome === 'bleed' ? '출혈 처치 유발' : '처치 가능'}`;
      body = best.stages.length > 1 ? best.stages.map(stage => `${stage.name} ${stage.hits}발`).join(' → ') : best.target.tip;
    } else {
      answer.dataset.tone = 'neutral'; title = '확인된 부위에서 바로 처치하는 경로 없음'; body = rows.some(row => row.conditional && row.outcome === 'kill') ? '아래에서 장갑 제거가 필요한 부위의 조건부 탄수를 확인하세요.' : '관통 가능한 부위와 부위 파괴 결과를 확인하세요. 이 결과만으로 적 전체를 처치 불가능하다고 단정하지 않습니다.';
    }
    answer.innerHTML = `<span class="combat-answer-label">${escape(enemy.name)} × ${escape(weapon.name)}</span><h3>${escape(title)}</h3><p>${escape(body)}</p>`;
    $('#combat-shield').hidden = !enemy.shield;
    $('#combat-shield-cleared').checked = state.shieldCleared;
    if (enemy.shield) {
      $('#combat-shield-label').textContent = enemy.shield.label;
      $('#combat-shield-note').textContent = `방패·보호막 체력 ${number(enemy.shield.hp)} / 장갑 ${enemy.shield.armor}. ${enemy.shield.note}`;
    }
    $('#combat-loadout').innerHTML = `<div class="combat-weapon-title"><img src="${escape(wikiIcons[weapon.id].src)}" alt="" width="40" height="40"><div><strong>${escape(weapon.name)}</strong><span>${escape(mode?.name || '정밀 계산 미지원')}</span></div></div>${mode && !mode.unsupported ? `<p>직격 ${number(mode.standard)} / 내구 피해 ${number(mode.durable)} / AP ${mode.ap}${mode.explosion ? `<br>폭발 ${number(mode.explosion)} / 폭발 AP ${mode.explosionAp}` : ''}</p>` : ''}${mode?.falloff ? '<p class="combat-row-note">거리 감쇠가 있는 무기입니다. 표시 탄수는 근거리 최대 피해 기준입니다.</p>' : ''}${profile?.note ? `<p class="combat-row-note">${escape(profile.note)}</p>` : ''}`;
    $('#combat-enemy-info').innerHTML = `<strong>${escape(enemy.name)}</strong><p>본체 체력 ${number(enemy.main.hp)} / 본체 장갑 ${enemy.main.armor}</p><p>${escape(enemy.note)}</p>`;
    $('#combat-routes').innerHTML = rows.map(routeCard).join('');
    $('#combat-sources').innerHTML = `${sourceLink(enemy.source, '적 부위 수치')} · ${sourceLink(profile?.source || weapon.source, '무기 수치')} · ${sourceLink(damageSource, '피해 계산 규칙')}<br>자료 확인 ${combatCheckedAt} · 커뮤니티 위키 검색 색인의 표 기준 · 실시간 패치 동기화 아님`;
  }

  function selectView(view, updateHash = true) {
    const combat = view === 'combat';
    $('#catalog-view').hidden = combat;
    $('#catalog-notice').hidden = combat;
    $('#combat-view').hidden = !combat;
    document.querySelectorAll('[data-feature]').forEach(button => {
      const active = button.dataset.feature === view;
      button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
    });
    if (updateHash) history.replaceState(null, '', `${location.pathname}${location.search}${combat ? '#combat' : ''}`);
    onViewChange();
  }
  document.querySelectorAll('[data-feature]').forEach(button => button.addEventListener('click', () => selectView(button.dataset.feature)));
  window.addEventListener('hashchange', () => selectView(location.hash === '#combat' ? 'combat' : 'catalog', false));
  enemySelect.addEventListener('change', () => { state.enemy = enemySelect.value; state.shieldCleared = false; render(); });
  weaponSelect.addEventListener('change', () => { state.weapon = weaponSelect.value; updateModes(); render(); });
  modeSelect.addEventListener('change', () => { state.mode = modeSelect.value; render(); });
  $('#combat-shield-cleared').addEventListener('change', event => { state.shieldCleared = event.target.checked; render(); });
  updateModes(); render(); selectView(location.hash === '#combat' ? 'combat' : 'catalog', false);
  return {
    showCatalog: () => selectView('catalog'),
    openWeapon(id) {
      if (!support.some(item => item.id === id)) return;
      state.weapon = id; weaponSelect.value = id; updateModes(); render(); selectView('combat'); enemySelect.focus();
    },
  };
}
