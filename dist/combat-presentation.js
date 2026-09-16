const number = value => value.toLocaleString('ko-KR');
export const combatTerms = mode => mode?.unit === '개'
  ? { unit: '개', count: '장약 개수', one: '장약 한 개', adhesive: mode.delivery === 'adhesive' }
  : { unit: '발', count: '탄수', one: '한 발', adhesive: false };
export const combatCount = (hits, mode) => `${number(hits)}${combatTerms(mode).unit}`;
export const combatOutcome = (outcome, mode) => ({ kill: '처치', bleed: combatTerms(mode).adhesive ? '출혈 유발' : '출혈 처치 유발', break: '부위 파괴', armor: '장갑 파괴', blocked: '피해 없음', unknown: '계산 보류', shield: '사선 조건 확인' })[outcome];

export function combatModeStats(mode) {
  if (!mode || mode.unsupported) return [];
  if (combatTerms(mode).adhesive) return [
    `직격 피해 ${number(mode.standard)}`,
    `폭발 일반 피해 ${number(mode.explosion)} / 폭발 내구 피해 ${number(mode.explosionDurable)} / 폭발 AP ${mode.explosionAp}`,
    `최대 피해 반경 ${number(mode.innerRadius)}m / 외곽 폭발 반경 ${number(mode.radius)}m · 최대 피해 반경 밖에서는 피해 감소`,
  ];
  return [`직격 ${number(mode.standard)} / 내구 피해 ${number(mode.durable)} / AP ${mode.ap}`, ...(mode.explosion ? [`폭발 ${number(mode.explosion)} / 폭발 AP ${mode.explosionAp}`] : [])];
}

export function combatAssumption(mode) {
  return combatTerms(mode).adhesive
    ? '<strong>해당 부위에 최대 폭발 피해가 들어가는 조건의 이론값</strong>입니다. 한 폭발이 여러 부위를 동시에 맞히는 효과는 합산하지 않았으며, 실제 최소 처치 개수로 단정할 수 없습니다.'
    : '표시 탄수는 <strong>최대 피해로 같은 부위를 계속 맞히는 조건</strong>의 계산값입니다. 거리·각도·빗맞음에 따라 실전에서는 더 필요할 수 있습니다.';
}

export function combatTargetTip(target, mode, row) {
  if (!combatTerms(mode).adhesive) return target.tip;
  const location = target.next ? target.name.split(' → ')[0] : target.name;
  let tip = `부착 후보: ${location} 쪽 표면. 사진의 강조 부위를 확인하고, 기폭 시 해당 부위가 폭발 중심 ${number(mode.innerRadius)}m 안에 들어가게 붙이세요.`;
  if (target.exdr === 100) tip += ' 이 부위 자체는 폭발 면역이므로, 부위 파괴가 아닌 본체에 처리되는 폭발 피해를 계산합니다.';
  if (row?.stages.length > 1) tip += ` 장갑 제거 후에는 노출된 ${target.next.name}에 다음 장약의 폭발이 닿아야 합니다. 한 장약의 초과 피해를 다음 부위에 넘기지 않습니다.`;
  if (target.prerequisite) tip += ` ‘${target.prerequisite}’ 조건을 먼저 충족해야 하며, 준비에 사용한 장약은 제외합니다.`;
  return tip;
}

export function combatShieldNotice(enemy, mode) {
  if (!enemy.shield) return null;
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
  if (row.outcome === 'bleed') notes.push(`출혈을 시작시키는 ${terms.count}입니다. 사망까지 시간이 걸릴 수 있습니다.`);
  if (row.outcome === 'break' || row.outcome === 'armor') notes.push(`이 ${terms.count}는 처치에 필요한 ${terms.count}가 아닙니다. 파괴 후 살아 있을 수 있습니다.`);
  if (row.via === 'main') notes.push('해당 부위에서 본체로 처리된 피해가 본체 체력을 소진하는 경로입니다. 치명 부위 파괴와 구분합니다.');
  if (row.conditional) notes.push(terms.adhesive ? `‘${row.target.prerequisite}’를 충족한 뒤의 부위 체력만 계산합니다. 선행 공격의 피해와 장약은 포함하지 않습니다.` : row.target.prerequisiteNote || '외피 제거 탄수와 이전 피해는 제외한, 노출 부위 자체의 체력 기준입니다.');
  return notes;
}

export function combatSummary(enemy, mode, { best, rows }, { shieldCleared = false, unsupported } = {}) {
  const terms = combatTerms(mode);
  if (unsupported) return { tone: 'neutral', title: `이 무기·모드의 ${terms.count}는 계산 보류`, body: `${unsupported} 처치 불가능이라는 뜻은 아닙니다.` };
  if (enemy.shield && !shieldCleared) {
    const notice = combatShieldNotice(enemy, mode);
    return { tone: 'neutral', title: notice.title, body: notice.note };
  }
  if (best) return {
    tone: 'positive',
    title: terms.adhesive ? `${best.target.name} · ${combatOutcome(best.outcome, mode)} 이론값 ${combatCount(best.hits, mode)}` : `${best.target.name} · ${combatCount(best.hits, mode)}로 ${best.outcome === 'bleed' ? '출혈 처치 유발' : '처치 가능'}`,
    body: terms.adhesive ? combatTargetTip(best.target, mode, best) : best.stages.length > 1 ? best.stages.map(stage => `${stage.name} ${combatCount(stage.hits, mode)}`).join(' → ') : best.target.tip,
  };
  return {
    tone: 'neutral', title: '확인된 부위에서 바로 처치하는 경로 없음',
    body: rows.some(row => row.conditional && row.outcome === 'kill') ? `아래에서 부위별 ${terms.adhesive ? '부착' : '조준'} 조건과 조건부 ${terms.count}를 확인하세요.` : '관통 가능한 부위와 부위 파괴 결과를 확인하세요. 이 결과만으로 적 전체를 처치 불가능하다고 단정하지 않습니다.',
  };
}
