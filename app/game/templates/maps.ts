import { ENEMY_TEMPLATES } from "./enemies";

export type DungeonDef = {
  id: string;
  name?: string;
  floors: number;
  requiredLevel?: number;
  bossTemplateId?: string;
};

export type RoomDef = {
  id: string;
  name?: string;
  // optional fixed enemy list for this room (deterministic encounters)
  enemyPool?: string[];
  // if true, this room is considered a boss room
  isBossRoom?: boolean;
};

export type MapTemplate = {
  id: string;
  name: string;
  theme?: string;
  logColor?: string;
  dungeonThreshold?: number;
  // minimum level allowed on this map (inclusive). If absent, map has no minimum.
  minLevel?: number;
  // allowed item tiers that may drop on this map (controls rarity visibility)
  allowedTiers?: string[];
  // human-friendly loot label for UI (example: "loot epic - rare")
  loot?: string;
  enemyPool: string[];
  // optional explicit rooms (fixed encounters) inside this map
  rooms?: RoomDef[];
  dungeons?: DungeonDef[]; // maps may contain multiple dungeons
};

const defaultMaps: MapTemplate[] = [
  {
    id: 'forest',
    name: 'Forest',
    theme: 'forest',
    dungeonThreshold: 15,
    minLevel: 10,
    allowedTiers: ['common'],
    loot: 'loot: Common',
    logColor: '#2ecc71',
    enemyPool: ['gobelin','loup','slime', 'pebble', 'wyrm', 'wyrm_king', 'hydre', 'monocle'],
    dungeons: [
      { id: 'forest_depths_1', name: 'Depths', floors: 5, bossTemplateId: 'wyrm' },
      { id: 'forest_cavern_1', name: 'Caverns', floors: 5, bossTemplateId: 'monocle' },
      
    ],
      // Example fixed rooms for the `forest` map — each room id follows the pattern
      // <dungeonId>_floor_<n>. When a dungeon is active, the game will attempt to
      // pick an enemy from the corresponding room (deterministic encounters).
      rooms: [
        { id: 'forest_depths_1_floor_5', name: 'Shallow Thicket', enemyPool: ['gobelin','slime'] },
        { id: 'forest_depths_1_floor_4', name: 'Old Clearing', enemyPool: ['gobelin','loup'] },
        { id: 'forest_depths_1_floor_3', name: 'Moss Hall', enemyPool: ['slime','pebble'] },
        { id: 'forest_depths_1_floor_2', name: 'Rooted Pass', enemyPool: ['loup','pebble'] },
        { id: 'forest_depths_1_floor_1', name: 'Wyrm Lair', enemyPool: ['wyrm_king'], isBossRoom: true },

        { id: 'forest_cavern_1_floor_5', name: 'Gloomy Grotto', enemyPool: ['slime','gobelin'] },
        { id: 'forest_cavern_1_floor_4', name: 'Damp Tunnel', enemyPool: ['pebble','loup'] },
        { id: 'forest_cavern_1_floor_3', name: 'Echoing Chamber', enemyPool: ['gobelin','pebble'] },
        { id: 'forest_cavern_1_floor_2', name: 'Stalagmite Path', enemyPool: ['loup','slime'] },
        { id: 'forest_cavern_1_floor_1', name: 'Monocle', enemyPool: ['monocle'], isBossRoom: true },
      ],
  },
  {
    id: 'caves',
    name: 'Caves',
    theme: 'cave',
    dungeonThreshold: 15,
    minLevel: 31,
    allowedTiers: ['common', 'rare'],
    loot: 'loot: Common - Rare ',
    logColor: '#95a5a6',
    enemyPool: ['slime','brigand','spectre','bandit', 'ogre', 'magma', 'seigneur', 'dragon'],
    dungeons: [
      { id: 'caves_echo_1', name: 'Echoes', floors: 5, bossTemplateId: 'magma' },
      { id: 'caves_depth_2', name: 'Abyss', floors: 5, bossTemplateId: 'ogre' },
    ],
  },
  {
    id: 'ruins',
    name: 'Ruins',
    theme: 'ruins',
    dungeonThreshold: 15,
    minLevel: 51,
    allowedTiers: ['rare', 'epic'],
    loot: 'loot: Rare - Epic',
    logColor: '#9b59b6',
    enemyPool: ['brigand','wyrm','ogre', 'spectre', 'golem', 'chimere', 'leviathan'],
    dungeons: [
      { id: 'ruins_halls_1', name: 'Ancient Halls', floors: 5, bossTemplateId: 'wyrm' },
      { id: 'ruins_depths_2', name: 'Underground', floors: 5, bossTemplateId: 'golem' },
    ],
  },
  {
    id: 'craters_scars',
    name: 'Scourge Craters',
    theme: 'scars',
    dungeonThreshold: 15,
    minLevel: 71,
    allowedTiers: ['epic', 'legendary'],
    loot: 'loot: Epic - Legendary',
    logColor: '#e74c3c',
    enemyPool: ['ogre','magma','wyrm','spectre', 'seigneur', 'troll_cavernes', 'phoenix'],
    dungeons: [
      { id: 'scars_delve_1', name: 'Scourge Depths', floors: 5, bossTemplateId: 'seigneur', requiredLevel: 71 },
      { id: 'scars_core_1', name: 'Core', floors: 5, bossTemplateId: 'seigneur', requiredLevel: 71 },
    ],
  },
];

