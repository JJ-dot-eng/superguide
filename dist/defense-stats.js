const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const known = value => Number.isFinite(value) && value >= 0;
const format = value => value.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
const metric = (id, label, value, unit = '', caption = '') => ({ id, label, value: known(value) ? format(value) : '자료 미확인', unit: known(value) ? unit : '', caption, unknown: !known(value) });
const fact = (id, label, value, caption = '') => ({ id, label, value: value || '자료 미확인', unit: '', caption, unknown: !value });
const baseNote = '함선 모듈·임무 효과 적용 전 기본값입니다.';
const seconds = value => `${Number.isInteger(value) ? '' : '약 '}${format(value)}초`;

// Waiting is separate from filling. Depletion uses its own delay, not both
// delays added together. Unknown inputs never turn into zero or a made-up time.
export function shieldRecovery(defense, remaining) {
  const shield = defense?.type === 'energy' ? defense.shield : null;
  if (!shield || !known(shield.capacity) || shield.capacity === 0 || !known(shield.regeneration) || shield.regeneration === 0 || !known(remaining) || remaining > shield.capacity) return null;
  if (remaining === shield.capacity) return { delay: 0, filling: 0, total: 0 };
  // A relay cannot restart a broken shield. Its internal 45-second timer is
  // not an operational recharge delay within the equipment's 40-second life.
  if (remaining === 0 && shield.regeneratesAfterDepletion === false) return null;
  const delay = remaining === 0 ? shield.depletedDelay : shield.hitDelay;
  if (!known(delay)) return null;
  const filling = (shield.capacity - remaining) / shield.regeneration;
  return { delay, filling, total: delay + filling };
}

