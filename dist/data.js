import { support } from './data-support.js';
import { orbitals, eagles } from './data-offense.js';
import { backpacks, defense, vehicles } from './data-equipment.js';
import { missions } from './data-mission.js';

export const checkedAt = '2026-09-16';
export const categories = [
  { id: 'all', name: '전체 스트라타젬', icon: 'grid', label: 'ALL STRATAGEMS', description: '임무에 맞는 화력을 찾아보세요.' },
  { id: 'support', name: '지원 무기', icon: 'crosshair', label: 'SUPPORT WEAPON', description: '직접 들고 싸우는 세 번째 화력.' },
  { id: 'orbital', name: '궤도 지원', icon: 'orbit', label: 'ORBITAL', description: '슈퍼 구축함에서 내려오는 결정적인 한 수.' },
  { id: 'eagle', name: '이글 공중 지원', icon: 'eagle', label: 'EAGLE', description: '짧은 간격으로 호출하는 근접 항공 지원.' },
  { id: 'defense', name: '센트리 · 설치물', icon: 'defense', label: 'EMPLACEMENT', description: '진입로를 막고, 거점을 지키는 화력.' },
  { id: 'backpack', name: '배낭', icon: 'backpack', label: 'BACKPACK', description: '생존, 기동, 보급을 책임지는 한 칸.' },
  { id: 'vehicle', name: '차량 · 엑소슈트', icon: 'vehicle', label: 'VEHICLE', description: '탑승해서 운용하는 기동 장비와 중화기.' },
  { id: 'mission', name: '공용 · 임무', icon: 'flag', label: 'MISSION', description: '분대 보급부터 임무 목표까지.' },
];
const groups = { support, orbital: orbitals, eagle: eagles, defense, backpack: backpacks, vehicle: vehicles, mission: missions };
const records = Object.entries(groups).flatMap(([category, items]) => items.map(item => ({
  category,
  direct: null,
  splash: null,
  ap: null,
  range: null,
  radius: null,
  rangeLabel: '미확인',
  rangeNoteShort: '사거리 수치 미확인',
  verified: true,
  source: `https://helldivers.wiki.gg/wiki/${item.en.replaceAll(' ', '_')}`,
  ...item,
})));

// The opening row illustrates three different categories; each category retains its own order.
const opening = ['orbital-precision', 'eagle-500kg', 'autocannon'];
export const stratagems = [
  ...opening.map(id => records.find(item => item.id === id)),
  ...records.filter(item => !opening.includes(item.id)),
];
