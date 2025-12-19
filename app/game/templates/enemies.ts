import type { EnemyTemplate } from '../types';

export const ENEMY_TEMPLATES: EnemyTemplate[] = [
  // MAP 0 — Spawn / Initiation (Level 1-5)
  { templateId: "slime", name: "Slime", hp: 20, dmg: 2, def: 0, dodge: 0, crit: 50, speed: 100, rarity: 'common' },
  { templateId: "rat_spawn", name: "Rat", hp: 15, dmg: 4, def: 2, dodge: 5, crit: 20, speed: 12, rarity: 'common' },
  { templateId: "butterfly_spawn", name: "Butterfly", hp: 12, dmg: 3, def: 1, dodge: 10, crit: 10, speed: 15, rarity: 'common' },

  // MAP 1 — Forest (Level 6-15)
  { templateId: "rat", name: "Rat", hp: 22, dmg: 6, def: 3, dodge: 8, crit: 15, speed: 14, rarity: 'common' },
  { templateId: "butterfly", name: "Butterfly", hp: 18, dmg: 5, def: 2, dodge: 12, crit: 12, speed: 16, rarity: 'common' },
  { templateId: "wolf", name: "Wolf", hp: 35, dmg: 14, def: 8, dodge: 8, crit: 12, speed: 28, rarity: 'rare' },
  { templateId: "ant", name: "Ant", hp: 24, dmg: 10, def: 6, dodge: 6, crit: 10, speed: 12, rarity: 'rare' },
  { templateId: "bee", name: "Bee", hp: 26, dmg: 11, def: 4, dodge: 6, crit: 8, speed: 20, rarity: 'rare' },
  { templateId: "mushroom", name: "Mushroom", hp: 28, dmg: 10, def: 3, dodge: 4, crit: 8, speed: 10, rarity: 'rare' },
  { templateId: "crow", name: "Crow", hp: 30, dmg: 13, def: 5, dodge: 8, crit: 10, speed: 18, rarity: 'rare' },
  { templateId: "monkey", name: "Monkey", hp: 40, dmg: 18, def: 10, dodge: 12, crit: 15, speed: 24, rarity: 'rare' },
  { templateId: "big_bee", name: "Big Bee", hp: 36, dmg: 16, def: 6, dodge: 8, crit: 10, speed: 24, rarity: 'rare' },
  // Forest Bosses
  { templateId: "queen_bee", name: "Queen Bee", hp: 56, dmg: 30, def: 12, dodge: 10, crit: 12, speed: 28, rarity: 'rare' },
  { templateId: "quetzal", name: "Quetzal", hp: 62, dmg: 32, def: 14, dodge: 12, crit: 14, speed: 30, rarity: 'rare' },

  // MAP 2 — Caves (Level 16-30)
  { templateId: "bat", name: "Bat", hp: 32, dmg: 10, def: 4, dodge: 6, crit: 12, speed: 18, rarity: 'common' },
  { templateId: "snail", name: "Snail", hp: 40, dmg: 12, def: 8, dodge: 4, crit: 8, speed: 8, rarity: 'common' },
  { templateId: "salamander", name: "Salamander", hp: 50, dmg: 24, def: 12, dodge: 8, crit: 12, speed: 16, rarity: 'epic' },
  { templateId: "snake", name: "Snake", hp: 48, dmg: 22, def: 14, dodge: 6, crit: 10, speed: 14, rarity: 'epic' },
  { templateId: "wood_fairy", name: "Wood Fairy", hp: 52, dmg: 26, def: 10, dodge: 10, crit: 14, speed: 20, rarity: 'epic' },
  { templateId: "bear", name: "Bear", hp: 58, dmg: 28, def: 16, dodge: 8, crit: 12, speed: 16, rarity: 'epic' },
  { templateId: "batwan", name: "Batwan", hp: 45, dmg: 20, def: 8, dodge: 8, crit: 14, speed: 22, rarity: 'epic' },
  // Caves Dungeon Boss
  { templateId: "rabid_hyenas", name: "Rabid Hyenas", hp: 85, dmg: 38, def: 26, dodge: 10, crit: 10, speed: 18, rarity: 'epic' },

  // MAP 3 — Ruins (Level 30-50)
  { templateId: "skeleton", name: "Skeleton", hp: 55, dmg: 20, def: 12, dodge: 6, crit: 14, speed: 14, rarity: 'epic' },
  { templateId: "cursed_knight", name: "Cursed Knight", hp: 70, dmg: 32, def: 18, dodge: 10, crit: 16, speed: 16, rarity: 'legendary' },
  { templateId: "shadow_mage", name: "Shadow Mage", hp: 65, dmg: 36, def: 14, dodge: 12, crit: 18, speed: 20, rarity: 'legendary' },
  { templateId: "gargoyle", name: "Gargoyle", hp: 75, dmg: 28, def: 22, dodge: 8, crit: 12, speed: 12, rarity: 'legendary' },
  { templateId: "wraith", name: "Wraith", hp: 68, dmg: 34, def: 16, dodge: 14, crit: 20, speed: 22, rarity: 'legendary' },
  { templateId: "ancient_sentinel", name: "Ancient Sentinel", hp: 80, dmg: 38, def: 20, dodge: 12, crit: 18, speed: 18, rarity: 'legendary' },
  // Ruins Dungeon Bosses
  { templateId: "ancient_guardian", name: "Ancient Guardian", hp: 110, dmg: 50, def: 28, dodge: 14, crit: 18, speed: 20, rarity: 'legendary' },
  { templateId: "forgotten_keeper", name: "Forgotten Keeper", hp: 105, dmg: 52, def: 26, dodge: 16, crit: 20, speed: 22, rarity: 'legendary' },

  // MAP 4 — Volcano (Level 50-70+)
  { templateId: "fire_imp", name: "Fire Imp", hp: 65, dmg: 28, def: 14, dodge: 10, crit: 16, speed: 20, rarity: 'legendary' },
  { templateId: "lava_golem", name: "Lava Golem", hp: 100, dmg: 45, def: 32, dodge: 8, crit: 14, speed: 14, rarity: 'mythic' },
  { templateId: "magma_serpent", name: "Magma Serpent", hp: 95, dmg: 48, def: 28, dodge: 10, crit: 16, speed: 18, rarity: 'mythic' },
  { templateId: "ash_phoenix", name: "Ash Phoenix", hp: 105, dmg: 50, def: 26, dodge: 14, crit: 18, speed: 22, rarity: 'mythic' },
  { templateId: "flame_titan", name: "Flame Titan", hp: 115, dmg: 54, def: 32, dodge: 12, crit: 18, speed: 20, rarity: 'mythic' },
  // Volcano Dungeon Bosses
  { templateId: "infernal_warden", name: "Infernal Warden", hp: 140, dmg: 60, def: 34, dodge: 14, crit: 18, speed: 22, rarity: 'mythic' },
  { templateId: "avatar_of_cinders", name: "Avatar of Cinders", hp: 160, dmg: 70, def: 40, dodge: 16, crit: 20, speed: 26, rarity: 'mythic' },
];

export default ENEMY_TEMPLATES;
