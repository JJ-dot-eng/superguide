// Reviewed Wiki Anatomy and Detailed Weapon Statistics tables, 2026-09-16.
// Original entries were checked through the search index; expanded anatomy
// entries use the Wiki revision API, with sourceRevision retained below.
// Percentages below use 0–100. Unknown mechanics are not replaced with zero.
export const combatCheckedAt = '2026-09-16';
export const damageSource = 'https://helldivers.wiki.gg/wiki/Damage';
const wiki = page => `https://helldivers.wiki.gg/wiki/${page}`;
const main = (hp, armor, durability, exdr, constitution = 0) => ({ hp, armor, durability, exdr, constitution });
const part = (id, name, hp, armor, durability, exdr, toMain, overflowCap, effect, tip, extra = {}) => ({ id, name, hp, armor, durability, exdr, toMain, overflowCap, effect, tip, ...extra });
const legFlesh = () => part('leg-flesh', '노출된 다리 살점', 800, 2, 70, 25, 50, false, 'kill', '장갑을 벗긴 같은 다리에 계속 맞히세요.');
const hunter = (id, name, hp, limbHp) => ({
  id, name, faction: '테르미니드', source: wiki('Hunter'), sourceRevision: 135080, family: 'hunter',
  main: main(hp, 0, 0, 0),
  note: '난이도 4부터 본체와 사지 체력이 증가합니다. 작은 머리는 난이도와 관계없이 체력 40입니다. 한쪽 다리 파괴와 처치를 구분합니다.',
  parts: [
    part('head', '머리', 40, 0, 0, 100, 100, true, 'kill', '도약하기 전이나 착지한 순간 작은 머리를 맞히세요.'),
    part('claw', '앞발 한쪽', limbHp, 0, 0, 100, 40, false, 'break', '몸 앞의 길게 뻗은 앞발 한쪽입니다. 앞발 하나를 부쉈다고 즉사하는 부위는 아닙니다.'),
    part('leg', '다리 한쪽', limbHp, 0, 0, 100, 50, false, 'break', '같은 다리를 맞혀 움직임과 도약을 방해하세요. 다른 다리에 나눠 맞힌 피해는 합치지 않습니다.'),
  ],
});
const warrior = (id, name, hp, headHp, limbHp) => ({
  id, name, faction: '테르미니드', source: wiki('Warrior'), sourceRevision: 135082, family: 'warrior',
  main: main(hp, 1, 20, 0),
  note: '난이도 4부터 체력이 증가합니다. 머리를 잃어도 잠시 돌진·공격할 수 있어, 머리 파괴는 출혈 시작과 즉사를 나눠 표시합니다.',
  parts: [
    part('head', '머리', headHp, 1, 20, 100, 100, false, 'bleed', '정면 머리를 노리세요. 머리가 떨어진 뒤에도 다가올 수 있으니 거리를 두세요.', { constitution: 200 }),
    part('claw', '앞발 한쪽', limbHp, 1, 0, 100, 40, false, 'break', '몸 앞의 집게 모양 앞발 하나를 노리는 조건입니다.'),
    part('leg', '다리 한쪽', limbHp, 1, 0, 100, 40, false, 'break', '다리 하나를 끊어 이동을 방해할 수 있습니다. 절단 자체는 즉사 조건이 아닙니다.'),
  ],
});
const spewer = (id, name, page, armor, note, revision, family = id) => ({
  id, name, faction: '테르미니드', source: wiki(page), sourceRevision: revision, family,
  main: main(750, armor, 50, 0), note,
  parts: [
    part('head', '머리', 300, armor, 0, 100, 100, true, 'kill', '앞쪽 머리 외피를 노리세요. 머리와 아래의 입은 장갑 수치가 다릅니다.'),
    part('mouth', '입', 250, 0, 0, 100, 100, true, 'kill', '정면 아래쪽 입 자체를 직접 맞히세요. 위쪽 머리 장갑에 맞은 탄과 구분합니다.'),
    part('butt', '후방 복부', 750, 0, 100, 0, 60, true, 'kill', '옆이나 뒤에서 부푼 복부를 쏘세요. 장갑은 없지만 내구도가 100%라 내구 피해가 중요합니다.'),
  ],
});
const voteless = (id, name, hp, headHp, forearmHp) => ({
  id, name, faction: '일루미닛', source: wiki('Voteless'), sourceRevision: 135187, family: 'voteless',
  main: main(hp, 0, 0, 0, 100),
  note: '체형별 체력이 다릅니다. 머리는 치명 부위입니다. 다리를 잃고도 기어올 수 있어 다리 파괴는 즉사로 취급하지 않습니다. 본체 체력 소진 후의 출혈도 반영합니다.',
  parts: [
    part('head', '머리', headHp, 1, 0, 100, 100, true, 'kill', '몸통보다 체력이 낮은 머리를 직접 맞히세요.'),
    part('forearm', '아래팔 한쪽', forearmHp, 0, 0, 100, 30, false, 'break', '팔꿈치 아래의 팔 한쪽을 노리는 계산입니다. 팔 하나가 떨어져도 살아 있을 수 있습니다.'),
    part('leg', '다리', 80, 0, 0, 100, 30, true, 'break', '다리를 끊어 쓰러뜨려도 기어와 공격할 수 있습니다. 확실히 끝내려면 머리를 노리세요.'),
  ],
});

