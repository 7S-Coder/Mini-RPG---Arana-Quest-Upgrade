import type { Rarity } from '../types';

export type CurrencyType = 'gold' | 'essence';

export type ShopItemType = 'potion' | 'lootbox';

export interface Cost {
  currency: CurrencyType;
  amount: number;
}

export interface ShopRequirement {
  minLevel?: number;
  unlockedRarities?: Rarity[];
}

export interface ShopItem {
  id: string;
  type: ShopItemType;
  name: string;
  description: string;
  rarity?: Rarity;
  costs: Cost[];
  requirements?: ShopRequirement;
  payload: {
    itemId?: string;
    lootTableId?: string;
    quantity?: number;
    potionType?: 'small' | 'medium' | 'large' | 'huge' | 'giant';
  };
  enabled: boolean;
}

// ✅ MVP SHOP - Or uniquement
export const SHOP_ITEMS: ShopItem[] = [
  // Potions
  {
    id: 'potion_small_gold',
    type: 'potion',
    name: 'Small Potion',
    description: 'Restore 50 HP.',
    costs: [{ currency: 'gold', amount: 30 }],
    payload: { potionType: 'small', quantity: 1 },
    enabled: true,
  },
  {
    id: 'potion_medium_gold',
    type: 'potion',
    name: 'Medium Potion',
    description: 'Restore 100 HP.',
    costs: [{ currency: 'gold', amount: 60 }],
    payload: { potionType: 'medium', quantity: 1 },
    enabled: true,
  },
  {
    id: 'potion_large_gold',
    type: 'potion',
    name: 'Large Potion',
    description: 'Restore 200 HP.',
    costs: [{ currency: 'gold', amount: 120 }],
    payload: { potionType: 'large', quantity: 1 },
    enabled: true,
  },
  {
    id: 'potion_huge_gold',
    type: 'potion',
    name: 'Huge Potion',
    description: 'Restore 400 HP.',
    costs: [{ currency: 'gold', amount: 200 }],
    payload: { potionType: 'huge', quantity: 1 },
    enabled: true,
  },
  {
    id: 'potion_giant_gold',
    type: 'potion',
    name: 'Giant Potion',
    description: 'Restore 1000 HP.',
    costs: [{ currency: 'gold', amount: 500 }],
    payload: { potionType: 'giant', quantity: 1 },
    enabled: true,
  },

  // Lootboxes - Or
  {
    id: 'lootbox_common_gold',
    type: 'lootbox',
    name: 'Common Loot Box',
    description: 'Contains 1 Common item or better.',
    rarity: 'common',
    costs: [{ currency: 'gold', amount: 10 }],
    requirements: { minLevel: 1 },
    payload: { lootTableId: 'loot_common' },
    enabled: true,
  },
  {
    id: 'lootbox_uncommon_gold',
    type: 'lootbox',
    name: 'Uncommon Loot Box',
    description: 'Contains 1 Uncommon item or better.',
    rarity: 'uncommon',
    costs: [{ currency: 'gold', amount: 20 }],
    requirements: { minLevel: 6, unlockedRarities: ['uncommon'] },
    payload: { lootTableId: 'loot_uncommon' },
    enabled: true,
  },
  {
    id: 'lootbox_rare_gold',
    type: 'lootbox',
    name: 'Rare Loot Box',
    description: 'Contains 1 Rare item or better.',
    rarity: 'rare',
    costs: [{ currency: 'gold', amount: 35 }],
    requirements: { minLevel: 15, unlockedRarities: ['rare'] },
    payload: { lootTableId: 'loot_rare' },
    enabled: true,
  },
  {
    id: 'lootbox_epic_gold',
    type: 'lootbox',
    name: 'Epic Loot Box',
    description: 'Contains 1 Epic item or better.',
    rarity: 'epic',
    costs: [{ currency: 'gold', amount: 100 }],
    requirements: { minLevel: 30, unlockedRarities: ['epic'] },
    payload: { lootTableId: 'loot_epic' },
    enabled: true,
  },
  {
    id: 'lootbox_legendary_gold',
    type: 'lootbox',
    name: 'Legendary Loot Box',
    description: 'Contains 1 Legendary item or better.',
    rarity: 'legendary',
    costs: [{ currency: 'gold', amount: 250 }],
    requirements: { minLevel: 50, unlockedRarities: ['legendary'] },
    payload: { lootTableId: 'loot_legendary' },
    enabled: true,
  },
  {
    id: 'lootbox_mythic_gold',
    type: 'lootbox',
    name: 'Mythic Loot Box',
    description: 'Contains 1 Mythic item or better.',
    rarity: 'mythic',
    costs: [{ currency: 'gold', amount: 500 }],
    requirements: { minLevel: 75, unlockedRarities: ['mythic'] },
    payload: { lootTableId: 'loot_mythic' },
    enabled: true,
  },

  // FUTURE: Essence versions (disabled for MVP)
  {
    id: 'lootbox_uncommon_essence',
    type: 'lootbox',
    name: 'Uncommon Loot Box (Essence)',
    description: 'Same rewards, paid with Essence.',
    rarity: 'uncommon',
    costs: [{ currency: 'essence', amount: 5 }],
    requirements: { minLevel: 6, unlockedRarities: ['uncommon'] },
    payload: { lootTableId: 'loot_uncommon' },
    enabled: false,
  },
  {
    id: 'lootbox_rare_essence',
    type: 'lootbox',
    name: 'Rare Loot Box (Essence)',
    description: 'Same rewards, paid with Essence.',
    rarity: 'rare',
    costs: [{ currency: 'essence', amount: 10 }],
    requirements: { minLevel: 15, unlockedRarities: ['rare'] },
    payload: { lootTableId: 'loot_rare' },
    enabled: false,
  },
];

/**
 * Check if player can afford and purchase a shop item
 */
export function canAfford(
  item: ShopItem,
  playerGold: number,
  playerEssence: number,
  playerLevel: number,
  unlockedRarities: string[] = []
): { canBuy: boolean; reason?: string } {
  if (!item.enabled) {
    return { canBuy: false, reason: 'Item not available' };
  }

  // Check level requirement
  if (item.requirements?.minLevel && playerLevel < item.requirements.minLevel) {
    return { canBuy: false, reason: `Requires level ${item.requirements.minLevel}+` };
  }

  // Check rarity unlock requirement
  if (item.requirements?.unlockedRarities && item.requirements.unlockedRarities.length > 0) {
    const hasUnlock = item.requirements.unlockedRarities.some((r) => unlockedRarities.includes(r));
    if (!hasUnlock) {
      return { canBuy: false, reason: `Rarity not unlocked` };
    }
  }

  // Check if player has enough of ANY required currency
  const hasEnough = item.costs.some((cost) => {
    if (cost.currency === 'gold') return playerGold >= cost.amount;
    if (cost.currency === 'essence') return playerEssence >= cost.amount;
    return false;
  });

  if (!hasEnough) {
    return { canBuy: false, reason: 'Not enough currency' };
  }

  return { canBuy: true };
}

/**
 * Get the cost that can be paid
 */
export function getAffordableCost(
  item: ShopItem,
  playerGold: number,
  playerEssence: number
): Cost | null {
  return (
    item.costs.find((c) => {
      if (c.currency === 'gold') return playerGold >= c.amount;
      if (c.currency === 'essence') return playerEssence >= c.amount;
      return false;
    }) ?? null
  );
}
