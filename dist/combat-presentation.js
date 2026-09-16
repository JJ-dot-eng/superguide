import { explosionComponents } from './combat.js?v=enemies-37-1';
import { combatConditionText, spearCannotLock } from './combat-conditions.js?v=enemies-37-1';

const number = value => Number.isFinite(value) ? value.toLocaleString('ko-KR') : '자료 미확인';
const hasBlast = mode => mode && (mode.explosion !== 0 || mode.explosions?.length > 0);
export const combatTerms = mode => mode?.unit === '개'
  ? { unit: '개', count: '장약 개수', one: '장약 한 개', adhesive: mode.delivery === 'adhesive' }
  : mode?.unit === '회' ? { unit: '회', count: '타격 횟수', one: '타격 한 번', adhesive: false }
  : { unit: '발', count: '탄수', one: '한 발', adhesive: false };
export const combatCount = (hits, mode) => `${number(hits)}${combatTerms(mode).unit}${mode?.conditionalImpact ? ' 이상' : ''}`;
export const combatOutcome = (outcome, mode) => ({ kill: '처치', bleed: combatTerms(mode).adhesive || mode?.reviewedExplosive || mode?.conditionalImpact ? '출혈 유발' : '출혈 처치 유발', break: '부위 파괴', down: '추락 유발', armor: '장갑 파괴', blocked: '피해 없음', unknown: '계산 보류', shield: '사선 조건 확인' })[outcome];
export const combatImpactLabel = mode => mode?.beam ? '광선' : mode?.delivery === 'arc' ? '전격' : mode?.delivery === 'flag' || mode?.delivery === 'melee' ? '타격' : '직격';
export const combatImpactVerb = mode => mode?.beam ? '조준 유지' : mode?.delivery === 'guided' ? '착탄' : '타격';

export function combatModeStats(mode) {
  if (!mode || mode.unsupported) return [];
  if (mode.beam) return [
    `초당 일반 피해 ${number(mode.beam.standardPerSecond)} / 초당 내구 피해 ${number(mode.beam.durablePerSecond)} / AP ${number(mode.ap)}`,
    `한 발 광선 지속 약 ${number(mode.beam.duration)}초 / 한 발 최대 일반·내구 피해 ${number(mode.standard)}`,
    '폭발 피해 없음 · 화상 피해 없음',
  ];
  if (mode.conditionalImpact) return [
    `${combatImpactLabel(mode)}${mode.delivery === 'arc' ? ' 1회' : ''} 일반 피해 ${number(mode.standard)} / 내구 피해 ${number(mode.durable)} / AP ${number(mode.ap)}`,
    ...explosionComponents(mode).map(blast => `폭발 일반·내구 피해 ${number(blast.durable)} / AP ${number(blast.ap)} / 최대 피해 ${number(blast.innerRadius)}m · 외곽 ${number(blast.radius)}m`),
    ...(mode.bomblet ? [`자탄 1개 직격 ${number(mode.bomblet.standard)} / 내구 ${number(mode.bomblet.durable)} / AP ${mode.bomblet.ap}`, `자탄 폭발 일반·내구 ${number(mode.bomblet.explosion)} / AP ${mode.bomblet.explosionAp} / 최대 피해 ${mode.bomblet.innerRadius}m · 외곽 ${mode.bomblet.radius}m`] : []),
  ];
  if (mode.reviewedExplosive) return [
    mode.directKind === 'none' ? '별도 직격 피해 없음 · 충돌 피해도 폭발로 계산' : `${mode.delivery === 'melee' ? '타격' : '직격'} 일반 피해 ${number(mode.standard)} / 내구 피해 ${number(mode.durable)} / AP ${number(mode.ap)}`,
    ...explosionComponents(mode).flatMap(blast => [
      `${blast.name} 일반 피해 ${number(blast.standard)} / 내구 피해 ${number(blast.durable)} / AP ${number(blast.ap)}`,
      `${blast.name} 최대 피해 반경 ${number(blast.innerRadius)}m / 외곽 반경 ${number(blast.radius)}m`,
    ]),
    ...(hasBlast(mode) ? ['최대 피해 반경 안쪽 기준 · 바깥에서는 피해 감소, 폭발 AP 1 감소(최소 2)'] : []),
  ];
  if (combatTerms(mode).adhesive) return [
    `직격 피해 ${number(mode.standard)}`,
    `폭발 일반 피해 ${number(mode.explosion)} / 폭발 내구 피해 ${number(mode.explosionDurable)} / 폭발 AP ${mode.explosionAp}`,
    `최대 피해 반경 ${number(mode.innerRadius)}m / 외곽 폭발 반경 ${number(mode.radius)}m · 최대 피해 반경 밖에서는 피해 감소`,
  ];
  return [`직격 ${number(mode.standard)} / 내구 피해 ${number(mode.durable)} / AP ${mode.ap}`, ...(mode.explosion ? [`폭발 ${number(mode.explosion)} / 폭발 AP ${mode.explosionAp}`] : [])];
}