export const enemies = [
  {
    id: 'charger', name: '차저', faction: '테르미니드', source: wiki('Charger'),
    main: main(2400, 4, 100, 25, 750),
    note: '머리 파괴는 즉사, 후방 복부 파괴는 출혈을 유발합니다. 다리는 장갑과 살점을 따로 계산합니다.',
    parts: [
      part('head', '머리', 1200, 4, 75, 25, 70, false, 'kill', '정면 머리 중앙을 노리세요. 등 장갑에 빗맞으면 다른 부위입니다.'),
      part('butt', '후방 복부', 950, 0, 80, 25, 150, false, 'bleed', '돌진을 피한 뒤 뒤쪽의 드러난 복부를 쏘세요. 파괴 후에도 바로 죽지 않을 수 있습니다.'),
      part('front-leg', '앞다리 장갑 → 살점', 800, 4, 70, 25, 60, false, 'armor', '한쪽 앞다리에 집중하세요. 장갑을 벗긴 탄의 초과 피해는 살점으로 넘어가지 않습니다.', { next: legFlesh() }),
    ],
  },
  {
    id: 'behemoth', name: '베히모스 차저', faction: '테르미니드', source: wiki('Charger_Behemoth'),
    main: main(3000, 4, 100, 25, 1000),
    note: '일반 차저보다 머리와 앞다리 장갑이 튼튼합니다. 같은 부위에 연속으로 맞히는 조건입니다.',
    parts: [
      part('head', '머리', 1600, 4, 100, 25, 70, false, 'kill', '정면 머리를 노리세요. 일반 차저의 탄수를 그대로 적용하지 마세요.'),
      part('butt', '후방 복부', 950, 0, 100, 25, 50, false, 'bleed', '뒤쪽 복부를 부수면 출혈이 시작됩니다. 장갑은 없지만 내구도가 높습니다.'),
      part('front-leg', '앞다리 장갑 → 살점', 1000, 4, 80, 25, 60, false, 'armor', '장갑 제거 후 같은 다리의 살점을 공격하세요.', { next: legFlesh() }),
    ],
  },
  {
    id: 'bile-titan', name: '바일 타이탄', faction: '테르미니드', source: wiki('Bile_Titan'),
    main: main(6500, 4, 100, 50),
    note: '담즙낭을 부수는 것과 처치는 다릅니다. 노출된 복부의 탄수에는 외피를 제거하는 공격이 포함되지 않습니다.',
    parts: [
      part('head', '머리', 1500, 4, 95, 50, 100, false, 'kill', '정면 머리를 정확히 맞히세요. 목이나 몸통에 맞은 탄은 이 계산에 포함되지 않습니다.'),
      part('sac', '담즙낭 한 개', 750, 0, 100, 50, 100, true, 'break', '아래쪽의 부푼 담즙낭입니다. 이 부위 하나의 파괴만으로 즉사하지 않습니다.'),
      part('underside', '노출된 복부', 4000, 2, 80, 0, 60, false, 'kill', '외피가 파괴되어 드러난 복부를 계속 공격하는 조건입니다.', { prerequisite: '복부 외피 제거 후', isolated: true }),
    ],
  },
  {
    id: 'hulk', name: '헐크 스코처', faction: '오토마톤', source: wiki('Hulk_Scorcher'),
    main: main(1800, 4, 60, 0),
    note: '화염방사기형 헐크 기준입니다. 눈은 폭발 피해를 받지 않으며, 후방 방열판 파괴 후에도 잠시 생존할 수 있습니다.',
    parts: [
      part('head', '정면의 붉은 눈', 250, 4, 25, 100, 100, true, 'kill', '작은 붉은 눈에 직접 맞혀야 합니다. 주변 얼굴 장갑에 맞는 것과 다릅니다.'),
      part('heatsink', '후방 방열판', 900, 1, 60, 0, 60, true, 'bleed', '뒤쪽 주황색 방열판을 쏘세요. 파괴 후 남은 추가 체력이 감소하며 죽습니다.', { constitution: 650 }),
    ],
  },
  {
    id: 'devastator', name: '데바스테이터 · 기본형', faction: '오토마톤', source: wiki('Devastator'),
    main: main(750, 2, 0, 0), note: '머리와 복부가 흉부보다 얇습니다. 로켓형·중장갑형의 장비와 방패는 포함하지 않습니다.',
    parts: [
      part('head', '머리', 110, 1, 0, 100, 100, true, 'kill', '흉부 위로 드러난 작은 얼굴을 노리세요.'),
      part('stomach', '복부', 350, 1, 0, 100, 100, true, 'kill', '가슴 장갑 아래 허리의 노출 부위를 노리세요.'),
      part('torso', '흉부 장갑', 425, 3, 30, 100, 100, true, 'kill', '넓어서 맞히기 쉽지만 머리·복부보다 높은 관통이 필요합니다.'),
    ],
  },
  {
    id: 'berserker', name: '버서커', faction: '오토마톤', source: wiki('Berserker'),
    main: main(750, 0, 0, 0), note: '작은 머리나 허리의 복부를 노리세요. 각 부위의 체력은 서로 별개입니다.',
    parts: [
      part('head', '머리', 110, 1, 0, 100, 100, true, 'kill', '접근하는 적의 작은 머리를 직접 맞히세요.'),
      part('stomach', '복부', 350, 1, 0, 100, 100, true, 'kill', '움직이는 머리를 맞히기 어렵다면 복부를 노리세요.'),
      part('chest', '흉부', 425, 2, 40, 100, 100, true, 'kill', '가슴은 내구도가 있어 표기 피해보다 적게 들어갑니다.'),
    ],
  },
  {
    id: 'overseer', name: '오버시어 · 지상형', faction: '일루미닛', source: wiki('Overseer'),
    main: main(600, 0, 0, 0),
    shield: { hp: 1500, armor: 2, label: '방패를 피해서 공격할 수 있음', note: '팔의 방패를 우회해 해당 부위를 직접 맞히는 조건입니다. 방패에 맞는 탄수는 포함하지 않습니다.' },
    note: '흉부는 장갑을 먼저 벗겨야 합니다. 방패가 사선을 가리고 있다면 아래의 직격 계산을 그대로 적용할 수 없습니다.',
    parts: [
      part('head', '머리·투구', 150, 3, 0, 100, 100, true, 'kill', '장갑 관통이 충분하면 투구를 쏘세요.'),
      part('chest-armor', '흉부 장갑 → 몸통', 150, 2, 0, 100, 20, false, 'armor', '흉부 장갑을 벗긴 뒤 같은 위치의 몸통을 쏘세요.', {
        next: part('torso', '노출된 몸통', 600, 1, 0, 100, 100, true, 'kill', '벗겨진 장갑 아래 몸통입니다.'),
      }),
    ],
  },
  {
    id: 'harvester', name: '하베스터', faction: '일루미닛', source: wiki('Harvester'),
    main: main(3000, 4, 70, 0),
    shield: { hp: 1500, armor: 0, label: '보호막이 이미 제거된 상태', note: '보호막은 강한 한 발도 흡수하고 다시 생성될 수 있습니다. 보호막 제거에 쓴 탄수는 아래 계산에서 제외합니다.' },
    note: '다리와 몸통을 잇는 가로 관절이 치명 부위입니다. 눈은 파괴해도 생존하며 빔 공격이 강해질 수 있습니다.',
    parts: [
      part('joint', '오른쪽·중앙 고관절 한 곳', 1000, 3, 70, 100, 60, true, 'kill', '몸통 바로 아래, 다리가 시작되는 가로 연결부 한 곳에 집중하세요.'),
      part('left-joint', '왼쪽 고관절', 1000, 3, 70, 100, 45, true, 'kill', '왼쪽 연결부도 파괴하면 죽습니다. 본체로 전달되는 피해 비율은 다릅니다.'),
      part('eye', '눈', 350, 2, 0, 100, 120, false, 'break', '눈 파괴 자체는 즉사가 아닙니다. 강한 탄의 초과 피해로 본체 체력을 소진하면 처치할 수 있습니다.'),
      part('generator', '보호막 생성기 한 개', 350, 3, 0, 100, 10, true, 'break', '눈 위아래의 돌출 부위를 하나 파괴하면 보호막 재생을 막을 수 있습니다.'),
    ],
  },
  hunter('hunter', '헌터 · 난이도 1–3', 130, 45),
  hunter('hunter-hardened', '헌터 · 난이도 4 이상', 160, 60),
  warrior('warrior', '워리어 · 난이도 1–3', 250, 110, 75),
  warrior('warrior-hardened', '워리어 · 난이도 4 이상', 325, 150, 100),
  {
    id: 'hive-guard', name: '하이브 가드', faction: '테르미니드', source: wiki('Hive_Guard'), sourceRevision: 135085,
    main: main(500, 2, 30, 0),
    note: '머리 장갑은 3, 노출된 사지는 1입니다. 머리 파괴 후에도 출혈 중 공격할 수 있습니다. 사지 한쪽의 파괴를 처치와 구분합니다.',
    parts: [
      part('head', '머리 장갑', 250, 3, 35, 100, 75, false, 'bleed', '정면의 넓은 머리 장갑을 뚫으려면 AP 3 이상이 필요합니다.', { constitution: 200 }),
      part('claw', '앞발 한쪽', 100, 1, 0, 100, 25, false, 'break', '머리 아래의 노출된 앞발을 맞히세요. 장갑판에 빗맞으면 관통 조건이 달라집니다.'),
      part('rear-leg', '뒷다리 한쪽', 125, 1, 0, 100, 35, false, 'break', '옆이나 뒤에서 장갑으로 가리지 않은 뒷다리를 노리세요.'),
    ],
  },
  {
    id: 'brood-commander', name: '브루드 커맨더', faction: '테르미니드', source: wiki('Brood_Commander'), sourceRevision: 135088,
    main: main(800, 2, 60, 0),
    note: '기본 브루드 커맨더 기준이며 알파 커맨더와 다릅니다. 머리를 잃어도 출혈이 끝나기 전까지 돌진할 수 있습니다.',
    parts: [
      part('head', '머리', 200, 2, 60, 100, 50, false, 'bleed', '머리가 떨어져도 즉시 멈추지 않습니다. 출혈이 끝날 때까지 접근을 피하세요.', { constitution: 300 }),
      part('claw', '앞발 한쪽', 200, 2, 50, 100, 50, false, 'break', '몸 앞의 큰 앞발 하나에 집중하는 계산입니다.'),
      part('leg', '다리 한쪽', 170, 1, 40, 100, 60, false, 'break', '장갑이 얇은 옆 다리를 노려 이동과 돌진 속도를 낮추세요.'),
    ],
  },
  spewer('bile-spewer', '바일 스퓨어 · 난이도 3–5', 'Bile_Spewer', 2, '난이도 6 미만의 바일 스퓨어 기준입니다. 머리는 장갑 2이며 입과 후방 복부는 장갑이 없습니다.', 135087, 'bile-spewer'),
  spewer('bile-spewer-armored', '바일 스퓨어 · 난이도 6 이상', 'Bile_Spewer', 3, '난이도 6부터 본체·머리 등의 장갑이 3으로 증가합니다. 입과 후방 복부의 수치는 그대로입니다.', 135087, 'bile-spewer'),
  spewer('nursing-spewer', '너싱 스퓨어', 'Nursing_Spewer', 2, '노란 복부의 너싱 스퓨어 기준입니다. 고난도 바일 스퓨어의 장갑 수치를 적용하지 않습니다.', 135086),
  {
    id: 'stalker', name: '스토커', faction: '테르미니드', source: wiki('Stalker'), sourceRevision: 135091,
    main: main(800, 1, 50, 0),
    note: '작은 머리의 체력이 낮습니다. 아래 탄수는 회복할 틈 없이 같은 부위를 연속으로 맞히는 조건이며, 도주 중 체력 회복은 포함하지 않습니다.',
    parts: [
      part('head', '머리', 175, 1, 0, 100, 100, true, 'kill', '위장 상태에서도 몸 중앙 앞쪽의 작은 머리를 노리세요.'),
      part('body-armor', '몸통 외피', 800, 2, 50, 100, 100, true, 'break', '넓은 몸통 외피입니다. 이 부위는 본체 체력을 공유하며, 머리보다 많은 피해가 필요합니다.'),
      part('underbelly', '아래쪽 복부', 800, 1, 50, 100, 100, true, 'kill', '몸 아래쪽의 얇은 복부를 직접 맞히세요. 위쪽 외피와 장갑 수치가 다릅니다.'),
    ],
  },
  {
    id: 'impaler', name: '임페일러', faction: '테르미니드', source: wiki('Impaler'), sourceRevision: 135095,
    main: main(4000, 4, 100, 0),
    note: '촉수를 땅에 박으면 머리가 드러납니다. 얼굴 노출과 다리 장갑 제거를 구분하며, 촉수 하나의 파괴와 본체 처치도 구분합니다.',
    parts: [
      part('head', '노출된 머리', 1250, 1, 75, 0, 150, false, 'kill', '촉수를 땅에 박았을 때 드러나는 얼굴을 맞히세요. 평소 앞을 덮는 촉수 장갑과 다른 부위입니다.', { prerequisite: '얼굴 노출 중', prerequisiteNote: '촉수를 땅에 박아 얼굴이 드러난 동안의 탄수입니다. 얼굴이 가려져 있으면 이 결과를 적용하지 않습니다.' }),
      part('leg-armor', '다리 장갑 → 살점', 1000, 4, 70, 0, 50, false, 'armor', '다리 하나의 장갑을 벗긴 뒤 같은 위치의 살점을 맞히세요.', { next: part('leg-flesh', '노출된 다리 살점', 1000, 0, 70, 0, 50, false, 'kill', '장갑을 벗긴 바로 그 다리입니다.') }),
      part('tentacle', '촉수 살점 한 개', 500, 1, 70, 0, 50, false, 'break', '사진에서 색으로 표시한 촉수 살점 한 가닥을 맞히는 조건입니다. 딱딱한 바깥 장갑과 구분하세요.'),
    ],
  },
  {
    id: 'shrieker', name: '슈리커', faction: '테르미니드', source: wiki('Shrieker'), sourceRevision: 135081,
    main: main(80, 0, 0, 0),
    note: '머리 또는 날개 한쪽을 파괴하면 추락합니다. 날개는 체력은 낮지만 내구도가 100%입니다. 떨어지는 사체도 피하세요.',
    parts: [
      part('head', '머리', 30, 0, 0, 100, 100, true, 'kill', '날개 사이의 작은 머리를 노리세요.'),
      part('wing', '날개 한쪽', 20, 0, 100, 100, 30, true, 'kill', '좌우 중 한쪽 날개에 직접 맞히세요. 날개의 내구 피해 기준으로 계산합니다.'),
    ],
  },
  {
    id: 'rocket-devastator', name: '로켓 데바스테이터', faction: '오토마톤', source: wiki('Rocket_Devastator'), sourceRevision: 135121,
    main: main(750, 2, 0, 0),
    note: '머리·복부는 치명 부위입니다. 어깨 로켓 포드 파괴는 무장 제거이며 즉사와 다릅니다.',
    parts: [
      part('head', '머리', 110, 1, 0, 100, 100, true, 'kill', '어깨 로켓 포드 사이의 작은 얼굴을 직접 맞히세요.'),
      part('stomach', '복부', 350, 1, 0, 100, 100, true, 'kill', '가슴 장갑 아래의 얇은 허리를 노리세요.'),
      part('rocket-pod', '로켓 포드', 300, 1, 100, 100, 30, true, 'break', '어깨 위 로켓 발사 장치입니다. 발사 장치를 부숴도 적은 살아 있을 수 있습니다.'),
    ],
  },
  {
    id: 'heavy-devastator', name: '헤비 데바스테이터', faction: '오토마톤', source: wiki('Heavy_Devastator'), sourceRevision: 135122,
    main: main(750, 2, 0, 0),
    shield: { hp: 800, armor: 4, label: '방패에 가리지 않은 부위를 조준', note: '방패를 피해서 머리·복부·배낭에 직접 맞히는 조건입니다. 방패 파괴 탄수와 방패를 통한 폭발은 포함하지 않습니다.' },
    note: '방패 자체에 맞은 탄은 아래 부위의 직격 피해가 아닙니다. 작은 얼굴이나 측면·후방에서 드러나는 배낭을 노리세요.',
    parts: [
      part('head', '머리', 110, 1, 0, 100, 100, true, 'kill', '방패 위로 노출된 작은 얼굴을 맞히세요.'),
      part('stomach', '복부', 350, 1, 0, 100, 100, true, 'kill', '방패가 내려가거나 옆으로 돌아 복부가 실제로 보이는 때만 적용합니다.'),
      part('backpack', '배낭', 600, 2, 0, 100, 40, true, 'kill', '뒤나 옆에서 커다란 배낭을 맞히세요. 배낭 파괴는 치명 판정입니다.'),
    ],
  },
  {
    id: 'scout-strider', name: '스카우트 스트라이더', faction: '오토마톤', source: wiki('Scout_Strider'), sourceRevision: 135123,
    main: main(500, 4, 0, 0),
    note: '후방이 열린 기본형입니다. 조종사와 보행 기체는 별도 체력이며, 조종사 머리 계산에는 조종사 체력 125를 적용합니다.',
    parts: [
      part('pilot-head', '노출된 조종사 머리', 40, 0, 0, 100, 100, true, 'kill', '뒤로 돌아가거나 높은 곳에서 드러난 조종사의 머리를 직접 맞히세요. 사진은 같은 조종사 모델의 머리 위치입니다.', { main: { ...main(125, 0, 0, 50), name: '조종사' } }),
      part('waist', '허리 연결부', 300, 3, 0, 100, 100, true, 'kill', '정면 장갑판 아래, 두 다리 위의 연결부를 맞히세요.'),
      part('leg', '다리 한쪽', 400, 2, 75, 0, 50, true, 'kill', '다리 하나를 계속 맞혀 보행 기체를 무너뜨리세요. 양쪽에 피해를 나누지 않는 조건입니다.'),
    ],
  },
  {
    id: 'reinforced-strider', name: '강화 스카우트 스트라이더', faction: '오토마톤', source: wiki('Reinforced_Scout_Strider'), sourceRevision: 135124,
    main: main(500, 4, 0, 0),
    note: '조종석이 막힌 강화형입니다. 위키에 로켓 유폭의 즉사 판정 오류가 기재되어 있어 로켓은 탄수 계산에서 제외합니다.',
    parts: [
      part('turret-system', '포탑 연결부', 300, 3, 0, 100, 100, true, 'kill', '조종석과 하부 보행 장치 사이의 회전 연결부를 맞히세요.'),
      part('waist', '허리', 300, 3, 0, 100, 100, true, 'kill', '큰 정면 장갑판 아래의 허리를 노리세요. AP 3 이상으로 관통합니다.'),
      part('leg', '다리 한쪽', 400, 2, 75, 0, 50, true, 'kill', '같은 다리 하나를 집중 공격하세요. 장갑은 2지만 내구도가 높습니다.'),
    ],
  },
  {
    id: 'gunship', name: '건십', faction: '오토마톤', source: wiki('Gunship'), sourceRevision: 135132,
    main: main(950, 3, 0, 0),
    note: '추진기 하나를 파괴하면 격추합니다. 앞뒤 추진기는 체력이 같지만 내구도가 다릅니다. 동체와 여러 추진기에 나눠 맞힌 경우는 계산하지 않습니다.',
    parts: [
      part('front-thruster', '앞 추진기 한 개', 400, 3, 85, 0, 0, true, 'kill', '동체 앞쪽 추진기 한 개에 집중하세요. 다른 추진기에 맞힌 피해는 합산하지 않습니다.'),
      part('rear-thruster', '뒤 추진기 한 개', 400, 3, 80, 0, 0, true, 'kill', '뒤쪽 추진기는 내구도가 조금 낮습니다. 사진에서 표시한 추진기 하나를 계속 맞히세요.'),
      part('fuselage', '동체', 950, 3, 100, 100, 100, true, 'kill', '가운데 큰 기체 몸통입니다. 내구도 100%를 적용하며 폭발은 관통 조건에 따라 본체로 전달합니다.'),
    ],
  },
  {
    id: 'annihilator-tank', name: '어나이얼레이터 탱크', faction: '오토마톤', source: wiki('Annihilator_Tank'), sourceRevision: 135129,
    main: main(4000, 5, 100, 0),
    note: '포탑 체력 2,100과 차체 체력 4,000을 따로 계산합니다. 포탑 뒤의 방열판과 차체 뒤의 엔진실도 서로 다른 부위입니다.',
    parts: [
      part('turret-front', '포탑 정면', 2100, 5, 100, 100, 100, true, 'kill', '위쪽 포탑의 정면 장갑을 맞히는 조건입니다. 아래 차체의 체력과 합산하지 않습니다.', { main: { ...main(2100, 5, 100, 0), name: '포탑' } }),
      part('heatsink', '포탑 후방 방열판', 750, 3, 100, 0, 200, true, 'kill', '위쪽 포탑 뒤의 빛나는 방열판을 노리세요. 차체 아래쪽 엔진실보다 장갑이 얇습니다.', { main: { ...main(2100, 5, 100, 0), name: '포탑' } }),
      part('hull-front', '차체 정면', 4000, 5, 100, 35, 100, false, 'kill', '궤도 사이의 아래쪽 차체 정면입니다. 포탑보다 본체 체력이 많습니다.'),
      part('engine', '차체 후방 엔진실', 1500, 4, 100, 50, 150, false, 'kill', '뒤로 돌아가 차체 뒤의 엔진실을 맞히세요. 위쪽 포탑 방열판과 구분합니다.'),
    ],
  },
  voteless('voteless-light', '보트리스 · 경량형', 100, 40, 50),
  voteless('voteless-medium', '보트리스 · 중간형', 130, 50, 50),
  voteless('voteless-heavy', '보트리스 · 중량형', 160, 60, 65),
  {
    id: 'watcher', name: '와처', faction: '일루미닛', source: wiki('Watcher'), sourceRevision: 135178,
    main: main(600, 0, 0, 0),
    note: '몸통이 치명 부위입니다. 눈이나 지느러미 하나를 파괴하는 것만으로는 죽지 않으며, 추가 피해가 본체를 소진한 경우에만 처치로 표시합니다.',
    parts: [
      part('body', '몸통', 400, 2, 0, 100, 100, true, 'kill', '눈 주변의 둥근 기체 몸통을 노리세요. 중앙을 안정적으로 맞히는 것이 중요합니다.'),
      part('eye', '눈', 300, 0, 0, 100, 100, true, 'break', '앞쪽 눈입니다. 눈의 장갑은 없지만 눈 파괴 자체는 즉사가 아닙니다.'),
      part('upper-fin', '위쪽 지느러미', 200, 0, 0, 100, 100, true, 'break', '몸 위로 돌출된 지느러미 하나입니다. 이 부위만 부수고 사격을 멈추면 살아 있을 수 있습니다.'),
    ],
  },
  {
    id: 'elevated-overseer', name: '엘리베이티드 오버시어 · 비행형', faction: '일루미닛', source: wiki('Elevated_Overseer'), sourceRevision: 135189,
    main: main(450, 0, 0, 0),
    note: '비행형은 지상형과 체력·머리 장갑이 다릅니다. 제트팩 파괴는 즉사이며, 흉부는 장갑을 벗긴 뒤 몸통에 후속탄을 맞힙니다.',
    parts: [
      part('head', '머리·투구', 200, 2, 0, 100, 100, true, 'kill', '날아다니는 적의 작은 투구를 직접 맞히세요. 지상형보다 머리 장갑이 낮습니다.'),
      part('jetpack', '등의 제트팩', 300, 2, 0, 100, 50, true, 'kill', '옆이나 뒤에서 등에 달린 제트팩을 노리세요. 파괴 때 주변에 폭발 피해를 줄 수 있습니다.'),
      part('chest-armor', '흉부 장갑 → 몸통', 150, 2, 0, 100, 20, false, 'armor', '흉부 장갑을 벗긴 뒤 같은 위치를 계속 맞히세요. 본체 체력 450에 전달된 피해도 함께 계산합니다.', { next: part('torso', '노출된 몸통', 600, 1, 0, 100, 100, true, 'kill', '위키 부위 표의 몸통 체력은 600이며, 그 전에 별도 본체 체력 450이 소진되면 처치입니다.') }),
    ],
  },
];

