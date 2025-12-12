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
    dungeonThreshold: 15,
    logColor: '#2ecc71',
    enemyPool: ['gobelin','loup','slime', 'pebble', 'wyrm', 'hydre'],
    dungeons: [
      { id: 'forest_depths_1', name: 'Profondeurs', floors: 5, bossTemplateId: 'wyrm' },
      { id: 'forest_cavern_1', name: 'Cavernes', floors: 5, bossTemplateId: 'ogre' },
    ],
  },
  {
    id: 'caves',
    name: 'Grottes',
    theme: 'cave',
    dungeonThreshold: 15,
    logColor: '#95a5a6',
    enemyPool: ['slime','brigand','spectre','bandit', 'ogre', 'magma', 'seigneur', 'dragon'],
    dungeons: [
      { id: 'caves_echo_1', name: 'Échos', floors: 5, bossTemplateId: 'magma' },
      { id: 'caves_depth_2', name: 'Abysses', floors: 5, bossTemplateId: 'ogre' },
    ],
  },
  {
    id: 'ruins',
    name: 'Ruines',
    theme: 'ruins',
    dungeonThreshold: 15,
    logColor: '#9b59b6',
    enemyPool: ['brigand','wyrm','ogre', 'spectre', 'golem', 'chimere', 'leviathan'],
    dungeons: [
      { id: 'ruins_halls_1', name: 'Salles anciennes', floors: 5, bossTemplateId: 'wyrm' },
      { id: 'ruins_depths_2', name: 'Souterrains', floors: 5, bossTemplateId: 'golem' },
    ],
  },
  {
    id: 'craters_scars',
    name: 'Cratères des Fléaux',
    theme: 'scars',
    dungeonThreshold: 15,
    logColor: '#e74c3c',
    enemyPool: ['ogre','magma','wyrm','spectre', 'seigneur', 'troll_cavernes', 'phoenix'],
    dungeons: [
      { id: 'scars_delve_1', name: 'Souterrain du Fléau', floors: 5, bossTemplateId: 'seigneur' },
      { id: 'scars_core_1', name: 'Noyau', floors: 5, bossTemplateId: 'seigneur' },
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
  if (!map) return undefined;
  // Strict: only choose from the map's `enemyPool`. No fallback allowed.
  if (Array.isArray(map.enemyPool) && map.enemyPool.length > 0) {
    const poolTemplates = ENEMY_TEMPLATES.filter((t) => map.enemyPool.includes(t.templateId));
    if (poolTemplates.length > 0) {
      const chosen = poolTemplates[Math.floor(Math.random() * poolTemplates.length)].templateId;
      try { console.log('[DEBUG] pickEnemyFromMap - chose from enemyPool (STRICT)', { mapId, chosen, poolTemplates: poolTemplates.map(p=>p.templateId) }); } catch(e) {}
      return chosen;
    }
    try { console.log('[DEBUG] pickEnemyFromMap - enemyPool defined but no templates found', { mapId, pool: map.enemyPool }); } catch(e) {}
    return undefined;
  }

  try { console.log('[DEBUG] pickEnemyFromMap - no enemyPool for map, returning undefined', { mapId }); } catch(e) {}
  return undefined;
}

export default { getMaps, getMapById, createMap, pickEnemyFromMap };
