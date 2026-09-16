import { damagePerHit } from './combat.js';

export const forceBounds = value => value == null ? null : typeof value === 'number' ? { min: value, max: value } : value;

export function evaluateForce(route, mode) {
  const components = ['direct', 'explosion'].map(component => {
    const force = forceBounds(mode[component]);
    let outcome = 'insufficient';
    if (route.explosiveOnly && component === 'direct') outcome = 'inapplicable';
    else if (mode.forceUnknown) outcome = 'unknown';
    else if (force?.min >= route.threshold) outcome = 'pass';
    else if (force?.max >= route.threshold) outcome = 'unknown';
    if (outcome === 'pass' && component === 'direct' && route.nonExplosiveUncertain && !mode.shieldBypass && !mode.warpHullDirect) outcome = 'unknown';
    return { component, force, outcome };
  });
  // Prefer the explosion when both components work: a projectile need not
  // physically collide with the structure for its central blast to reach it.
  const passing = [...components].reverse().find(item => item.outcome === 'pass');
  return { route, components, component: passing?.component, outcome: passing ? 'pass' : components.some(item => item.outcome === 'unknown') ? 'unknown' : 'insufficient' };
}

export function calculateStructureDamage(structure, mode) {
  if (!structure.health || !mode?.damage) return null;
  // Missing values must not be coerced to zero or produce an invented hit count.
  if (!['standard', 'durable', 'ap', 'explosion', 'explosionAp'].every(key => Number.isFinite(mode.damage[key]) && mode.damage[key] >= 0)) return null;
  const { direct, explosion } = damagePerHit(mode.damage, structure.health, structure.health);
  const total = direct + explosion;
  return { direct, explosion, total, hits: total > 0 ? Math.ceil(structure.health.hp / total) : null };
}

export function calculateDemolition(structure, profile, mode, options = {}) {
  const base = { structure, outcome: 'unknown', method: null, route: null, component: null, hits: null, unit: mode?.unit || '발', conditions: [], routes: [], health: null };
  if (!profile || !mode) return { ...base, reason: '이 장비·공격의 철거 수치와 시설 피해를 아직 확인하지 않았습니다. 파괴 불가능이라는 뜻은 아닙니다.' };

  const routes = structure.routes.map(route => evaluateForce(route, mode));
  const health = calculateStructureDamage(structure, mode);
  const outer = routes.find(row => row.outcome === 'pass' && !row.route.opening);
  const opening = routes.find(row => row.outcome === 'pass' && row.route.opening);
  const result = { ...base, routes, health };
  if (outer) Object.assign(result, { outcome: 'demolish', method: 'force', route: outer.route, component: outer.component, reason: outer.component === 'explosion' ? '폭발 중심부가 이 부위에 닿으면 철거력 조건을 충족합니다.' : '탄체·광선·타격이 이 부위에 직접 닿으면 철거력 조건을 충족합니다.' });
  else if (health?.hits) Object.assign(result, { outcome: 'health', method: 'health', hits: health.hits, reason: `같은 시설 본체에 최대 피해를 주어 체력을 소진하는 ${mode.unit === '개' ? '폭약 개수' : '탄수'}입니다.` });
  else if (opening) Object.assign(result, { outcome: 'demolish', method: 'force', route: opening.route, component: opening.component, reason: '폭발이 입구 안쪽에 들어가야 합니다. 바깥 표면에 맞히는 것과는 다릅니다.' });
  else if (routes.some(row => row.outcome === 'unknown')) result.reason = '철거 수치가 미확인이거나 출처가 엇갈려 파괴 여부를 확정하지 않습니다.';
  else if (structure.health && !health) result.reason = '철거력은 부족하지만 체력 파괴 경로가 있습니다. 이 공격의 시설 피해·탄수는 아직 확인하지 않았습니다.';
  else Object.assign(result, { outcome: 'blocked', reason: health ? '철거력이 부족하고 본체 장갑을 뚫는 피해도 없습니다.' : '확인된 철거력 조건에 미달합니다. 여러 발의 철거력을 합산해 파괴할 수는 없습니다.' });

  if (result.method) {
    if (result.route?.opening) result.conditions.push(`${result.route.name}에 폭발을 넣어야 합니다.`);
    if (profile.conditionalAim) result.conditions.push(profile.note || '실제 명중·기폭 조건을 확인하세요.');
    if (structure.condition === 'shield' && !options.shieldCleared && !(mode.shieldBypass && !result.route?.opening)) result.conditions.push('워프 함선의 보호막을 먼저 제거해야 합니다. 아래 탄수에는 보호막이 포함되지 않습니다.');
    if (structure.condition === 'jammer' && profile.requiresCallIn && !options.jammerDisabled) result.conditions.push('교란기를 비활성화한 뒤 호출해야 합니다. 활성 상태에서는 이 공격을 호출할 수 없습니다.');
    if (result.conditions.length) result.outcome = 'conditional';
  }
  return result;
}
