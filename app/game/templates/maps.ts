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
  // optional list of item names (fragments) required to unlock the map
  requiredKeyFragments?: string[];
};

const defaultMaps: MapTemplate[] = [
  {
    id: 'forest',
    name: 'Forest',
    theme: 'forest',
    dungeonThreshold: 15,
    minLevel: 10,
    allowedTiers: ['common', 'rare'],
    loot: 'loot: Common - Rare',
    logColor: '#2ecc71',
    enemyPool: ['wolf', 'mushroom', 'bee', 'crow', 'butterfly'],
    dungeons: [
      { id: 'forest_the_beehive_1', name: 'The Beehive', floors: 5, bossTemplateId: 'queen_bee' },
      { id: 'the_celestial_tree', name: 'The Celestial Tree', floors: 5, bossTemplateId: 'quetzal' },
    ],
      // Example fixed rooms for the `forest` map — each room id follows the pattern
      // <dungeonId>_floor_<n>. When a dungeon is active, the game will attempt to
      // pick an enemy from the corresponding room (deterministic encounters).
      rooms: [
        { id: 'forest_the_beehive_floor_1', name: '', enemyPool: ['ants','mushroom'] },
        { id: 'forest_the_beehive_floor_2', name: '', enemyPool: ['bee', 'big_bee'] },
        { id: 'forest_the_beehive_floor_3', name: '', enemyPool: ['big_bee','mushroom'] },
        { id: 'forest_the_beehive_floor_4', name: '', enemyPool: ['big_bee','mushroom', 'bee'] },
        { id: 'forest_the_beehive_floor_5', name: '', enemyPool: ['queen_bee'], isBossRoom: true },

        { id: 'forest_the_celestial_tree_floor_1', name: 'Gloomy Grotto', enemyPool: ['ants','crow'] },
        { id: 'forest_the_celestial_tree_floor_2', name: 'Damp Tunnel', enemyPool: ['crow','butterfly'] },
        { id: 'forest_the_celestial_tree_floor_3', name: 'Echoing Chamber', enemyPool: ['monkey','butterfly', 'crow'] },
        { id: 'forest_the_celestial_tree_floor_4', name: 'Stalagmite Path', enemyPool: ['monkey','butterfly'] },
        { id: 'forest_the_celestial_tree_floor_5', name: 'Monocle', enemyPool: ['quetzal'], isBossRoom: true },
      ],
  },
  {
    id: 'caves',
    name: 'Caves',
    theme: 'caves',
    dungeonThreshold: 15,
    minLevel: 31,
    allowedTiers: ['common', 'rare', 'epic'],
    loot: 'loot: Common - Rare - Epic',
      logColor: '#95a5a6',
    enemyPool: ['salamander','snail','snake','bear', 'wood_fairy'],
    // requires both fragments to unlock
    requiredKeyFragments: ['Cave Key fragment A', 'Cave Key fragment B'],
    dungeons: [
      { id: 'caves_the_underground_cave_1', name: 'The Underground Cave', floors: 5, bossTemplateId: 'rabid_hyenas' },
      { id: 'caves_echoing_depths_2', name: 'Echoing Depths', floors: 5, bossTemplateId: 'cave_stalker' },
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
    enemyPool: ['golem','wyrm','cultist', 'spectre', 'corrupted_knight', 'ancien_spirit', 'ghost', 'nain'],
    dungeons: [
      { id: 'ruins_the_forgotten_sanctum_1', name: 'The Forgotten Sanctum', floors: 5, bossTemplateId: 'ancient_guardian' },
      { id: 'ruins_the_ruins_heart_2', name: 'The Ruins Heart', floors: 5, bossTemplateId: 'hydra' },
    ],
    // fragments required to unlock the Ruins (drop in previous map)
    requiredKeyFragments: ['Ruins Key fragment A', 'Ruins Key fragment B'],
    rooms: [
        { id: 'ruins_the_forgotten_sanctum_1_floor_1', name: '', enemyPool: ['cultist','ghost', 'wyrm'] },
        { id: 'ruins_the_forgotten_sanctum_1_floor_2', name: '', enemyPool: ['golem', 'ghost', 'cultist'] },
        { id: 'ruins_the_forgotten_sanctum_1_floor_3', name: '', enemyPool: ['wyrm','cultist'] },
        { id: 'ruins_the_forgotten_sanctum_1_floor_4', name: '', enemyPool: ['golem','wyrm'] },
        { id: 'ruins_the_forgotten_sanctum_1_floor_5', name: '', enemyPool: ['ancient_guardian'], isBossRoom: true },
        { id: 'ruins_underground_2_floor_1', name: '', enemyPool: ['golem','corrupted_knight'] },
        { id: 'ruins_underground_2_floor_2', name: '', enemyPool: ['corrupted_knight','nain'] },
        { id: 'ruins_underground_2_floor_3', name: '', enemyPool: ['ancien_spirit','corrupted_knight', 'nain'] },
        { id: 'ruins_underground_2_floor_4', name: '', enemyPool: ['nain','corrupted_knight', 'ancien_spirit', 'golem'] },
        { id: 'ruins_underground_2_floor_5', name: '', enemyPool: ['hydra'], isBossRoom: true },
      ],
  },
  {
    id: 'volcano',
    name: 'Volcano',
    theme: 'volcano',
    dungeonThreshold: 15,
    minLevel: 71,
    allowedTiers: ['epic', 'legendary', 'mythic'],
    loot: 'loot: Epic - Legendary',
    logColor: '#e74c3c',
    enemyPool: ['magma_beast','fire_drake','phoenix','lava_golem','will_o_the_wisp','leviathan'],
    dungeons: [
      { id: 'volcano_molten_core_1', name: 'Molten Core', floors: 5, bossTemplateId: 'phoenix_lord', requiredLevel: 71 },
      { id: 'volcano_dragon_crucible_1', name: 'Dragon Crucible', floors: 5, bossTemplateId: 'ancient_dragon', requiredLevel: 71 },
    ],
    // fragments required to unlock the Volcano
    requiredKeyFragments: ['Volcano Key fragment A', 'Volcano Key fragment B'],
    rooms: [
        { id: 'volcano_molten_core_1_floor_1', name: '', enemyPool: ["fire_drake","will_o_the_wisp", "magma_beast"] },
        { id: 'volcano_molten_core_1_floor_2', name: '', enemyPool: ["will_o_the_wisp", "magma_beast", "leviathan"] },
        { id: 'volcano_molten_core_1_floor_3', name: '', enemyPool: ["fire_drake", "leviathan"] },
        { id: 'volcano_molten_core_1_floor_4', name: '', enemyPool: ["leviathan"] },
        { id: 'volcano_molten_core_1_floor_5', name: '', enemyPool: ['phoenix_lord'], isBossRoom: true },
        { id: 'volcano_dragon_crucible_2_floor_1', name: '', enemyPool: ['lava_golem','ancient_drake'] },
        { id: 'volcano_dragon_crucible_2_floor_2', name: '', enemyPool: ['phoenix','ancient_drake'] },
        { id: 'volcano_dragon_crucible_2_floor_3', name: '', enemyPool: ['silver_dragon','ancient_drake', 'lava_golem'] },
        { id: 'volcano_dragon_crucible_2_floor_4', name: '', enemyPool: ['silver_dragon','ancient_drake', 'lava_golem', 'phoenix'] },
        { id: 'volcano_dragon_crucible_2_floor_5', name: '', enemyPool: ['ancient_dragon'], isBossRoom: true },
      ],
  },
];

let customMaps: MapTemplate[] = [];

// Small default pool used when no map is selected (the 'spawn' area)
const SPAWN_POOL: string[] = ['cockroach', 'rat', 'bat', 'ants'];

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
