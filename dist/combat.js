// A repeated-hit model for one reviewed body-part route, not a whole-body AoE sim.
export const armorMultiplier = (ap, armor) => ap < armor ? 0 : ap === armor ? 0.65 : 1;
const floor = value => Math.floor(value + 1e-9);
export function damagePerHit(mode, target, main) {
  const mixed = floor(mode.standard * (1 - target.durability / 100) + mode.durable * target.durability / 100);
  const direct = floor(mixed * armorMultiplier(mode.ap, target.armor));
  const blast = (armor, exdr) => floor(mode.explosion * armorMultiplier(mode.explosionAp, armor) * (1 - exdr / 100));
  return {
    direct,
    explosion: target.exdr === 100 ? 0 : blast(target.armor, target.exdr),
    mainExplosion: target.exdr === 100 ? blast(main.armor, main.exdr) : 0,
  };
}

export function calculateRoute(enemy, target, mode, { shieldCleared = false } = {}) {
  const base = { target, stages: [], hits: null, outcome: 'unknown', conditional: Boolean(target.prerequisite) };
  if (!mode || mode.unsupported) return { ...base, reason: mode?.unsupported || '정밀 피해 자료를 아직 확인하지 않았습니다.' };
  if (enemy.shield && !shieldCleared) return { ...base, outcome: 'shield', reason: enemy.shield.note };
  let totalHits = 0;
  let mainRemaining = enemy.main.hp;
  let current = target;
  const stages = [];
  while (current) {
    const damage = damagePerHit(mode, current, enemy.main);
    const partDamage = damage.direct + damage.explosion;
    const stage = { name: current.name, hp: current.hp, armor: current.armor, durability: current.durability, damage, hits: 0 };
    stages.push(stage);
    if (partDamage === 0 && damage.mainExplosion === 0) {
      return { ...base, stages, hits: totalHits || null, outcome: totalHits ? 'armor' : 'blocked', reason: totalHits ? '장갑은 제거했지만 노출 부위에 피해를 주지 못합니다.' : '이 부위와 본체에 계산상 피해가 들어가지 않습니다.' };
    }
    let partRemaining = current.hp;
    let transferBudget = current.hp + (current.constitution || 0);
    // Never continue firing into an unknown destroyed hitbox. Known armor layers
    // advance only on the next shot; a plate's excess damage is not carried over.
    for (let hit = 1; hit <= 20000; hit++) {
      totalHits++; stage.hits++;
      let transfer = floor(partDamage * current.toMain / 100);
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
      if (!target.isolated && mainRemaining <= 0) return { ...result, outcome: enemy.main.constitution && mainRemaining > -enemy.main.constitution ? 'bleed' : 'kill', via: 'main' };
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
