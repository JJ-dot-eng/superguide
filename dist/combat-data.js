// Reviewed Wiki Anatomy and Detailed Weapon Statistics tables, 2026-09-16.
// Direct pages returned 403; numeric tables were read through the search index.
// Percentages below use 0–100. Unknown mechanics are not replaced with zero.
export const combatCheckedAt = '2026-09-16';
export const damageSource = 'https://helldivers.wiki.gg/wiki/Damage';
const wiki = page => `https://helldivers.wiki.gg/wiki/${page}`;
const main = (hp, armor, durability, exdr, constitution = 0) => ({ hp, armor, durability, exdr, constitution });
const part = (id, name, hp, armor, durability, exdr, toMain, overflowCap, effect, tip, extra = {}) => ({ id, name, hp, armor, durability, exdr, toMain, overflowCap, effect, tip, ...extra });
const legFlesh = () => part('leg-flesh', '노출된 다리 살점', 800, 2, 70, 25, 50, false, 'kill', '장갑을 벗긴 같은 다리에 계속 맞히세요.');

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
];

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
