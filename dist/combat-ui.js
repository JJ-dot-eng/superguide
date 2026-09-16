import { enemies, weaponProfiles, unsupportedWeapons, combatCheckedAt, damageSource, enemyTypeCount } from './combat-data.js?v=vox-explanation-2';
import { calculateMatchup } from './combat.js?v=enemies-37-1';
import { combatImages } from './combat-images.js?v=enemies-37-1';
import { combatTerms, combatCount, combatOutcome, combatAssumption, combatTargetTip, combatShieldNotice, combatRouteNotes, combatSummary, combatModeStats, combatImpactLabel, combatImpactVerb } from './combat-presentation.js?v=vox-leveller-1';
import { resolveCombatCondition, combatConditionText } from './combat-conditions.js?v=enemies-37-1';
import { syncImagePicker, focusImagePicker } from './image-picker.js?v=portrait-layout-1';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const number = value => Number.isFinite(value) ? value.toLocaleString('ko-KR') : '자료 미확인';
const percent = value => Number.isFinite(value) ? `${number(value)}%` : '자료 미확인';
const sourceLink = (url, label) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;

export function renderTacticalExplanation(reference) {
  const explanation = reference?.explanation;
  if (!explanation) return '';
  return `<details class="combat-breakdown combat-tactical-explanation"><summary>한 발 처치가 가능한 이유 · 가정 계산 자세히</summary>
    <p>${escape(explanation.intro)}</p>
    <ul>${explanation.attacks.map(attack => `<li>${escape(attack)}</li>`).join('')}</ul>
    <table class="combat-tactical-table"><caption>여러 부위 동시 피격을 가정한 본체 전달 피해</caption><thead><tr><th scope="col">피격 부위</th><th scope="col">전달 계산</th><th scope="col">본체 피해</th></tr></thead>
    <tbody>${explanation.rows.map(row => `<tr><th scope="row">${escape(row.part)}</th><td>${escape(row.formula)}</td><td>${number(row.mainDamage)}</td></tr>`).join('')}</tbody>
    <tfoot><tr><th scope="row" colspan="2">가정 합계 · 실측값 아님</th><td>${number(explanation.total)}</td></tr></tfoot></table>
    <ul>${explanation.notes.map(note => `<li>${escape(note)}</li>`).join('')}</ul>
    <p class="combat-sources">${explanation.sources.map(source => sourceLink(source.url, escape(source.label))).join(' · ')}</p>
  </details>`;
}

