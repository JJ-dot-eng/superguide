// Counts selected here are explicit scenarios, not measured hit distributions.
export function resolveCombatCondition(mode, { hitCount = '', primaryHit = 'blast', bombletDirect = false } = {}) {
  if (!mode?.hitCondition) return mode;
  const { kind, min, max } = mode.hitCondition;
  const count = typeof hitCount === 'number' || /^\d+$/.test(hitCount) ? Number(hitCount) : NaN;
  if (!Number.isInteger(count) || count < min || count > max || !['none', 'blast', 'direct'].includes(primaryHit) || typeof bombletDirect !== 'boolean') {
    return { ...mode, impactEvents: undefined, selectedCondition: undefined, conditionPending: true };
  }
  const event = (name, attack, count, directHit) => ({ name, attack, count, directHit });
  const impactEvents = kind === 'arcs'
    ? [event('전격', mode, count, true)]
    : [
      ...(primaryHit === 'none' ? [] : [event('주탄', mode, 1, primaryHit === 'direct')]),
      ...(count === 0 ? [] : [event('자탄', mode.bomblet, count, bombletDirect)]),
    ];
  return { ...mode, impactEvents, conditionPending: false, selectedCondition: { count, primaryHit, bombletDirect } };
}

export function combatConditionText(mode) {
  if (!mode?.hitCondition) return '';
  if (!mode.selectedCondition) return '한 발당 해당 부위에 맞는 개수를 선택하세요. 실제 명중 수는 자료 미확인이며 선택값은 계산을 위한 가정입니다.';
  const { count, primaryHit, bombletDirect } = mode.selectedCondition;
  if (mode.hitCondition.kind === 'arcs') return `한 발마다 해당 부위에 전격 ${count}회 명중 가정 · 유탄 자체 직격 제외`;
  const primary = { none: '주탄 피해 제외', blast: '주폭발만', direct: '주탄 직격과 주폭발' }[primaryHit];
  return `${primary} · 자탄 ${count}개 ${bombletDirect && count > 0 ? '직격과 폭발' : '폭발'} 명중 가정`;
}

// Current calculator roster intersected with the Wiki's Spear lock-on list.
const spearTargets = new Set(['charger', 'behemoth', 'bile-titan', 'hulk', 'harvester', 'brood-commander', 'stalker', 'impaler', 'scout-strider', 'reinforced-strider', 'gunship', 'annihilator-tank']);
export const spearCannotLock = (enemy, mode) => mode?.delivery === 'guided' && !spearTargets.has(enemy.id);
