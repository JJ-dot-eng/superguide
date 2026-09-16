import { enemies, weaponProfiles, unsupportedWeapons, combatCheckedAt, damageSource, enemyTypeCount } from './combat-data.js?v=enemy-names-1';
import { calculateMatchup } from './combat.js?v=c4-1';
import { combatImages } from './combat-images.js?v=high-difficulty-1';
import { combatTerms, combatCount, combatOutcome, combatAssumption, combatTargetTip, combatShieldNotice, combatRouteNotes, combatSummary, combatModeStats } from './combat-presentation.js?v=c4-1';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const number = value => value.toLocaleString('ko-KR');
const sourceLink = (url, label) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;

export function renderCombatRoute(row, enemy, mode) {
  const target = row.target;
  const terms = combatTerms(mode);
  const outcome = combatOutcome(row.outcome, mode);
  const stages = row.stages;
  const photo = combatImages[enemy.id][target.id][0];
  const [cropX, cropY, cropWidth, cropHeight] = photo.thumbnailCrop || [0, 0, 320, 213];
  const cropStyle = `width:${320 / cropWidth * 100}%;height:${213 / cropHeight * 100}%;left:${-cropX / cropWidth * 100}%;top:${-cropY / cropHeight * 100}%;`;
  let component = target;
  const stageExplanation = stages.map((stage, index) => {
    const { direct, explosion, mainExplosion } = stage.damage;
    const transfer = terms.adhesive ? `<br>부위 피해의 본체 전달 ${component.toMain}% · ${component.overflowCap ? `누적 전달 상한 ${number(component.hp + (component.constitution || 0))}` : '전달 상한 없음'}` : '';
    component = component.next;
    return `<li><strong>${escape(stage.name)}</strong>: 직격 ${number(direct)} + 부위 폭발 ${number(explosion)}${mainExplosion ? ` · 본체에 처리되는 폭발 ${number(mainExplosion)}` : ''}${stages.length > 1 ? ` → ${combatCount(stage.hits, mode)}` : ''}${index < stages.length - 1 ? ' 후 다음 부위 공격' : ''}${transfer}</li>`;
  }).join('');
  const main = target.main || enemy.main;
  const breakdownNote = terms.adhesive
    ? `폭발 관통과 해당 부위의 폭발 저항을 적용합니다. 폭발 면역 부위는 본체 장갑·폭발 저항으로 처리하며, 이 폭발을 부위 피해에 중복으로 더하지 않습니다. 계산 대상 본체 체력 ${number(main.hp)} / 장갑 ${main.armor} / 폭발 저항 ${main.exdr}%. 한 폭발의 여러 부위 동시 피해는 합산하지 않습니다.`
    : '일반 피해에 내구도·장갑을 적용한 값입니다. 폭발은 중심부 최대값이며 본체 전달 피해를 부위 피해에 중복으로 더하지 않습니다.';
  const notes = combatRouteNotes(row, mode);
  return `<article class="combat-route" data-outcome="${row.outcome}">
    <div class="combat-route-overview"><div class="combat-route-lead"><div class="combat-route-top"><h3>${escape(target.name)}</h3><span class="outcome-tag">${outcome}</span></div>
    <div class="combat-hit-count">${row.hits != null ? `<strong>${number(row.hits)}</strong><span>${terms.unit} · 이론값${target.prerequisite ? ` · ${escape(target.prerequisite)}` : ''}</span>` : `<strong class="combat-no-count">${row.outcome === 'blocked' ? '관통·피해 조건 미충족' : '—'}</strong>`}</div></div>
    <button class="combat-part-photo" data-part-image="${escape(target.id)}" aria-label="${escape(enemy.name)} ${escape(target.name)} 사진 크게 보기" aria-haspopup="dialog" aria-controls="combat-image-dialog"><span class="combat-part-window" style="aspect-ratio:${cropWidth}/${cropHeight}"><img src="${escape(photo.thumbnail)}" alt="${escape(enemy.name)}의 ${escape(target.name)} 위치가 색으로 표시된 사진" width="320" height="213" loading="lazy" decoding="async" style="${cropStyle}"></span><span class="combat-part-caption" aria-hidden="true">크게 보기 ↗</span></button></div>
    <dl class="combat-part-stats"><div><dt>부위 체력</dt><dd>${number(target.hp)}${target.next ? ` → ${number(target.next.hp)}` : ''}</dd></div><div><dt>장갑 수치</dt><dd>${target.armor}${target.next ? ` → ${target.next.armor}` : ''}</dd></div><div><dt>내구도</dt><dd>${target.durability}%${target.next && target.next.durability !== target.durability ? ` → ${target.next.durability}%` : ''}</dd></div><div><dt>폭발 저항</dt><dd>${target.exdr}%</dd></div></dl>
    <p class="combat-target-tip">${escape(combatTargetTip(target, mode, row))}</p>${notes.map(note => `<p class="combat-row-note">${escape(note)}</p>`).join('')}
    ${target.main ? `<p class="combat-row-note">${escape(target.main.name)} 체력 ${number(target.main.hp)} 기준 · 다른 본체 체력과 별도 계산</p>` : ''}
    ${stageExplanation ? `<details class="combat-breakdown"><summary>${terms.one} 피해와 계산 과정</summary><ul>${stageExplanation}</ul><p>${escape(breakdownNote)}</p></details>` : ''}
  </article>`;
}

