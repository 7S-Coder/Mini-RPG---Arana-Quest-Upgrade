'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { NarrativeMessage } from '@/app/game/templates/narration';
import { getLevelMilestoneNarration } from '@/app/game/templates/narration';

const MILESTONES_SEEN_KEY = 'arena_quest_level_milestones_seen';

export function useLevelMilestones() {
  const [milestonesShownRef] = useState(() => new Set<number>());
  const loadedRef = useRef(false);
  const [pendingNarration, setPendingNarration] = useState<{
    narration: NarrativeMessage;
    level: number;
  } | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([]);

  // Load milestones shown from localStorage on mount
  useEffect(() => {
    if (!loadedRef.current) {
      try {
        const saved = localStorage.getItem(MILESTONES_SEEN_KEY);
        if (saved) {
          const levelNumbers = JSON.parse(saved) as number[];
          levelNumbers.forEach(level => milestonesShownRef.add(level));
          setUnlockedLevels(levelNumbers);
        }
      } catch (e) {
        console.error('Failed to load level milestones:', e);
      }
      loadedRef.current = true;
    }
  }, [milestonesShownRef]);

  const checkAndTriggerMilestone = useCallback((currentLevel: number): NarrativeMessage | null => {
    // Check if we haven't already shown this milestone
    if (milestonesShownRef.has(currentLevel)) {
      return null;
    }

    // Get narration for this level
    const narration = getLevelMilestoneNarration(currentLevel);
    if (!narration) {
      return null;
    }

    // Mark as shown and persist
    milestonesShownRef.add(currentLevel);
    try {
      const allLevels = Array.from(milestonesShownRef);
      localStorage.setItem(MILESTONES_SEEN_KEY, JSON.stringify(allLevels));
      setUnlockedLevels(allLevels);
    } catch (e) {
      console.error('Failed to save level milestone:', e);
    }

    return narration;
  }, [milestonesShownRef]);

  return {
    checkAndTriggerMilestone,
    pendingNarration,
    setPendingNarration,
    unlockedLevels,
  };
}