export const enemyTypeCount = new Set(enemies.map(enemy => enemy.family || enemy.id)).size;

const shot = (id, name, standard, durable, ap, explosion = 0, explosionAp = 0, extra = {}) => ({ id, name, standard, durable, ap, explosion, explosionAp, ...extra });
const profile = (page, modes, note = '') => ({ source: wiki(page), modes, note });
export const weaponProfiles = {
  'autocannon': profile('AC-8_Autocannon', [
    shot('aphet', '철갑고폭예광탄(APHET)', 325, 260, 4, 150, 3, { falloff: true }),
    { id: 'flak', name: '대공포탄 모드', unsupported: '근접 신관과 파편의 명중 수에 따라 피해가 크게 달라져 고정 탄수를 계산하지 않습니다.' },
  ]),
  'anti-materiel': profile('Anti-Material_Rifle', [shot('standard', '기본 사격', 450, 225, 4, 0, 0, { falloff: true })], '헐크 눈은 근거리 이론값으로 1발이어도, 거리 감쇠가 생기면 2발 이상 필요할 수 있습니다.'),
  'machine-gun': profile('MG-43_Machine_Gun', [shot('standard', '기본 사격', 90, 23, 3, 0, 0, { falloff: true })]),
  'stalwart': profile('M-105_Stalwart', [shot('standard', '기본 사격', 90, 22, 2, 0, 0, { falloff: true })]),
  'heavy-machine-gun': profile('MG-206_Heavy_Machine_Gun', [shot('standard', '기본 사격', 150, 35, 4, 0, 0, { falloff: true })]),
  'maxigun': profile('M-1000_Maxigun', [shot('standard', '기본 사격', 80, 18, 3, 0, 0, { falloff: true })]),
  'bullet-storm': profile('MGX-42', [shot('standard', '기본 사격', 100, 25, 2, 0, 0, { falloff: true })]),
  'expendable-at': profile('EAT-17_Expendable_Anti-Tank', [shot('standard', '대전차탄', 2000, 2000, 6, 150, 3)]),
  'quasar': profile('LAS-99_Quasar_Cannon', [shot('standard', '충전 사격', 2000, 2000, 6, 150, 3)]),
  'commando': profile('MLS-4X_Commando', [shot('standard', '미사일 1발', 1100, 1100, 6, 150, 3)], '유도한 미사일이 선택한 부위에 직접 명중하는 조건입니다.'),
  'recoilless': profile('Recoilless', [
    shot('heat', '대전차 고폭탄(HEAT)', 3200, 3200, 6, 150, 3),
    shot('he', '고폭탄(HE)', 750, 750, 5, 800, 4),
  ]),
  'railgun': profile('Railgun', [
    shot('safe', '안전 모드 · 기본 충전', 600, 225, 5, 0, 0, { falloff: true }),
    shot('unsafe-max', '불안전 모드 · 최대 피해 충전', 1500, 562, 5, 0, 0, { falloff: true }),
  ], '최대 충전의 내구 피해는 위키 세부 표의 562를 사용합니다. 충전이 덜 되면 피해가 줄며, 과충전 자폭은 탄의 폭발 피해에 포함하지 않습니다.'),
};

export const unsupportedWeapons = {
  'flamethrower': '불길의 접촉 시간과 화상 지속 피해가 필요해 탄수로 환산하지 않습니다.',
  'cremator': '불길의 접촉 시간과 화상 지속 피해가 필요해 탄수로 환산하지 않습니다.',
  'laser-cannon': '광선의 접촉 시간과 화상을 따로 계산해야 하므로 발 단위 계산을 지원하지 않습니다.',
  'airburst-launcher': '자탄의 명중 개수와 폭발 위치가 달라 고정 탄수를 계산하지 않습니다.',
  'wasp': '유도 모드별 명중 부위와 연속 폭발 조건을 아직 검증하지 않았습니다.',
  'arc-thrower': '전격이 실제로 선택하는 부위와 연쇄 조건을 아직 검증하지 않았습니다.',
  'spear': '자동 유도의 실제 명중 부위를 사용자가 정확히 지정할 수 없어 부위별 탄수를 제공하지 않습니다.',
  'sterilizer': '가스의 지속 시간과 대상별 피해 조건이 필요합니다.',
  'speargun': '작살의 직격과 가스 지속 피해를 함께 계산하는 조건을 아직 검증하지 않았습니다.',
};
