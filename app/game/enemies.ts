import type { EnemyTemplate } from './types';

export const ENEMY_TEMPLATES: EnemyTemplate[] = [
  { templateId: "gobelin", name: "Gobelin", hp: 18, dmg: 6, def: 1, dodge: 5, crit: 2, speed: 30, rarity: 'common' },
  { templateId: "slime", name: "Slime", hp: 14, dmg: 4, def: 0, dodge: 2, crit: 0, speed: 20, rarity: 'common' },
  { templateId: "brigand", name: "Brigand", hp: 22, dmg: 8, def: 2, dodge: 8, crit: 6, speed: 36, rarity: 'rare' },
  { templateId: "ogre", name: "Ogre", hp: 40, dmg: 14, def: 4, dodge: 1, crit: 3, speed: 18, rarity: 'epic' },
  { templateId: "golem", name: "Golem", hp: 60, dmg: 18, def: 8, dodge: 0, crit: 1, speed: 10, rarity: 'legendary' },
  { templateId: "wyrm", name: "Wyrm", hp: 45, dmg: 16, def: 5, dodge: 4, crit: 4, speed: 28, rarity: 'epic' },
  { templateId: "seigneur", name: "Seigneur du Fléau", hp: 120, dmg: 28, def: 10, dodge: 6, crit: 8, speed: 24, rarity: 'mythic' },
  { templateId: "spectre", name: "Spectre", hp: 30, dmg: 10, def: 2, dodge: 12, crit: 10, speed: 40, rarity: 'rare' },
  { templateId: "loup", name: "Loup", hp: 20, dmg: 7, def: 1, dodge: 10, crit: 5, speed: 44, rarity: 'common' },
  { templateId: "bandit", name: "Bandit", hp: 24, dmg: 9, def: 2, dodge: 7, crit: 7, speed: 34, rarity: 'rare' },
];

export default ENEMY_TEMPLATES;