export function defenseView(item) {
  const d = item.defense;
  if (!d) return null;
  const cooldown = metric('cooldown', '기본 재사용 대기시간', d.cooldown, '초', '함선 강화·임무 효과 제외');
  const coverage = fact('coverage', '보호 방향', d.shield?.coverage || (item.rangeLabel !== '미확인' ? item.rangeLabel : null));
  if (d.type === 'energy') {
    const noRecovery = d.shield?.regeneratesAfterDepletion === false;
    const bodyLabel = d.bodyLabel || '장치 본체';
    const full = shieldRecovery(d, 0);
    const regeneration = d.shield?.regeneration;
    const fillingTime = known(d.shield?.capacity) && d.shield.capacity > 0 && known(regeneration) && regeneration > 0 ? d.shield.capacity / regeneration : null;
    const filling = noRecovery
      ? fact('refill-time', '재생만 걸리는 시간 · 0 → 최대', '해당 없음', '완전히 깨진 보호막은 재생을 시작하지 않음')
      : metric('refill-time', '재생만 걸리는 시간 · 0 → 최대', fillingTime, '초', '대기시간 제외 · 이론값');
    const total = noRecovery
      ? fact('full-recovery', '완전 소진 → 완전 회복', '복구 불가', '장비 수명 내에 재생되지 않음')
      : metric('full-recovery', '완전 소진 → 완전 회복', full?.total, '초', '소진 후 대기 + 재생 · 추가 피격 없는 이론값');
    for (const [row, value] of [[filling, fillingTime], [total, full?.total]]) if (!noRecovery && !row.unknown && !Number.isInteger(value)) row.value = `약 ${row.value}`;
    const immediate = known(d.shield?.hitDelay) && d.shield.hitDelay <= 0.01;
    const hitDelay = metric('hit-delay', '피격 후 재생 대기', d.shield?.hitDelay, '초', immediate ? '사실상 즉시 · 완전히 깨지지 않은 상태' : '일부 소모 시 · 마지막 피격 후');
    if (immediate) hitDelay.value = `약 ${hitDelay.value}`;
    const depletedDelay = noRecovery
      ? fact('depleted-delay', '완전 소진 후 재생 대기', '재생 안 됨', '보호막이 완전히 깨지면 복구 불가')
      : metric('depleted-delay', '완전 소진 후 재생 대기', d.shield?.depletedDelay, '초', '이 시간이 지난 뒤 재생 시작');
    const recoveryNote = noRecovery ? '보호막이 완전히 깨지면 재생되지 않습니다. 0에서 최대 용량까지 충전하는 시간도 적용하지 않습니다.'
      : full ? `완전 소진 후 ${seconds(full.delay)} 대기 + ${seconds(full.filling)} 재생 = ${seconds(full.total)}입니다.` : '완전 회복 시간 계산에 필요한 수치는 자료 미확인입니다.';
    const partialNote = known(d.shield?.hitDelay) && known(regeneration) && regeneration > 0 ? `일부 소모 시에는 마지막 피격으로부터 ${seconds(d.shield.hitDelay)}${immediate ? '(사실상 즉시)' : ''} 뒤, 부족한 용량을 초당 ${format(regeneration)}씩 채웁니다.` : '일부 소모 후 회복 시간에 필요한 수치는 자료 미확인입니다.';
    const rows = [
      metric('capacity', '에너지 보호막 용량', d.shield?.capacity, '', '장비 본체와 별도'),
      metric('regeneration', '보호막 재생 속도', regeneration, '/초', noRecovery ? '일부 손상만 재생 · 완전 파괴 후 재생 불가' : '재생이 시작된 뒤의 속도'),
      metric('body-hp', `${bodyLabel} 체력`, d.body?.hp, '', '에너지 보호막 용량 아님'),
      metric('body-armor', `${bodyLabel} 장갑`, d.body?.armor, '', '에너지 보호막의 장갑 수치 아님'),
      hitDelay, depletedDelay, filling, total, coverage,
      ...(d.shield && 'radius' in d.shield ? [metric('radius', '보호 반경', d.shield.radius, 'm', '보호막 중심부터의 거리')] : []),
      ...('lifetime' in d ? [d.lifetime === 'unlimited' ? fact('lifetime', '최대 지속시간', '고정 제한 없음', '보호막 소모·재생과 별도') : metric('lifetime', '최대 지속시간', d.lifetime, '초', '한 번 설치한 장비의 수명')] : []),
      ...(d.body && ('durability' in d.body || 'explosionResistance' in d.body) ? [
        metric('durability', `${bodyLabel} 내구도`, d.body.durability, '%', '본체 피해 계산 비율 · 남은 체력 아님'),
        metric('explosion-resistance', `${bodyLabel} 폭발 저항`, d.body.explosionResistance, '%', '보호막·내부 인원의 폭발 방호율과 별개'),
      ] : []),
      cooldown,
      fact('replacement', '소진·파괴 후 복구', noRecovery ? '보호막 파괴 후 재생 불가' : full ? '보호막 소진 시 재생' : null, '장치 본체 파괴와 별도'),
    ];
    const highlights = new Set(d.body ? ['capacity', 'regeneration', 'body-hp', 'body-armor'] : ['capacity', 'regeneration', 'hit-delay', 'depleted-delay']);
    return {
      highlights: rows.filter(row => highlights.has(row.id)),
      additional: rows.filter(row => !highlights.has(row.id)),
      notes: [
        baseNote,
        '보호막 용량과 장치 본체 체력은 별개입니다. 본체 장갑을 에너지 보호막에 적용하지 않습니다.',
        `${recoveryNote} ${partialNote} 추가 피격 없이 재생되는 조건입니다.`,
        ...(d.notes || []),
      ],
    };
  }
  if (d.type === 'ballistic') return {
    highlights: [
      metric('body-hp', '방패 체력', d.body?.hp),
      metric('body-armor', '방패 장갑', d.body?.armor, '', '공격 관통력(AP)이 아님'),
      metric('durability', '방패 내구도', d.body?.durability, '%', '남은 체력이 아닌 피해 계산 비율'),
      metric('explosion-resistance', '방패 자체 폭발 저항', d.body?.explosionResistance, '%', '착용자의 폭발 방호율과 별개'),
    ],
    additional: [coverage, cooldown, { id: 'replacement', label: '방패 파괴 후', value: d.replacement === 'new-call' ? '새 방패 호출 필요' : '자료 미확인', unit: '', caption: '물리 방패의 파괴 기준' }],
    notes: [
      baseNote,
      known(d.body?.durability) ? `내구도 ${format(d.body.durability)}%는 남은 체력이 아닙니다. 방패에 들어오는 피해를 계산할 때 일반 피해와 내구 피해를 섞는 비율입니다.` : '내구도는 남은 체력이 아닌 피해 계산 비율이며, 수치는 자료 미확인입니다.',
      '방패 자체의 폭발 저항과 착용자의 폭발 방호는 별개입니다. 투사체를 막아도 폭발 피해·밀쳐짐이 착용자에게 전달될 수 있으며, 방패 위치와 폭발 위치에 따라 달라집니다.',
    ],
  };
  return null;
}

