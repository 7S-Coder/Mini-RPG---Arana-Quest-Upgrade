import type { Rarity } from '../types';

/**
 * Loot system rules:
 * 1. Map determines maximum rarity
 * 2. Dungeons guarantee minimum rarity
 * 3. Bosses can exceed map rarity
 * 4. Mythics never drop from trash/common enemies
 * 5. Fragments/keys are outside the classic loot table
 */

export interface LootTable {
  [rarity: string]: number; // percentage for each rarity
}

export interface MapLootConfig {
  maxRarity: Rarity;
  allowedRarities: Rarity[];
  trashLootTable: LootTable;
  dungeonMinRarity?: Rarity;
  dungeonLootTable?: LootTable;
  bossLootTable?: LootTable;
}

export const LOOT_RARITY_ORDER: Rarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythic',
];

/**
 * MAP 0 — Spawn / Initiation
 * Allowed: Common, Uncommon (very rare)
 */
export const SPAWN_LOOT: MapLootConfig = {
  maxRarity: 'uncommon',
  allowedRarities: ['common', 'uncommon'],
  trashLootTable: {
    common: 85,
    uncommon: 15,
  },
};

/**
 * MAP 1 — Forest
 * Allowed: Common, Uncommon, Rare (low rate)
 */
export const FOREST_LOOT: MapLootConfig = {
  maxRarity: 'rare',
  allowedRarities: ['common', 'uncommon', 'rare'],
  trashLootTable: {
    common: 60,
    uncommon: 30,
    rare: 10,
  },
  dungeonMinRarity: 'uncommon',
  dungeonLootTable: {
    uncommon: 55,
    rare: 35,
    epic: 10,
  },
  bossLootTable: {
    rare: 55,
    epic: 35,
    legendary: 10,
  },
};

/**
 * MAP 2 — Caves
 * Allowed: Uncommon, Rare, Epic (low rate)
 */
export const CAVES_LOOT: MapLootConfig = {
  maxRarity: 'epic',
  allowedRarities: ['uncommon', 'rare', 'epic'],
  trashLootTable: {
    uncommon: 45,
    rare: 40,
    epic: 15,
  },
  dungeonMinRarity: 'rare',
  dungeonLootTable: {
    rare: 50,
    epic: 40,
    legendary: 10,
  },
  bossLootTable: {
    epic: 55,
    legendary: 35,
    mythic: 10,
  },
};

/**
 * MAP 3 — Ruins
 * Allowed: Rare, Epic, Legendary (rare)
 */
export const RUINS_LOOT: MapLootConfig = {
  maxRarity: 'legendary',
  allowedRarities: ['rare', 'epic', 'legendary'],
  trashLootTable: {
    rare: 45,
    epic: 40,
    legendary: 15,
  },
  dungeonMinRarity: 'epic',
  dungeonLootTable: {
    epic: 50,
    legendary: 40,
    mythic: 10,
  },
  bossLootTable: {
    legendary: 60,
    mythic: 40,
  },
};

/**
 * MAP 4 — Volcano
 * Allowed: Epic, Legendary, Mythic (very rare)
 */
export const VOLCANO_LOOT: MapLootConfig = {
  maxRarity: 'mythic',
  allowedRarities: ['epic', 'legendary', 'mythic'],
  trashLootTable: {
    epic: 50,
    legendary: 40,
    mythic: 10,
  },
  dungeonMinRarity: 'legendary',
  dungeonLootTable: {
    legendary: 55,
    mythic: 45,
  },
  bossLootTable: {
    mythic: 70,
    // mythic+ (uniques) = 30% — reserved for seasonal/lore uniques
  },
};

/**
 * Get loot config for a map
 */
export function getLootConfigForMap(mapId?: string): MapLootConfig {
  switch (mapId) {
    case 'spawn':
      return SPAWN_LOOT;
    case 'forest':
      return FOREST_LOOT;
    case 'caves':
      return CAVES_LOOT;
    case 'ruins':
      return RUINS_LOOT;
    case 'volcano':
      return VOLCANO_LOOT;
    default:
      return SPAWN_LOOT;
  }
}

/**
 * Roll a rarity based on a loot table
 * @param table - LootTable with percentages
 * @returns The selected rarity
 */
export function rollFromLootTable(table: LootTable): Rarity | null {
  const roll = Math.random() * 100;
  let accumulated = 0;

  for (const rarity of LOOT_RARITY_ORDER) {
    if (table[rarity] !== undefined) {
      accumulated += table[rarity];
      if (roll <= accumulated) {
        return rarity as Rarity;
      }
    }
  }

  return null;
}

/**
 * Check if a rarity is allowed on a specific map
 */
export function isRarityAllowedOnMap(mapId: string | undefined, rarity: Rarity): boolean {
  const config = getLootConfigForMap(mapId);
  return config.allowedRarities.includes(rarity);
}

/**
 * Get the drop chance modifier based on enemy count in area
 * (for balancing purposes)
 */
export function getDropChanceForMap(mapId?: string): number {
  switch (mapId) {
    case 'spawn':
      return 0.05; // 5% — very rare
    case 'forest':
      return 0.08; // 8%
    case 'caves':
      return 0.10; // 10%
    case 'ruins':
      return 0.12; // 12%
    case 'volcano':
      return 0.15; // 15%
    default:
      return 0.08;
  }
}