export function renderCombatRoute(row, enemy, mode, { singlePartTheory = false } = {}) {
  const target = row.target;
  const terms = combatTerms(mode);
  const outcome = row.outcome === 'break' && target.resultLabel ? target.resultLabel : combatOutcome(row.outcome, mode);
  const stages = row.stages;
  const photo = combatImages[enemy.id]?.[target.id]?.find(photo => photo.stage === 'initial');
  const thumbWidth = photo?.thumbnailWidth || 320, thumbHeight = photo?.thumbnailHeight || 213;
  const [cropX, cropY, cropWidth, cropHeight] = photo?.thumbnailCrop || [0, 0, thumbWidth, thumbHeight];
  const cropStyle = `width:${thumbWidth / cropWidth * 100}%;height:${thumbHeight / cropHeight * 100}%;left:${-cropX / cropWidth * 100}%;top:${-cropY / cropHeight * 100}%;`;
  let component = target;
  const stageExplanation = stages.map((stage, index) => {
    const { direct, explosion, mainExplosion } = stage.damage;
    const transfer = component.partOnly ? `<br>독립 장치 자체 파괴 기준 · 본체 전달 미합산` : terms.adhesive || mode?.reviewedExplosive || mode?.conditionalImpact ? `<br>부위 피해의 본체 전달 ${number(component.toMain)}% · ${component.overflowCap == null ? '전달 상한 자료 미확인' : component.overflowCap ? `누적 전달 상한 ${number(component.hp + (component.staticConstitution || 0) + (component.constitution || 0) + (component.transferExtraHealth || 0))}` : '전달 상한 없음'}` : '';
    if (mode?.beam) return `<li><strong>${escape(stage.name)}</strong>: 한 발 최대 광선 피해 ${number(direct)} / AP ${mode.ap} → 장갑 ${stage.armor}${transfer}${Number.isFinite(stage.contactSeconds) ? `<br>계산 종료까지 광선 접촉 약 ${number(stage.contactSeconds)}초 · 누적 부위 피해 ${number(stage.appliedDirect)} · 본체 전달 ${number(stage.mainTransfer)}` : ''}</li>`;
    const blasts = stage.breakdown?.explosions.map(blast => blast.excluded ? `<br>${escape(blast.name)}: 독립 장치 폭발 면역 → 장치 피해 0 · 주변 본체 피해 미합산` : `<br>${escape(blast.name)}: AP ${number(blast.effectiveAp)} → ${blast.redirected ? '본체' : '부위'} 장갑 ${number(blast.armor)} / 폭발 저항 ${number(blast.exdr)}% → ${blast.redirected ? '본체 폭발' : '부위 폭발'} ${number(blast.redirected ? blast.mainDamage : blast.partDamage)}<br>최대 피해 반경 ${number(blast.innerRadius)}m / 외곽 반경 ${number(blast.radius)}m`).join('') || '';
    const events = stage.events?.map(event => `<br>${escape(event.name)} ${event.count}회 명중 가정: ${combatImpactLabel(event.attack)} ${number(event.breakdown.damage.direct)} + 부위 폭발 ${number(event.breakdown.damage.explosion)} + 본체 폭발 ${number(event.breakdown.damage.mainExplosion)} (1회당)${event.breakdown.explosions.map(blast => blast.excluded ? '<br>독립 장치 폭발 면역 · 주변 본체 피해 미합산' : `<br>폭발 AP ${number(blast.effectiveAp)} → ${blast.redirected ? '본체' : '부위'} 장갑 ${number(blast.armor)} / 폭발 저항 ${number(blast.exdr)}% / 최대 피해 반경 ${number(blast.innerRadius)}m`).join('')}`).join('') || '';
    component = component.next;
    return `<li><strong>${escape(stage.name)}</strong>: ${combatImpactLabel(mode)} ${number(direct)} + 부위 폭발 ${number(explosion)}${mainExplosion !== 0 ? ` · 본체에 처리되는 폭발 ${number(mainExplosion)}` : ''}${stages.length > 1 ? ` → ${combatCount(stage.hits, mode)}` : ''}${index < stages.length - 1 ? ' 후 다음 부위 공격' : ''}${blasts}${events}${transfer}</li>`;
  }).join('');
  const main = target.main || enemy.main;
  const breakdownNote = target.partOnly ? target.partOnlyNote : mode?.beam
    ? `일반·내구 피해에 부위 내구도와 장갑을 적용합니다. 같은 장갑 수치에서는 피해가 65%이며, 광선에는 폭발 저항을 적용하지 않습니다. 본체 전달 비율과 누적 상한을 반영하고, 부위 파괴 또는 본체 체력 소진 시점에서 멈춥니다. 남은 광선을 파괴된 부위의 초과 피해로 넘기거나 화상으로 더하지 않습니다. 본체 체력 ${number(main.hp)}. 접촉 시간은 충전·재장전·사격 사이 공백을 제외한 이론값이며, 실제 피해 적용 간격은 자료 미확인입니다.`
    : mode?.conditionalImpact
    ? `각 명중의 일반·내구 피해에 부위 내구도와 장갑을 적용한 뒤 본체 전달 피해를 계산합니다. 전격과 작살 직격에는 폭발 저항을 적용하지 않습니다. 폭발은 각 폭발의 관통·반경·폭발 저항으로 별도 판정합니다. 여러 부위 동시 피해는 합산하지 않습니다. 계산 대상 본체 체력 ${number(main.hp)}. 한 발의 명중 수를 고른 경우 각 명중마다 피해와 본체 전달을 버림 처리하고 누적 전달 상한을 공유합니다.`
    : mode?.delivery === 'melee' && mode.explosion === 0
    ? `타격 일반·내구 피해에 부위 내구도와 장갑을 적용합니다. 부위에서 본체로 전달되는 피해와 누적 전달 상한을 따로 적용합니다. 계산 대상 본체 체력 ${number(main.hp)}. 폭약 피해는 포함하지 않습니다.`
    : terms.adhesive || mode?.reviewedExplosive
    ? `폭발 관통과 해당 부위의 폭발 저항을 적용합니다. 폭발 면역 부위는 본체 장갑·폭발 저항으로 처리하며, 이 폭발을 부위 피해에 중복으로 더하지 않습니다. 계산 대상 본체 체력 ${number(main.hp)} / 장갑 ${main.armor} / 폭발 저항 ${main.exdr}%. 한 폭발의 여러 부위 동시 피해는 합산하지 않습니다.`
    : '일반 피해에 내구도·장갑을 적용한 값입니다. 폭발은 중심부 최대값이며 본체 전달 피해를 부위 피해에 중복으로 더하지 않습니다.';
  const notes = combatRouteNotes(row, mode);
  return `<article class="combat-route" data-outcome="${row.outcome}">
    <div class="combat-route-overview"><div class="combat-route-lead"><div class="combat-route-top"><h3>${escape(target.name)}</h3><span class="outcome-tag">${outcome}</span></div>
    <div class="combat-hit-count">${row.hits != null ? `<strong>${number(row.hits)}</strong><span>${terms.unit}${mode?.conditionalImpact ? ` 이상 · ${escape(target.name)} ${combatImpactVerb(mode)} 시` : row.lowerBound ? ' 이상 · 재생 제외' : singlePartTheory ? ' · 단일 부위 이론값' : ' · 이론값'}${target.prerequisite ? ` · ${escape(target.prerequisite)}` : ''}</span>` : `<strong class="combat-no-count">${row.outcome === 'blocked' ? '관통·피해 조건 미충족' : '—'}</strong>`}</div></div>
    ${photo ? `<button class="combat-part-photo" data-part-image="${escape(target.id)}" aria-label="${escape(enemy.name)} ${escape(target.name)} 사진 크게 보기" aria-haspopup="dialog" aria-controls="combat-image-dialog"><span class="combat-part-window" style="aspect-ratio:${cropWidth}/${cropHeight}"><img src="${escape(photo.thumbnail)}" alt="${escape(enemy.name)}의 ${escape(target.name)} 위치가 색으로 표시된 사진" width="${thumbWidth}" height="${thumbHeight}" loading="lazy" decoding="async" style="${cropStyle}"></span><span class="combat-part-caption" aria-hidden="true">크게 보기 ↗</span></button>` : `<span class="combat-part-missing">부위 사진<br>자료 미확인</span>`}</div>
    <dl class="combat-part-stats"><div><dt>부위 체력</dt><dd>${number(target.hp == null ? null : target.hp + (target.staticConstitution || 0))}${target.mainOnly ? ' · 본체 공유' : ''}${target.next ? ` → ${number(target.next.hp + (target.next.staticConstitution || 0))}` : ''}</dd></div><div><dt>장갑 수치</dt><dd>${number(target.armor)}${target.next ? ` → ${number(target.next.armor)}` : ''}</dd></div><div><dt>내구도</dt><dd>${percent(target.durability)}${target.next && target.next.durability !== target.durability ? ` → ${percent(target.next.durability)}` : ''}</dd></div><div><dt>폭발 저항</dt><dd>${percent(target.exdr)}</dd></div></dl>
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
  const state = { enemy: 'charger', weapon: 'autocannon', mode: 'aphet', shieldCleared: false, hitCount: '', primaryHit: 'blast', bombletDirect: false };
  const option = (id, name) => `<option value="${escape(id)}">${escape(name)}</option>`;
  enemySelect.innerHTML = [...new Set(enemies.map(enemy => enemy.faction))].map(faction => `<optgroup label="${faction}">${enemies.filter(enemy => enemy.faction === faction).map(enemy => option(enemy.id, enemy.name)).join('')}</optgroup>`).join('');
  weaponSelect.innerHTML = [true, false].map(supported => `<optgroup label="${supported ? '계산 지원' : '정밀 계산 미지원'}">${support.filter(item => Boolean(weaponProfiles[item.id]) === supported).map(item => option(item.id, item.name)).join('')}</optgroup>`).join('');
  enemySelect.value = state.enemy;
  weaponSelect.value = state.weapon;
  $('#combat-coverage').textContent = `적 ${enemyTypeCount}종 · 무기 ${Object.keys(weaponProfiles).length}종`;

  function updateModes() {
    const modes = weaponProfiles[state.weapon]?.modes;
    $('#combat-mode-label').textContent = modes?.some(mode => mode.beam) ? '거리별 피해 기준' : '발사·기폭 방식';
    modeSelect.innerHTML = modes ? modes.map(mode => option(mode.id, mode.name)).join('') : option('unsupported', '정밀 계산 미지원');
    modeSelect.disabled = !modes || modes.length === 1;
    state.mode = modeSelect.value;
    updateConditions();
  }

  function updateConditions() {
    const mode = weaponProfiles[state.weapon]?.modes.find(item => item.id === state.mode);
    const condition = mode?.hitCondition;
    state.hitCount = ''; state.primaryHit = 'blast'; state.bombletDirect = false;
    $('#combat-hit-conditions').hidden = !condition;
    $('#combat-primary-control').hidden = condition?.kind !== 'bomblets';
    $('#combat-bomblet-control').hidden = condition?.kind !== 'bomblets';
    $('#combat-primary-hit').value = state.primaryHit;
    $('#combat-bomblet-direct').checked = false;
    const unit = condition?.kind === 'arcs' ? '회' : '개';
    $('#combat-impact-label').textContent = condition?.kind === 'arcs' ? '한 발당 해당 부위 전격 명중 수' : '한 발당 해당 부위 자탄 명중 수';
    $('#combat-impact-count').innerHTML = option('', '명중 수 선택 · 실제 개수 미확인') + (condition ? Array.from({ length: condition.max - condition.min + 1 }, (_, index) => option(String(condition.min + index), `${condition.min + index}${unit} 명중 가정`)).join('') : '');
  }

  function render() {
    syncImagePicker(enemySelect);
    syncImagePicker(weaponSelect);
    const enemy = enemies.find(item => item.id === state.enemy);
    const weapon = support.find(item => item.id === state.weapon);
    const profile = weaponProfiles[state.weapon];
    const mode = resolveCombatCondition(profile?.modes.find(item => item.id === state.mode), state);
    const unsupported = mode?.unsupported || (!profile && (unsupportedWeapons[weapon.id] || '이 무기의 내구 피해와 부위별 적용 조건을 아직 검증하지 않았습니다.'));
    const { best, rows } = calculateMatchup(enemy, mode, state);
    const answer = $('#combat-answer');
    const { title, body, tone, reference } = combatSummary(enemy, mode, { best, rows }, { ...state, unsupported });
    answer.dataset.tone = tone;
    $('#combat-assumption').innerHTML = combatAssumption(mode);
    $('#combat-condition-note').textContent = combatConditionText(mode);
    $('#combat-bomblet-direct').disabled = !(mode?.selectedCondition?.count > 0);
    answer.innerHTML = `<span class="combat-answer-label">${escape(enemy.name)} × ${escape(weapon.name)}</span><h3>${escape(title)}</h3><p>${escape(body)}</p>${renderTacticalExplanation(reference)}${reference ? `<p class="combat-sources">${sourceLink(reference.source, '위키 전술 설명')} · 자료 확인 ${escape(reference.checkedAt)}</p>` : ''}`;
    $('#combat-shield').hidden = !enemy.shield;
    $('#combat-shield-cleared').checked = state.shieldCleared;
    if (enemy.shield) {
      const notice = combatShieldNotice(enemy, mode);
      $('#combat-shield-label').textContent = notice.label;
      $('#combat-shield-note').textContent = `방패·보호막 체력 ${enemy.shield.infiniteHealth ? '파괴 불가' : number(enemy.shield.hp)}${Number.isFinite(enemy.shield.armor) ? ` / 장갑 ${enemy.shield.armor}` : ''}. ${notice.note}`;
    }
    $('#combat-loadout').innerHTML = `<div class="combat-weapon-title"><img src="${escape(wikiIcons[weapon.id].src)}" alt="" width="40" height="40"><div><strong>${escape(weapon.name)}</strong><span>${escape(mode?.name || '정밀 계산 미지원')}</span></div></div>${combatModeStats(mode).length ? `<p>${combatModeStats(mode).map(escape).join('<br>')}</p>` : ''}${mode?.falloff ? '<p class="combat-row-note">거리 감쇠가 있는 무기입니다. 표시 탄수는 근거리 최대 피해 기준입니다.</p>' : ''}${mode?.note ? `<p class="combat-row-note">${escape(mode.note)}</p>` : ''}${profile?.note ? `<p class="combat-row-note">${escape(profile.note)}</p>` : ''}`;
    $('#combat-enemy-info').innerHTML = `<strong>${escape(enemy.name)}</strong><p>본체 체력 ${number(enemy.main.hp)} / 본체 장갑 ${enemy.main.armor}</p><p>${escape(mode?.unit ? enemy.note.replaceAll('탄수', combatTerms(mode).count).replaceAll('후속탄', '후속 공격') : enemy.note)}</p>`;
    $('#combat-routes').innerHTML = rows.map(row => renderCombatRoute(row, enemy, mode, { singlePartTheory: Boolean(reference) })).join('');
    $('#combat-sources').innerHTML = `${sourceLink(enemy.source, '적 부위 수치')} · ${sourceLink(profile?.source || weapon.source, '무기 수치')}${profile?.extraSource ? ` · ${sourceLink(profile.extraSource, '광선 세부 수치')}` : ''} · ${sourceLink(damageSource, '피해 계산 규칙')}<br>자료 확인 ${escape(profile?.checkedAt || combatCheckedAt)} · 커뮤니티 위키의 부위·무기 표 기준 · 실시간 패치 동기화 아님`;
  }

  enemySelect.addEventListener('change', () => { state.enemy = enemySelect.value; state.shieldCleared = false; updateConditions(); render(); });
  weaponSelect.addEventListener('change', () => { state.weapon = weaponSelect.value; updateModes(); render(); });
  modeSelect.addEventListener('change', () => { state.mode = modeSelect.value; updateConditions(); render(); });
  $('#combat-impact-count').addEventListener('change', event => {
    state.hitCount = event.target.value;
    if (!(Number(state.hitCount) > 0)) { state.bombletDirect = false; $('#combat-bomblet-direct').checked = false; }
    render();
  });
  $('#combat-primary-hit').addEventListener('change', event => { state.primaryHit = event.target.value; render(); });
  $('#combat-bomblet-direct').addEventListener('change', event => { state.bombletDirect = event.target.checked; render(); });
  $('#combat-shield-cleared').addEventListener('change', event => { state.shieldCleared = event.target.checked; render(); });
  $('#combat-routes').addEventListener('click', event => {
    const button = event.target.closest('[data-part-image]');
    if (!button) return;
    const enemy = enemies.find(item => item.id === state.enemy);
    const target = enemy.parts.find(item => item.id === button.dataset.partImage);
    const photos = combatImages[enemy.id][target.id];
    $('#combat-image-title').textContent = `${enemy.name} · ${target.name}`;
    const mode = resolveCombatCondition(weaponProfiles[state.weapon]?.modes.find(item => item.id === state.mode), state);
    const row = calculateMatchup(enemy, mode, state).rows.find(item => item.target.id === target.id);
    $('#combat-image-tip').textContent = combatTargetTip(target, mode, row) + (enemy.id === 'harvester' ? ' 좌우는 적의 몸을 기준으로 구분합니다.' : '');
    $('#combat-image-gallery').innerHTML = photos.map((photo, index) => {
      const label = photo.caption || (target.next ? photo.stage === 'initial' ? '1. 장갑이 남아 있는 상태' : '2. 장갑 제거 후 노출된 부위' : target.name);
      return `<figure><figcaption>${escape(label)}</figcaption><img src="${escape(photo.src)}" alt="${escape(enemy.name)} ${escape(label)} — 색으로 표시된 영역이 조준 부위" width="${photo.width}" height="${photo.height}" decoding="async"><p class="combat-sources">${sourceLink(photo.source, '위키 사진 출처')}</p></figure>`;
    }).join('');
    $('#combat-image-dialog').showModal();
  });
  updateModes(); render();
  return {
    showCatalog: () => navigate('catalog'),
    openWeapon(id) {
      if (!support.some(item => item.id === id)) return;
      state.weapon = id; weaponSelect.value = id; updateModes(); render(); navigate('combat'); focusImagePicker(enemySelect);
    },
  };
}
