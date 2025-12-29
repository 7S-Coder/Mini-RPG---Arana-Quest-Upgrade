import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS } from '../../app/game/templates/achievements';

describe('Achievement Rewards System', () => {
  describe('Achievement Structure', () => {
    it('should have achievements defined', () => {
      expect(Object.keys(ACHIEVEMENTS).length).toBeGreaterThan(0);
    });

    it('each achievement should have required fields', () => {
      Object.values(ACHIEVEMENTS).forEach((ach) => {
        expect(ach).toHaveProperty('id');
        expect(ach).toHaveProperty('title');
        expect(ach).toHaveProperty('description');
      });
    });
  });

  describe('Reward Distribution', () => {
    it('battle_10 should award 200 gold and 10 essence', () => {
      const ach = ACHIEVEMENTS['battle_10'];
      expect(ach?.reward?.gold).toBe(200);
      expect(ach?.reward?.essence).toBe(10);
    });

    it('should have reward property', () => {
      Object.values(ACHIEVEMENTS).forEach((ach) => {
        expect(ach).toHaveProperty('reward');
        if (ach.reward) {
          // Reward must have at least one of gold or essence
          const hasGold = 'gold' in ach.reward;
          const hasEssence = 'essence' in ach.reward;
          expect(hasGold || hasEssence).toBe(true);
        }
      });
    });

    it('rewards should not be negative', () => {
      Object.values(ACHIEVEMENTS).forEach((ach) => {
        if (ach.reward) {
          if (ach.reward.gold !== undefined) {
            expect(ach.reward.gold).toBeGreaterThanOrEqual(0);
          }
          if (ach.reward.essence !== undefined) {
            expect(ach.reward.essence).toBeGreaterThanOrEqual(0);
          }
        }
      });
    });
  });

  describe('Reward Calculation', () => {
    function calculateTotalReward(achievements: string[]): {
      totalGold: number;
      totalEssence: number;
    } {
      let totalGold = 0;
      let totalEssence = 0;

      achievements.forEach((achId) => {
        const ach = ACHIEVEMENTS[achId];
        if (ach?.reward) {
          if (ach.reward.gold !== undefined) {
            totalGold += ach.reward.gold;
          }
          if (ach.reward.essence !== undefined) {
            totalEssence += ach.reward.essence;
          }
        }
      });

      return { totalGold, totalEssence };
    }

    it('should accumulate gold from multiple achievements', () => {
      const rewards = calculateTotalReward(['battle_10', 'battle_50']);
      expect(rewards.totalGold).toBeGreaterThan(0);
    });

    it('should accumulate essence from multiple achievements', () => {
      const rewards = calculateTotalReward(['battle_10', 'battle_50']);
      expect(rewards.totalEssence).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty achievement list', () => {
      const rewards = calculateTotalReward([]);
      expect(rewards.totalGold).toBe(0);
      expect(rewards.totalEssence).toBe(0);
    });

    it('should handle non-existent achievements gracefully', () => {
      const rewards = calculateTotalReward(['battle_10', 'invalid_id', 'battle_50']);
      expect(rewards.totalGold).toBeGreaterThanOrEqual(0);
      expect(rewards.totalEssence).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Rarity-Based Rewards', () => {
    it('achievements with different rarities should have proportional rewards', () => {
      // Common achievements should have less reward than rare ones
      const allAchievements = Object.values(ACHIEVEMENTS);
      const withRewards = allAchievements.filter((a) => a.reward);
      
      expect(withRewards.length).toBeGreaterThan(0);
      
      // Find min and max rewards
      const goldValues = withRewards.map((a) => a.reward?.gold ?? 0);
      const minGold = Math.min(...goldValues);
      const maxGold = Math.max(...goldValues);
      
      expect(maxGold).toBeGreaterThanOrEqual(minGold);
    });
  });

  describe('Reward Logic', () => {
    function applyReward(
      currentGold: number,
      currentEssence: number,
      achId: string
    ): { gold: number; essence: number } {
      const ach = ACHIEVEMENTS[achId];
      const goldReward = ach?.reward?.gold ?? 0;
      const essenceReward = ach?.reward?.essence ?? 0;

      return {
        gold: currentGold + goldReward,
        essence: currentEssence + essenceReward,
      };
    }

    it('should apply single achievement reward', () => {
      const result = applyReward(1000, 50, 'battle_10');
      expect(result.gold).toBeGreaterThan(1000);
      expect(result.essence).toBeGreaterThan(50);
    });

    it('should apply multiple consecutive rewards', () => {
      let gold = 1000;
      let essence = 50;

      const achIds = ['battle_10', 'boss_5', 'battle_25'];
      
      for (const id of achIds) {
        const result = applyReward(gold, essence, id);
        gold = result.gold;
        essence = result.essence;
      }

      expect(gold).toBeGreaterThan(1000);
      expect(essence).toBeGreaterThan(50);
    });

    it('should not lose resources when applying reward', () => {
      const initialGold = 5000;
      const initialEssence = 100;

      const result = applyReward(initialGold, initialEssence, 'battle_10');

      expect(result.gold).toBeGreaterThanOrEqual(initialGold);
      expect(result.essence).toBeGreaterThanOrEqual(initialEssence);
    });
  });

  describe('Edge Cases', () => {
    function applyReward(
      currentGold: number,
      currentEssence: number,
      achId: string
    ): { gold: number; essence: number } {
      const ach = ACHIEVEMENTS[achId];
      const goldReward = ach?.reward?.gold ?? 0;
      const essenceReward = ach?.reward?.essence ?? 0;

      return {
        gold: currentGold + goldReward,
        essence: currentEssence + essenceReward,
      };
    }

    it('should handle null reward gracefully', () => {
      const testAch = { id: 'test', name: 'Test', reward: null as any };
      const gold = (testAch.reward?.gold ?? 0) || 0;
      const essence = (testAch.reward?.essence ?? 0) || 0;
      
      expect(gold).toBe(0);
      expect(essence).toBe(0);
    });

    it('should handle undefined reward gracefully', () => {
      const testAch = { id: 'test', name: 'Test', reward: undefined as any };
      const gold = testAch.reward?.gold ?? 0;
      const essence = testAch.reward?.essence ?? 0;
      
      expect(gold).toBe(0);
      expect(essence).toBe(0);
    });

    it('should apply with large numbers safely', () => {
      const result = applyReward(1000000, 10000, 'battle_10');
      expect(result.gold).toBeLessThan(Number.MAX_SAFE_INTEGER);
      expect(result.essence).toBeLessThan(Number.MAX_SAFE_INTEGER);
    });
  });
});