export function initCombat({ stratagems, wikiIcons, navigate }) {
  const $ = selector => document.querySelector(selector);
  const enemySelect = $('#combat-enemy');
  const weaponSelect = $('#combat-weapon');
  const modeSelect = $('#combat-mode');
  const support = stratagems.filter(item => item.category === 'support');
  const state = { enemy: 'charger', weapon: 'autocannon', mode: 'aphet', shieldCleared: false };
  const option = (id, name) => `<option value="${escape(id)}">${escape(name)}</option>`;
  enemySelect.innerHTML = [...new Set(enemies.map(enemy => enemy.faction))].map(faction => `<optgroup label="${faction}">${enemies.filter(enemy => enemy.faction === faction).map(enemy => option(enemy.id, enemy.name)).join('')}</optgroup>`).join('');
  weaponSelect.innerHTML = [true, false].map(supported => `<optgroup label="${supported ? '계산 지원' : '정밀 계산 미지원'}">${support.filter(item => Boolean(weaponProfiles[item.id]) === supported).map(item => option(item.id, item.name)).join('')}</optgroup>`).join('');
  enemySelect.value = state.enemy;
  weaponSelect.value = state.weapon;
  $('#combat-coverage').textContent = `적 ${enemyTypeCount}종 · 무기 ${Object.keys(weaponProfiles).length}종`;

  function updateModes() {
    const modes = weaponProfiles[state.weapon]?.modes;
    modeSelect.innerHTML = modes ? modes.map(mode => option(mode.id, mode.name)).join('') : option('unsupported', '정밀 계산 미지원');
    modeSelect.disabled = !modes || modes.length === 1;
    state.mode = modeSelect.value;
  }

  function render() {
    const enemy = enemies.find(item => item.id === state.enemy);
    const weapon = support.find(item => item.id === state.weapon);
    const profile = weaponProfiles[state.weapon];
    const mode = profile?.modes.find(item => item.id === state.mode);
    const unsupported = mode?.unsupported || (!profile && (unsupportedWeapons[weapon.id] || '이 무기의 내구 피해와 부위별 적용 조건을 아직 검증하지 않았습니다.'));
    const { best, rows } = calculateMatchup(enemy, mode, state);
    const answer = $('#combat-answer');
    const { title, body, tone } = combatSummary(enemy, mode, { best, rows }, { ...state, unsupported });
    answer.dataset.tone = tone;
    $('#combat-assumption').innerHTML = combatAssumption(mode);
    answer.innerHTML = `<span class="combat-answer-label">${escape(enemy.name)} × ${escape(weapon.name)}</span><h3>${escape(title)}</h3><p>${escape(body)}</p>`;
    $('#combat-shield').hidden = !enemy.shield;
    $('#combat-shield-cleared').checked = state.shieldCleared;
    if (enemy.shield) {
      const notice = combatShieldNotice(enemy, mode);
      $('#combat-shield-label').textContent = notice.label;
      $('#combat-shield-note').textContent = `방패·보호막 체력 ${number(enemy.shield.hp)} / 장갑 ${enemy.shield.armor}. ${notice.note}`;
    }
    $('#combat-loadout').innerHTML = `<div class="combat-weapon-title"><img src="${escape(wikiIcons[weapon.id].src)}" alt="" width="40" height="40"><div><strong>${escape(weapon.name)}</strong><span>${escape(mode?.name || '정밀 계산 미지원')}</span></div></div>${combatModeStats(mode).length ? `<p>${combatModeStats(mode).map(escape).join('<br>')}</p>` : ''}${mode?.falloff ? '<p class="combat-row-note">거리 감쇠가 있는 무기입니다. 표시 탄수는 근거리 최대 피해 기준입니다.</p>' : ''}${profile?.note ? `<p class="combat-row-note">${escape(profile.note)}</p>` : ''}`;
    $('#combat-enemy-info').innerHTML = `<strong>${escape(enemy.name)}</strong><p>본체 체력 ${number(enemy.main.hp)} / 본체 장갑 ${enemy.main.armor}</p><p>${escape(combatTerms(mode).adhesive ? enemy.note.replaceAll('탄수', '장약 개수').replaceAll('후속탄', '후속 공격') : enemy.note)}</p>`;
    $('#combat-routes').innerHTML = rows.map(row => renderCombatRoute(row, enemy, mode)).join('');
    $('#combat-sources').innerHTML = `${sourceLink(enemy.source, '적 부위 수치')} · ${sourceLink(profile?.source || weapon.source, '무기 수치')} · ${sourceLink(damageSource, '피해 계산 규칙')}<br>자료 확인 ${escape(profile?.checkedAt || combatCheckedAt)} · 커뮤니티 위키의 부위·무기 표 기준 · 실시간 패치 동기화 아님`;
  }

  enemySelect.addEventListener('change', () => { state.enemy = enemySelect.value; state.shieldCleared = false; render(); });
  weaponSelect.addEventListener('change', () => { state.weapon = weaponSelect.value; updateModes(); render(); });
  modeSelect.addEventListener('change', () => { state.mode = modeSelect.value; render(); });
  $('#combat-shield-cleared').addEventListener('change', event => { state.shieldCleared = event.target.checked; render(); });
  $('#combat-routes').addEventListener('click', event => {
    const button = event.target.closest('[data-part-image]');
    if (!button) return;
    const enemy = enemies.find(item => item.id === state.enemy);
    const target = enemy.parts.find(item => item.id === button.dataset.partImage);
    const photos = combatImages[enemy.id][target.id];
    $('#combat-image-title').textContent = `${enemy.name} · ${target.name}`;
    const mode = weaponProfiles[state.weapon]?.modes.find(item => item.id === state.mode);
    const row = calculateMatchup(enemy, mode, state).rows.find(item => item.target.id === target.id);
    $('#combat-image-tip').textContent = combatTargetTip(target, mode, row) + (enemy.id === 'harvester' ? ' 좌우는 적의 몸을 기준으로 구분합니다.' : '');
    $('#combat-image-gallery').innerHTML = photos.map((photo, index) => {
      const label = photo.caption || (photos.length > 1 ? index === 0 ? '1. 장갑이 남아 있는 상태' : '2. 장갑 제거 후 노출된 부위' : target.name);
      return `<figure><figcaption>${escape(label)}</figcaption><img src="${escape(photo.src)}" alt="${escape(enemy.name)} ${escape(label)} — 색으로 표시된 영역이 조준 부위" width="${photo.width}" height="${photo.height}" decoding="async"><p class="combat-sources">${sourceLink(photo.source, '위키 사진 출처')}</p></figure>`;
    }).join('');
    $('#combat-image-dialog').showModal();
  });
  updateModes(); render();
  return {
    showCatalog: () => navigate('catalog'),
    openWeapon(id) {
      if (!support.some(item => item.id === id)) return;
      state.weapon = id; weaponSelect.value = id; updateModes(); render(); navigate('combat'); enemySelect.focus();
    },
  };
}
