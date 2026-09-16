// A repeated-hit model for one reviewed body-part route, not a whole-body AoE sim.
export const armorMultiplier = (ap, armor) => ap < armor ? 0 : ap === armor ? 0.65 : 1;
const floor = value => Math.floor(value + 1e-9);
const known = value => Number.isFinite(value) && value >= 0;
const sumKnown = values => values.every(known) ? values.reduce((sum, value) => sum + value, 0) : null;

// Legacy profiles store equal normal/durable explosion damage in one field.
// Explicit null is unverified data and must not fall back to normal damage.
export const explosionComponents = mode => mode.explosions || (mode.explosion === 0 ? [] : [{
  id: 'explosion', name: mode.explosionName || '폭발', standard: mode.explosion,
  durable: Object.hasOwn(mode, 'explosionDurable') ? mode.explosionDurable : mode.explosion,
  ap: mode.explosionAp, innerRadius: mode.innerRadius, radius: mode.radius,
}]);

// Distance is from this explosion's center to the selected hitbox, not weapon
// range. The UI requests the inner-radius maximum (0); outer checks are useful
// for ensuring overlapping explosions never share a radius or AP.
function blastAtDistance(blast, distance) {
  if (!known(distance)) return { factor: null, ap: null };
  if (distance === 0) return { factor: 1, ap: blast.ap };
  if (known(blast.radius) && distance >= blast.radius) return { factor: 0, ap: blast.ap };
  if (!known(blast.innerRadius) || !known(blast.radius) || blast.radius < blast.innerRadius) return { factor: null, ap: null };
  if (distance <= blast.innerRadius) return { factor: 1, ap: blast.ap };
  // Wiki Damage: linear falloff and one less AP (minimum AP 2) outside inner.
  return { factor: (blast.radius - distance) / (blast.radius - blast.innerRadius), ap: known(blast.ap) ? Math.max(2, blast.ap - 1) : null };
}

export function damageBreakdown(mode, target, main, { blastDistance = 0, directHit = true } = {}) {
  let direct = null;
  if (!directHit || mode.standard === 0 && mode.durable === 0 || known(mode.ap) && mode.ap < target.armor) direct = 0;
  else if ([mode.ap, target.durability, target.armor].every(known)) {
    const mixed = target.durability === 0 ? mode.standard : target.durability === 100 ? mode.durable
      : [mode.standard, mode.durable].every(known) ? floor(mode.standard * (1 - target.durability / 100) + mode.durable * target.durability / 100) : null;
    if (known(mixed)) direct = floor(mixed * armorMultiplier(mode.ap, target.armor));
  }
  const explosions = explosionComponents(mode).map(blast => {
    const { factor, ap } = blastAtDistance(blast, blastDistance);
    const redirected = target.exdr === 100;
    const recipient = redirected ? main : target;
    let amount = null;
    if (factor === 0 || recipient.exdr === 100 || blast.durable === 0 || known(ap) && ap < recipient.armor) amount = 0;
    // Negative ExDR is a verified vulnerability multiplier (e.g. Warp Ships).
    else if ([factor, ap, blast.durable, recipient.armor].every(known) && Number.isFinite(recipient.exdr) && recipient.exdr <= 100) amount = floor(blast.durable * factor * armorMultiplier(ap, recipient.armor) * (1 - recipient.exdr / 100));
    return { ...blast, effectiveAp: ap, factor, exdr: recipient.exdr, armor: recipient.armor, redirected,
      partDamage: redirected ? 0 : amount, mainDamage: redirected ? amount : 0 };
  });
  return { direct, explosions, damage: {
    direct,
    explosion: sumKnown(explosions.map(blast => blast.partDamage)),
    mainExplosion: sumKnown(explosions.map(blast => blast.mainDamage)),
  } };
}

export function damagePerHit(mode, target, main, options) {
  return damageBreakdown(mode, target, main, options).damage;
}

