import { ItemTemplate, Rarity } from '../types';

export const SLOTS = ["familiar", "boots", "belt", "hat", "chestplate", "ring", "weapon"] as const;

export const ITEM_POOL: ItemTemplate[] = [
    //Chapeaux
  { slot: "hat", name: "Night Hood", category: "armor", stats: { dodge: 1 }, weight: 3, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"], description: "See without being seen." },
  { slot: "hat", name: "Chef's Hat", category: "armor", stats: { hp: 1, def: 1 }, weight: 3, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"], description: "Not heroic. Sufficient." },
  { slot: "hat", name: "Fortin helmet", category: "armor", stats: { hp: 3, def: 3 }, weight: 4, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Walls rarely lie." },
  { slot: "hat", name: "Helmet in Inns", category: "armor", stats: { hp: 4, def: 5, regen: 1 }, weight: 4, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Nights in inns are worse than battles." },
  { slot: "hat", name: "Second Mask", category: "armor", stats: { hp: 2, dodge: 4, resolve: 1 }, weight: 4, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Sometimes it's better to be nobody." },
  { slot: "hat", name: "Eyebrow pencil", category: "armor", stats: { hp: 6, def: 7, dodge: 3 }, weight: 4, rarity: "epic", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "To look is to choose." },
  { slot: "hat", name: "Broken Spectacles", category: "armor", stats: { hp: 5, resolve: 5, dodge: 5 }, weight: 4, rarity: "legendary", allowedMaps: ["ruins", "volcano"], description: "Seeing the truth kills. Slowly." },
  { slot: "hat", name: "Helm of the Petitioner", category: "armor", stats: { hp: 10, def: 10, resolve: 12 }, weight: 4, rarity: "mythic", allowedMaps: ["volcano", "burning_throne"], description: "Asking has never been without consequence." },
  // Bottes
  { slot: "boots", name: "Claies Boots", category: "armor", stats: { speed: 1 }, weight: 3, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"], description: "To flee or to pursue. Often the same thing." },
  { slot: "boots", name: "Messenger Boots", category: "armor", stats: { speed: 3, dodge: 1 }, weight: 3, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Bad news always arrives before you do." },
  { slot: "boots", name: "Refuge Clogs", category: "armor", stats: { hp: 2, speed: 3 }, weight: 3, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "The ground does not protect, but it supports." },
  { slot: "boots", name: "Dodge Shoes", category: "armor", stats: { regen: 2, dodge: 3, speed: 4 }, weight: 3, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Staying alive is nothing to be proud of." },
  { slot: "boots", name: "Hail Shoes", category: "armor", stats: { dodge: 9, speed: 10 }, weight: 3, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: " Let the projectiles pass between yourself and nothing." },
  { slot: "boots", name: "Sepulchre Boots", category: "armor", stats: { dodge: 12, resolve: 6 }, weight: 3, rarity: "legendary", allowedMaps: ["ruins", "volcano"], description: "Graves do not pursue—they wait." },
  { slot: "boots", name: "Nightbreaker ", category: "armor", stats: { dodge: 14, speed: 16, resolve: 8 }, weight: 3, rarity: "mythic", allowedMaps: ["volcano", "burning_throne"], description: "" },
  { slot: "boots", name: "Blazing Boots", category: "armor", stats: { dodge: 6, speed: 10, dmg: 4 }, weight: 3, rarity: "epic", allowedMaps: ["ruins", "volcano"], description: "You move differently when you know you're going to die." },
  { slot: "boots", name: "Bulwark Boots", category: "armor", stats: { dodge: 18, speed: 28, dmg: 14 }, weight: 3, rarity: "legendary", allowedMaps: ["ruins", "volcano"], description: "" },
  { slot: "boots", name: "Phoenix Boots", category: "armor", stats: { dodge: 28, speed: 42, dmg: 8, crit: 10 }, weight: 3, rarity: "mythic", allowedMaps: ["volcano", "burning_throne"], description: "" },
  // Anneaux
  { slot: "ring", name: "Modest Ring", category: "accessory", stats: { hp: 1 }, weight: 3, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"], description: "We are content." },
  { slot: "ring", name: "Gray Ring", category: "accessory", stats: { hp: 2, resolve:1 }, weight: 3, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Nothing really changes." },
  { slot: "ring", name: "Safety Ring", category: "accessory", stats: { dodge: 4, resolve: 2 }, weight: 3, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Doubt saves lives." },
  { slot: "ring", name: "Tie Ring", category: "accessory", stats: { crit: 4, dmg: 5 }, weight: 3, rarity: "epic", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Some details hurt." },
  { slot: "ring", name: "Circus of Penance ", category: "accessory", stats: { crit: 4, hp: 6, resolve: 6 }, weight: 3, rarity: "legendary", allowedMaps: ["ruins", "volcano"], description: "We pay what we owe." },
  { slot: "ring", name: "Broken Ring", category: "accessory", stats: { resolve: 12, crit: 6, hp: 8 }, weight: 3, rarity: "mythic", allowedMaps: ["volcano", "burning_throne"], description: "What remains is not what we thought it would be." },
    // Plastrons
  { slot: "chestplate", name: "Travel Vest", category: "armor", stats: { hp: 2, dodge: 2 }, weight: 3, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"], description: "Light enough to run away." },
  { slot: "chestplate", name: "Fireless Tunic", category: "armor", stats: { hp: 4, dodge: 3, regen: 1 }, weight: 6, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Sleeping near the cold keeps you cautious." },
  { slot: "chestplate", name: "Fallback Fabric", category: "armor", stats: { hp: 6, dodge: 6, regen: 2 }, weight: 6, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Victory belongs to the patients." },
  { slot: "chestplate", name: "Bond's cape", category: "armor", stats: { hp: 9, dodge: 10, speed: 4 }, weight: 6, rarity: "epic", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Strike fast, disappear faster." },
  
  { slot: "chestplate", name: "Battle Breastplate", category: "armor", stats: { hp: 3, def: 3}, weight: 4, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"], description: "Protecting the flesh does not prevent the rest from suffering." },
  { slot: "chestplate", name: "Guard Breastplate", category: "armor", stats: { hp: 6, def: 5 }, weight: 6, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "To stay the course when others give up." },
  { slot: "chestplate", name: "Patchwork Armor ", category: "armor", stats: { hp: 10, def: 7, resolve: 1 }, weight: 6, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Anything that breaks can hold out a little longer." },
  { slot: "chestplate", name: "Lookout Point", category: "armor", stats: { hp: 12, def: 10, resolve: 3 }, weight: 6, rarity: "epic", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "They saw everything. Rarely died." },
  { slot: "chestplate", name: "Male ferret", category: "armor", stats: { hp: 18, def: 14,regen: 5 }, weight: 6, rarity: "legendary", allowedMaps: ["ruins", "volcano"], description: "The sound of metal against the world." },
  { slot: "chestplate", name: "Shroud of the Elder", category: "armor", stats: { hp: 30, def: 20,resolve: 10 }, weight: 6, rarity: "mythic", allowedMaps: ["volcano", "burning_throne"], description: "On ne comprend qu’à la fin pourquoi ils se taisaient." },
    // Ceintures
  { slot: "belt", name: "Work Belt", category: "armor", stats: { hp: 2 }, weight: 7, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"], description: "Some days nothing breaks." },
  { slot: "belt", name: "Veteran's Belt", category: "armor", stats: { hp: 4, def: 2 }, weight: 7, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Few talk about what they have lost." },
  { slot: "belt", name: "Studded Belt", category: "armor", stats: { resolve: 2, def: 4 }, weight: 7, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Discipline is a gentle way of suffering." },
  { slot: "belt", name: "Shock Belt", category: "armor", stats: { hp: 8, def: 6, resolve: 3}, weight: 7, rarity: "epic", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "You grip before hitting." },
  { slot: "belt", name: "Ascetic Link", category: "armor", stats: { hp: 6, resolve: 8 }, weight: 7, rarity: "legendary", allowedMaps: ["ruins", "volcano"], description: "The flesh never had a say." },
  { slot: "belt", name: "Jugular Fascia ", category: "armor", stats: { hp: 8, resolve: 15 }, weight: 7, rarity: "mythic", allowedMaps: ["volcano", "burning_throne"], description: "The verdict is never lenient." },
    // Armes - SWORD TYPE
    // Épée: polyvalente (speed+, crit+, dodge+, dmg+)
    { slot: "weapon", name: "Cold guard", category: "weapon", weaponType: "sword", stats: { dmg: 2, crit: 1, dodge: 1 }, weight: 5, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"], description: "Counter: Dodge → Riposte" },
    { slot: "weapon", name: "Watchman of Escarde", category: "weapon", weaponType: "sword", stats: { dmg: 6, crit: 3, dodge: 5 }, weight: 5, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Counter: Dodge → Riposte" },
    { slot: "weapon", name: "Final World", category: "weapon", weaponType: "sword", stats: { dmg: 15, crit: 8, dodge: 10}, weight: 5, rarity: "mythic", allowedMaps: ["volcano", "burning_throne"], description: "Counter: Dodge → Riposte" },
  
    // Armes - DAGGER TYPE
    // Dague: multi-coups (dmg+, crit+, speed++)
    { slot: "weapon", name: "Night Thorn", category: "weapon", weaponType: "dagger", stats: { dmg: 1, crit: 1, speed: 1 }, weight: 3, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"], description: "Multi-Hit: 2x chance bonus" },
    { slot: "weapon", name: "Hunter's Hook", category: "weapon", weaponType: "dagger", stats: { dmg: 3, crit: 2, speed: 3 }, weight: 3, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins", "volcano"  ], description: "Multi-Hit: 2x chance bonus" },
    { slot: "weapon", name: "Greenhouse of the Unacknowledged", category: "weapon", weaponType: "dagger", stats: { dmg: 9, crit: 6, speed: 12 }, weight: 3, rarity: "epic", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"], description: "Multi-Hit: 2x chance bonus" },
  
    // Armes - SPEAR TYPE
    // Lance: tactique (dmg++, speed+, dodge+, anti rage)
    { slot: "weapon", name: "Templar Stake", category: "weapon", weaponType: "spear", stats: { dmg: 4, speed: 2, dodge: 2 }, weight: 6, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Anti-Rage: Prevents +20% rage boost" },
    { slot: "weapon", name: "Gungnir", category: "weapon", weaponType: "spear", stats: { dmg: 18, speed: 6, dodge: 5 }, weight: 6, rarity: "legendary", allowedMaps: ["ruins", "volcano"], description: "Anti-Rage: Prevents +20% rage boost" },
    { slot: "weapon", name: "Tear of Austre", category: "weapon", weaponType: "spear", stats: { dmg: 22,  speed: 10, dodge: 8 }, weight: 6, rarity: "mythic", allowedMaps: ["volcano", "burning_throne"], description: "Anti-Rage: Prevents +20% rage boost" },
  
    // Armes - AXE TYPE
    // Hache: brutal (dmg++, pénétration+, def+, boss damage)
    { slot: "weapon", name: "Shroud cutter", category: "weapon", weaponType: "axe", stats: { dmg: 3, def: 1 }, weight: 5, rarity: "common", allowedMaps: ["spawn", "forest", "caves", "ruins", "volcano"], description: "Boss Damage: +25% vs Bosses | Penetration: 25% def ignore" },
    { slot: "weapon", name: "Breaking", category: "weapon", weaponType: "axe", stats: { dmg: 7, def: 4 }, weight: 5, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Boss Damage: +25% vs Bosses | Penetration: 25% def ignore" },
    { slot: "weapon", name: "Memoir of Ferre", category: "weapon", weaponType: "axe", stats: { dmg: 14, def: 6 }, weight: 5, rarity: "legendary", allowedMaps: ["ruins", "volcano"], description: "Boss Damage: +50% vs Bosses | Penetration: 25% def ignore" },
    { slot: "weapon", name: "Garzen", category: "weapon", weaponType: "axe", stats: { dmg: 16, def: 5 }, weight: 5, rarity: "legendary", allowedMaps: [ "ruins", "volcano"], description: "Boss Damage: +50% vs Bosses | Penetration: 25% def ignore" },
    // Familiers
  { slot: "familiar", name: "Ash Crow", category: "pet", stats: { dodge: 6, speed: 2, regen: 1 }, weight: 2, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Winter never takes its time." },
  { slot: "familiar", name: "Lame Cat", category: "pet", stats: { hp: 3, resolve: 1, regen: 2 }, weight: 2, rarity: "uncommon", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "We're barely surviving, but we're surviving." },
  { slot: "familiar", name: "Dog of the Outskirts", category: "pet", stats: { dmg: 2, hp: 6, resolve: 2 }, weight: 2, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Faithful in bad times." },
  { slot: "familiar", name: "Fly Guard", category: "pet", stats: { dodge: 4, resolve: 1, regen:3 }, weight: 2, rarity: "rare", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Small things don't die without reason." },
  { slot: "familiar", name: "Owl Night Light", category: "pet", stats: { dodge: 6, speed: 2, resolve: 3 }, weight: 2, rarity: "epic", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "It observes. It understands." },
  { slot: "familiar", name: "Eclipse Lizard", category: "pet", stats: { dmg: 8, crit: 4 }, weight: 2, rarity: "epic", allowedMaps: ["forest", "caves", "ruins", "volcano"], description: "Light is just an accident." },
  { slot: "familiar", name: "Specter of the Nest", category: "pet", stats: { resolve: 8, dodge: 6, hp: 6 }, weight: 2, rarity: "legendary", allowedMaps: ["ruins", "volcano"], description: "Walls keep what they see." },
  { slot: "familiar", name: "Moth Coil", category: "pet", stats: { resolve: 12, dodge: 10, hp:10 }, weight: 2, rarity: "mythic", allowedMaps: ["volcano", "burning_throne"], description: "The end attracts those who know." },
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