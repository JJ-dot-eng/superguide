import assert from 'node:assert/strict';
import { stratagems } from '../dist/data.js';
import { shieldRecovery, defenseView, renderDefenseStats, renderDefenseSource, defenseComparisonRows } from '../dist/defense-stats.js';

const directional = stratagems.find(item => item.id === 'directional-shield');
const ballistic = stratagems.find(item => item.id === 'ballistic-shield');
const otherBackpack = stratagems.find(item => item.id === 'shield-pack');
const weapon = stratagems.find(item => item.id === 'autocannon');
assert(directional && ballistic && otherBackpack && weapon);

// Verified wiki values stay in their own defensive components. They must not
// become offensive AP, shield armor, wearer resistance, or remaining health.
assert.deepEqual(directional.defense, {
  type: 'energy', checkedAt: '2026-09-16', sourceRevision: 126349,
  cooldown: 300,
  shield: { capacity: 1000, regeneration: 300, hitDelay: 3, depletedDelay: 6 },
  body: { hp: 400, armor: 4 },
});
assert.deepEqual(ballistic.defense, {
  type: 'ballistic', checkedAt: '2026-09-16', sourceRevision: 130352,
  cooldown: 240,
  body: { hp: 1000, armor: 4, durability: 70, explosionResistance: 0 },
  replacement: 'new-call',
});
assert.equal(directional.name, '방향 방패');
assert.equal(ballistic.name, '탄도 방패 배낭');
assert.equal(directional.source, 'https://helldivers.wiki.gg/wiki/SH-51_Directional_Shield');
assert.equal(ballistic.source, 'https://helldivers.wiki.gg/wiki/SH-20_Ballistic_Shield_Backpack');
for (const item of [directional, ballistic]) {
  assert.equal(item.utility, true);
  for (const field of ['ap', 'direct', 'splash']) assert.equal(item[field], null);
}
assert.deepEqual(stratagems.filter(item => item.defense).map(item => item.id).sort(), ['ballistic-shield', 'directional-shield']);