let customMaps: MapTemplate[] = [];

// Small default pool used when no map is selected (the 'spawn' area)
const SPAWN_POOL: string[] = ['cockroach'];

export function getSpawnPool() {
  return [...SPAWN_POOL];
}

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
  // If map is not provided, treat area as the global 'spawn' and pick from SPAWN_POOL
  if (!map) {
    const poolTemplates = ENEMY_TEMPLATES.filter((t) => SPAWN_POOL.includes(t.templateId));
    if (poolTemplates.length === 0) {
      try { console.log('[DEBUG] pickEnemyFromMap - spawn pool empty', { SPAWN_POOL }); } catch(e) {}
      return undefined;
    }
    const chosen = poolTemplates[Math.floor(Math.random() * poolTemplates.length)].templateId;
    try { console.log('[DEBUG] pickEnemyFromMap - chose from SPAWN_POOL', { chosen, SPAWN_POOL }); } catch(e) {}
    return chosen;
  }

  // Strict: only choose from the map's `enemyPool`. No fallback allowed for map-specific pools.
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

// Return rooms for a given map (or empty array)
export function getRoomsForMap(mapId?: string) {
  const m = getMapById(mapId ?? undefined);
  if (!m || !Array.isArray(m.rooms)) return [];
  return [...m.rooms];
}

// Pick an enemy for a specific room if the map defines rooms with fixed enemy pools.
// Falls back to the map's `enemyPool` or the global SPAWN_POOL when appropriate.
export function pickEnemyFromRoom(mapId?: string, roomId?: string) {
  const map = getMapById(mapId);
  if (!map) {
    // spawn area
    const poolTemplates = ENEMY_TEMPLATES.filter((t) => SPAWN_POOL.includes(t.templateId));
    if (poolTemplates.length === 0) return undefined;
    return poolTemplates[Math.floor(Math.random() * poolTemplates.length)].templateId;
  }

  if (roomId && Array.isArray(map.rooms)) {
    const room = map.rooms.find((r) => r.id === roomId);
    if (room && Array.isArray(room.enemyPool) && room.enemyPool.length > 0) {
      const poolTemplates = ENEMY_TEMPLATES.filter((t) => room.enemyPool!.includes(t.templateId));
      if (poolTemplates.length > 0) {
        return poolTemplates[Math.floor(Math.random() * poolTemplates.length)].templateId;
      }
    }
  }

  // fallback to map enemyPool (strict)
  if (Array.isArray(map.enemyPool) && map.enemyPool.length > 0) {
    const poolTemplates = ENEMY_TEMPLATES.filter((t) => map.enemyPool.includes(t.templateId));
    if (poolTemplates.length > 0) {
      return poolTemplates[Math.floor(Math.random() * poolTemplates.length)].templateId;
    }
  }

  return undefined;
}

export default { getMaps, getMapById, createMap, pickEnemyFromMap, pickEnemyFromRoom, getRoomsForMap };

export function isTierAllowedOnMap(mapId: string | undefined | null, tier: string) {
  if (!mapId) return tier === 'common';
  const m = getMapById(mapId);
  if (!m) return tier === 'common';
  if (!m.allowedTiers || m.allowedTiers.length === 0) return true;
  return m.allowedTiers.includes(tier);
}
