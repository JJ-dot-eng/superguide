import assert from 'node:assert/strict';
import { stratagems } from '../dist/data.js';
import { shieldRecovery, defenseView, renderDefenseStats, renderDefenseSource, defenseComparisonRows } from '../dist/defense-stats.js';

const directional = stratagems.find(item => item.id === 'directional-shield');
const ballistic = stratagems.find(item => item.id === 'ballistic-shield');
const shieldPack = stratagems.find(item => item.id === 'shield-pack');
const shieldRelay = stratagems.find(item => item.id === 'shield-relay');
const otherBackpack = stratagems.find(item => item.id === 'warp-pack');
const weapon = stratagems.find(item => item.id === 'autocannon');
assert(directional && ballistic && shieldPack && shieldRelay && otherBackpack && weapon);

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
assert.equal(shieldPack.name, '방어막 생성 팩');
assert.equal(shieldRelay.name, '방어막 생성 릴레이');
assert.equal(shieldPack.source, 'https://helldivers.wiki.gg/wiki/SH-32_Shield_Generator_Pack');
assert.equal(shieldRelay.source, 'https://helldivers.wiki.gg/wiki/FX-12_Shield_Generator_Relay');
assert.deepEqual(shieldPack.defense.shield, { capacity: 150, regeneration: 150, hitDelay: 60, depletedDelay: 12, coverage: '전방위' });
assert.equal(shieldPack.defense.cooldown, 480);
assert.equal(shieldPack.defense.lifetime, 'unlimited');
assert.equal(shieldPack.defense.body, undefined, 'The Hellpod HP must not become backpack body HP');
assert.deepEqual(shieldRelay.defense.shield, { capacity: 4000, regeneration: 400, hitDelay: 0.01, regeneratesAfterDepletion: false, internalDepletedDelay: 45, radius: 15, coverage: '전방위' });
assert.deepEqual(shieldRelay.defense.body, { hp: 450, armor: 2, durability: 0, explosionResistance: 0 });
assert.equal(shieldRelay.defense.cooldown, 90);
assert.equal(shieldRelay.defense.lifetime, 40);
assert.equal(shieldRelay.defense.shield.depletedDelay, undefined, 'An internal timer is not an operational recharge delay');
for (const item of [directional, ballistic, shieldPack, shieldRelay]) {
  assert.equal(item.utility, true);
  for (const field of ['ap', 'direct', 'splash']) assert.equal(item[field], null);
  assert.equal(item.defense.checkedAt, '2026-09-16');
  assert.equal(item.defense.shield?.armor, undefined, 'Body armor must not be assigned to the energy shield');
}
assert.deepEqual(stratagems.filter(item => item.defense).map(item => item.id).sort(), ['ballistic-shield', 'directional-shield', 'shield-pack', 'shield-relay']);

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
assert.deepEqual(shieldRecovery(shieldPack.defense, 0), { delay: 12, filling: 1, total: 13 });
assert.deepEqual(shieldRecovery(shieldPack.defense, 75), { delay: 60, filling: 0.5, total: 60.5 }, 'Partial damage uses the 60-second delay, not the broken-shield delay');
assert.deepEqual(shieldRecovery(shieldPack.defense, 150), { delay: 0, filling: 0, total: 0 });
assert.equal(shieldRecovery(shieldRelay.defense, 0), null, 'The relay cannot regenerate after complete depletion');
assert.deepEqual(shieldRecovery(shieldRelay.defense, 2000), { delay: 0.01, filling: 5, total: 5.01 }, 'Partial damage still regenerates while the relay remains active');
assert.deepEqual(shieldRecovery(shieldRelay.defense, 4000), { delay: 0, filling: 0, total: 0 });
assert.equal(shieldRecovery({ ...shieldRelay.defense, shield: { ...shieldRelay.defense.shield, depletedDelay: 45 } }, 0), null, 'Even an accidentally supplied 45-second delay must not restore a broken relay');
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
  [shieldPack, {
    capacity: '150', regeneration: '150', 'body-hp': '자료 미확인', 'body-armor': '자료 미확인',
    'hit-delay': '60', 'depleted-delay': '12', 'refill-time': '1', 'full-recovery': '13',
    coverage: '전방위', lifetime: '고정 제한 없음', cooldown: '480', replacement: '보호막 소진 시 재생',
  }],
  [shieldRelay, {
    capacity: '4,000', regeneration: '400', 'body-hp': '450', 'body-armor': '2', durability: '0', 'explosion-resistance': '0',
    'hit-delay': '약 0.01', 'depleted-delay': '재생 안 됨', 'refill-time': '해당 없음', 'full-recovery': '복구 불가',
    coverage: '전방위', radius: '15', lifetime: '40', cooldown: '90', replacement: '보호막 파괴 후 재생 불가',
  }],
]);
for (const [item, values] of expected) {
  const metrics = allMetrics(item);
  const view = defenseView(item);
  for (const [id, value] of Object.entries(values)) assert.equal(metrics.get(id).value, value, `${item.id}: ${id}`);
  for (const context of ['card', 'detail']) {
    const html = renderDefenseStats(item, context);
    const visibleMetrics = context === 'card' ? view.highlights : [...metrics.values()];
    for (const metric of visibleMetrics) {
      assert(html.includes(metric.label), `${context}: missing ${metric.label}`);
      assert(html.includes(metric.value), `${context}: missing ${metric.value}`);
    }
    if (context === 'card') {
      assert.equal((html.match(/class="stat"/g) || []).length, 4, 'Cards show four core defense metrics');
      assert(!html.includes('defense-facts') && !html.includes('defense-explanations'), 'Additional facts and long explanations open in the detail dialog');
      for (const metric of view.additional) assert(!html.includes(metric.label));
      for (const note of view.notes) assert(!html.includes(note));
    } else {
      for (const note of view.notes) assert(html.includes(note));
    }
    assert(html.includes(item.rangeLabel), 'Existing coverage description remains visible');
    assert(!/<a\b/.test(html), 'Source links must remain outside the card button');
    assert(!/NaN|undefined|Infinity/.test(html));
  }
  const source = renderDefenseSource(item);
  assert(source.includes(item.defense.checkedAt) && source.includes(`href="${item.source}"`));
  assert.match(source, /함선 모듈 적용 전 기본값/);
  assert(view.notes.some(note => note.includes('함선 모듈·임무 효과 적용 전 기본값')));
}
assert.deepEqual(defenseView(shieldPack).highlights.map(row => row.id), ['capacity', 'regeneration', 'hit-delay', 'depleted-delay']);
assert.match(renderDefenseStats(shieldPack, 'detail'), /12초 대기 \+ 1초 재생 = 13초/);
assert.match(renderDefenseStats(shieldPack, 'detail'), /투하 포드 체력 200은 보호막 용량이나 배낭 자체 체력이 아닙니다/);
assert.match(renderDefenseStats(shieldRelay), /완전 파괴 후 재생 불가/);
assert.match(renderDefenseStats(shieldRelay, 'detail'), /사실상 즉시/);
assert.match(renderDefenseStats(shieldRelay, 'detail'), /장비 수명이 최대 40초/);

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
const unknownGeneratorBody = { ...shieldRelay, defense: { ...shieldRelay.defense, body: { hp: null, armor: null, durability: null, explosionResistance: null } } };
for (const id of ['body-hp', 'body-armor', 'durability', 'explosion-resistance']) assert.equal(allMetrics(unknownGeneratorBody).get(id).value, '자료 미확인');
assert.equal(allMetrics({ ...shieldRelay, defense: { ...shieldRelay.defense, lifetime: null } }).get('lifetime').value, '자료 미확인', 'Unknown lifetime is not zero or unlimited');

