import { ItemTemplate, Rarity } from './types';

export const SLOTS = ["familier", "bottes", "ceinture", "chapeau", "plastron", "anneau", "arme"] as const;

export const ITEM_POOL: ItemTemplate[] = [
    //Chapeaux
  { slot: "hat", name: "Straw Hat", category: "armor", stats: { hp: 1 }, weight: 4, rarity: "common" },
  { slot: "hat", name: "Chef's Hat", category: "armor", stats: { hp: 1, dodge: 1 }, weight: 4, rarity: "common" },
  { slot: "hat", name: "Wool Cap", category: "armor", stats: { hp: 3, dodge: 2 }, weight: 4, rarity: "rare" },
  { slot: "hat", name: "Iron Helmet", category: "armor", stats: { hp: 4, def: 2 }, weight: 4, rarity: "rare" },
  { slot: "hat", name: "Warrior Helm", category: "armor", stats: { hp: 8, def: 3, dodge: 2 }, weight: 4, rarity: "epic" },
  { slot: "hat", name: "Legendary Helmet", category: "armor", stats: { hp: 14, def: 7, dodge: 4 }, weight: 2, rarity: "legendary" },
  { slot: "hat", name: "Sun King Crown", category: "armor", stats: { hp: 25, def: 14, dodge: 8, crit: 7 }, weight: 1, rarity: "mythic" },
  // Bottes
  { slot: "boots", name: "Leather Boots", category: "armor", stats: { dodge: 1 }, weight: 4, rarity: "common" },
  { slot: "boots", name: "Rider Boots", category: "armor", stats: { dmg: 1 }, weight: 4, rarity: "common" },
  { slot: "boots", name: "Agile Boots", category: "armor", stats: { dodge: 3, dmg: 1, speed: 2 }, weight: 4, rarity: "rare" },
  { slot: "boots", name: "Swift Boots", category: "armor", stats: { dodge: 5, speed: 10 }, weight: 4, rarity: "epic" },
  { slot: "boots", name: "Epic Boots", category: "armor", stats: { dodge: 7, speed: 12, dmg: 2 }, weight: 4, rarity: "epic" },
  { slot: "boots", name: "Legendary Boots", category: "armor", stats: { dodge: 8, speed: 15, dmg: 2 }, weight: 4, rarity: "legendary" },
  { slot: "boots", name: "Phoenix Boots", category: "armor", stats: { dodge: 12, speed: 20, dmg: 3, crit: 6 }, weight: 4, rarity: "mythic" },
  // Anneaux
  { slot: "ring", name: "Simple Ring", category: "accessory", stats: { hp: 1 }, weight: 3, rarity: "common" },
  { slot: "ring", name: "Modest Ring", category: "accessory", stats: { crit: 1, hp: 3 }, weight: 2, rarity: "rare" },
  { slot: "ring", name: "Rooster Ring", category: "accessory", stats: { dodge: 4, crit: 2 }, weight: 1.5, rarity: "rare" },
  { slot: "ring", name: "Precision Ring", category: "accessory", stats: { crit: 3, dmg: 2 }, weight: 1, rarity: "epic" },
  { slot: "ring", name: "Legendary Ring", category: "accessory", stats: { crit: 5, dmg: 3, hp: 8 }, weight: 0.5, rarity: "legendary" },
  { slot: "ring", name: "Dragon Band", category: "accessory", stats: { crit: 9, dmg: 7, hp: 15, dodge: 5 }, weight: 0.3, rarity: "mythic" },
    // Plastrons
  { slot: "chestplate", name: "Simple Tunic", category: "armor", stats: { hp: 1, def:1 }, weight: 3, rarity: "common" },
  { slot: "chestplate", name: "Basic Cuirass", category: "armor", stats: { hp: 2, def: 1 }, weight: 2, rarity: "common" },
  { slot: "chestplate", name: "Light Breastplate", category: "armor", stats: { hp: 8, def: 1 }, weight: 1, rarity: "rare" },
  { slot: "chestplate", name: "Combat Armor", category: "armor", stats: { hp: 6, def: 3 }, weight: 1, rarity: "rare" },
  { slot: "chestplate", name: "Sturdy Cuirass", category: "armor", stats: { hp: 12, def: 3 }, weight: 0.8, rarity: "epic" },
  { slot: "chestplate", name: "Heavy Armor", category: "armor", stats: { hp: 18, def: 5 }, weight: 0.5, rarity: "legendary" },
  { slot: "chestplate", name: "Titanic Armor", category: "armor", stats: { hp: 25, def: 8, crit: 4 }, weight: 0.3, rarity: "mythic" },
    // Ceintures
  { slot: "belt", name: "Rope Belt", category: "armor", stats: { hp: 2 }, weight: 7, rarity: "common" },
  { slot: "belt", name: "Leather Belt", category: "armor", stats: { hp: 3, def: 1 }, weight: 7, rarity: "common" },
  { slot: "belt", name: "Reinforced Belt", category: "armor", stats: { hp: 6, def: 2 }, weight: 7, rarity: "rare" },
  { slot: "belt", name: "Fighter's Belt", category: "armor", stats: { hp: 4, def: 3 }, weight: 7, rarity: "rare" },
  { slot: "belt", name: "Battle Belt", category: "armor", stats: { hp: 10, def: 5 }, weight: 7, rarity: "epic" },
  { slot: "belt", name: "Legendary Belt", category: "armor", stats: { hp: 15, def: 8 }, weight: 7, rarity: "legendary" },
  { slot: "belt", name: "Colossus Belt", category: "armor", stats: { hp: 27, def: 10, dmg: 7 }, weight: 7, rarity: "mythic" },
    // Armes
  { slot: "weapon", name: "Dull Dagger", category: "weapon", stats: { dmg: 1, crit: 1 }, weight: 4, rarity: "common" },
  { slot: "weapon", name: "Short Sword", category: "weapon", stats: { dmg: 1 }, weight: 3, rarity: "common" },
  { slot: "weapon", name: "War Mace", category: "weapon", stats: { dmg: 6, def:1 }, weight: 2, rarity: "rare" },
  { slot: "weapon", name: "Long Sword", category: "weapon", stats: { dmg: 8, crit: 2 }, weight: 1.5, rarity: "rare" },
  { slot: "weapon", name: "Battle Axe", category: "weapon", stats: { dmg: 12, crit: 3 }, weight: 1, rarity: "epic" },
  { slot: "weapon", name: "Legendary Blade", category: "weapon", stats: { dmg: 16, crit: 5 }, weight: 0.5, rarity: "legendary" },
  { slot: "weapon", name: "Excalibur", category: "weapon", stats: { dmg: 22, crit: 8, dodge: 4 }, weight: 0.2, rarity: "mythic" },
    // Familiers
  { slot: "familiar", name: "Small Dragon", category: "pet", stats: { dmg: 8, hp: 5 }, weight: 1, rarity: "epic" },
  { slot: "familiar", name: "Luminous Fairy", category: "pet", stats: { hp: 15, dodge: 5 }, weight: 1, rarity: "legendary" },
  { slot: "familiar", name: "Eternal Phoenix", category: "pet", stats: { dmg: 14, hp: 20, crit: 8, dodge:2 }, weight: 0.5, rarity: "mythic" },
];

export const rarityMultiplier: Record<Rarity, number> = {
  common: 1,
  rare: 1.3,
  epic: 1.6,
  legendary: 2.2,
  mythic: 3.8,
};

export const priceMultiplier: Record<Rarity, number> = {
  common: 1,
  rare: 1.6,
  epic: 2.6,
  legendary: 5,
  mythic: 12,
};

export const computeItemCost = (stats: Record<string, number> | undefined, rarity: Rarity) => {
  const base = 10 + Object.values(stats || {}).reduce((s, v) => s + Number(v || 0), 0) * 5;
  const mult = priceMultiplier[rarity] ?? 1;
  return Math.max(1, Math.round(base * mult));
};

export const scaleStats = (stats: Record<string, number> | undefined, rarity: Rarity) => {
  if (!stats) return undefined;
  const m = rarityMultiplier[rarity] ?? 1;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(stats)) {
    out[k] = Math.max(0, Math.round((v || 0) * m));
  }
  return out;
};