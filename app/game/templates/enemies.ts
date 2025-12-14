import type { EnemyTemplate } from '../types';

export const ENEMY_TEMPLATES: EnemyTemplate[] = [
  // Spawn area enemies
  { templateId: "cockroach", name: "Cockroach", hp: 50, dmg: 3, def: 0, dodge: 1, crit: 80, speed: 200, rarity: 'common' },
    // Common
  { templateId: "gobelin", name: "Goblin", hp: 18, dmg: 6, def: 1, dodge: 5, crit: 2, speed: 30, rarity: 'common' },
  { templateId: "slime", name: "Slime", hp: 14, dmg: 4, def: 0, dodge: 2, crit: 0, speed: 20, rarity: 'common' },
  { templateId: "loup", name: "Wolf", hp: 20, dmg: 7, def: 1, dodge: 10, crit: 5, speed: 44, rarity: 'common' },
  { templateId: "rat", name: "Giant Rat", hp: 16, dmg: 5, def: 1, dodge: 3, crit: 1, speed: 26, rarity: 'common' },
  { templateId: "fluo", name: "Fluo", hp: 18, dmg: 10, def: 2, dodge: 4, crit: 3, speed: 24, rarity: 'common' },
  { templateId: "wisp", name: "Wisp", hp: 25, dmg: 9, def: 2, dodge: 5, crit: 3, speed: 20, rarity: 'common' },
  { templateId: "mushroom", name: "Mushroom", hp: 26, dmg: 10, def: 2, dodge: 3, crit: 3, speed: 20, rarity: 'common' },
    // Rare
  { templateId: "brigand", name: "Bandit", hp: 22, dmg: 8, def: 2, dodge: 8, crit: 6, speed: 36, rarity: 'rare' },
  { templateId: "bandit", name: "Bandit", hp: 24, dmg: 9, def: 2, dodge: 7, crit: 7, speed: 34, rarity: 'rare' },
  { templateId: "spectre", name: "Wraith", hp: 30, dmg: 10, def: 2, dodge: 12, crit: 10, speed: 40, rarity: 'rare' },
  { templateId: "pebble", name: "Pebble", hp: 28, dmg: 11, def: 3, dodge: 4, crit: 4, speed: 22, rarity: 'rare' },
  { templateId: "wish", name: "Witch", hp: 35, dmg: 12, def: 3, dodge: 1, crit: 2, speed: 16, rarity: 'rare' },
    // Epics
  { templateId: "ogre", name: "Ogre", hp: 40, dmg: 14, def: 4, dodge: 1, crit: 3, speed: 18, rarity: 'epic' },
  { templateId: "wyrm", name: "Wyrm", hp: 45, dmg: 16, def: 5, dodge: 4, crit: 4, speed: 28, rarity: 'epic' },
  { templateId: "golem", name: "Golem", hp: 50, dmg: 15, def: 6, dodge: 0, crit: 2, speed: 14, rarity: 'epic' },
  // Legendaries
  { templateId: "magma", name: "Magma", hp: 60, dmg: 18, def: 8, dodge: 0, crit: 1, speed: 10, rarity: 'legendary' },
  { templateId: "troll_cavernes", name: "Cave Troll", hp: 70, dmg: 20, def: 9, dodge: 2, crit: 2, speed: 12, rarity: 'legendary' },
  { templateId: "hydre", name: "Hydra", hp: 80, dmg: 22, def: 10, dodge: 5, crit: 5, speed: 16, rarity: 'legendary' },
  { templateId: "chimere", name: "Chimera", hp: 90, dmg: 25, def: 11, dodge: 7, crit: 7, speed: 20, rarity: 'legendary' },
    // Mythics
  { templateId: "seigneur", name: "Scourge Lord", hp: 120, dmg: 28, def: 10, dodge: 6, crit: 8, speed: 24, rarity: 'mythic' },
  { templateId: "dragon", name: "Ancient Dragon", hp: 150, dmg: 32, def: 12, dodge: 8, crit: 10, speed: 30, rarity: 'mythic' },
  { templateId: "phoenix", name: "Legendary Phoenix", hp: 175, dmg: 43, def: 11, dodge: 10, crit: 45, speed: 28, rarity: 'mythic' },
  { templateId: "leviathan", name: "Leviathan", hp: 200, dmg: 50, def: 15, dodge: 12, crit: 12, speed: 20, rarity: 'mythic' },
];

export default ENEMY_TEMPLATES;
