import { ItemTemplate, Rarity } from './types';

export const SLOTS = ["familier", "bottes", "ceinture", "chapeau", "plastron", "anneau", "arme"] as const;

export const ITEM_POOL: ItemTemplate[] = [
    //Chapeaux
  { slot: "chapeau", name: "Chapeau de paille", category: "armor", stats: { hp: 1 }, weight: 4, rarity: "common" },
  { slot: "chapeau", name: "Toque du cuisinier", category: "armor", stats: { hp: 1, dodge: 1 }, weight: 4, rarity: "common" },
  { slot: "chapeau", name: "Bonnet en laine", category: "armor", stats: { hp: 4, dodge: 2 }, weight: 4, rarity: "rare" },
  { slot: "chapeau", name: "Casque de fer", category: "armor", stats: { hp: 6, def: 1 }, weight: 2, rarity: "rare" },
  { slot: "chapeau", name: "Heaume du guerrier", category: "armor", stats: { hp: 10, def: 2 }, weight: 1, rarity: "epic" },
  // Bottes
  { slot: "bottes", name: "Bottes en cuir", category: "armor", stats: { dodge: 1 }, weight: 4, rarity: "common" },
  { slot: "bottes", name: "Bottes du coursier", category: "armor", stats: { dmg: 1 }, weight: 4, rarity: "common" },
  { slot: "bottes", name: "Bottes agiles", category: "armor", stats: { dodge: 3, dmg: 1 }, weight: 2, rarity: "rare" },
  { slot: "bottes", name: "Bottes de rapidité", category: "armor", stats: { dodge: 5, speed: 10 }, weight: 1, rarity: "epic" },
  { slot: "bottes", name: "Bottes épiques", category: "armor", stats: { dodge: 7, speed: 12, dmg: 2 }, weight: 0.8, rarity: "epic" },
  { slot: "bottes", name: "Bottes légendaires", category: "armor", stats: { dodge: 8, speed: 15, dmg: 2 }, weight: 0.5, rarity: "legendary" },
  { slot: "bottes", name: "Bottes du Phoenix", category: "armor", stats: { dodge: 12, speed: 20, dmg: 3, crit: 6 }, weight: 0.2, rarity: "mythic" },
  // Anneaux
  { slot: "anneau", name: "Anneau en mousse", category: "accessory", stats: { hp: 1 }, weight: 3, rarity: "common" },
  { slot: "anneau", name: "Anneau modeste", category: "accessory", stats: { crit: 1, hp: 3 }, weight: 2, rarity: "rare" },
  { slot: "anneau", name: "Bague du coq", category: "accessory", stats: { dodge: 4, crit: 2 }, weight: 1.5, rarity: "rare" },
  { slot: "anneau", name: "Anneau de précision", category: "accessory", stats: { crit: 3, dmg: 2 }, weight: 1, rarity: "epic" },
  { slot: "anneau", name: "Anneau légendaire", category: "accessory", stats: { crit: 5, dmg: 3, hp: 8 }, weight: 0.5, rarity: "legendary" },
  // Plastrons
  { slot: "plastron", name: "Tunique simple", category: "armor", stats: { hp: 4 }, weight: 3, rarity: "common" },
  { slot: "plastron", name: "Cuirasse basique", category: "armor", stats: { hp: 6, def: 1 }, weight: 2, rarity: "common" },
  { slot: "plastron", name: "Plastron léger", category: "armor", stats: { hp: 8, def: 1 }, weight: 1, rarity: "rare" },
  { slot: "plastron", name: "Cuirasse solide", category: "armor", stats: { hp: 12, def: 3 }, weight: 0.8, rarity: "epic" },
  { slot: "plastron", name: "Armure lourde", category: "armor", stats: { hp: 18, def: 5 }, weight: 0.5, rarity: "legendary" },
  { slot: "plastron", name: "Armure titanesque", category: "armor", stats: { hp: 25, def: 8, crit: 4 }, weight: 0.3, rarity: "mythic" },
  { slot: "ceinture", name: "Ceinture en corde", category: "armor", stats: { hp: 2 }, weight: 4, rarity: "common" },
  { slot: "ceinture", name: "Ceinture de cuir", category: "armor", stats: { hp: 3, def: 1 }, weight: 3, rarity: "common" },
  { slot: "ceinture", name: "Ceinture renforcée", category: "armor", stats: { hp: 6, def: 2 }, weight: 2, rarity: "rare" },
  { slot: "ceinture", name: "Ceinture du combattant", category: "armor", stats: { hp: 8, def: 3 }, weight: 1.5, rarity: "rare" },
  { slot: "ceinture", name: "Ceinture de bataille", category: "armor", stats: { hp: 10, def: 5 }, weight: 1, rarity: "epic" },
  { slot: "ceinture", name: "Ceinture légendaire", category: "armor", stats: { hp: 15, def: 8 }, weight: 0.5, rarity: "legendary" },
  { slot: "ceinture", name: "Ceinture du Colosse", category: "armor", stats: { hp: 27, def: 10, dmg: 7 }, weight: 0.3, rarity: "mythic" },
  { slot: "arme", name: "Dague émoussée", category: "weapon", stats: { dmg: 2 }, weight: 4, rarity: "common" },
  { slot: "arme", name: "Épée courte", category: "weapon", stats: { dmg: 4 }, weight: 3, rarity: "common" },
  { slot: "arme", name: "Masse d'armes", category: "weapon", stats: { dmg: 6 }, weight: 2, rarity: "rare" },
  { slot: "arme", name: "Épée longue", category: "weapon", stats: { dmg: 8, crit: 2 }, weight: 1.5, rarity: "rare" },
  { slot: "arme", name: "Hache de bataille", category: "weapon", stats: { dmg: 12, crit: 3 }, weight: 1, rarity: "epic" },
  { slot: "arme", name: "Lame légendaire", category: "weapon", stats: { dmg: 16, crit: 5 }, weight: 0.5, rarity: "legendary" },
  { slot: "arme", name: "Excalibur", category: "weapon", stats: { dmg: 22, crit: 8, dodge: 4 }, weight: 0.2, rarity: "mythic" },
  { slot: "familier", name: "Petit dragon", category: "pet", stats: { dmg: 3, hp: 5 }, weight: 1, rarity: "epic" },
  { slot: "familier", name: "Fée lumineuse", category: "pet", stats: { hp: 6, dodge: 5 }, weight: 1, rarity: "legendary" },
  { slot: "familier", name: "Phénix éternel", category: "pet", stats: { dmg: 12, hp: 20, crit: 8, dodge:1 }, weight: 0.5, rarity: "mythic" },
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