const rows = new Map(defenseComparisonRows([directional, ballistic, weapon]));
const cell = (label, item) => rows.get(label)(item);
assert.match(cell('에너지 보호막 용량', directional), /1,000/);
assert.match(cell('에너지 보호막 용량', ballistic), /해당 없음/);
assert.match(cell('방패·장치 본체 체력', directional), /400/);
assert.match(cell('방패·장치 본체 체력', ballistic), /1,000/);
assert.match(cell('방패·장치 본체 장갑', directional), /에너지 보호막의 장갑 수치 아님/);
assert.match(cell('방패·장치 본체 내구도', ballistic), /70<small>%/);
assert.match(cell('방패·장치 본체 내구도', directional), /자료 미확인/);
assert.match(cell('방패·장치 본체 폭발 저항', ballistic), /0<small>%/);
assert.match(cell('방패·장치 본체 폭발 저항', ballistic), /착용자의 폭발 방호율과 별개/);
assert.match(cell('방패·장치 본체 폭발 저항', directional), /자료 미확인/);
assert.match(cell('기본 재사용 대기시간', directional), /300<small>초/);
assert.match(cell('기본 재사용 대기시간', ballistic), /240<small>초/);
assert.match(cell('완전 소진 → 완전 회복', directional), /약 9\.33/);
assert.match(cell('소진·파괴 후 복구', ballistic), /새 방패 호출 필요/);
assert.match(cell('소진·파괴 후 복구', directional), /장치 본체 파괴와 별도/);
assert.match(cell('방어 수치 해석', ballistic), /남은 체력이 아닙니다/);
assert.match(cell('방어 수치 해석', ballistic), /일반 피해와 내구 피해/);
assert.equal(cell('방패·장치 본체 장갑', weapon), '자료 미확인');
const generatorRows = new Map(defenseComparisonRows([shieldPack, shieldRelay, ballistic]));
const generatorCell = (label, item) => generatorRows.get(label)(item);
assert.match(generatorCell('에너지 보호막 용량', shieldPack), />150</);
assert.match(generatorCell('방패·장치 본체 체력', shieldPack), /자료 미확인/);
assert.doesNotMatch(generatorCell('방패·장치 본체 체력', shieldPack), /200/);
assert.match(generatorCell('완전 소진 후 재생 대기', shieldPack), /12<small>초/);
assert.match(generatorCell('재생만 걸리는 시간 · 0 → 최대', shieldPack), />1<small>초/);
assert.match(generatorCell('완전 소진 → 완전 회복', shieldPack), />13<small>초/);
assert.match(generatorCell('최대 지속시간', shieldPack), /고정 제한 없음/);
assert.match(generatorCell('에너지 보호막 용량', shieldRelay), /4,000/);
assert.match(generatorCell('방패·장치 본체 체력', shieldRelay), /450/);
assert.match(generatorCell('방패·장치 본체 장갑', shieldRelay), /2<\/span>.*발전기 본체 장갑/);
assert.match(generatorCell('방패·장치 본체 내구도', shieldRelay), /0<small>%/);
assert.match(generatorCell('방패·장치 본체 폭발 저항', shieldRelay), /0<small>%/);
assert.match(generatorCell('방패·장치 본체 폭발 저항', shieldRelay), /보호막·내부 인원의 폭발 방호율과 별개/);
assert.match(generatorCell('피격 후 재생 대기', shieldRelay), /약 0\.01<small>초/);
assert.match(generatorCell('완전 소진 후 재생 대기', shieldRelay), /재생 안 됨/);
assert.match(generatorCell('재생만 걸리는 시간 · 0 → 최대', shieldRelay), /해당 없음/);
assert.match(generatorCell('완전 소진 → 완전 회복', shieldRelay), /복구 불가/);
assert.match(generatorCell('소진·파괴 후 복구', shieldRelay), /보호막 파괴 후 재생 불가/);
assert.match(generatorCell('보호 반경', shieldRelay), /15<small>m/);
assert.match(generatorCell('최대 지속시간', shieldRelay), /40<small>초/);
assert.match(generatorCell('기본 재사용 대기시간', shieldRelay), /90<small>초/);
assert.match(generatorCell('기본 재사용 대기시간', shieldPack), /480<small>초/);
assert.match(generatorCell('보호 방향', shieldPack), /전방위/);
assert.match(generatorCell('보호 방향', ballistic), /전면 방어/);
for (const item of [otherBackpack, weapon]) {
  assert.equal(defenseView(item), null);
  assert.equal(renderDefenseStats(item), '');
  assert.equal(renderDefenseSource(item), '');
}
assert.deepEqual(defenseComparisonRows([otherBackpack, weapon]), []);
console.log('PASS: shield defense source values, distinct components, recovery timing, unknown values, card/detail displays, and mixed comparisons.');
