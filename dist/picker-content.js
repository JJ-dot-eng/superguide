import { enemies, weaponProfiles } from './combat-data.js?v=meltagun-1';
import { structures } from './demolition-data.js?v=explosive-weapons-1';
import { pickerEnemyImages, pickerStructureImages } from './selector-images.js?v=faction-icons-1';

export function pickerConfigs({ stratagems, categories, wikiIcons }) {
  const weapons = stratagems.map(item => ({ ...item, image: { ...wikiIcons[item.id], kind: 'stratagem' }, group: categories.find(category => category.id === item.category).name }));
  const all = name => ({ id: 'all', name, group: '', caption: '전체 보기' });
  return [
    { id: 'combat-enemy', title: '적 유닛', items: enemies.map(item => ({ ...item, group: item.faction, image: pickerEnemyImages[item.id], caption: item.id.startsWith('voteless-') ? '체형 구분 · 공통 이미지' : item.faction })) },
    { id: 'combat-weapon', title: '지원 무기', items: [true, false].flatMap(supported => weapons.filter(item => item.category === 'support' && Boolean(weaponProfiles[item.id]) === supported).map(item => ({ ...item, group: supported ? '계산 지원' : '정밀 계산 미지원' }))) },
    { id: 'demolition-structure', title: '건물·시설', items: [all('모든 건물'), ...structures.map(item => ({ ...item, group: item.faction, image: pickerStructureImages[item.id], caption: pickerStructureImages[item.id].note || item.faction }))] },
    { id: 'demolition-weapon', title: '스트라타젬', items: [all('모든 스트라타젬'), ...categories.filter(category => category.id !== 'all').flatMap(category => weapons.filter(item => item.category === category.id))] },
  ];
}