export function combatAssumption(mode) {
  if (mode?.beam) return '<strong>같은 부위에 광선을 유지하는 조건의 이론값</strong>입니다. 한 발을 약 1.4초로 환산하며, 부위 파괴·출혈 시작·본체 체력 소진 시점까지만 계산합니다. 실제 피해 적용 간격과 빗나간 시간은 반영하지 않아, 표시된 ‘발 이상’은 실제 최소 처치 탄수를 보장하지 않습니다.';
  if (mode?.conditionalImpact) return '<strong>해당 부위에 최대 유효 피해가 들어가는 조건의 이론값</strong>입니다. ‘이상’은 표시된 명중 조건 안에서의 횟수이며 실제 최소 처치 횟수나 최대 탄수를 보장하지 않습니다.' + (mode.hitCondition ? ' 전격·자탄 명중 수는 사용자가 선택한 가정이며, 여러 부위 동시 피해는 합산하지 않습니다.' : ' 제외한 피해와 실제 명중 부위에 따라 결과가 달라집니다.');
  if (mode?.reviewedExplosive) return hasBlast(mode)
    ? '<strong>해당 부위에 최대 폭발 피해가 들어가는 조건의 이론값</strong>입니다. 직격·타격이 있는 모드는 그것도 같은 부위에 명중하는 조건입니다. 여러 부위 동시 피해는 합산하지 않으며, 실제 최소 처치 횟수로 단정할 수 없습니다.'
    : '표시 횟수는 <strong>같은 부위에 정면 타격이 계속 닿는 조건의 이론값</strong>입니다. 실제 접근 가능 여부와 방어구의 근접 피해 증가 효과는 포함하지 않습니다.';
  return combatTerms(mode).adhesive
    ? '<strong>해당 부위에 최대 폭발 피해가 들어가는 조건의 이론값</strong>입니다. 한 폭발이 여러 부위를 동시에 맞히는 효과는 합산하지 않았으며, 실제 최소 처치 개수로 단정할 수 없습니다.'
    : '표시 탄수는 <strong>최대 피해로 같은 부위를 계속 맞히는 조건</strong>의 계산값입니다. 거리·각도·빗맞음에 따라 실전에서는 더 필요할 수 있습니다.';
}

