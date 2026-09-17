import { factionGuides, factionSides, factionCheckedAt, factionAimTargets, factionTactics, factionApproaches } from './faction-data.js?v=spore-fire-options-1';
import { enemies, weaponProfiles, combatCheckedAt } from './combat-data.js?v=vox-explanation-2';
import { calculateMatchup } from './combat.js?v=enemies-37-1';
import { combatCount, combatOutcome, combatTargetTip, combatRouteNotes, combatSummary, combatShieldNotice } from './combat-presentation.js?v=vox-leveller-1';
import { pickerEnemyImages } from './selector-images.js?v=enemies-37-1';
import { factionLoadouts } from './faction-loadouts.js?v=spore-fire-options-1';
import { factionGuideEnemies } from './faction-data.js?v=spore-fire-options-1';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const link = (url, label) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a>`;
const fatal = row => !row.conditional && Number.isFinite(row.hits) && ['kill', 'bleed', 'down'].includes(row.outcome);

export function factionRecommendation(unit, choice) {
  const [weapon, modeId] = choice.split(':');
  const enemy = enemies.find(item => item.id === unit.enemy) || factionGuideEnemies[unit.enemy];
  const selection = factionLoadouts[unit.enemy]?.find(item => item.weapon === choice);
  if (enemy && selection?.adviceOnly) return { enemy, weapon, selection, adviceOnly: true };
  const profile = weaponProfiles[weapon];
  const mode = modeId ? profile?.modes.find(item => item.id === modeId) : profile?.modes[0];
  if (!enemy || !mode) throw new Error(`Unknown faction recommendation: ${unit.enemy}/${choice}`);
  const approach = factionApproaches[`${enemy.id}:${choice}`];
  const result = calculateMatchup(enemy, mode, { shieldCleared: true, ...(approach ? { directHit: approach.directHit } : {}) });
  const targets = approach ? [approach.target] : selection?.targets || factionAimTargets[`${enemy.id}:${choice}`] || unit.targets;
  const candidates = targets.map(id => result.rows.find(item => item.target.id === id)).filter(item => item && fatal(item));
  // Compare the reviewed aim options for this weapon, not their array order.
  candidates.sort((a, b) => a.hits - b.hits || Number(a.outcome !== 'kill') - Number(b.outcome !== 'kill'));
  const row = candidates[0] || (selection ? null : result.best);
  const reference = combatSummary(enemy, mode, result, { weapon, shieldCleared: true }).reference;
  return { enemy, weapon, profile, mode, row, reference, approach, selection, alternatives: candidates.slice(1), tactic: factionTactics[`${enemy.id}:${choice}`] };
}

export function factionRouteText(row, mode) {
  const redirected = row.via === 'main' && row.target.exdr === 100 && row.stages.every(stage => stage.damage.direct === 0 && stage.damage.explosion === 0);
  return {
    title: redirected ? '본체 폭발 피해 · 단일 판정 가정' : row.target.name,
    tip: redirected
      ? `‘${row.target.name}’는 폭발 피해를 받지 않습니다. 폭발이 이 부위에 닿아 본체에 피해가 한 번 전달되는 판정만 반복한 이론값이며, 해당 부위를 파괴하거나 그곳에 조준하는 것이 가장 효과적이라는 뜻은 아닙니다.`
      : combatTargetTip(row.target, mode, row),
    count: `${combatCount(row.hits, mode)}${row.lowerBound && !mode.conditionalImpact ? ' 이상 · 재생 제외' : ''} · ${combatOutcome(row.outcome, mode)}`,
  };
}

function renderRoute(row, mode) {
  const text = factionRouteText(row, mode);
  return `<p class="faction-result"><strong>${escape(text.title)}</strong><span>${escape(text.count)}</span></p><p>${escape(text.tip)}</p>${row.stages.length > 1 ? `<p class="faction-condition">${row.stages.map(stage => `${escape(stage.name)} ${escape(combatCount(stage.hits, mode))}`).join(' → ')} · 위 횟수에 장갑 제거와 후속 공격을 모두 포함합니다.</p>` : ''}${combatRouteNotes(row, mode).map(note => `<p class="faction-condition">${escape(note)}</p>`).join('')}<p class="faction-basis">같은 피해 경로에 최대 피해가 반복되는 이론값. 여러 부위 동시 폭발 피해는 합산하지 않습니다.${mode.falloff ? ' 거리 감쇠 전 기준입니다.' : ''}</p>`;
}

export function renderFactionGuide(guide, stratagems, wikiIcons) {
  const cards = guide.units.map(unit => {
    const enemy = enemies.find(item => item.id === unit.enemy) || factionGuideEnemies[unit.enemy];
    const photo = pickerEnemyImages[enemy.id];
    const base = enemies.find(item => item.id === unit.base);
    const weapons = unit.weapons.map(choice => {
      const { weapon, profile, mode, row, reference, alternatives, tactic, approach, selection, adviceOnly } = factionRecommendation(unit, choice);
      const item = stratagems.find(entry => entry.id === weapon);
      if (adviceOnly) return `<details class="faction-weapon"><summary><img src="${escape(wikiIcons[weapon].src)}" alt="" width="34" height="34"><span><strong>${escape(item.name)}</strong><small class="faction-handling">${escape(selection.label)}</small><small>전술 안내 · 고정 탄수 미표시</small></span><span class="faction-expand">자세히 ＋</span></summary><div class="faction-weapon-body"><p>${escape(selection.note)}</p><p class="faction-basis">${escape(selection.limitation)}</p><p class="combat-sources">${link(selection.source, '적 특성·전술 출처')} · ${link(item.source, '장비 출처')} · 확인 ${factionCheckedAt}</p></div></details>`;
      const handling = selection;
      const shield = enemy.shield?.partial ? '<p class="faction-condition">조종사 보호막과 기체를 구분하세요. 아래의 기체 노출 부위는 보호막 밖 경로입니다.</p>' : enemy.shield ? `<p class="faction-condition">${escape(combatShieldNotice(enemy, mode).label)} 기준. ${escape(combatShieldNotice(enemy, mode).note)}</p>` : '';
      const advice = tactic || (reference ? { title: '몸통 명중 시 1발 처치 가능', body: '위키 전술 설명 기준. 여러 부위가 폭발에 함께 맞는 조건이며, 실제 피해는 명중 위치에 따라 달라집니다.', source: reference.source } : null);
      const theory = approach && row ? `<p class="faction-result"><strong>${escape(approach.title)}</strong><span>${escape(combatCount(row.hits, mode))} · 제트팩 파괴로 처치</span></p><p>${escape(approach.tip)}</p><p class="faction-condition">${escape(approach.condition)}</p><details class="faction-theory"><summary>폭발 피해 계산 조건</summary><p>제트팩 체력 ${row.target.hp} / 장갑 ${row.target.armor}. 관통·폭발 저항 적용 후 한 발당 폭발 피해 ${row.stages[0].damage.explosion}. ${Number.isFinite(mode.innerRadius) ? `제트팩이 폭발 중심 ${mode.innerRadius}m 안에 들어오는 조건입니다.` : ''}</p><p>정면 폭발 전술은 ${link(approach.source, '위키 안내')}, 위 탄수는 기존 부위·무기 수치로 계산했습니다. 정면 명중마다 폭발이 제트팩에 닿는지 자동 판정하는 계산은 아닙니다.</p></details>` : row ? renderRoute(row, mode) : `<p>${escape(mode.unsupported || '검증된 처치 경로가 없어 계산을 보류합니다.')}</p>`;
      const routes = advice && row ? `<details class="faction-theory"><summary>별도의 단일 부위 계산 보기</summary>${theory}</details>` : theory;
      return `<details class="faction-weapon"><summary><img src="${escape(wikiIcons[weapon].src)}" alt="" width="34" height="34"><span><strong>${escape(item.name)}</strong><small>${escape(mode.name)}</small>${handling ? `<small class="faction-handling">${escape(handling.label)}</small>` : ''}</span><span class="faction-expand">자세히 <span aria-hidden="true">＋</span></span></summary><div class="faction-weapon-body">${handling ? `<p class="faction-handling-note">${escape(handling.note)}</p>` : ''}${shield}${advice ? `<p class="faction-reference"><strong>${escape(advice.title)}</strong><br>${escape(advice.body)} ${link(advice.source, '전술 출처')}</p>` : ''}${routes}${!advice && alternatives.length ? `<details class="faction-theory"><summary>다른 조준 위치와 비교</summary>${alternatives.map(other => renderRoute(other, mode)).join('')}</details>` : ''}<button type="button" class="text-button" data-faction-combat="${escape(enemy.id)}" data-weapon="${escape(weapon)}" data-mode="${escape(mode.id)}">${approach ? '부위 직격·폭발 계산과 비교 →' : '적 대응 계산에서 자세히 보기 →'}</button>${approach ? '<p class="faction-basis">전체 계산기는 선택 부위를 직접 맞히는 기준입니다. 위 정면 폭발 계산은 제트팩 직격을 제외했습니다.</p>' : ''}<p class="combat-sources">${link(profile.source, '무기 수치')} · ${link(enemy.source, '적 수치')} · 확인 ${escape(profile.checkedAt || combatCheckedAt)}</p></div></details>`;
    }).join('');
    return `<article class="faction-unit"><header>${photo?.src ? `<img class="faction-portrait" src="${escape(photo.src)}" alt="" loading="lazy">` : ''}<div><h3>${escape(enemy.name)}</h3>${base ? `<small>${escape(base.name)} 대비</small>` : ''}<p>${escape(unit.change)}</p><small>${link(enemy.source, '유닛 대응 출처')}</small></div></header><div class="faction-weapons">${weapons}</div></article>`;
  }).join('');
  return `<div class="faction-intro"><span class="eyebrow">${escape(guide.en)}</span><h2>${escape(guide.name)}</h2><p>${escape(guide.intro)}</p>${guide.coverage ? `<p class="faction-basis">${escape(guide.coverage)}</p>` : ''}<p class="combat-sources">${link(guide.source, '팩션 구성 출처')} · 확인 ${factionCheckedAt} · 주요 유닛 ${guide.units.length}종</p></div><div class="faction-unit-grid">${cards}</div>`;
}

export function initFactionGuide({ stratagems, wikiIcons, openMatchup }) {
  const root = document.querySelector('#factions-view');
  let side = factionSides[0].id;
  let selected = factionGuides.find(item => item.side === side).id;
  function render() {
    root.innerHTML = `<div class="combat-heading"><div><h2>어떤 걸 들고 갈까?</h2><p>조준 부담이 적은 대응을 먼저 살펴보세요. 무기를 누르면 추천 이유와 사용 조건·이론 탄수를 확인할 수 있습니다.</p></div></div><div class="faction-sides" aria-label="진영">${factionSides.map(item => `<button type="button" data-faction-side="${item.id}" aria-pressed="${side === item.id}"><img src="${item.icon}" alt="" width="28" height="28">${item.name}</button>`).join('')}</div><div class="faction-tabs" aria-label="팩션">${factionGuides.filter(item => item.side === side).map(item => `<button type="button" data-faction-id="${item.id}" aria-pressed="${selected === item.id}">${item.name}</button>`).join('')}</div>${renderFactionGuide(factionGuides.find(item => item.id === selected), stratagems, wikiIcons)}<p class="faction-basis">조준 난도·폭발 활용·충전과 재장전 부담을 고려한 입문자용 추천입니다. 최소 탄수 순위가 아니며, 출현 구성의 변화와 개별 유닛의 수치 차이를 구분합니다. 고난이도 기준 · 실시간 위치·패치 연동 없음.</p>`;
  }
  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.factionSide) {
      side = button.dataset.factionSide;
      selected = factionGuides.find(item => item.side === side).id;
      render(); root.querySelector(`[data-faction-side="${side}"]`).focus();
    } else if (button.dataset.factionId) {
      selected = button.dataset.factionId;
      render(); root.querySelector(`[data-faction-id="${selected}"]`).focus();
    } else if (button.dataset.factionCombat) {
      openMatchup({ enemy: button.dataset.factionCombat, weapon: button.dataset.weapon, mode: button.dataset.mode, shieldCleared: true });
    }
  });
  render();
}
