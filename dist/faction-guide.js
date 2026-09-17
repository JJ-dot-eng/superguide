import { factionGuides, factionSides, factionCheckedAt } from './faction-data.js';
import { enemies, weaponProfiles } from './combat-data.js?v=vox-explanation-2';
import { calculateMatchup } from './combat.js?v=enemies-37-1';
import { combatCount, combatOutcome, combatTargetTip, combatRouteNotes, combatSummary, combatShieldNotice } from './combat-presentation.js?v=vox-leveller-1';
import { pickerEnemyImages } from './selector-images.js?v=enemies-37-1';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const link = (url, label) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a>`;
const fatal = row => !row.conditional && Number.isFinite(row.hits) && ['kill', 'bleed', 'down'].includes(row.outcome);

export function factionRecommendation(unit, choice) {
  const [weapon, modeId] = choice.split(':');
  const enemy = enemies.find(item => item.id === unit.enemy);
  const profile = weaponProfiles[weapon];
  const mode = modeId ? profile?.modes.find(item => item.id === modeId) : profile?.modes[0];
  if (!enemy || !mode) throw new Error(`Unknown faction recommendation: ${unit.enemy}/${choice}`);
  const result = calculateMatchup(enemy, mode, { shieldCleared: true });
  const row = unit.targets.map(id => result.rows.find(item => item.target.id === id)).find(item => item && fatal(item)) || result.best;
  const reference = combatSummary(enemy, mode, result, { weapon, shieldCleared: true }).reference;
  return { enemy, weapon, profile, mode, row, reference };
}

export function renderFactionGuide(guide, stratagems, wikiIcons) {
  const cards = guide.units.map(unit => {
    const enemy = enemies.find(item => item.id === unit.enemy);
    const photo = pickerEnemyImages[enemy.id];
    const base = enemies.find(item => item.id === unit.base);
    const weapons = unit.weapons.map(choice => {
      const { weapon, profile, mode, row, reference } = factionRecommendation(unit, choice);
      const item = stratagems.find(entry => entry.id === weapon);
      const count = row ? `${combatCount(row.hits, mode)}${row.lowerBound && !mode.conditionalImpact ? ' 이상 · 재생 제외' : ''} · ${combatOutcome(row.outcome, mode)}` : '계산 보류';
      const shield = enemy.shield?.partial ? '<p class="faction-condition">조종사 보호막과 기체를 구분하세요. 기체의 노출 부위는 보호막 밖 경로이며, 조종사를 노릴 때는 보호막을 먼저 제거해야 합니다.</p>' : enemy.shield ? `<p class="faction-condition">${escape(combatShieldNotice(enemy, mode).label)} 기준. 보호막 제거에 필요한 공격은 아래 횟수에서 제외합니다.</p>` : '';
      return `<details class="faction-weapon"><summary><img src="${escape(wikiIcons[weapon].src)}" alt="" width="34" height="34"><span><strong>${escape(item.name)}</strong><small>${escape(mode.name)}</small></span><span class="faction-expand">자세히 <span aria-hidden="true">＋</span></span></summary><div class="faction-weapon-body">${shield}${reference ? `<p class="faction-reference"><strong>몸통 명중 시 1발 처치 가능</strong><br>위키 전술 설명 기준. 여러 부위가 폭발에 함께 맞는 조건이며, 실제 피해는 명중 위치에 따라 달라집니다. ${link(reference.source, '전술 출처')}</p>` : ''}${row ? `<p class="faction-result"><strong>${escape(row.target.name)}</strong><span>${escape(count)}</span></p><p>${escape(combatTargetTip(row.target, mode, row))}</p>${combatRouteNotes(row, mode).map(note => `<p class="faction-condition">${escape(note)}</p>`).join('')}<p class="faction-basis">${reference ? '위 탄수는 별도의 단일 부위 계산입니다. ' : ''}같은 부위를 최대 피해로 계속 맞히는 조건의 이론값. 폭발의 여러 부위 동시 피해는 합산하지 않습니다.${mode.falloff ? ' 거리 감쇠 전 기준입니다.' : ''}</p>` : '<p>검증된 처치 경로가 없어 계산을 보류합니다.</p>'}<button type="button" class="text-button" data-faction-combat="${escape(enemy.id)}" data-weapon="${escape(weapon)}" data-mode="${escape(mode.id)}">적 대응 계산에서 자세히 보기 →</button><p class="combat-sources">${link(profile.source, '무기 수치')} · ${link(enemy.source, '적 수치')} · 확인 ${escape(profile.checkedAt || factionCheckedAt)}</p></div></details>`;
    }).join('');
    return `<article class="faction-unit"><header>${photo?.src ? `<img class="faction-portrait" src="${escape(photo.src)}" alt="" loading="lazy">` : ''}<div><h3>${escape(enemy.name)}</h3>${base ? `<small>${escape(base.name)} 대비</small>` : ''}<p>${escape(unit.change)}</p></div></header><div class="faction-weapons">${weapons}</div></article>`;
  }).join('');
  return `<div class="faction-intro"><span class="eyebrow">${escape(guide.en)}</span><h2>${escape(guide.name)}</h2><p>${escape(guide.intro)}</p>${guide.coverage ? `<p class="faction-basis">${escape(guide.coverage)}</p>` : ''}<p class="combat-sources">${link(guide.source, '팩션 구성 출처')} · 확인 ${factionCheckedAt} · 주요 유닛 ${guide.units.length}종</p></div><div class="faction-unit-grid">${cards}</div>`;
}

export function initFactionGuide({ stratagems, wikiIcons, openMatchup }) {
  const root = document.querySelector('#factions-view');
  let side = factionSides[0].id;
  let selected = factionGuides.find(item => item.side === side).id;
  function render() {
    root.innerHTML = `<div class="combat-heading"><div><h2>어떤 걸 들고 갈까?</h2><p>팩션의 주요 유닛과 약점을 확인하고, 무기를 눌러 조준 위치와 이론 탄수를 살펴보세요.</p></div></div><div class="faction-sides" aria-label="진영">${factionSides.map(item => `<button type="button" data-faction-side="${item.id}" aria-pressed="${side === item.id}"><img src="${item.icon}" alt="" width="28" height="28">${item.name}</button>`).join('')}</div><div class="faction-tabs" aria-label="팩션">${factionGuides.filter(item => item.side === side).map(item => `<button type="button" data-faction-id="${item.id}" aria-pressed="${selected === item.id}">${item.name}</button>`).join('')}</div>${renderFactionGuide(factionGuides.find(item => item.id === selected), stratagems, wikiIcons)}<p class="faction-basis">등록된 주요 유닛과 계산 지원 무기 중에서 약점 공략용으로 추린 목록입니다. 모든 장비의 성능 순위가 아니며, 출현 구성의 변화와 개별 유닛의 수치 차이를 구분합니다. 고난이도 기준 · 실시간 위치·패치 연동 없음.</p>`;
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
