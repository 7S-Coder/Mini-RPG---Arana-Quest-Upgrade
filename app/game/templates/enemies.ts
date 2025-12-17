import type { EnemyTemplate } from '../types';

export const ENEMY_TEMPLATES: EnemyTemplate[] = [
  // Spawn area enemies
  { templateId: "cockroach", name: "Cockroach", hp: 50, dmg: 3, def: 0, dodge: 1, crit: 80, speed: 200, rarity: 'common' },
  { templateId: "rat", name: "Rat", hp: 25, dmg: 8, def: 12, dodge: 14, crit: 20, speed: 14, rarity: 'common' },
  { templateId: "bat", name: "Bat", hp: 36, dmg: 6, def: 2, dodge: 1, crit: 100, speed: 23, rarity: 'common' },
  { templateId: "ants", name: "Ants", hp: 22, dmg: 14, def: 18, dodge: 14, crit: 14, speed: 12, rarity: 'common' },
    // Rare area Forest enemies
  { templateId: "wolf", name: "Wolf", hp: 35, dmg: 14, def: 8, dodge: 8, crit: 6, speed: 36, rarity: 'rare' },
  { templateId: "mushroom", name: "Mushroom", hp: 30, dmg: 10, def: 2, dodge: 12, crit: 10, speed: 40, rarity: 'rare' },
  { templateId: "bee", name: "Bee", hp: 28, dmg: 11, def: 3, dodge: 4, crit: 4, speed: 22, rarity: 'rare' },
  { templateId: "crow", name: "Crow", hp: 37, dmg: 16, def: 9, dodge: 8, crit: 6, speed: 16, rarity: 'rare' },
  { templateId: "butterfly", name: "Butterfly", hp: 35, dmg: 12, def: 3, dodge: 41, crit: 2, speed: 16, rarity: 'rare' },
  { templateId: "big_bee", name: "Big Bee", hp: 38, dmg: 15, def: 5, dodge: 6, crit: 5, speed: 26, rarity: 'rare' },
  { templateId: "ants", name: "Ants", hp: 32, dmg: 13, def: 7, dodge: 10, crit: 7, speed: 14, rarity: 'rare' },
  { templateId: "monkey", name: "Monkey", hp: 52, dmg: 20, def: 25, dodge: 18, crit: 25, speed: 60, rarity: 'rare' },
    // Epic area Caves enemies
  { templateId: "wood_fairy", name: "Wood Fairy", hp: 65, dmg: 33, def: 19, dodge: 12, crit: 17, speed: 18, rarity: 'epic' },
  { templateId: "salamander", name: "Salamander", hp: 39, dmg: 40, def: 16, dodge: 9, crit: 11, speed: 28, rarity: 'epic' },
  { templateId: "snake", name: "Snake", hp: 70, dmg: 25, def: 30, dodge: 5, crit: 5, speed: 8, rarity: 'epic' },
  { templateId: "bat", name: "Bat", hp: 65, dmg: 22, def: 28, dodge: 3, crit: 3, speed: 6, rarity: 'epic' },
  { templateId: "spectral_fairy", name: "Spectral Fairy", hp: 68, dmg: 36, def: 35, dodge: 2, crit: 12, speed: 4, rarity: 'epic' },
  { templateId: "snail", name: "Giant Snail", hp: 75, dmg: 28, def: 32, dodge: 4, crit: 4, speed: 10, rarity: 'epic' },
  { templateId: "bear", name: "Bear", hp: 70, dmg: 30, def: 28, dodge: 6, crit: 6, speed: 14, rarity: 'epic' },
  { templateId: "vampire", name: "Vampire", hp: 80, dmg: 35, def: 30, dodge: 8, crit: 8, speed: 16, rarity: 'epic' },
 // Legendaire area Ruins enemies
  { templateId: "golem", name: "Golem", hp: 60, dmg: 58, def: 55, dodge: 0, crit: 1, speed: 10, rarity: 'legendary' },
  { templateId: "wyrm", name: "Wyrm", hp: 70, dmg: 30, def: 23, dodge: 2, crit: 2, speed: 12, rarity: 'legendary' },
  { templateId: "cultist", name: "Cultist", hp: 80, dmg: 472, def: 36, dodge: 5, crit: 5, speed: 16, rarity: 'legendary' },
  { templateId: "corrupted_knight", name: "Corrupted Knight", hp: 90, dmg: 48, def: 37, dodge: 7, crit: 7, speed: 20, rarity: 'legendary' },
  { templateId: "spectre", name: "Spectre", hp: 8, dmg: 44, def: 22, dodge: 6, crit: 6, speed: 18, rarity: 'legendary' },
  { templateId: "ancien_spirit", name: "Ancient Spirit", hp: 95, dmg: 57, def: 33, dodge: 8, crit: 8, speed: 22, rarity: 'legendary' },
  { templateId: "ghost", name: "", hp: 100, dmg: 30, def: 13, dodge: 50, crit: 28, speed: 44, rarity: 'legendary' },
  { templateId: "nain", name: "Ancient Dwarf", hp: 110, dmg: 26, def: 44, dodge: 9, crit: 18, speed: 20, rarity: 'legendary' },
    // Mythics are Voclano enemies
  { templateId: "magma_beast", name: "Magma Beast", hp: 150, dmg: 58, def: 40, dodge: 33, crit: 26, speed: 40, rarity: 'mythic' },
  { templateId: "fire_drake", name: "Fire Drake", hp: 160, dmg: 62, def: 45, dodge: 36, crit: 30, speed: 45, rarity: 'mythic' },
  { templateId: "phoenix", name: "Phoenix", hp: 180, dmg: 70, def: 50, dodge: 20, crit: 20, speed: 30, rarity: 'mythic' },
  { templateId: "lava_golem", name: "Lava Golem", hp: 168, dmg: 50, def: 48, dodge: 15, crit: 15, speed: 25, rarity: 'mythic' },
  { templateId: "will_o_the_wisp", name: "Will-o'-the-Wisp", hp: 175, dmg: 55, def: 42, dodge: 18, crit: 18, speed: 28, rarity: 'mythic' },
  { templateId: "leviathan", name: "Leviathan", hp: 190, dmg: 65, def: 55, dodge: 22, crit: 22, speed: 32, rarity: 'mythic' },
  { templateId: "ancient_drake", name: "Ancient Drake", hp: 180, dmg: 56, def: 40, dodge: 30, crit: 25, speed: 35, rarity: 'mythic' },  
  //bosses
  // Forest dungeon boss 
  { templateId: "queen_bee", name: "Queen Bee", hp: 56, dmg: 36, def: 24, dodge: 18, crit: 8, speed: 40, rarity: 'rare' },
  { templateId: "quetzal", name: "Quetzal", hp: 69, dmg: 30, def: 22, dodge: 8, crit: 1, speed: 27, rarity: 'rare' },
  // Caves dungeon boss
  { templateId: "rabid_hyenas", name: "Rabid Hyenas", hp: 85, dmg: 38, def: 26, dodge: 10, crit: 10, speed: 18, rarity: 'epic' },
  { templateId: "cave_stalker", name: "Cave Stalker", hp: 90, dmg: 40, def: 28, dodge: 12, crit: 12, speed: 20, rarity: 'epic' },
  // Ruins dungeon boss
  { templateId: "ancient_guardian", name: "Ancient Guardian", hp: 110, dmg: 50, def: 40, dodge: 15, crit: 15, speed: 22, rarity: 'legendary' },
  { templateId: "hydra", name: "Hydra", hp: 130, dmg: 55, def: 45, dodge: 35, crit: 18, speed: 100, rarity: 'legendary' },
 // Volcano dungeon boss
  { templateId: "phoenix_lord", name: "Phoenix Lord", hp: 190, dmg: 70, def: 60, dodge: 25, crit: 25, speed: 40, rarity: 'mythic' },
  { templateId: "ancient_dragon", name: "Ancient Dragon", hp: 220, dmg: 66, def: 65, dodge: 30, crit: 30, speed: 45, rarity: 'mythic' },
];

export default ENEMY_TEMPLATES;
