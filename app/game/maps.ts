import { ENEMY_TEMPLATES } from "./enemies";

export type DungeonDef = {
  id: string;
  name?: string;
  floors: number;
  bossTemplateId?: string;
};

export type MapTemplate = {
  id: string;
  name: string;
  theme?: string;
  logColor?: string;
  dungeonThreshold?: number;
  enemyPool: string[];
  dungeons?: DungeonDef[]; // maps may contain multiple dungeons
};

const defaultMaps: MapTemplate[] = [
  {
    id: 'forest',
    name: 'Forêt',
    theme: 'forest',
    dungeonThreshold: 2,
    logColor: '#2ecc71',
    enemyPool: ['gobelin','loup','slime'],
    dungeons: [
      { id: 'forest_depths_1', name: 'Profondeurs', floors: 5, bossTemplateId: 'wyrm' },
      { id: 'forest_cavern_1', name: 'Cavernes', floors: 5, bossTemplateId: 'ogre' },
    ],
  },
  {
    id: 'caves',
    name: 'Grottes',
    theme: 'cave',
    dungeonThreshold: 2,
    logColor: '#95a5a6',
    enemyPool: ['slime','brigand','spectre','bandit'],
    dungeons: [
      { id: 'caves_echo_1', name: 'Échos', floors: 5, bossTemplateId: 'golem' },
      { id: 'caves_depth_2', name: 'Abysses', floors: 5, bossTemplateId: 'ogre' },
    ],
  },
  {
    id: 'ruins',
    name: 'Ruines',
    theme: 'ruins',
    dungeonThreshold: 2,
    logColor: '#9b59b6',
    enemyPool: ['brigand','wyrm','ogre'],
    dungeons: [
      { id: 'ruins_halls_1', name: 'Salles anciennes', floors: 5, bossTemplateId: 'wyrm' },
      { id: 'ruins_depths_2', name: 'Souterrains', floors: 5, bossTemplateId: 'golem' },
    ],
  },
  {
    id: 'dungeon_final',
    name: 'Donjon du Fléau',
    theme: 'dungeon',
    dungeonThreshold: 2,
    logColor: '#e74c3c',
    enemyPool: ['ogre','golem','wyrm','spectre'],
    dungeons: [
      { id: 'flaw_delve_1', name: 'Souterrain du Fléau', floors: 5, bossTemplateId: 'seigneur' },
      { id: 'flaw_core_1', name: 'Noyau', floors: 5, bossTemplateId: 'seigneur' },
    ],
  },
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
