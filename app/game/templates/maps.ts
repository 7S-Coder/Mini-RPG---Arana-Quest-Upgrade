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
  // maximum level allowed on this map (inclusive). Enemies cannot spawn above this level.
  maxLevel?: number;
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
  // MAP 0 — Spawn/Initiation
  {
    id: 'spawn',
    name: 'Spawn Area',
    theme: 'spawn',
    logColor: '#cccccc',
    dungeonThreshold: 999, // No dungeons
    minLevel: 1,
    maxLevel: 5,
    allowedTiers: ['common'],
    loot: 'loot: Common',
    enemyPool: ['slime', 'rat_spawn', 'butterfly_spawn'],
  },

  // MAP 1 — Forest (Level 6-29)
  {
    id: 'forest',
    name: 'Forest',
    theme: 'forest',
    logColor: '#2ecc71',
    dungeonThreshold: 15,
    minLevel: 6,
    maxLevel: 29,
    allowedTiers: ['common', 'uncommon', 'rare'],
    loot: 'loot: Common - Uncommon - Rare',
    enemyPool: ['rat', 'butterfly', 'giant_spider', 'forest_goblin', 'wild_boar', 'wolf', 'ant', 'bee', 'mushroom', 'crow', 'monkey', 'big_bee'],
    requiredKeyFragments: [],
    dungeons: [
      { id: 'beehive', name: 'The Beehive', floors: 5, bossTemplateId: 'queen_bee' },
      { id: 'celestial_tree', name: 'The Celestial Tree', floors: 5, bossTemplateId: 'quetzal' },
    ],
    rooms: [
      // Beehive
      { id: 'forest_beehive_floor_1', enemyPool: ['ant', 'mushroom', 'forest_goblin'] },
      { id: 'forest_beehive_floor_2', enemyPool: ['bee', 'big_bee', 'giant_spider'] },
      { id: 'forest_beehive_floor_3', enemyPool: ['big_bee', 'mushroom', 'wild_boar'] },
      { id: 'forest_beehive_floor_4', enemyPool: ['big_bee', 'mushroom', 'bee'] },
      { id: 'forest_beehive_floor_5', enemyPool: ['big_bee', 'big_bee', 'queen_bee'], isBossRoom: true },
      // Celestial Tree
      { id: 'forest_celestial_tree_floor_1', enemyPool: ['ant', 'crow', 'forest_goblin'] },
      { id: 'forest_celestial_tree_floor_2', enemyPool: ['crow', 'butterfly', 'giant_spider'] },
      { id: 'forest_celestial_tree_floor_3', enemyPool: ['monkey', 'butterfly', 'crow', 'wild_boar'] },
      { id: 'forest_celestial_tree_floor_4', enemyPool: ['monkey', 'butterfly'] },
      { id: 'forest_celestial_tree_floor_5', enemyPool: ['crow', 'crow', 'quetzal'], isBossRoom: true },
    ],
  },

  // MAP 2 — Caves (Level 16-59)
  {
    id: 'caves',
    name: 'Caves',
    theme: 'caves',
    logColor: '#95a5a6',
    dungeonThreshold: 20,
    minLevel: 16,
    maxLevel: 59,
    allowedTiers: ['uncommon', 'rare', 'epic'],
    loot: 'loot: Uncommon - Rare - Epic',
    enemyPool: ['stone_golem', 'crystal_bug', 'cave_troll', 'bat', 'snail', 'salamander', 'snake', 'wood_fairy', 'bear', 'batwan', 'rabid_hyenas'],
    requiredKeyFragments: ['Forest Key A', 'Forest Key B'],
    dungeons: [
      { id: 'underground_cave', name: 'The Underground Cave', floors: 5, bossTemplateId: 'rabid_hyenas' },
    ],
    rooms: [
      { id: 'caves_underground_cave_floor_1', enemyPool: ['stone_golem', 'crystal_bug'] },
      { id: 'caves_underground_cave_floor_2', enemyPool: ['cave_troll', 'bat'] },
      { id: 'caves_underground_cave_floor_3', enemyPool: ['snail', 'salamander'] },
      { id: 'caves_underground_cave_floor_4', enemyPool: ['snake', 'wood_fairy', 'bear'] },
      { id: 'caves_underground_cave_floor_5', enemyPool: ['bear', 'bear', 'rabid_hyenas'], isBossRoom: true },
    ],
  },

  // MAP 3 — Ruins
  {
    id: 'ruins',
    name: 'Ruins',
    theme: 'ruins',
    logColor: '#9b59b6',
    dungeonThreshold: 20,
    minLevel: 30,
    maxLevel: 89,
    allowedTiers: ['rare', 'epic', 'legendary'],
    loot: 'loot: Rare - Epic - Legendary',
    enemyPool: ['skeleton', 'tomb_guardian', 'ghost_knight', 'cursed_statue', 'cursed_knight', 'shadow_mage', 'gargoyle', 'wraith', 'ancient_sentinel'],
    requiredKeyFragments: ['Caves Key A', 'Caves Key B'],
    dungeons: [
      { id: 'forgotten_temple', name: 'Forgotten Temple', floors: 5, bossTemplateId: 'ancient_guardian' },
      { id: 'library_of_ashes', name: 'Library of Ashes', floors: 5, bossTemplateId: 'forgotten_keeper' },
    ],
    rooms: [
      // Forgotten Temple
      { id: 'ruins_forgotten_temple_floor_1', enemyPool: ['skeleton', 'tomb_guardian'] },
      { id: 'ruins_forgotten_temple_floor_2', enemyPool: ['tomb_guardian', 'ghost_knight'] },
      { id: 'ruins_forgotten_temple_floor_3', enemyPool: ['ghost_knight', 'cursed_statue'] },
      { id: 'ruins_forgotten_temple_floor_4', enemyPool: ['cursed_knight', 'shadow_mage', 'gargoyle'] },
      { id: 'ruins_forgotten_temple_floor_5', enemyPool: ['gargoyle', 'ancient_sentinel', 'ancient_guardian'], isBossRoom: true },
      // Library of Ashes
      { id: 'ruins_library_of_ashes_floor_1', enemyPool: ['shadow_mage', 'wraith'] },
      { id: 'ruins_library_of_ashes_floor_2', enemyPool: ['ghost_knight', 'cursed_statue'] },
      { id: 'ruins_library_of_ashes_floor_3', enemyPool: ['cursed_knight', 'gargoyle'] },
      { id: 'ruins_library_of_ashes_floor_4', enemyPool: ['wraith', 'ancient_sentinel'] },
      { id: 'ruins_library_of_ashes_floor_5', enemyPool: ['wraith', 'wraith', 'forgotten_keeper'], isBossRoom: true },
    ],
  },

  // MAP 4 — Volcano
  {
    id: 'volcano',
    name: 'Volcano',
    theme: 'volcano',
    logColor: '#e74c3c',
    dungeonThreshold: 20,
    minLevel: 50,
    maxLevel: 120,
    allowedTiers: ['legendary', 'mythic'],
    loot: 'loot: Legendary - Mythic',
    enemyPool: ['fire_imp', 'lava_golem', 'magma_serpent', 'ash_phoenix', 'flame_titan'],
    requiredKeyFragments: ['Ruins Key A', 'Ruins Key B'],
    dungeons: [
      { id: 'infernal_abyss', name: 'Infernal Abyss', floors: 5, bossTemplateId: 'infernal_warden' },
      { id: 'ashen_citadel', name: 'Ashen Citadel', floors: 5, bossTemplateId: 'avatar_of_cinders' },
    ],
    rooms: [
      // Infernal Abyss
      { id: 'volcano_infernal_abyss_floor_1', enemyPool: ['fire_imp', 'lava_golem'] },
      { id: 'volcano_infernal_abyss_floor_2', enemyPool: ['lava_golem', 'magma_serpent'] },
      { id: 'volcano_infernal_abyss_floor_3', enemyPool: ['magma_serpent', 'ash_phoenix'] },
      { id: 'volcano_infernal_abyss_floor_4', enemyPool: ['ash_phoenix', 'flame_titan'] },
      { id: 'volcano_infernal_abyss_floor_5', enemyPool: ['flame_titan', 'flame_titan', 'infernal_warden'], isBossRoom: true },
      // Ashen Citadel
      { id: 'volcano_ashen_citadel_floor_1', enemyPool: ['fire_imp', 'magma_serpent'] },
      { id: 'volcano_ashen_citadel_floor_2', enemyPool: ['lava_golem', 'ash_phoenix'] },
      { id: 'volcano_ashen_citadel_floor_3', enemyPool: ['magma_serpent', 'flame_titan'] },
      { id: 'volcano_ashen_citadel_floor_4', enemyPool: ['ash_phoenix', 'flame_titan'] },
      { id: 'volcano_ashen_citadel_floor_5', enemyPool: ['ash_phoenix', 'ash_phoenix', 'avatar_of_cinders'], isBossRoom: true },
    ],
  },

  // MAP 5 — Final Boss Arena
  {
    id: 'final_arena',
    name: 'Burning Throne',
    theme: 'volcano',
    logColor: '#ff6b35',
    dungeonThreshold: 999, // No dungeons
    minLevel: 100,
    maxLevel: 120,
    allowedTiers: ['mythic'],
    loot: 'loot: Mythic',
    enemyPool: ['fire_overlord'],
    requiredKeyFragments: ['Volcano Key A', 'Volcano Key B'],
    rooms: [
      { id: 'final_arena_throne_room', enemyPool: ['fire_overlord', 'fire_overlord'], isBossRoom: true },
    ],
  },
];

