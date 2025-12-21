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
  // MAP 0 — Spawn/Initiation
  {
    id: 'spawn',
    name: 'Spawn Area',
    theme: 'spawn',
    logColor: '#cccccc',
    dungeonThreshold: 999, // No dungeons
    minLevel: 1,
    allowedTiers: ['common', 'uncommon'],
    loot: 'loot: Common - Uncommon',
    enemyPool: ['slime', 'rat_spawn', 'butterfly_spawn'],
  },

  // MAP 1 — Forest
  {
    id: 'forest',
    name: 'Forest',
    theme: 'forest',
    logColor: '#2ecc71',
    dungeonThreshold: 15,
    minLevel: 6,
    allowedTiers: ['common', 'uncommon', 'rare'],
    loot: 'loot: Common - Uncommon - Rare',
    enemyPool: ['rat', 'butterfly', 'wolf', 'ant', 'bee', 'mushroom', 'crow', 'monkey'],
    requiredKeyFragments: [],
    dungeons: [
      { id: 'beehive', name: 'The Beehive', floors: 5, bossTemplateId: 'queen_bee' },
      { id: 'celestial_tree', name: 'The Celestial Tree', floors: 5, bossTemplateId: 'quetzal' },
    ],
    rooms: [
      // Beehive
      { id: 'forest_beehive_floor_1', enemyPool: ['ant', 'mushroom'] },
      { id: 'forest_beehive_floor_2', enemyPool: ['bee', 'big_bee'] },
      { id: 'forest_beehive_floor_3', enemyPool: ['big_bee', 'mushroom'] },
      { id: 'forest_beehive_floor_4', enemyPool: ['big_bee', 'mushroom', 'bee'] },
      { id: 'forest_beehive_floor_5', enemyPool: ['queen_bee'], isBossRoom: true },
      // Celestial Tree
      { id: 'forest_celestial_tree_floor_1', enemyPool: ['ant', 'crow'] },
      { id: 'forest_celestial_tree_floor_2', enemyPool: ['crow', 'butterfly'] },
      { id: 'forest_celestial_tree_floor_3', enemyPool: ['monkey', 'butterfly', 'crow'] },
      { id: 'forest_celestial_tree_floor_4', enemyPool: ['monkey', 'butterfly'] },
      { id: 'forest_celestial_tree_floor_5', enemyPool: ['quetzal'], isBossRoom: true },
    ],
  },

  // MAP 2 — Caves
  {
    id: 'caves',
    name: 'Caves',
    theme: 'caves',
    logColor: '#95a5a6',
    dungeonThreshold: 20,
    minLevel: 16,
    allowedTiers: ['uncommon', 'rare', 'epic'],
    loot: 'loot: Uncommon - Rare - Epic',
    enemyPool: ['bat', 'snail', 'salamander', 'snake', 'wood_fairy', 'bear'],
    requiredKeyFragments: ['Forest Key A', 'Forest Key B'],
    dungeons: [
      { id: 'underground_cave', name: 'The Underground Cave', floors: 5, bossTemplateId: 'rabid_hyenas' },
    ],
    rooms: [
      { id: 'caves_underground_cave_floor_1', enemyPool: ['bat', 'batwan'] },
      { id: 'caves_underground_cave_floor_2', enemyPool: ['batwan', 'salamander'] },
      { id: 'caves_underground_cave_floor_3', enemyPool: ['salamander', 'wood_fairy'] },
      { id: 'caves_underground_cave_floor_4', enemyPool: ['wood_fairy', 'snake'] },
      { id: 'caves_underground_cave_floor_5', enemyPool: ['rabid_hyenas'], isBossRoom: true },
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
    allowedTiers: ['rare', 'epic', 'legendary'],
    loot: 'loot: Rare - Epic - Legendary',
    enemyPool: ['skeleton', 'cursed_knight', 'shadow_mage', 'gargoyle', 'wraith', 'ancient_sentinel'],
    requiredKeyFragments: ['Caves Key A', 'Caves Key B'],
    dungeons: [
      { id: 'forgotten_temple', name: 'Forgotten Temple', floors: 5, bossTemplateId: 'ancient_guardian' },
      { id: 'library_of_ashes', name: 'Library of Ashes', floors: 5, bossTemplateId: 'forgotten_keeper' },
    ],
    rooms: [
      // Forgotten Temple
      { id: 'ruins_forgotten_temple_floor_1', enemyPool: ['skeleton', 'shadow_mage'] },
      { id: 'ruins_forgotten_temple_floor_2', enemyPool: ['cursed_knight', 'skeleton'] },
      { id: 'ruins_forgotten_temple_floor_3', enemyPool: ['cursed_knight', 'gargoyle'] },
      { id: 'ruins_forgotten_temple_floor_4', enemyPool: ['gargoyle', 'wraith'] },
      { id: 'ruins_forgotten_temple_floor_5', enemyPool: ['ancient_guardian'], isBossRoom: true },
      // Library of Ashes
      { id: 'ruins_library_of_ashes_floor_1', enemyPool: ['shadow_mage', 'skeleton'] },
      { id: 'ruins_library_of_ashes_floor_2', enemyPool: ['shadow_mage', 'wraith'] },
      { id: 'ruins_library_of_ashes_floor_3', enemyPool: ['wraith', 'ancient_sentinel'] },
      { id: 'ruins_library_of_ashes_floor_4', enemyPool: ['ancient_sentinel', 'gargoyle'] },
      { id: 'ruins_library_of_ashes_floor_5', enemyPool: ['forgotten_keeper'], isBossRoom: true },
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
    allowedTiers: ['epic', 'legendary', 'mythic'],
    loot: 'loot: Epic - Legendary - Mythic',
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
      { id: 'volcano_infernal_abyss_floor_5', enemyPool: ['infernal_warden'], isBossRoom: true },
      // Ashen Citadel
      { id: 'volcano_ashen_citadel_floor_1', enemyPool: ['fire_imp', 'magma_serpent'] },
      { id: 'volcano_ashen_citadel_floor_2', enemyPool: ['lava_golem', 'ash_phoenix'] },
      { id: 'volcano_ashen_citadel_floor_3', enemyPool: ['magma_serpent', 'flame_titan'] },
      { id: 'volcano_ashen_citadel_floor_4', enemyPool: ['ash_phoenix', 'flame_titan'] },
      { id: 'volcano_ashen_citadel_floor_5', enemyPool: ['avatar_of_cinders'], isBossRoom: true },
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
