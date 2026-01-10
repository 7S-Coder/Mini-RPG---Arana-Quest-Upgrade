import type { WeaponStats } from "../types";

/**
 * WEAPON TEMPLATES
 * 
 * Each weapon type provides unique gameplay hooks via:
 * - dmgMultiplier: changes total damage output
 * - critBonus: additive to crit chance
 * - dodgeBonus: additive to dodge chance
 * - initiativeBonus: additive to initiative rolls
 * - multiHitBonus: multiplier on speed/200 (multi-hit chance)
 * - missChance: 0-100 chance to miss attack
 * - rageModifier: 1.0 neutral, >1 increases enemy rage, <1 decreases
 * - skill: special weapon ability (counter, multi_hit, boss_damage, anti_rage)
 */

export const WEAPON_TEMPLATES: Record<string, WeaponStats> = {
  barehand: {
    type: 'barehand',
    name: 'Barrehand',
    description: 'Instinctif, agile mais peu létal. Safe poke / survival early',
    dmgMultiplier: 0.6, // weak damage
    critBonus: 0, // no crit
    dodgeBonus: 5, // +5% dodge
    initiativeBonus: 10, // +10% initiative
    multiHitBonus: 1.0, // normal multi-hit chance
    missChance: 0,
    rageModifier: 0.9, // -10% enemy rage
    role: 'Safe early game',
  },

  dagger: {
    type: 'dagger',
    name: 'Dagger',
    description: 'Rapide et opportuniste. Assassin / burst RNG explosif',
    dmgMultiplier: 0.8, // weak damage per hit
    critBonus: 12, // +12% crit
    dodgeBonus: 0,
    initiativeBonus: 20, // +20% initiative (very fast)
    multiHitBonus: 2.0, // x2 multi-hit chance (30-50% instead of 15-25%)
    missChance: 6, // 6% miss chance
    rageModifier: 1.1, // +10% enemy rage (aggressive)
    skill: 'multi_hit', // Signature skill: multiple hits per turn
    role: 'Burst RNG / Kill before scaling',
  },

  sword: {
    type: 'sword',
    name: 'Sword',
    description: 'Équilibrée et duelliste. Maîtrise / adaptation polyvalente',
    dmgMultiplier: 1.0, // standard damage
    critBonus: 5, // +5% crit (light)
    dodgeBonus: 3, // +3% dodge (light)
    initiativeBonus: 5, // +5% initiative (light)
    multiHitBonus: 1.2, // 1.2x multi-hit chance (18-30% instead of 15-25%)
    missChance: 0,
    rageModifier: 1.0, // neutral (no malus)
    skill: 'counter', // Signature skill: dodge turns into counter-attack
    role: 'Consistent DPS / All-purpose',
  },

  axe: {
    type: 'axe',
    name: 'Axe',
    description: 'Brutale et risquée. Barbare / heavy strike anti-boss',
    dmgMultiplier: 1.35, // +35% damage
    critBonus: 8, // +8% crit (good for crits)
    dodgeBonus: -5, // -5% dodge (heavy, less agile)
    initiativeBonus: -20, // -20% initiative (slow)
    multiHitBonus: 0, // NO multi-hit (heavy, single hit)
    missChance: 12, // 12% miss chance (unwieldy)
    rageModifier: 1.15, // +15% enemy rage (provokes)
    skill: 'boss_damage', // Signature skill: bonus damage vs bosses (scales with rarity)
    penetration: 0.25, // 25% armor penetration base
    boss_bonus: 1.25, // +25% damage vs bosses/elites (base)
    role: 'All-in lethality / Heavy strike',
  },

  spear: {
    type: 'spear',
    name: 'Spear',
    description: 'Défensive et tactique. Tacticien / reach / placement anti-swarm',
    dmgMultiplier: 0.95, // slightly reduced damage
    critBonus: -3, // -3% crit (not a crit weapon)
    dodgeBonus: 4, // +4% dodge (defensive)
    initiativeBonus: 15, // +15% initiative (reach advantage)
    multiHitBonus: 1.5, // 1.5x multi-hit chance (22-37% instead of 15-25%)
    missChance: 0,
    rageModifier: 0.85, // -15% enemy rage (poke from distance)
    skill: 'anti_rage', // Signature skill: prevents +20% rage per turn
    swarm_bonus: 1.15, // +15% damage vs multiple enemies
    role: 'Control / Anti-horde / Safe scaling',
  },
};

/**
 * Get weapon stats by type
 */
export function getWeaponStats(type: string): WeaponStats {
  return WEAPON_TEMPLATES[type] ?? WEAPON_TEMPLATES['barehand'];
}

/**
 * Get all available weapons
 */
export function getAllWeapons(): WeaponStats[] {
  return Object.values(WEAPON_TEMPLATES);
}
