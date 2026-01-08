import type { Player, WeaponStats, Rarity } from "./types";
import { getWeaponStats } from "./templates/weapons";

/**
 * Get rarity multiplier bonus for weapons
 * Increases effectiveness based on weapon rarity tier
 */
export function getRarityMultiplier(rarity?: Rarity): number {
  if (!rarity) return 1.0;
  
  const rarityMultipliers: Record<Rarity, number> = {
    common: 1.0,
    uncommon: 1.05,
    rare: 1.1,
    epic: 1.25,
    legendary: 1.5,
    mythic: 2.0,
  };
  
  return rarityMultipliers[rarity] ?? 1.0;
}

/**
 * Get equipped weapon stats for a player
 * Falls back to barehand if no weapon equipped
 */
export function getPlayerWeaponStats(player: Player): WeaponStats {
  if (!player.equippedWeapon) {
    return getWeaponStats('barehand');
  }
  return getWeaponStats(player.equippedWeapon.type);
}

/**
 * Apply weapon damage multiplier to base damage (with rarity bonus)
 */
export function getWeaponDamage(baseDmg: number, player: Player): number {
  const weaponStats = getPlayerWeaponStats(player);
  const rarityMult = getRarityMultiplier(player.equippedWeapon?.rarity);
  return Math.max(1, Math.round(baseDmg * weaponStats.dmgMultiplier * rarityMult));
}

/**
 * Get crit chance with weapon bonus (with rarity bonus)
 */
export function getWeaponCritChance(baseCrit: number, player: Player): number {
  const weaponStats = getPlayerWeaponStats(player);
  const rarityMult = getRarityMultiplier(player.equippedWeapon?.rarity);
  return baseCrit + (weaponStats.critBonus * rarityMult);
}

/**
 * Get dodge chance with weapon bonus (with rarity bonus)
 */
export function getWeaponDodgeChance(baseDodge: number, player: Player): number {
  const weaponStats = getPlayerWeaponStats(player);
  const rarityMult = getRarityMultiplier(player.equippedWeapon?.rarity);
  return Math.max(0, baseDodge + (weaponStats.dodgeBonus * rarityMult));
}

/**
 * Get initiative bonus from weapon
 * Used when calculating who acts first
 */
export function getWeaponInitiativeBonus(player: Player): number {
  const weaponStats = getPlayerWeaponStats(player);
  return weaponStats.initiativeBonus;
}

/**
 * Get multi-hit chance multiplier from weapon (with rarity bonus)
 * Formula: (speed / 200) * multiHitBonus * rarityMult, capped at 0.5
 */
export function getWeaponMultiHitChance(speed: number, player: Player): number {
  const weaponStats = getPlayerWeaponStats(player);
  const rarityMult = getRarityMultiplier(player.equippedWeapon?.rarity);
  const baseChance = Math.min(0.5, Math.max(0, speed / 200));
  const bonusChance = baseChance * weaponStats.multiHitBonus * rarityMult;
  return Math.min(0.5, bonusChance); // still capped at 50%
}

/**
 * Check if attack misses based on weapon
 */
export function checkWeaponMiss(player: Player): boolean {
  const weaponStats = getPlayerWeaponStats(player);
  return Math.random() * 100 < weaponStats.missChance;
}

/**
 * Apply weapon rage modifier to enemy rage gain (with rarity bonus)
 */
export function applyWeaponRageModifier(rageGain: number, player: Player): number {
  const weaponStats = getPlayerWeaponStats(player);
  const rarityMult = getRarityMultiplier(player.equippedWeapon?.rarity);
  // Rarity mult affects the rage modifier strength
  const adjustedRageModifier = 1 + ((weaponStats.rageModifier - 1) * rarityMult);
  return Math.round(rageGain * adjustedRageModifier);
}

/**
 * Get boss damage bonus (with rarity bonus)
 */
export function getWeaponBossBonus(player: Player): number {
  const weaponStats = getPlayerWeaponStats(player);
  const rarityMult = getRarityMultiplier(player.equippedWeapon?.rarity);
  const baseBossBonus = weaponStats.boss_bonus ?? 1.0;
  // Apply rarity as percentage increase to boss bonus
  return 1 + ((baseBossBonus - 1) * rarityMult);
}

/**
 * Get swarm damage bonus (with rarity bonus)
 */
export function getWeaponSwarmBonus(player: Player): number {
  const weaponStats = getPlayerWeaponStats(player);
  const rarityMult = getRarityMultiplier(player.equippedWeapon?.rarity);
  const baseSwarmBonus = weaponStats.swarm_bonus ?? 1.0;
  // Apply rarity as percentage increase to swarm bonus
  return 1 + ((baseSwarmBonus - 1) * rarityMult);
}

/**
 * Get human-readable weapon info for UI
 */
export function getWeaponDescription(player: Player): string {
  const stats = getPlayerWeaponStats(player);
  const rarityMult = getRarityMultiplier(player.equippedWeapon?.rarity);
  const parts = [
    stats.name,
    `Role: ${stats.role}`,
  ];

  // Add rarity bonus if present
  if (player.equippedWeapon?.rarity && rarityMult > 1.0) {
    const rarityPercent = Math.round((rarityMult - 1) * 100);
    parts.push(`✨ Rarity +${rarityPercent}%`);
  }

  if (stats.dmgMultiplier !== 1.0) {
    const dmgPercent = Math.round((stats.dmgMultiplier - 1) * 100);
    parts.push(`DMG ${dmgPercent > 0 ? '+' : ''}${dmgPercent}%`);
  }

  if (stats.initiativeBonus !== 0) {
    parts.push(`Init ${stats.initiativeBonus > 0 ? '+' : ''}${stats.initiativeBonus}%`);
  }

  if (stats.multiHitBonus > 1) {
    parts.push(`Multi-hit x${stats.multiHitBonus.toFixed(1)}`);
  }

  if (stats.rageModifier !== 1.0) {
    const ragePercent = Math.round((stats.rageModifier - 1) * 100);
    parts.push(`Enemy Rage ${ragePercent > 0 ? '+' : ''}${ragePercent}%`);
  }

  return parts.join(' • ');
}