// Depletion waits 6 seconds, then fills. Partial damage waits 3 seconds and
// fills only the missing capacity; a full shield has no recovery remaining.
const near = (actual, expected) => assert(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
const empty = shieldRecovery(directional.defense, 0);
assert.equal(empty.delay, 6);
near(empty.filling, 10 / 3);
near(empty.total, 28 / 3);
assert.deepEqual(shieldRecovery(directional.defense, 700), { delay: 3, filling: 1, total: 4 });
assert.deepEqual(shieldRecovery(directional.defense, 1000), { delay: 0, filling: 0, total: 0 });
assert.equal(shieldRecovery(ballistic.defense, 0), null);
for (const remaining of [null, undefined, NaN, Infinity, -1, 1001, '0']) assert.equal(shieldRecovery(directional.defense, remaining), null);

const altered = (field, value) => ({ ...directional, defense: { ...directional.defense, shield: { ...directional.defense.shield, [field]: value } } });
for (const field of ['capacity', 'regeneration', 'depletedDelay']) assert.equal(shieldRecovery(altered(field, null).defense, 0), null);
assert.equal(shieldRecovery(altered('hitDelay', null).defense, 700), null);
assert.equal(shieldRecovery(altered('regeneration', 0).defense, 0), null);
assert.equal(shieldRecovery(altered('capacity', 0).defense, 0), null);
assert.deepEqual(shieldRecovery(altered('depletedDelay', null).defense, 700), { delay: 3, filling: 1, total: 4 });
assert.equal(shieldRecovery(altered('hitDelay', null).defense, 0).delay, 6);

const allMetrics = item => {
  const view = defenseView(item);
  return new Map([...view.highlights, ...view.additional].map(row => [row.id, row]));
};
const expected = new Map([
  [directional, {
    capacity: '1,000', regeneration: '300', 'body-hp': '400', 'body-armor': '4',
    'hit-delay': '3', 'depleted-delay': '6', 'refill-time': '약 3.33', 'full-recovery': '약 9.33', cooldown: '300',
  }],
  [ballistic, {
    'body-hp': '1,000', 'body-armor': '4', durability: '70', 'explosion-resistance': '0', cooldown: '240', replacement: '새 방패 호출 필요',
  }],
]);
for (const [item, values] of expected) {
  const metrics = allMetrics(item);
  const view = defenseView(item);
  for (const [id, value] of Object.entries(values)) assert.equal(metrics.get(id).value, value, `${item.id}: ${id}`);
  for (const context of ['card', 'detail']) {
    const html = renderDefenseStats(item, context);
    for (const metric of metrics.values()) {
      assert(html.includes(metric.label), `${context}: missing ${metric.label}`);
      assert(html.includes(metric.value), `${context}: missing ${metric.value}`);
    }
    for (const note of view.notes) assert(html.includes(note));
    assert(html.includes(item.rangeLabel), 'Existing coverage description remains visible');
    assert(!/<a\b/.test(html), 'Source links must remain outside the card button');
    assert(!/NaN|undefined|Infinity/.test(html));
  }
  const source = renderDefenseSource(item);
  assert(source.includes(item.defense.checkedAt) && source.includes(`href="${item.source}"`));
}

// Unknown delay must not erase a known filling duration or invent a total.
const missingDelay = allMetrics(altered('depletedDelay', null));
assert.equal(missingDelay.get('refill-time').value, '약 3.33');
assert.equal(missingDelay.get('full-recovery').value, '자료 미확인');
for (const field of ['capacity', 'regeneration', 'hitDelay', 'depletedDelay']) {
  const html = renderDefenseStats(altered(field, null), 'detail');
  assert(html.includes('자료 미확인'));
  assert(!/undefined|NaN|Infinity/.test(html));
}
const missingBody = { ...ballistic, defense: { ...ballistic.defense, body: {} } };
assert.equal(allMetrics(missingBody).get('explosion-resistance').value, '자료 미확인');
assert.equal(allMetrics(ballistic).get('explosion-resistance').value, '0', 'Confirmed zero is not unknown');

const rows = new Map(defenseComparisonRows([directional, ballistic, weapon]));
const cell = (label, item) => rows.get(label)(item);
assert.match(cell('에너지 보호막 용량', directional), /1,000/);
assert.match(cell('에너지 보호막 용량', ballistic), /해당 없음/);
assert.match(cell('방패·장치 본체 체력', directional), /400/);
assert.match(cell('방패·장치 본체 체력', ballistic), /1,000/);
assert.match(cell('방패·장치 본체 장갑', directional), /에너지 보호막의 장갑 수치 아님/);
assert.match(cell('방패 자체 내구도', ballistic), /70<small>%/);
assert.match(cell('방패 자체 내구도', directional), /자료 미확인/);
assert.match(cell('방패 자체 폭발 저항', ballistic), /0<small>%/);
assert.match(cell('방패 자체 폭발 저항', ballistic), /착용자의 폭발 방호율과 별개/);
assert.match(cell('방패 자체 폭발 저항', directional), /자료 미확인/);
assert.match(cell('기본 재사용 대기시간', directional), /300<small>초/);
assert.match(cell('기본 재사용 대기시간', ballistic), /240<small>초/);
assert.match(cell('완전 소진 → 완전 회복', directional), /약 9\.33/);
assert.match(cell('소진·파괴 후 복구', ballistic), /새 방패 호출 필요/);
assert.match(cell('소진·파괴 후 복구', directional), /장치 본체 파괴와 별도/);
assert.match(cell('방어 수치 해석', ballistic), /남은 체력이 아닙니다/);
assert.match(cell('방어 수치 해석', ballistic), /일반 피해와 내구 피해/);
assert.equal(cell('방패·장치 본체 장갑', weapon), '자료 미확인');
for (const item of [otherBackpack, weapon]) {
  assert.equal(defenseView(item), null);
  assert.equal(renderDefenseStats(item), '');
  assert.equal(renderDefenseSource(item), '');
}
assert.deepEqual(defenseComparisonRows([otherBackpack, weapon]), []);
console.log('PASS: shield defense source values, distinct components, recovery timing, unknown values, card/detail displays, and mixed comparisons.');