export function combatTargetTip(target, mode, row) {
  if (mode?.conditionalImpact) {
    const location = target.next ? target.name.split(' → ')[0] : target.name;
    if (mode.beam) return `조준 유지 부위: ${location}. ${target.next ? '먼저 이 장갑에 광선을 유지하세요. 장갑 제거 후 살점의 피해는 합산하지 않습니다.' : target.tip} 충전 후에도 같은 부위를 계속 따라가며 광선을 맞히세요.`;
    if (mode.delivery === 'arc') return `명중 가정 부위: ${location}. 전격이 이 부위에 닿는 조건이며, 원하는 부위를 자유롭게 조준할 수 있다는 뜻은 아닙니다.`;
    if (mode.delivery === 'guided') return `착탄 부위: ${location}. 미사일이 이 부위에 직접 명중하고 폭발 중심 1.5m 안에 같은 부위가 들어오는 조건입니다.`;
    if (mode.delivery === 'flag') return `타격 부위: ${location}. 깃발 날이 이 부위에 먼저 닿아야 합니다. 실제로 접근해 찌를 수 있는 위치인지 확인하세요.`;
    if (mode.delivery === 'harpoon') return `직격 부위: ${location}. ${target.tip} 가스 피해는 제외합니다.`;
    return `폭발 피해를 받는 부위: ${location}. 선택한 주폭발은 중심 3m, 자탄 폭발은 각각 중심 4m 안에 이 부위가 들어오는 조건입니다.` + (target.exdr === 100 ? target.partOnly ? ' 이 장치는 폭발 면역입니다. 주변 본체의 폭발 피해는 장치 파괴 횟수에 합산하지 않습니다.' : ' 이 부위는 폭발 면역이므로 폭발은 본체 장갑·폭발 저항으로 따로 판정합니다.' : '');
  }
  if (mode?.reviewedExplosive) {
    const location = target.next ? target.name.split(' → ')[0] : target.name;
    let tip = target.tip;
    if (mode.delivery === 'melee') tip = `타격 위치: ${location}. 망치가 다른 부위보다 이 부위에 먼저 닿아야 합니다. ${tip.replaceAll('쏘세요', '타격하세요').replaceAll('후속탄', '다음 타격').replaceAll('사격', '공격').replaceAll('탄수', '타격 횟수').replaceAll('탄의', '타격의')}`;
    if (hasBlast(mode)) {
      const radii = explosionComponents(mode).map(blast => blast.innerRadius);
      tip += radii.every(Number.isFinite)
        ? radii.length > 1 ? ` 두 폭발 모두 선택 부위에 닿아야 합니다. 충돌 폭발 중심에서 ${number(Math.min(...radii))}m 안에 드는 위치를 노리세요.` : ` 선택 부위가 폭발 중심에서 ${number(radii[0])}m 안에 들어오는 위치를 노리세요.`
        : ' 최대 폭발 피해가 해당 부위에 닿는 조건입니다. 폭발 반경 일부는 자료 미확인입니다.';
      if (target.exdr === 100) tip += target.partOnly ? ' 이 장치는 폭발 면역입니다. 주변 본체의 폭발 피해는 장치 파괴 횟수에 합산하지 않습니다.' : ' 이 부위 자체는 폭발 면역입니다. 폭발은 본체 장갑·폭발 저항으로 따로 계산하며, 폭발로 이 부위를 파괴하는 결과가 아닙니다.';
    }
    if (row?.stages.length > 1) tip += ` 장갑을 제거한 다음 공격부터 ${target.next.name}을 노리세요. 같은 공격의 초과 피해를 노출 부위에 넘기지 않습니다.`;
    return tip;
  }
  if (!combatTerms(mode).adhesive) return target.tip;
  const location = target.next ? target.name.split(' → ')[0] : target.name;
  let tip = `부착 후보: ${location} 쪽 표면. 부위 위치를 확인하고, 기폭 시 해당 부위가 폭발 중심 ${number(mode.innerRadius)}m 안에 들어가게 붙이세요.`;
  if (target.exdr === 100) tip += target.partOnly ? ' 이 장치는 폭발 면역입니다. 주변 본체의 폭발 피해는 장치 파괴 횟수에 합산하지 않습니다.' : ' 이 부위 자체는 폭발 면역이므로, 부위 파괴가 아닌 본체에 처리되는 폭발 피해를 계산합니다.';
  if (row?.stages.length > 1) tip += ` 장갑 제거 후에는 노출된 ${target.next.name}에 다음 장약의 폭발이 닿아야 합니다. 한 장약의 초과 피해를 다음 부위에 넘기지 않습니다.`;
  if (target.prerequisite) tip += ` ‘${target.prerequisite}’ 조건을 먼저 충족해야 하며, 준비에 사용한 장약은 제외합니다.`;
  return tip;
}