export function calculateRoute(enemy, target, mode, { shieldCleared = false, ...damageOptions } = {}) {
  const base = { target, stages: [], hits: null, outcome: 'unknown', conditional: Boolean(target.prerequisite) };
  if (!mode || mode.unsupported) return { ...base, reason: mode?.unsupported || '정밀 피해 자료를 아직 확인하지 않았습니다.' };
  if (enemy.shield && !shieldCleared) return { ...base, outcome: 'shield', reason: enemy.shield.note };
  // Tanks have independent turret/hull pools; a strider's pilot also has its
  // own pool. A blast reaching this route must not damage a different pool.
  const main = target.main || enemy.main;
  let totalHits = 0;
  let mainRemaining = main.hp;
  let current = target;
  const stages = [];
  while (current) {
    const breakdown = damageBreakdown(mode, current, main, damageOptions);
    const damage = breakdown.damage;
    const partDamage = damage.direct + damage.explosion;
    const stage = { name: current.name, hp: current.hp, armor: current.armor, durability: current.durability, damage, hits: 0 };
    if (mode.reviewedExplosive || mode.explosions) stage.breakdown = breakdown;
    stages.push(stage);
    if (!Object.values(damage).every(known)) return { ...base, stages, reason: '자료 미확인: 이 부위에 적용되는 일부 피해·관통·반경을 확인하지 못해 최종 횟수는 계산 보류합니다. 확인된 피해는 계산 과정에 별도로 표시합니다.' };
    if (partDamage === 0 && damage.mainExplosion === 0) {
      return { ...base, stages, hits: totalHits || null, outcome: totalHits ? 'armor' : 'blocked', reason: totalHits ? '장갑은 제거했지만 노출 부위에 피해를 주지 못합니다.' : '이 부위와 본체에 계산상 피해가 들어가지 않습니다.' };
    }
    let partRemaining = current.hp;
    let transferBudget = current.hp + (current.constitution || 0);
    // Never continue firing into an unknown destroyed hitbox. Known armor layers
    // advance only on the next shot; a plate's excess damage is not carried over.
    for (let hit = 1; hit <= 20000; hit++) {
      totalHits++; stage.hits++;
      // Distinct explosions are distinct damage events, including integer
      // rounding of transfer. The shared part transfer cap is consumed once.
      let transfer = mode.explosions
        ? [damage.direct, ...breakdown.explosions.map(blast => blast.partDamage)].reduce((sum, amount) => sum + floor(amount * current.toMain / 100), 0)
        : floor(partDamage * current.toMain / 100);
      if (current.overflowCap) {
        transfer = Math.min(transfer, transferBudget);
        transferBudget -= transfer;
      }
      mainRemaining -= transfer + damage.mainExplosion;
      partRemaining -= partDamage;
      const result = { ...base, stages, hits: totalHits };
      // Fatal part destruction bypasses the Main constitution pool.
      if (partRemaining <= 0 && current.effect === 'kill') return { ...result, outcome: 'kill', via: 'part' };
      if (partRemaining <= -(current.constitution || Infinity) && current.effect === 'bleed') return { ...result, outcome: 'kill', via: 'part' };
      // An already-exposed part is an isolated, conservative part-HP estimate:
      // previous armor damage to Main is unknown, so no fresh Main is invented.
      if (!target.isolated && mainRemaining <= 0) return { ...result, outcome: main.constitution && mainRemaining > -main.constitution ? 'bleed' : 'kill', via: 'main' };
      if (partRemaining <= 0) {
        if (current.next) { current = current.next; break; }
        return { ...result, outcome: current.effect, via: 'part' };
      }
      if (hit === 20000) return { ...base, stages, reason: '계산 범위를 초과했습니다.' };
    }
  }
  return base;
}

export function calculateMatchup(enemy, mode, options) {
  const rows = enemy.parts.map(target => calculateRoute(enemy, target, mode, options));
  const candidates = rows.filter(row => !row.conditional && ['kill', 'bleed'].includes(row.outcome));
  candidates.sort((a, b) => a.hits - b.hits || (a.outcome === 'kill' ? 0 : 1) - (b.outcome === 'kill' ? 0 : 1));
  return { rows, best: candidates[0] || null };
}
