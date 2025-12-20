import { Rarity, Item } from '../types';

// Material types for forge actions
export type MaterialType = 'essence_dust' | 'mithril_ore' | 'star_fragment' | 'void_shard';

export interface ForgeAction {
  id: string;
  name: string;
  description: string;
  costType: 'gold' | 'essence' | 'material' | 'mixed';
  goldCost?: number;
  essenceCost?: number;
  materialType?: MaterialType;
  materialCost?: number;
  requirements?: {
    minRarity?: Rarity;
    maxRarity?: Rarity;
    requiresMaterial?: MaterialType;
  };
}

export interface ForgeResult {
  success: boolean;
  message: string;
  item?: Item;
  newStats?: Record<string, number>;
}

// Forge actions catalog
export const FORGE_ACTIONS: Record<string, ForgeAction> = {
  upgradeStat: {
    id: 'upgradeStat',
    name: 'Upgrade Stat',
    description: 'Increase one stat by +1 to +3',
    costType: 'gold',
    goldCost: 500,
    requirements: {
      minRarity: 'common',
      maxRarity: 'epic',
    },
  },
  lockStat: {
    id: 'lockStat',
    name: 'Lock Stat',
    description: 'Prevent a stat from being rerolled during upgrades',
    costType: 'mixed',
    goldCost: 300,
    materialType: 'mithril_ore',
    materialCost: 1,
    requirements: {
      minRarity: 'uncommon',
      maxRarity: 'legendary',
    },
  },
  infusion: {
    id: 'infusion',
    name: 'Infusion',
    description: 'Imbue the item with essence to grant special properties',
    costType: 'essence',
    essenceCost: 50,
    requirements: {
      minRarity: 'rare',
      maxRarity: 'legendary',
    },
  },
  mythicEvolution: {
    id: 'mythicEvolution',
    name: 'Mythic Evolution',
    description: 'Transform an item to Mythic rarity (ultimate power)',
    costType: 'essence',
    essenceCost: 150, // 3x 50 essence
    requirements: {
      minRarity: 'legendary',
      maxRarity: 'legendary',
    },
  },
};

// Helper function to check if a player can afford an action
export function canAffordForgeAction(
  action: ForgeAction,
  playerGold: number = 0,
  playerEssence: number = 0,
  materials: Partial<Record<MaterialType, number>> = {}
): { canAfford: boolean; reason?: string } {
  if (action.goldCost && playerGold < action.goldCost) {
    return { canAfford: false, reason: `Need ${action.goldCost}g (have ${playerGold}g)` };
  }

  if (action.essenceCost && playerEssence < action.essenceCost) {
    return { canAfford: false, reason: `Need ${action.essenceCost}✨ (have ${playerEssence}✨)` };
  }

  if (action.materialType && action.materialCost) {
    const available = materials[action.materialType] || 0;
    if (available < action.materialCost) {
      return { canAfford: false, reason: `Need ${action.materialCost}x ${action.materialType} (have ${available})` };
    }
  }

  return { canAfford: true };
}

// Helper to get forge action cost display
export function getForgeActionCostDisplay(action: ForgeAction): string {
  const parts: string[] = [];

  if (action.goldCost) parts.push(`${action.goldCost}g`);
  if (action.essenceCost) parts.push(`${action.essenceCost}✨`);
  if (action.materialType && action.materialCost) {
    parts.push(`${action.materialCost}x ${action.materialType}`);
  }

  return parts.join(' + ') || 'Free';
}

// Helper to check rarity requirements
export function meetsRarityRequirement(
  itemRarity: Rarity,
  action: ForgeAction
): { meets: boolean; reason?: string } {
  const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  const itemIdx = RARITY_ORDER.indexOf(itemRarity);

  if (action.requirements?.minRarity) {
    const minIdx = RARITY_ORDER.indexOf(action.requirements.minRarity);
    if (itemIdx < minIdx) {
      return { meets: false, reason: `Requires ${action.requirements.minRarity}+ rarity` };
    }
  }

  if (action.requirements?.maxRarity) {
    const maxIdx = RARITY_ORDER.indexOf(action.requirements.maxRarity);
    if (itemIdx > maxIdx) {
      return { meets: false, reason: `Cannot apply to ${itemRarity}+ items` };
    }
  }

  return { meets: true };
}