let customMaps: MapTemplate[] = [];

// Small default pool used when no map is selected (the 'spawn' area)
const SPAWN_POOL: string[] = ['slime', 'rat_spawn', 'butterfly_spawn'];

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
      try { } catch(e) {}
      return undefined;
    }
    const chosen = poolTemplates[Math.floor(Math.random() * poolTemplates.length)].templateId;
    try { } catch(e) {}
    return chosen;
  }

  // Strict: only choose from the map's `enemyPool`. No fallback allowed for map-specific pools.
  if (Array.isArray(map.enemyPool) && map.enemyPool.length > 0) {
    const poolTemplates = ENEMY_TEMPLATES.filter((t) => map.enemyPool.includes(t.templateId));
    if (poolTemplates.length > 0) {
      const chosen = poolTemplates[Math.floor(Math.random() * poolTemplates.length)].templateId;
      try { } catch(e) {}
      return chosen;
    }
    try {  } catch(e) {}
    return undefined;
  }

  try { } catch(e) {}
  return undefined;
}

// Return rooms for a given map (or empty array)
export function getRoomsForMap(mapId?: string) {
  const m = getMapById(mapId ?? undefined);
  if (!m || !Array.isArray(m.rooms)) return [];
  // Deduplicate rooms by id while preserving order to avoid duplicated
  // room definitions caused by custom maps or accidental repeats.
  const seen = new Set<string>();
  const out: RoomDef[] = [];
  for (const r of m.rooms) {
    if (!r || !r.id) continue;
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
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
    const rooms = getRoomsForMap(mapId);
    const room = rooms.find((r) => r.id === roomId);
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
