import type { Player, WeaponStats } from "./types";
import { getWeaponStats } from "./templates/weapons";

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
 * Apply weapon damage multiplier to base damage
 */
export function getWeaponDamage(baseDmg: number, player: Player): number {
  const weaponStats = getPlayerWeaponStats(player);
  return Math.max(1, Math.round(baseDmg * weaponStats.dmgMultiplier));
}

/**
 * Get crit chance with weapon bonus
 */
export function getWeaponCritChance(baseCrit: number, player: Player): number {
  const weaponStats = getPlayerWeaponStats(player);
  return baseCrit + weaponStats.critBonus;
}

/**
 * Get dodge chance with weapon bonus
 */
export function getWeaponDodgeChance(baseDodge: number, player: Player): number {
  const weaponStats = getPlayerWeaponStats(player);
  return Math.max(0, baseDodge + weaponStats.dodgeBonus);
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
 * Get multi-hit chance multiplier from weapon
 * Formula: (speed / 200) * multiHitBonus, capped at 0.5
 */
export function getWeaponMultiHitChance(speed: number, player: Player): number {
  const weaponStats = getPlayerWeaponStats(player);
  const baseChance = Math.min(0.5, Math.max(0, speed / 200));
  const bonusChance = baseChance * weaponStats.multiHitBonus;
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
 * Apply weapon rage modifier to enemy rage gain
 */
export function applyWeaponRageModifier(rageGain: number, player: Player): number {
  const weaponStats = getPlayerWeaponStats(player);
  return Math.round(rageGain * weaponStats.rageModifier);
}

/**
 * Get boss damage bonus
 */
export function getWeaponBossBonus(player: Player): number {
  const weaponStats = getPlayerWeaponStats(player);
  return weaponStats.boss_bonus ?? 1.0;
}

/**
 * Get swarm damage bonus
 */
export function getWeaponSwarmBonus(player: Player): number {
  const weaponStats = getPlayerWeaponStats(player);
  return weaponStats.swarm_bonus ?? 1.0;
}

/**
 * Get human-readable weapon info for UI
 */
export function getWeaponDescription(player: Player): string {
  const stats = getPlayerWeaponStats(player);
  const parts = [
    stats.name,
    `Role: ${stats.role}`,
  ];

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
