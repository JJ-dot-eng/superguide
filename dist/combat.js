// A repeated-hit model for one reviewed body-part route, not a whole-body AoE sim.
export const armorMultiplier = (ap, armor) => ap < armor ? 0 : ap === armor ? 0.65 : 1;
const floor = value => Math.floor(value + 1e-9);
const known = value => Number.isFinite(value) && value >= 0;
const sumKnown = values => values.every(known) ? values.reduce((sum, value) => sum + value, 0) : null;
// Non-decaying constitution is extra health, not a bleed-out timer.
const partHealth = part => part.hp + (part.staticConstitution || 0);
const transferLimit = part => partHealth(part) + (part.constitution || 0) + (part.transferExtraHealth || 0);
const hasUnknownCap = part => part.capUnverified && part.overflowCap == null || Boolean(part.next && hasUnknownCap(part.next));
const withCapScenario = (part, capped) => ({ ...part,
  ...(part.capUnverified && part.overflowCap == null ? { overflowCap: capped } : {}),
  ...(part.next ? { next: withCapScenario(part.next, capped) } : {}),
});

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

export function damageBreakdown(mode, target, main, { blastDistance = 0, directHit = true, excludeMainExplosion = false } = {}) {
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
    if (redirected && excludeMainExplosion || factor === 0 || recipient.exdr === 100 || blast.durable === 0 || known(ap) && ap < recipient.armor) amount = 0;
    // Negative ExDR is a verified vulnerability multiplier (e.g. Warp Ships).
    else if ([factor, ap, blast.durable, recipient.armor].every(known) && Number.isFinite(recipient.exdr) && recipient.exdr <= 100) amount = floor(blast.durable * factor * armorMultiplier(ap, recipient.armor) * (1 - recipient.exdr / 100));
    return { ...blast, effectiveAp: ap, factor, exdr: recipient.exdr, armor: recipient.armor, redirected,
      ...(redirected && excludeMainExplosion ? { excluded: true } : {}),
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
  // A missing cap is not an unlimited cap. Calculate both possible settings and
  // publish a count only when the outcome and count agree in both scenarios.
  if (hasUnknownCap(target) && !target.unknownReason) {
    const capped = calculateRoute(enemy, withCapScenario(target, true), mode, { shieldCleared, ...damageOptions });
    const uncapped = calculateRoute(enemy, withCapScenario(target, false), mode, { shieldCleared, ...damageOptions });
    if (capped.hits === uncapped.hits && capped.outcome === uncapped.outcome) {
      const result = { ...capped, target, via: capped.via === uncapped.via ? capped.via : undefined };
      return capped.hits == null ? result : { ...result,
        modelNote: [capped.modelNote, '본체 전달 상한은 자료 미확인입니다. 상한 적용 여부가 표시 횟수와 결과에 영향을 주지 않는 경우만 계산했습니다.'].filter(Boolean).join(' '),
      };
    }
    return { target, stages: [], hits: null, outcome: 'unknown', conditional: Boolean(target.prerequisite), reason: '본체 전달 상한의 적용 여부에 따라 결과가 달라져 계산을 보류합니다.' };
  }
  // A separate device can have its own destruction threshold without a normal
  // Main transfer route. Keep its source values null and calculate only the
  // device itself; no unverified Main damage or secondary explosion is invented.
  if (target.partOnly && !target.unknownReason) {
    const isolated = { ...target, partOnly: false, toMain: 0, overflowCap: false, isolated: true };
    const result = calculateRoute(enemy, isolated, mode, { shieldCleared, ...damageOptions, excludeMainExplosion: true });
    return { ...result, target, modelNote: target.partOnlyNote };
  }
  const result = calculateReviewedRoute(enemy, target, mode, { shieldCleared, ...damageOptions });
  // No firing cadence is invented for regenerative enemies. The count is an
  // explicit no-regeneration lower bound unless a non-regenerating fatal part wins.
  if (enemy.regeneration && result.hits != null && !(result.via === 'part' && (target.next || target).regenerates === false)) {
    return { ...result, lowerBound: true, modelNote: enemy.regeneration.note };
  }
  return result;
}

function calculateReviewedRoute(enemy, target, mode, { shieldCleared = false, ...damageOptions } = {}) {
  const base = { target, stages: [], hits: null, outcome: 'unknown', conditional: Boolean(target.prerequisite) };
  if (!mode || mode.unsupported) return { ...base, reason: mode?.unsupported || '정밀 피해 자료를 아직 확인하지 않았습니다.' };
  if (enemy.shield && !shieldCleared && (!enemy.shield.partial || target.requiresShieldClear)) return { ...base, outcome: 'shield', reason: enemy.shield.note };
  if (target.unknownReason) return { ...base, reason: target.unknownReason };
  if (mode.beam) return calculateBeamRoute(enemy, target, mode, damageOptions);
  if (mode.hitCondition && !mode.impactEvents) return { ...base, reason: '한 발당 해당 부위의 명중 수를 선택하면 그 가정의 탄수를 계산합니다. 실제 명중 수는 자료 미확인입니다.' };
  if (mode.impactEvents) return calculateImpactRoute(enemy, target, mode, damageOptions);
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
    const stage = { name: current.name, hp: partHealth(current), armor: current.armor, durability: current.durability, damage, hits: 0 };
    if (mode.reviewedExplosive || mode.explosions || mode.conditionalImpact) stage.breakdown = breakdown;
    stages.push(stage);
    if (!Object.values(damage).every(known)) return { ...base, stages, reason: '자료 미확인: 이 부위에 적용되는 일부 피해·관통·반경을 확인하지 못해 최종 횟수는 계산 보류합니다. 확인된 피해는 계산 과정에 별도로 표시합니다.' };
    if (partDamage === 0 && damage.mainExplosion === 0) {
      return { ...base, stages, hits: totalHits || null, outcome: totalHits ? 'armor' : 'blocked', reason: totalHits ? '장갑은 제거했지만 노출 부위에 피해를 주지 못합니다.' : '이 부위와 본체에 계산상 피해가 들어가지 않습니다.' };
    }
    let partRemaining = current.mainOnly ? Infinity : partHealth(current);
    let transferBudget = transferLimit(current);
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
      if (partRemaining <= 0) mainRemaining -= current.destroyMainDamage || 0;
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

// A short continuous beam has a maximum damage budget per burst, not an
// instantaneous hit. Stop when the hitbox breaks or Main HP is exhausted;
// the unused beam must not become an overkill transfer or hit exposed flesh.
// This is a continuous-damage envelope, not an invented frame/tick simulator.
function calculateBeamRoute(enemy, target, mode, options) {
  const base = { target, stages: [], hits: null, outcome: 'unknown', conditional: Boolean(target.prerequisite) };
  const main = target.main || enemy.main;
  const breakdown = damageBreakdown(mode, target, main, options);
  const damage = breakdown.damage;
  const stage = { name: target.name, hp: partHealth(target), armor: target.armor, durability: target.durability, damage, hits: 0, breakdown };
  const stages = [stage];
  if (![...Object.values(damage), mode.beam.duration, mode.beam.standardPerSecond, mode.beam.durablePerSecond, target.hp, target.toMain, main.hp].every(known)
    || mode.beam.duration === 0 || target.hp === 0 || main.hp === 0 || damage.explosion !== 0 || damage.mainExplosion !== 0) {
    return { ...base, stages, reason: '자료 미확인: 광선의 피해·지속시간 또는 부위 수치가 확인되지 않아 계산을 보류합니다.' };
  }
  if (damage.direct === 0) return { ...base, stages, outcome: 'blocked', reason: '광선이 해당 부위 장갑을 관통하지 못하거나 직접 닿지 않습니다.' };
  const partBursts = target.mainOnly ? Infinity : partHealth(target) / damage.direct;
  const transferPerBurst = damage.direct * target.toMain / 100;
  const transferCap = target.overflowCap ? transferLimit(target) : Infinity;
  const mainBursts = !target.isolated && transferPerBurst > 0 && main.hp <= transferCap ? main.hp / transferPerBurst : Infinity;
  const bursts = Math.min(partBursts, mainBursts);
  const hits = Math.ceil(bursts - 1e-9);
  if (hits < 1 || hits > 20000) return { ...base, stages, reason: '계산 범위를 초과했습니다.' };
  Object.assign(stage, {
    hits, contactSeconds: bursts * mode.beam.duration,
    appliedDirect: damage.direct * bursts,
    mainTransfer: Math.min(transferPerBurst * bursts, transferCap),
  });
  const result = { ...base, stages, hits };
  // Fatal parts take priority at a simultaneous Main/part threshold.
  if (partBursts <= mainBursts && target.effect === 'kill') return { ...result, outcome: 'kill', via: 'part' };
  if (partBursts <= mainBursts && main.hp - stage.mainTransfer - (target.destroyMainDamage || 0) <= 0) return { ...result, outcome: main.constitution ? 'bleed' : 'kill', via: 'main' };
  if (mainBursts <= partBursts) return { ...result, outcome: main.constitution ? 'bleed' : 'kill', via: 'main' };
  return {
    ...result, outcome: target.effect, via: 'part',
    ...(target.next ? { reason: '장갑 파괴까지의 탄수입니다. 남은 광선이 노출된 살점에 이어서 닿는 조건은 자료 미확인이므로 최종 처치 탄수는 계산 보류합니다.' } : {}),
  };
}

// Multiple arcs/bomblets are separate damage events. Round damage and Main
// transfer per event, share the transfer cap, and stop on a destroyed hitbox.
// The existing single-impact model above is intentionally kept unchanged.
function calculateImpactRoute(enemy, target, mode, options) {
  const base = { target, stages: [], hits: null, outcome: 'unknown', conditional: Boolean(target.prerequisite) };
  const main = target.main || enemy.main;
  let mainRemaining = main.hp, totalHits = 0, current = target;
  const stages = [];
  while (current) {
    const events = mode.impactEvents.map(event => ({ ...event, breakdown: damageBreakdown(event.attack, current, main, { ...options, directHit: event.directHit }) }));
    const damage = Object.fromEntries(['direct', 'explosion', 'mainExplosion'].map(key => [key, sumKnown(events.map(event => {
      const amount = event.breakdown.damage[key];
      return known(amount) ? amount * event.count : null;
    }))]));
    const stage = { name: current.name, hp: partHealth(current), armor: current.armor, durability: current.durability, damage, hits: 0, events };
    stages.push(stage);
    if (!Object.values(damage).every(known)) return { ...base, stages, reason: '자료 미확인: 선택한 명중 조건에 필요한 피해 수치가 확인되지 않았습니다.' };
    if (Object.values(damage).every(amount => amount === 0)) return { ...base, stages, outcome: totalHits ? 'armor' : 'blocked', hits: totalHits || null, reason: '선택한 명중 조건에서는 이 부위와 본체에 피해가 들어가지 않습니다.' };
    let partRemaining = current.mainOnly ? Infinity : partHealth(current);
    let transferBudget = transferLimit(current);
    const eventCount = events.reduce((sum, event) => sum + event.count, 0);
    let advance = false;
    for (let shot = 0; shot < 20000 && !advance; shot++) {
      totalHits++; stage.hits++;
      let applied = 0;
      for (const event of events) for (let hit = 0; hit < event.count; hit++) {
        applied++;
        const single = event.breakdown.damage;
        const partDamage = single.direct + single.explosion;
        let transfer = [single.direct, ...event.breakdown.explosions.map(blast => blast.partDamage)]
          .reduce((sum, amount) => sum + floor(amount * current.toMain / 100), 0);
        if (current.overflowCap) {
          transfer = Math.min(transfer, transferBudget);
          transferBudget -= transfer;
        }
        mainRemaining -= transfer + single.mainExplosion;
        partRemaining -= partDamage;
        if (partRemaining <= 0) mainRemaining -= current.destroyMainDamage || 0;
        const result = { ...base, stages, hits: totalHits };
        if (partRemaining <= 0 && current.effect === 'kill') return { ...result, outcome: 'kill', via: 'part' };
        if (partRemaining <= -(current.constitution || Infinity) && current.effect === 'bleed') return { ...result, outcome: 'kill', via: 'part' };
        if (!target.isolated && mainRemaining <= 0) return { ...result, outcome: main.constitution && mainRemaining > -main.constitution ? 'bleed' : 'kill', via: 'main' };
        if (partRemaining <= 0) {
          if (!current.next) return { ...result, outcome: current.effect, via: 'part' };
          if (applied < eventCount) return { ...base, stages, reason: '장갑 파괴 후 같은 발의 남은 전격·자탄이 노출 부위에 닿는지는 자료 미확인입니다. 최종 탄수는 계산 보류합니다.' };
          current = current.next;
          advance = true;
          break;
        }
      }
    }
    if (!advance) return { ...base, stages, reason: '계산 범위를 초과했습니다.' };
  }
  return base;
}

export function calculateMatchup(enemy, mode, options) {
  const rows = enemy.parts.map(target => calculateRoute(enemy, target, mode, options));
  const candidates = rows.filter(row => !row.conditional && ['kill', 'bleed', 'down'].includes(row.outcome));
  candidates.sort((a, b) => a.hits - b.hits || (a.outcome === 'kill' ? 0 : 1) - (b.outcome === 'kill' ? 0 : 1));
  return { rows, best: candidates[0] || null };
}