export function combatShieldNotice(enemy, mode) {
  if (!enemy.shield) return null;
  if (enemy.shield.kind === 'energy') return {
    title: enemy.shield.partial ? '조종사 보호막과 노출 부위를 구분하세요' : '보호막 제거 여부를 먼저 확인하세요',
    label: enemy.shield.label,
    note: `${enemy.shield.note} 보호막 제거에 필요한 공격과 재생은 이 횟수에 포함하지 않습니다.`,
  };
  if (mode?.conditionalImpact) return {
    title: enemy.id === 'harvester' ? '보호막 제거 여부를 먼저 확인하세요' : '방패를 우회한 명중 조건을 확인하세요',
    label: '방패·보호막이 선택한 부위로 향하는 공격을 막지 않는 상태',
    note: mode?.beam ? '방패·보호막을 제거하거나 우회해 광선이 부위에 직접 닿아야 합니다. 제거에 쓴 광선과 보호막 재생은 제외합니다.' : '방패·보호막을 제거하거나 우회해야 합니다. 제거에 필요한 공격과 보호막 재생은 제외하며, 전격·미사일·폭발이 보호막을 통과한다고 가정하지 않습니다.',
  };
  if (mode?.reviewedExplosive) return enemy.id === 'harvester' ? {
    title: '보호막 제거 여부를 먼저 확인하세요',
    label: '보호막이 제거되어 선택 부위에 공격이 닿는 상태',
    note: '보호막을 먼저 제거해야 합니다. 제거에 필요한 공격과 재생은 계산에서 제외하며, 직접 타격·폭발이 다시 생긴 보호막에 막히지 않는 조건입니다.',
  } : {
    title: '방패를 우회해 해당 부위에 공격이 닿는지 확인하세요',
    label: '방패가 직격·타격과 폭발 경로를 가리지 않는 상태',
    note: '방패 제거에 필요한 공격은 제외합니다. 방패 뒤로 폭발이 통과한다고 가정하지 않으며, 방패를 우회한 공격 경로가 필요합니다.',
  };
  if (!combatTerms(mode).adhesive) return {
    title: enemy.id === 'harvester' ? '보호막 제거 여부를 먼저 확인하세요' : '방패를 피한 사격인지 확인하세요',
    label: enemy.shield.label, note: enemy.shield.note,
  };
  return enemy.id === 'harvester' ? {
    title: '보호막 제거 여부를 먼저 확인하세요',
    label: '보호막이 제거되어 적 본체에 폭발이 닿는 상태',
    note: '보호막을 먼저 제거해야 합니다. 제거에 필요한 장약 개수와 보호막 관통 여부는 여기서 계산하지 않습니다. 보호막이 다시 생기기 전에 본체에 폭발이 닿는 조건입니다.',
  } : {
    title: '방패가 부착 위치·폭발 경로를 가리지 않는지 확인하세요',
    label: '방패를 우회해 해당 부위에 폭발이 닿는 상태',
    note: '팔의 방패가 부착 위치나 폭발 경로를 가리지 않는 조건입니다. 방패 자체에 붙이거나 방패를 파괴하는 데 필요한 장약 개수는 이 계산에 포함하지 않습니다.',
  };
}

export function combatRouteNotes(row, mode) {
  const terms = combatTerms(mode);
  const notes = [];
  if (['unknown', 'shield'].includes(row.outcome) && row.reason) notes.push(row.reason);
  if (row.modelNote) notes.push(row.modelNote);
  if (row.target.followupNote) notes.push(row.target.followupNote);
  if (row.target.destroyMainDamage) notes.push(`부위 파괴 시 본체에 추가 피해 ${number(row.target.destroyMainDamage)}가 한 번 적용됩니다.`);
  for (const part of [row.target, row.target.next].filter(Boolean)) {
    if (part.staticConstitution) notes.push(`${part.name}: 기본 체력 ${number(part.hp)} + 시간에 따라 줄지 않는 추가 체력 ${number(part.staticConstitution)} = ${number(part.hp + part.staticConstitution)} 기준입니다. 출혈 대기시간이 아닙니다.`);
  }
  if (mode?.beam && row.outcome === 'armor' && row.reason) notes.push(row.reason);
  if (row.outcome === 'down') notes.push('수송기 추락을 유발하는 횟수입니다. 탑승 병력 처치까지 보장하지 않습니다.');
  if (row.outcome === 'bleed') notes.push(`출혈을 시작시키는 ${terms.count}입니다. 사망까지 시간이 걸릴 수 있습니다.`);
  if (row.outcome === 'break' || row.outcome === 'armor') notes.push(`이 ${terms.count}는 처치에 필요한 ${terms.count}가 아닙니다. 파괴 후 살아 있을 수 있습니다.`);
  if (row.via === 'main') notes.push('해당 부위에서 본체로 처리된 피해가 본체 체력을 소진하는 경로입니다. 치명 부위 파괴와 구분합니다.');
  if (row.conditional) notes.push(terms.adhesive ? `‘${row.target.prerequisite}’를 충족한 뒤의 부위 체력만 계산합니다. 선행 공격의 피해와 장약은 포함하지 않습니다.` : (row.target.prerequisiteNote || '외피 제거 탄수와 이전 피해는 제외한, 노출 부위 자체의 체력 기준입니다.').replaceAll('탄수', terms.count));
  if (mode?.explosions && row.target.next) notes.push('같은 탄의 두 폭발이 장갑과 노출된 살점에 차례로 들어가는 효과는 자료 미확인으로 제외합니다. 장갑이 제거되면 다음 탄부터 노출 부위를 계산합니다.');
  return notes;
}

