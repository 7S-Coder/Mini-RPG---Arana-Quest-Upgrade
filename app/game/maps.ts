import { ENEMY_TEMPLATES } from "./enemies";

export type MapTemplate = {
  id: string;
  name: string;
  theme?: string;
  logColor?: string;
  enemyPool: string[];
  dungeon?: { floors: number; bossTemplateId?: string } | null;
};

const defaultMaps: MapTemplate[] = [
  { id: 'forest', name: 'Forêt', theme: 'forest', logColor: '#2ecc71', enemyPool: ['gobelin','loup','slime'], dungeon: null },
  { id: 'caves', name: 'Grottes', theme: 'cave', logColor: '#95a5a6', enemyPool: ['slime','brigand','spectre','bandit'], dungeon: null },
  { id: 'ruins', name: 'Ruines', theme: 'ruins', logColor: '#9b59b6', enemyPool: ['brigand','wyrm','ogre'], dungeon: null },
  { id: 'dungeon_final', name: 'Donjon du Fléau', theme: 'dungeon', logColor: '#e74c3c', enemyPool: ['ogre','golem','wyrm','spectre'], dungeon: { floors: 3, bossTemplateId: 'seigneur' } },
];

let customMaps: MapTemplate[] = [];

export function getMaps() {
  return [...defaultMaps, ...customMaps];
}

export function getMapById(id?: string) {
  if (!id) return null;
  return getMaps().find((m) => m.id === id) || null;
}

export function createMap(payload: Omit<MapTemplate, 'id'>) {
  const id = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_' + (Date.now() % 10000);
  const map = { id, ...payload } as MapTemplate;
  customMaps.push(map);
  return map;
}

export function pickEnemyFromMap(mapId?: string) {
  const map = getMapById(mapId);
  if (!map || !map.enemyPool || map.enemyPool.length === 0) return ENEMY_TEMPLATES[Math.floor(Math.random()*ENEMY_TEMPLATES.length)].templateId;
  return map.enemyPool[Math.floor(Math.random()*map.enemyPool.length)];
}

export default { getMaps, getMapById, createMap, pickEnemyFromMap };