const valueHtml = row => `${escape(row.value)}${row.unit ? `<small>${escape(row.unit)}</small>` : ''}`;
export function renderDefenseStats(item, context = 'card') {
  const view = defenseView(item);
  if (!view) return '';
  const detailed = context === 'detail';
  const highlights = view.highlights.map(row => `<div class="${detailed ? 'detail-stat' : 'stat'}"><span class="stat-label">${escape(row.label)}</span><span class="stat-value${row.unknown ? ' unknown' : ''}">${valueHtml(row)}</span>${row.caption ? `<span class="stat-caption">${escape(row.caption)}</span>` : ''}</div>`).join('');
  const details = detailed ? `<dl class="defense-facts">${view.additional.map(row => `<div><dt>${escape(row.label)}</dt><dd>${valueHtml(row)}${row.caption ? `<span>${escape(row.caption)}</span>` : ''}</dd></div>`).join('')}</dl><div class="defense-explanations">${view.notes.map(note => `<p>${escape(note)}</p>`).join('')}</div>` : '';
  return `<div class="defense-panel" data-defense="${escape(item.defense.type)}" aria-label="방어 성능"><p class="defense-heading"><strong>방어 성능</strong><span>${escape(item.rangeLabel || '방어 범위 자료 미확인')}</span></p><div class="${detailed ? 'detail-stats' : 'stats-grid'} defense-highlights">${highlights}</div>${details}</div>`;
}

export function renderDefenseSource(item) {
  if (!item.defense) return '';
  return `<p class="defense-source">함선 모듈 적용 전 기본값<br>방어 수치 확인 ${escape(item.defense.checkedAt || '자료 미확인')} · <a href="${escape(item.source)}" target="_blank" rel="noopener noreferrer">위키 출처 ↗</a></p>`;
}

const comparisonFields = [
  ['capacity', '에너지 보호막 용량'], ['regeneration', '보호막 재생 속도'],
  ['hit-delay', '피격 후 재생 대기'], ['depleted-delay', '완전 소진 후 재생 대기'],
  ['refill-time', '재생만 걸리는 시간 · 0 → 최대'], ['full-recovery', '완전 소진 → 완전 회복'],
  ['coverage', '보호 방향'], ['radius', '보호 반경'], ['lifetime', '최대 지속시간'],
  ['body-hp', '방패·장치 본체 체력'], ['body-armor', '방패·장치 본체 장갑'],
  ['durability', '방패·장치 본체 내구도'], ['explosion-resistance', '방패·장치 본체 폭발 저항'],
  ['cooldown', '기본 재사용 대기시간'], ['replacement', '소진·파괴 후 복구'],
];
export function defenseComparisonRows(items) {
  const views = items.map(defenseView);
  if (!views.some(Boolean)) return [];
  const rows = comparisonFields.filter(([id]) => views.some(view => view && [...view.highlights, ...view.additional].some(row => row.id === id))).map(([id, label]) => [label, item => {
    const view = defenseView(item);
    if (!view) return '자료 미확인';
    const row = [...view.highlights, ...view.additional].find(row => row.id === id);
    if (!row) {
      if (item.defense.type === 'ballistic' && ['capacity', 'regeneration', 'hit-delay', 'depleted-delay', 'refill-time', 'full-recovery'].includes(id)) return '해당 없음<small>재생형 에너지 보호막이 없는 물리 방패</small>';
      return '자료 미확인<small>다른 방패의 수치를 대입하지 않음</small>';
    }
    return `<span class="comparison-value">${valueHtml(row)}</span><small>${escape(row.label)}${row.caption ? ` · ${escape(row.caption)}` : ''}</small>`;
  }]);
  rows.push(['방어 수치 해석', item => {
    const view = defenseView(item);
    return view ? view.notes.map(note => `<p>${escape(note)}</p>`).join('') : '자료 미확인';
  }]);
  return rows;
}
