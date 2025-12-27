import type { EnemyTemplate } from '../types';

export const ENEMY_TEMPLATES: EnemyTemplate[] = [
  // ============================================
  // TIER: COMMON (Level 1-5)
  // ============================================
  // MAP 0 — Spawn / Initiation (Level 1-5)
  { templateId: "slime", name: "Slime", hp: 20, dmg: 2, def: 0, dodge: 0, crit: 50, speed: 100, rarity: 'common', rageEffect: 'explosion', rageThreshold: 0 },
  { templateId: "rat_spawn", name: "Rat", hp: 15, dmg: 4, def: 2, dodge: 5, crit: 20, speed: 12, rarity: 'common', rageEffect: 'multi_attack', rageThreshold: 60 },
  { templateId: "butterfly_spawn", name: "Butterfly", hp: 12, dmg: 3, def: 1, dodge: 10, crit: 10, speed: 15, rarity: 'common', rageEffect: 'multiplier', rageThreshold: 0 },

  // ============================================
  // TIER: UNCOMMON (Level 6-15)
  // ============================================
  // Forest Uncommon (Level 6-15)
  { templateId: "rat", name: "Rat", hp: 22, dmg: 6, def: 3, dodge: 8, crit: 15, speed: 14, rarity: 'uncommon', rageEffect: 'multi_attack', rageThreshold: 60 },
  { templateId: "butterfly", name: "Butterfly", hp: 18, dmg: 5, def: 2, dodge: 12, crit: 12, speed: 16, rarity: 'uncommon', rageEffect: 'multiplier', rageThreshold: 0 },
  { templateId: "giant_spider", name: "Giant Spider", hp: 28, dmg: 9, def: 4, dodge: 10, crit: 14, speed: 18, rarity: 'uncommon', rageEffect: 'multi_attack', rageThreshold: 70 },
  { templateId: "forest_goblin", name: "Forest Goblin", hp: 26, dmg: 8, def: 3, dodge: 9, crit: 13, speed: 16, rarity: 'uncommon', rageEffect: 'debuff', rageThreshold: 50 },
  { templateId: "wild_boar", name: "Wild Boar", hp: 32, dmg: 11, def: 6, dodge: 7, crit: 11, speed: 14, rarity: 'uncommon', rageEffect: 'multiplier', rageThreshold: 60 },

  // Caves Uncommon (Level 16-19 transition)
  { templateId: "stone_golem", name: "Stone Golem", hp: 56, dmg: 16, def: 12, dodge: 5, crit: 8, speed: 10, rarity: 'uncommon', rageEffect: 'heal', rageThreshold: 70 },
  { templateId: "crystal_bug", name: "Crystal Bug", hp: 42, dmg: 15, def: 7, dodge: 7, crit: 11, speed: 15, rarity: 'uncommon', rageEffect: 'explosion', rageThreshold: 50 },
  { templateId: "cave_troll", name: "Cave Troll", hp: 60, dmg: 18, def: 10, dodge: 6, crit: 10, speed: 12, rarity: 'uncommon', rageEffect: 'multiplier', rageThreshold: 65 },

  // ============================================
  // TIER: RARE (Level 10-29)
  // ============================================
  // Forest Rare (Level 10-19)
  { templateId: "wolf", name: "Wolf", hp: 35, dmg: 14, def: 8, dodge: 8, crit: 12, speed: 28, rarity: 'rare', rageEffect: 'multi_attack', rageThreshold: 0 },
  { templateId: "ant", name: "Ant", hp: 24, dmg: 10, def: 6, dodge: 6, crit: 10, speed: 12, rarity: 'rare', rageEffect: 'multi_attack', rageThreshold: 0 },
  { templateId: "bee", name: "Bee", hp: 26, dmg: 11, def: 4, dodge: 6, crit: 8, speed: 20, rarity: 'rare', rageEffect: 'multiplier', rageThreshold: 0 },
  { templateId: "mushroom", name: "Mushroom", hp: 28, dmg: 10, def: 3, dodge: 4, crit: 8, speed: 10, rarity: 'rare', rageEffect: 'explosion', rageThreshold: 0 },
  { templateId: "crow", name: "Crow", hp: 30, dmg: 13, def: 5, dodge: 8, crit: 10, speed: 18, rarity: 'rare', rageEffect: 'multiplier', rageThreshold: 0 },
  { templateId: "monkey", name: "Monkey", hp: 40, dmg: 18, def: 10, dodge: 12, crit: 15, speed: 24, rarity: 'rare', rageEffect: 'multi_attack', rageThreshold: 0 },
  { templateId: "big_bee", name: "Big Bee", hp: 36, dmg: 16, def: 6, dodge: 8, crit: 10, speed: 24, rarity: 'rare', rageEffect: 'multiplier', rageThreshold: 0 },
  // Forest Bosses (Rare)
  { templateId: "queen_bee", name: "Queen Bee", hp: 56, dmg: 30, def: 12, dodge: 10, crit: 12, speed: 28, rarity: 'rare', rageEffect: 'explosion', rageThreshold: 0 },
  { templateId: "quetzal", name: "Quetzal", hp: 62, dmg: 32, def: 14, dodge: 12, crit: 14, speed: 30, rarity: 'rare', rageEffect: 'multiplier', rageThreshold: 0 },

  // Caves Rare (Level 20-29)
  { templateId: "bat", name: "Bat", hp: 32, dmg: 10, def: 4, dodge: 6, crit: 12, speed: 18, rarity: 'rare', rageEffect: 'multi_attack', rageThreshold: 0 },
  { templateId: "snail", name: "Snail", hp: 40, dmg: 12, def: 8, dodge: 4, crit: 8, speed: 8, rarity: 'rare', rageEffect: 'heal', rageThreshold: 0 },

  // ============================================
  // TIER: EPIC (Level 30-59)
  // ============================================
  // Caves Epic (Level 30-49)
  { templateId: "salamander", name: "Salamander", hp: 50, dmg: 24, def: 12, dodge: 8, crit: 12, speed: 16, rarity: 'epic', rageEffect: 'explosion', rageThreshold: 0 },
  { templateId: "snake", name: "Snake", hp: 48, dmg: 22, def: 14, dodge: 6, crit: 10, speed: 14, rarity: 'epic', rageEffect: 'multi_attack', rageThreshold: 0 },
  { templateId: "wood_fairy", name: "Wood Fairy", hp: 52, dmg: 26, def: 10, dodge: 10, crit: 14, speed: 20, rarity: 'epic', rageEffect: 'heal', rageThreshold: 0 },
  { templateId: "bear", name: "Bear", hp: 58, dmg: 28, def: 16, dodge: 8, crit: 12, speed: 16, rarity: 'epic', rageEffect: 'multiplier', rageThreshold: 0 },
  { templateId: "batwan", name: "Batwan", hp: 45, dmg: 20, def: 8, dodge: 8, crit: 14, speed: 22, rarity: 'epic', rageEffect: 'multi_attack', rageThreshold: 0 },
  // Caves Dungeon Boss
  { templateId: "rabid_hyenas", name: "Rabid Hyenas", hp: 85, dmg: 38, def: 26, dodge: 10, crit: 10, speed: 18, rarity: 'epic', rageEffect: 'multi_attack', rageThreshold: 0 },

  // Ruins Epic (Level 30-49)
  { templateId: "skeleton", name: "Skeleton", hp: 55, dmg: 20, def: 12, dodge: 6, crit: 14, speed: 14, rarity: 'epic', rageEffect: 'debuff', rageThreshold: 0 },
  // Ruins Uncommon->Epic transition (Level 30-39)
  { templateId: "tomb_guardian", name: "Tomb Guardian", hp: 50, dmg: 18, def: 14, dodge: 8, crit: 12, speed: 12, rarity: 'epic', rageEffect: 'heal', rageThreshold: 0 },
  { templateId: "ghost_knight", name: "Ghost Knight", hp: 48, dmg: 20, def: 12, dodge: 10, crit: 14, speed: 14, rarity: 'epic', rageEffect: 'multiplier', rageThreshold: 0 },
  { templateId: "cursed_statue", name: "Cursed Statue", hp: 54, dmg: 16, def: 16, dodge: 6, crit: 10, speed: 10, rarity: 'epic', rageEffect: 'debuff', rageThreshold: 0 },

  // ============================================
  // TIER: LEGENDARY (Level 60-89)
  // ============================================
  // Ruins Legendary (Level 60-89)
  { templateId: "cursed_knight", name: "Cursed Knight", hp: 70, dmg: 32, def: 18, dodge: 10, crit: 16, speed: 16, rarity: 'legendary', rageEffect: 'multiplier', rageThreshold: 0 },
  { templateId: "shadow_mage", name: "Shadow Mage", hp: 65, dmg: 36, def: 14, dodge: 12, crit: 18, speed: 20, rarity: 'legendary', rageEffect: 'debuff', rageThreshold: 0 },
  { templateId: "gargoyle", name: "Gargoyle", hp: 75, dmg: 28, def: 22, dodge: 8, crit: 12, speed: 12, rarity: 'legendary', rageEffect: 'heal', rageThreshold: 0 },
  { templateId: "wraith", name: "Wraith", hp: 68, dmg: 34, def: 16, dodge: 14, crit: 20, speed: 22, rarity: 'legendary', rageEffect: 'multi_attack', rageThreshold: 0 },
  { templateId: "ancient_sentinel", name: "Ancient Sentinel", hp: 80, dmg: 38, def: 20, dodge: 12, crit: 18, speed: 18, rarity: 'legendary', rageEffect: 'explosion', rageThreshold: 0 },
  // Ruins Dungeon Bosses
  { templateId: "ancient_guardian", name: "Ancient Guardian", hp: 110, dmg: 50, def: 28, dodge: 14, crit: 18, speed: 20, rarity: 'legendary', rageEffect: 'multiplier', rageThreshold: 0 },
  { templateId: "forgotten_keeper", name: "Forgotten Keeper", hp: 105, dmg: 52, def: 26, dodge: 16, crit: 20, speed: 22, rarity: 'legendary', rageEffect: 'multi_attack', rageThreshold: 0 },

  // Volcano Legendary (Level 60-80)
  { templateId: "fire_imp", name: "Fire Imp", hp: 65, dmg: 28, def: 14, dodge: 10, crit: 16, speed: 20, rarity: 'legendary', rageEffect: 'explosion', rageThreshold: 0 },

  // ============================================
  // TIER: MYTHIC (Level 90-120)
  // ============================================
  // Volcano Mythic (Level 90-120)
  { templateId: "lava_golem", name: "Lava Golem", hp: 100, dmg: 45, def: 32, dodge: 8, crit: 14, speed: 14, rarity: 'mythic', rageEffect: 'explosion', rageThreshold: 0 },
  { templateId: "magma_serpent", name: "Magma Serpent", hp: 95, dmg: 48, def: 28, dodge: 10, crit: 16, speed: 18, rarity: 'mythic', rageEffect: 'multi_attack', rageThreshold: 0 },
  { templateId: "ash_phoenix", name: "Ash Phoenix", hp: 105, dmg: 50, def: 26, dodge: 14, crit: 18, speed: 22, rarity: 'mythic', rageEffect: 'multiplier', rageThreshold: 0 },
  { templateId: "flame_titan", name: "Flame Titan", hp: 115, dmg: 54, def: 32, dodge: 12, crit: 18, speed: 20, rarity: 'mythic', rageEffect: 'explosion', rageThreshold: 0 },
  // Volcano Dungeon Bosses
  { templateId: "infernal_warden", name: "Infernal Warden", hp: 110, dmg: 60, def: 34, dodge: 14, crit: 18, speed: 22, rarity: 'mythic', rageEffect: 'multi_attack', rageThreshold: 0 },
  { templateId: "avatar_of_cinders", name: "Avatar of Cinders", hp: 120, dmg: 70, def: 40, dodge: 16, crit: 20, speed: 26, rarity: 'mythic', rageEffect: 'explosion', rageThreshold: 0 },
  
  // ============================================
  // BOSS FINAL (Level 100+)
  // ============================================
  { templateId: "fire_overlord", name: "Fire Overlord", hp: 150, dmg: 75, def: 42, dodge: 18, crit: 22, speed: 28, rarity: 'mythic', rageEffect: 'explosion', rageThreshold: 0 },
];

export default ENEMY_TEMPLATES;
