import { describe, it, expect } from 'vitest';

// Helper function to simulate the spawn calculation logic from Game.tsx
function calculateEnemySpawn(baseEnemies: number, eventSpawnBonus: number = 0): number {
  let count = baseEnemies;
  if (eventSpawnBonus) {
    count = Math.max(1, count + eventSpawnBonus);
  }
  return count;
}

// Simulate getActiveEventEffects return value
interface EventEffects {
  spawn_count_bonus?: number;
  enemy_damage_bonus?: number;
  player_damage_malus?: number;
  dodge_bonus?: number;
  loot_bonus?: number;
  rage_modifier?: number;
  enemy_debuff?: number;
}

function applyEventEffects(baseValue: number, effect: number, isMultiplier: boolean = false): number {
  if (isMultiplier) {
    return Math.ceil(baseValue * (1 + effect / 100));
  }
  return Math.max(0, baseValue + effect);
}

describe('Event Modifiers - Combat System', () => {
  describe('Spawn Count Modifier', () => {
    it('should add spawn_count_bonus to enemy count', () => {
      const baseEnemies = 2;
      const swarmBonus = 2;
      const result = calculateEnemySpawn(baseEnemies, swarmBonus);
      expect(result).toBe(4); // 2 + 2 = 4
    });

    it('should not let spawn count go below 1', () => {
      const baseEnemies = 1;
      const negativeBonus = -5;
      const result = calculateEnemySpawn(baseEnemies, negativeBonus);
      expect(result).toBe(1); // Math.max(1, 1-5) = 1
    });

    it('should handle swarm_surge event correctly', () => {
      // swarm_surge has spawn_modifier: 2
      // Base spawn: 1-3 enemies, with +2 should be 3-5
      for (let i = 0; i < 10; i++) {
        const baseSpawn = 1 + Math.floor(Math.random() * 3); // 1-3
        const swarmSpawn = calculateEnemySpawn(baseSpawn, 2);
        expect(swarmSpawn).toBeGreaterThanOrEqual(3);
        expect(swarmSpawn).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('Damage Modifiers', () => {
    it('should apply enemy_damage_bonus as percentage', () => {
      const baseDamage = 10;
      const bloodMoonBonus = 20; // +20% bonus
      const result = applyEventEffects(baseDamage, bloodMoonBonus, true);
      expect(result).toBe(12); // 10 * 1.2 = 12
    });

    it('should apply player_damage_malus negatively', () => {
      const baseDamage = 20;
      const plagueDebuff = 10; // -10% damage
      const result = applyEventEffects(baseDamage, -plagueDebuff, true);
      expect(result).toBe(18); // 20 * 0.9 = 18
    });

    it('should handle frozen_peaks negative enemy bonus', () => {
      const baseDamage = 15;
      const frozenPenalty = -15; // -15% enemy damage
      const result = applyEventEffects(baseDamage, frozenPenalty, true);
      expect(result).toBe(13); // 15 * 0.85 ≈ 12.75 → 13
    });
  });

  describe('Loot Modifiers', () => {
    it('should apply loot_bonus for essence drops', () => {
      const baseLoot = 100;
      const lootBonus = 15; // blood_moon +15%
      const result = applyEventEffects(baseLoot, lootBonus, true);
      expect(result).toBe(115);
    });

    it('should stack with multiple loot bonuses', () => {
      const baseLoot = 100;
      // If multiple events: blood_moon (10%) + essence_storm (15%)
      const firstBonus = applyEventEffects(baseLoot, 10, true);
      const finalBonus = applyEventEffects(firstBonus, 15, true);
      expect(finalBonus).toBeGreaterThan(baseLoot);
    });
  });

  describe('Dodge Modifiers', () => {
    it('should apply positive dodge_bonus', () => {
      const baseChance = 10; // 10% dodge
      const whisperBonus = 10; // whispering_shadows +10%
      const result = applyEventEffects(baseChance, whisperBonus, false);
      expect(result).toBe(20); // 10 + 10 = 20%
    });

    it('should not let dodge go below 0', () => {
      const baseChance = 5;
      const frozenPenalty = -10; // frozen_peaks -5%
      const result = applyEventEffects(baseChance, frozenPenalty, false);
      expect(result).toBe(0); // Math.max(0, 5-10) = 0
    });
  });

  describe('Rage Modifiers', () => {
    it('should increase rage gain with blood_moon', () => {
      const baseRageGain = 10;
      const rageBonus = 30; // +30% rage
      const result = applyEventEffects(baseRageGain, rageBonus, true);
      expect(result).toBe(13); // 10 * 1.3 = 13
    });

    it('should handle whispering_shadows high rage', () => {
      const baseRageGain = 10;
      const whisperRage = 50; // +50% rage
      const result = applyEventEffects(baseRageGain, whisperRage, true);
      expect(result).toBe(15); // 10 * 1.5 = 15
    });
  });

  describe('Enemy Defense Modifier', () => {
    it('should reduce enemy defense with essence_storm', () => {
      const baseDefense = 20;
      const debuff = -10; // -10% defense
      const result = applyEventEffects(baseDefense, debuff, true);
      expect(result).toBe(18); // 20 * 0.9 = 18
    });
  });

  describe('Combined Event Effects', () => {
    it('should handle swarm_surge combination', () => {
      // swarm_surge: spawn_modifier +2, enemy_bonus -20, loot_bonus +5
      const baseSpawn = 2;
      const spawnResult = calculateEnemySpawn(baseSpawn, 2);
      expect(spawnResult).toBe(4); // More enemies

      const baseDamage = 20;
      const damageResult = applyEventEffects(baseDamage, -20, true);
      expect(damageResult).toBe(16); // But they do less damage (balanced)

      const baseLoot = 100;
      const lootResult = applyEventEffects(baseLoot, 5, true);
      expect(lootResult).toBe(105); // Better loot
    });

    it('should handle plague_mist debuffs', () => {
      // plague_mist: player_malus -10%, enemy_bonus +10%, loot_bonus +8
      const playerDamage = 25;
      const playerResult = applyEventEffects(playerDamage, -10, true);
      expect(playerResult).toBeLessThan(playerDamage); // Player weakened

      const enemyDamage = 15;
      const enemyResult = applyEventEffects(enemyDamage, 10, true);
      expect(enemyResult).toBeGreaterThan(enemyDamage); // Enemy empowered
    });
  });
});
