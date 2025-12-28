"use client";

import { useState, useCallback, useRef } from "react";
import type {
  Achievement,
  AchievementTrackingStats,
  Player,
  Enemy,
} from "../types";
import { ACHIEVEMENTS } from "../templates/achievements";

/**
 * useAchievements Hook
 *
 * Manages:
 * 1. Achievement unlock state (in-memory)
 * 2. Tracking statistics (battle count, bosses defeated, etc.)
 * 3. Achievement unlock logic
 * 4. Persistence (via save callbacks)
 * 5. Toast notifications for new unlocks
 */

export function useAchievements() {
  // === STATE: Achievements (in-memory copy that can be modified) ===
  const [achievements, setAchievements] = useState<Record<string, Achievement>>(
    () => {
      // Deep clone to avoid mutating the imported template
      const cloned: Record<string, Achievement> = {};
      for (const [id, ach] of Object.entries(ACHIEVEMENTS)) {
        cloned[id] = { ...ach };
      }
      return cloned;
    }
  );

  // === STATE: Tracking stats ===
  const [stats, setStats] = useState<AchievementTrackingStats>({
    totalBattlesWon: 0,
    totalBattlesLost: 0,
    dungeonCompleted: {},
    bossesDefeated: {},
    mapsUnlocked: {},
    enemyTypesDefeated: {},
    highestWinStreak: 0,
    chaptersCompleted: {},
  });

  // Track newly unlocked achievements to show toast notifications
  const newlyUnlockedRef = useRef<Set<string>>(new Set());

  // --- Methods: Update tracking stats ---

  /**
   * Called after a battle victory
   * Increments totalBattlesWon and tracks enemy type
   */
  const recordBattleWin = useCallback(
    (enemies: Enemy[]) => {
      setStats((prev: any) => {
        const next = { ...prev, totalBattlesWon: prev.totalBattlesWon + 1 };

        // Track enemy types defeated
        for (const enemy of enemies) {
          if (enemy.templateId) {
            next.enemyTypesDefeated[enemy.templateId] =
              (next.enemyTypesDefeated[enemy.templateId] ?? 0) + 1;
          }
        }

        return next;
      });
    },
    []
  );

  /**
   * Called after a battle loss/death
   */
  const recordBattleLoss = useCallback(() => {
    setStats((prev: any) => ({
      ...prev,
      totalBattlesLost: prev.totalBattlesLost + 1,
    }));
  }, []);

  /**
   * Called when a boss is defeated
   */
  const recordBossDefeat = useCallback((bossTemplateId: string) => {
    setStats((prev: any) => ({
      ...prev,
      bossesDefeated: {
        ...prev.bossesDefeated,
        [bossTemplateId]: (prev.bossesDefeated[bossTemplateId] ?? 0) + 1,
      },
    }));
  }, []);

  /**
   * Called when a map is unlocked
   */
  const recordMapUnlock = useCallback((mapId: string) => {
    setStats((prev: any) => ({
      ...prev,
      mapsUnlocked: {
        ...prev.mapsUnlocked,
        [mapId]: true,
      },
    }));
  }, []);

  /**
   * Called when a dungeon is completed
   */
  const recordDungeonCompletion = useCallback((dungeonId: string) => {
    setStats((prev: any) => ({
      ...prev,
      dungeonCompleted: {
        ...prev.dungeonCompleted,
        [dungeonId]: (prev.dungeonCompleted[dungeonId] ?? 0) + 1,
      },
    }));
  }, []);

  /**
   * Called when a chapter is completed (narrative progression)
   */
  const recordChapterCompletion = useCallback((chapterId: string) => {
    setStats((prev: any) => ({
      ...prev,
      chaptersCompleted: {
        ...prev.chaptersCompleted,
        [chapterId]: true,
      },
    }));
  }, []);

  /**
   * Update highest win streak
   */
  const updateHighestWinStreak = useCallback((streak: number) => {
    setStats((prev: any) => ({
      ...prev,
      highestWinStreak: Math.max(prev.highestWinStreak, streak),
    }));
  }, []);

  // --- Methods: Achievement unlock logic ---

  /**
   * Main function: Check all achievements and unlock those that qualify
   * Called after key events (battle victory, boss defeat, map unlock, etc.)
   *
   * Returns array of newly unlocked achievement IDs
   */
  const checkAchievements = useCallback(
    (context?: {
      player?: Player;
      currentWinStreak?: number;
    }): string[] => {
      const unlocked: string[] = [];

      setAchievements((prev: any) => {
        const next = { ...prev };
        const player = context?.player;
        const winStreak = context?.currentWinStreak ?? 0;

        // Check each achievement
        for (const [id, ach] of Object.entries(next)) {
          // Skip if already unlocked
          if ((ach as any).unlocked) continue;

          let shouldUnlock = false;

          // === COMBAT ACHIEVEMENTS ===
          if (id === "first_blood" && stats.totalBattlesWon >= 1) {
            shouldUnlock = true;
          } else if (id === "battle_10" && stats.totalBattlesWon >= 10) {
            shouldUnlock = true;
          } else if (id === "battle_50" && stats.totalBattlesWon >= 50) {
            shouldUnlock = true;
          } else if (id === "battle_100" && stats.totalBattlesWon >= 100) {
            shouldUnlock = true;
          } else if (id === "win_streak_10" && winStreak >= 10) {
            shouldUnlock = true;
          } else if (id === "win_streak_25" && winStreak >= 25) {
            shouldUnlock = true;
          }
          // === ENEMY TYPE ACHIEVEMENTS ===
          else if (id === "goblin_slayer" && stats.enemyTypesDefeated["goblin"] >= 1) {
            shouldUnlock = true;
          } else if (id === "troll_hunter" && stats.enemyTypesDefeated["troll"] >= 1) {
            shouldUnlock = true;
          } else if (id === "dragon_slayer" && stats.enemyTypesDefeated["dragon"] >= 1) {
            shouldUnlock = true;
          } else if (id === "shadow_hunter" && stats.enemyTypesDefeated["shadow_beast"] >= 1) {
            shouldUnlock = true;
          }
          // === BOSS ACHIEVEMENTS ===
          else if (id === "first_boss" && Object.keys(stats.bossesDefeated).length >= 1) {
            shouldUnlock = true;
          } else if (id === "five_bosses" && Object.values(stats.bossesDefeated).reduce((sum: number, v: any) => sum + v, 0) >= 5) {
            shouldUnlock = true;
          }
          // === MAP ACHIEVEMENTS ===
          else if (id === "map_unlock_5" && Object.keys(stats.mapsUnlocked).length >= 5) {
            shouldUnlock = true;
          } else if (id === "map_unlock_10" && Object.keys(stats.mapsUnlocked).length >= 10) {
            shouldUnlock = true;
          }
          // === DUNGEON ACHIEVEMENTS ===
          else if (id === "first_dungeon" && Object.keys(stats.dungeonCompleted).length >= 1) {
            shouldUnlock = true;
          } else if (id === "three_dungeons" && Object.keys(stats.dungeonCompleted).length >= 3) {
            shouldUnlock = true;
          }
          // === SPECIAL ACHIEVEMENTS ===
          else if (id === "never_die" && winStreak >= 10 && stats.totalBattlesLost === 0) {
            shouldUnlock = true;
          } else if (id === "first_essence" && player?.essence && player.essence >= 1) {
            shouldUnlock = true;
          }
          // legendary_find and mythic_find are handled by item drops separately
          // === NARRATIVE/HIDDEN ACHIEVEMENTS ===
          else if (id === "final_boss" && stats.bossesDefeated["fire_overlord"] >= 1) {
            shouldUnlock = true;
          }

          if (shouldUnlock) {
            (next as any)[id] = {
              ...(ach as any),
              unlocked: true,
              unlockedAt: Date.now(),
            };
            unlocked.push(id);
            newlyUnlockedRef.current.add(id);
          }
        }

        return next;
      });

      return unlocked;
    },
    [stats]
  );

  /**
   * Manually unlock a specific achievement (for special cases)
   * This should be used for item-related achievements or special events
   */
  const unlockAchievement = useCallback((id: string): boolean => {
    let wasUnlocked = false;

    setAchievements((prev: any) => {
      if (prev[id] && !prev[id].unlocked) {
        prev[id] = {
          ...prev[id],
          unlocked: true,
          unlockedAt: Date.now(),
        };
        newlyUnlockedRef.current.add(id);
        wasUnlocked = true;
      }
      return { ...prev };
    });

    return wasUnlocked;
  }, []);

  /**
   * Get all newly unlocked achievements since last check
   * (Used for toast notifications)
   */
  const getNewlyUnlocked = useCallback((): Achievement[] => {
    const newly = Array.from(newlyUnlockedRef.current).map(
      (id) => achievements[id]
    );
    newlyUnlockedRef.current.clear();
    return newly;
  }, [achievements]);

  // --- Methods: Loading/Saving ---

  /**
   * Load achievements from saved data
   * Called when game loads from localStorage
   */
  const loadFromSave = useCallback(
    (savedAch: Record<string, Achievement>, savedStats: AchievementTrackingStats) => {
      // Merge saved achievements with current template
      setAchievements((prev: any) => {
        const next = { ...prev };
        for (const [id, saved] of Object.entries(savedAch)) {
          if (next[id]) {
            next[id] = {
              ...next[id],
              unlocked: saved.unlocked,
              unlockedAt: saved.unlockedAt,
            };
          }
        }
        return next;
      });

      // Load stats
      setStats(savedStats);
    },
    []
  );

  /**
   * Get current state for saving
   * Called by saveCoreGame
   */
  const getSaveData = useCallback(
    () => ({
      achievements,
      stats,
    }),
    [achievements, stats]
  );

  // === Public API ===
  return {
    // State
    achievements,
    stats,

    // Tracking
    recordBattleWin,
    recordBattleLoss,
    recordBossDefeat,
    recordMapUnlock,
    recordDungeonCompletion,
    recordChapterCompletion,
    updateHighestWinStreak,

    // Checking
    checkAchievements,
    unlockAchievement,
    getNewlyUnlocked,

    // Persistence
    loadFromSave,
    getSaveData,
  };
}
