import { ItemTemplate, Rarity } from '../types';

export const SLOTS = ["familiar", "boots", "belt", "hat", "chestplate", "ring", "weapon"] as const;

export const ITEM_POOL: ItemTemplate[] = [
    //Chapeaux
  { slot: "hat", name: "Straw Hat", category: "armor", stats: { hp: 1 }, weight: 4, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"] },
  { slot: "hat", name: "Chef's Hat", category: "armor", stats: { hp: 1, dodge: 1 }, weight: 4, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"] },
  { slot: "hat", name: "Padded Cap", category: "armor", stats: { hp: 2, def: 1 }, weight: 4, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins"] },
  { slot: "hat", name: "Leather Helmet", category: "armor", stats: { hp: 3, def: 2 }, weight: 4, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins"] },
  { slot: "hat", name: "Wool Cap", category: "armor", stats: { hp: 5, dodge: 3 }, weight: 4, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"] },
  { slot: "hat", name: "Iron Helmet", category: "armor", stats: { hp: 4, def: 5 }, weight: 4, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"] },
  { slot: "hat", name: "Warrior Helm", category: "armor", stats: { hp: 14, def: 8, dodge: 4 }, weight: 4, rarity: "epic", allowedMaps: ["caves", "ruins", "volcano"] },
  { slot: "hat", name: "Knight's Crown", category: "armor", stats: { hp: 12, def: 10, dodge: 6 }, weight: 4, rarity: "epic", allowedMaps: ["caves", "ruins", "volcano"] },
  { slot: "hat", name: "Divine Helmet", category: "armor", stats: { hp: 26, def: 14, dodge: 8 }, weight: 4, rarity: "legendary", allowedMaps: ["ruins", "volcano"] },
  { slot: "hat", name: "Steel headgear", category: "armor", stats: { hp: 22, def: 18, crit: 5, dodge: 5 }, weight: 4, rarity: "legendary", allowedMaps: ["ruins", "volcano"] },
  { slot: "hat", name: "Sun King Crown", category: "armor", stats: { hp: 48, def: 26, dodge: 14, crit: 12 }, weight: 4, rarity: "mythic", allowedMaps: ["volcano"] },
  // Bottes
  { slot: "boots", name: "Leather Boots", category: "armor", stats: { dodge: 1 }, weight: 3, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"] },
  { slot: "boots", name: "Rider Boots", category: "armor", stats: { dmg: 1 }, weight: 3, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"] },
  { slot: "boots", name: "Traveler Boots", category: "armor", stats: { dodge: 2, speed: 2 }, weight: 3, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins"] },
  { slot: "boots", name: "Scout Boots", category: "armor", stats: { dmg: 1, speed: 3 }, weight: 3, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins"] },
  { slot: "boots", name: "Agile Boots", category: "armor", stats: { dodge: 4, dmg: 2, speed: 3 }, weight: 3, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"] },
  { slot: "boots", name: "Hunter Boots", category: "armor", stats: { dodge: 5, speed: 8 }, weight: 3, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"] },
  { slot: "boots", name: "Swift Boots", category: "armor", stats: { dodge: 10, speed: 14 }, weight: 3, rarity: "epic", allowedMaps: ["caves", "ruins", "volcano"] },
  { slot: "boots", name: "Blazing Boots", category: "armor", stats: { dodge: 12, speed: 20, dmg: 8 }, weight: 3, rarity: "epic", allowedMaps: ["caves", "ruins", "volcano"] },
  { slot: "boots", name: "Bulwark Boots", category: "armor", stats: { dodge: 18, speed: 28, dmg: 14 }, weight: 3, rarity: "legendary", allowedMaps: ["ruins", "volcano"] },
  { slot: "boots", name: "Phoenix Boots", category: "armor", stats: { dodge: 28, speed: 42, dmg: 8, crit: 10 }, weight: 3, rarity: "mythic", allowedMaps: ["volcano"] },
  // Anneaux
  { slot: "ring", name: "Simple Ring", category: "accessory", stats: { hp: 1 }, weight: 3, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"] },
  { slot: "ring", name: "Copper Ring", category: "accessory", stats: { dmg: 1 }, weight: 3, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"] },
  { slot: "ring", name: "Bronze Ring", category: "accessory", stats: { hp: 2, dmg: 1 }, weight: 3, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins"] },
  { slot: "ring", name: "Silver Ring", category: "accessory", stats: { def: 2, dodge: 1 }, weight: 3, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins"] },
  { slot: "ring", name: "Modest Ring", category: "accessory", stats: { crit: 2, hp: 5 }, weight: 3, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"] },
  { slot: "ring", name: "Rooster Ring", category: "accessory", stats: { dodge: 6, crit: 3, def: 4 }, weight: 3, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"] },
  { slot: "ring", name: "Precision Ring", category: "accessory", stats: { crit: 6, dmg: 10, def: 6 }, weight: 3, rarity: "epic", allowedMaps: ["caves", "ruins", "volcano"] },
  { slot: "ring", name: "Dragon Ring", category: "accessory", stats: { crit: 10, dmg: 16, hp: 14 }, weight: 3, rarity: "legendary", allowedMaps: ["ruins", "volcano"] },
  { slot: "ring", name: "Dragon Band", category: "accessory", stats: { crit: 16, dmg: 38, hp: 26, dodge: 10, def: 30 }, weight: 3, rarity: "mythic", allowedMaps: ["volcano"] },
    // Plastrons
  { slot: "chestplate", name: "Simple Tunic", category: "armor", stats: { hp: 1, def: 2 }, weight: 6, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"] },
  { slot: "chestplate", name: "Basic Cuirass", category: "armor", stats: { hp: 2, def: 1 }, weight: 6, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"] },
  { slot: "chestplate", name: "Leather Vest", category: "armor", stats: { hp: 4, def: 2 }, weight: 6, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins"] },
  { slot: "chestplate", name: "Reinforced Tunic", category: "armor", stats: { hp: 5, def: 3, dodge: 1 }, weight: 6, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins"] },
  { slot: "chestplate", name: "Light Breastplate", category: "armor", stats: { hp: 12, def: 6, dodge: 3, regen: 4 }, weight: 6, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"] },
  { slot: "chestplate", name: "Combat Armor", category: "armor", stats: { hp: 10, def: 6, crit: 3, regen: 4 }, weight: 6, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"] },
  { slot: "chestplate", name: "Sturdy Cuirass", category: "armor", stats: { hp: 24, def: 12, dodge: 6, regen: 8 }, weight: 6, rarity: "epic", allowedMaps: ["caves", "ruins", "volcano"] },
  { slot: "chestplate", name: "Heavy Armor", category: "armor", stats: { hp: 40, def: 12, regen: 20 }, weight: 6, rarity: "legendary", allowedMaps: ["ruins", "volcano"] },
  { slot: "chestplate", name: "Titanic Armor", category: "armor", stats: { hp: 70, def: 28, crit: 12, dodge: 10, regen: 80 }, weight: 6, rarity: "mythic", allowedMaps: ["volcano"] },
    // Ceintures
  { slot: "belt", name: "Rope Belt", category: "armor", stats: { hp: 2, def: 1 }, weight: 7, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"] },
  { slot: "belt", name: "Leather Belt", category: "armor", stats: { hp: 3, def: 1 }, weight: 7, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"] },
  { slot: "belt", name: "Studded Belt", category: "armor", stats: { hp: 5, def: 2 }, weight: 7, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins"] },
  { slot: "belt", name: "Iron Belt", category: "armor", stats: { hp: 6, def: 3 }, weight: 7, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins"] },
  { slot: "belt", name: "Reinforced Belt", category: "armor", stats: { hp: 10, def: 4 }, weight: 7, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"] },
  { slot: "belt", name: "Fighter's Belt", category: "armor", stats: { hp: 8, def: 5 }, weight: 7, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"] },
  { slot: "belt", name: "Battle Belt", category: "armor", stats: { hp: 18, def: 10 }, weight: 7, rarity: "epic", allowedMaps: ["caves", "ruins", "volcano"] },
  { slot: "belt", name: "Colossus Belt", category: "armor", stats: { hp: 32, def: 16 }, weight: 7, rarity: "legendary", allowedMaps: ["ruins", "volcano"] },
  { slot: "belt", name: "Titanic Belt", category: "armor", stats: { hp: 54, def: 32, dmg: 60 }, weight: 7, rarity: "mythic", allowedMaps: ["volcano"] },
    // Armes
  { slot: "weapon", name: "Dull Dagger", category: "weapon", stats: { dmg: 1, crit: 1 }, weight: 5, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"] },
  { slot: "weapon", name: "Short Sword", category: "weapon", stats: { dmg: 1 }, weight: 5, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"] },
  { slot: "weapon", name: "Iron Dagger", category: "weapon", stats: { dmg: 2, crit: 1 }, weight: 5, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins"] },
  { slot: "weapon", name: "Basic Sword", category: "weapon", stats: { dmg: 3, crit: 1 }, weight: 5, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins"] },
  { slot: "weapon", name: "War Mace", category: "weapon", stats: { dmg: 10, crit: 2 }, weight: 5, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"] },
  { slot: "weapon", name: "Long Sword", category: "weapon", stats: { dmg: 12, crit: 3 }, weight: 5, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"] },
  { slot: "weapon", name: "Battle Axe", category: "weapon", stats: { dmg: 20, crit: 5 }, weight: 5, rarity: "epic", allowedMaps: ["caves", "ruins", "volcano"] },
  { slot: "weapon", name: "Colossus Blade", category: "weapon", stats: { dmg: 40, crit: 8 }, weight: 5, rarity: "legendary", allowedMaps: ["ruins", "volcano"] },
  { slot: "weapon", name: "Excalibur", category: "weapon", stats: { dmg: 64, crit: 14, dodge: 8, speed: 18 }, weight: 5, rarity: "mythic", allowedMaps: ["volcano"] },
    // Familiers
  { slot: "familiar", name: "Small Dragon", category: "pet", stats: { dmg: 12, hp: 8, regen: 2 }, weight: 2, rarity: "epic", allowedMaps: ["caves", "ruins", "volcano"] },
  { slot: "familiar", name: "Luminous Fairy", category: "pet", stats: { hp: 28, dodge: 10, regen: 4 }, weight: 2, rarity: "legendary", allowedMaps: ["ruins", "volcano"] },
  { slot: "familiar", name: "Eternal Phoenix", category: "pet", stats: { dmg: 36, hp: 35, crit: 14, dodge: 6, regen: 8 }, weight: 2, rarity: "mythic", allowedMaps: ["volcano"] },
];

export const rarityMultiplier: Record<Rarity, number> = {
  common: 1,
  uncommon: 1.2,
  rare: 1.5,
  epic: 2,
  legendary: 2.8,
  mythic: 4.5,
};

export const priceMultiplier: Record<Rarity, number> = {
  common: 1,
  uncommon: 1.3,
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