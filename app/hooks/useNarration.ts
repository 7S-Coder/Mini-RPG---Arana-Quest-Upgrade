'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { NarrativeMessage } from '@/app/game/templates/narration';

const TUTORIALS_SHOWN_KEY = 'arena_quest_tutorials_shown';

export function useNarration() {
  const [currentMessage, setCurrentMessage] = useState<NarrativeMessage | null>(null);
  const tutorialsShownRef = useRef<Set<string>>(new Set());
  const loadedRef = useRef(false);

  // Load tutorials shown from localStorage on mount
  useEffect(() => {
    if (!loadedRef.current) {
      try {
        const saved = localStorage.getItem(TUTORIALS_SHOWN_KEY);
        if (saved) {
          tutorialsShownRef.current = new Set(JSON.parse(saved));
        }
      } catch (e) {}
      loadedRef.current = true;
    }
  }, []);

  const showNarration = useCallback((message: NarrativeMessage | undefined) => {
    if (message) {
      setCurrentMessage(message);
    }
  }, []);

  const closeNarration = useCallback(() => {
    setCurrentMessage(null);
  }, []);

  const markTutorialShown = useCallback((tutorialId: string) => {
    tutorialsShownRef.current.add(tutorialId);
    try {
      localStorage.setItem(TUTORIALS_SHOWN_KEY, JSON.stringify(Array.from(tutorialsShownRef.current)));
    } catch (e) {}
  }, []);

  const isTutorialShown = useCallback((tutorialId: string) => {
    return tutorialsShownRef.current.has(tutorialId);
  }, []);

  return {
    currentMessage,
    showNarration,
    closeNarration,
    markTutorialShown,
    isTutorialShown,
    tutorialsShown: tutorialsShownRef.current,
  };
}