export function combatSummary(enemy, mode, { best, rows }, { weapon, shieldCleared = false, unsupported } = {}) {
  const terms = combatTerms(mode);
  if (unsupported) return { tone: 'neutral', title: `이 무기·모드의 ${terms.count}는 계산 보류`, body: `${unsupported} 처치 불가능이라는 뜻은 아닙니다.` };
  if (enemy.shield && !shieldCleared && !enemy.shield.partial) {
    const notice = combatShieldNotice(enemy, mode);
    return { tone: 'neutral', title: notice.title, body: notice.note };
  }
  if (mode?.hitCondition && !mode.selectedCondition) return { tone: 'neutral', title: '한 발당 명중 조건을 선택하세요', body: combatConditionText(mode) };
  if (spearCannotLock(enemy, mode)) return { tone: 'neutral', title: '직접 락온 불가 · 착탄 가정 참고', body: '스피어는 이 적에게 직접 락온할 수 없습니다. 아래 수치는 다른 표적에 발사한 미사일이 표시 부위에 착탄했을 때의 참고값입니다.' };
  // Wiki tactics describe observed outcomes; they do not replace one-part damage calculations.
  const reference = enemy.tacticalResults?.find(result => result.weapon === weapon && result.mode === mode?.id);
  if (reference) return {
    tone: 'positive',
    title: `${reference.target} 명중 시 ${combatCount(reference.hits, mode)} ${combatOutcome(reference.outcome, mode)} 가능 · 위키 기준`,
    body: reference.note,
    reference,
  };
  if (best?.lowerBound) return {
    tone: 'neutral', title: `${number(best.hits)}${terms.unit} 이상 · ${best.target.name} · ${combatOutcome(best.outcome, mode)}`,
    body: `${best.modelNote} ${combatTargetTip(best.target, mode, best)}`,
  };
  if (best?.outcome === 'down') return { tone: 'positive', title: `${best.target.name} · 추락 유발 이론값 ${combatCount(best.hits, mode)}`, body: best.target.tip };
  if (best && mode?.conditionalImpact) return {
    tone: 'positive', title: `${combatCount(best.hits, mode)} · ${best.target.name} ${combatImpactVerb(mode)} 시 · ${combatOutcome(best.outcome, mode)}`,
    body: [combatConditionText(mode), combatTargetTip(best.target, mode, best)].filter(Boolean).join('. '),
  };
  if (best) return {
    tone: 'positive',
    title: terms.adhesive || mode?.reviewedExplosive ? `${best.target.name} · ${combatOutcome(best.outcome, mode)} 이론값 ${combatCount(best.hits, mode)}` : `${best.target.name} · ${combatCount(best.hits, mode)}로 ${best.outcome === 'bleed' ? '출혈 처치 유발' : '처치 가능'}`,
    body: terms.adhesive || mode?.reviewedExplosive ? combatTargetTip(best.target, mode, best) : best.stages.length > 1 ? best.stages.map(stage => `${stage.name} ${combatCount(stage.hits, mode)}`).join(' → ') : best.target.tip,
  };
  if (rows.some(row => row.outcome === 'unknown')) return { tone: 'neutral', title: '자료 미확인 부위는 계산 보류', body: '아래에서 확인된 피해와 부위별 조준 조건을 확인하세요. 미확인 값을 0으로 채워 처치 불가능으로 판단하지 않습니다.' };
  return {
    tone: 'neutral', title: '확인된 부위에서 바로 처치하는 경로 없음',
    body: rows.some(row => row.conditional && row.outcome === 'kill') ? `아래에서 부위별 ${terms.adhesive ? '부착' : '조준'} 조건과 조건부 ${terms.count}를 확인하세요.` : '관통 가능한 부위와 부위 파괴 결과를 확인하세요. 이 결과만으로 적 전체를 처치 불가능하다고 단정하지 않습니다.',
  };
}
