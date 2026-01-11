/**
 * useRelationships - Hook for managing NPC relationships
 * Handles state, persistence, branching logic, and memory events
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PlayerRelationships, NPCRelation, DialogueChoice } from '@/app/game/templates/relationships/types';
import { initializeRelationships } from '@/app/game/templates/relationships';

const STORAGE_KEY = 'arena_relationships';

export function useRelationships() {
  const [relationships, setRelationships] = useState<PlayerRelationships | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRelationships(JSON.parse(saved));
      } catch {
        setRelationships(initializeRelationships());
      }
    } else {
      setRelationships(initializeRelationships());
    }
  }, []);

  // Save whenever relationships change
  useEffect(() => {
    if (relationships) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(relationships));
    }
  }, [relationships]);

  // Get specific NPC relation
  const getNPC = useCallback(
    (npcId: 'lya' | 'eldran' | 'brak' | 'messenger'): NPCRelation | undefined => {
      return relationships?.[npcId];
    },
    [relationships]
  );

  // Apply dialogue choice (update trust, affection, etc.)
  const applyChoice = useCallback(
    (npcId: 'lya' | 'eldran' | 'brak' | 'messenger', choice: DialogueChoice) => {
      setRelationships((prev) => {
        if (!prev || !prev[npcId]) return prev;

        const npc = { ...prev[npcId] };
        const effects = choice.effects;

        // Apply effects
        if (effects.trust) npc.trust = Math.max(0, Math.min(100, npc.trust + effects.trust));
        if (effects.affection) npc.affection = Math.max(0, Math.min(100, npc.affection + effects.affection));
        if (effects.anger) npc.anger = Math.max(0, Math.min(100, npc.anger + effects.anger));
        if (effects.intimacy) npc.intimacy = Math.max(0, Math.min(100, npc.intimacy + effects.intimacy));

        // Track choice
        npc.choicesMade[choice.id] = choice.id;

        // Add memory event if applicable
        if (effects.memoryEvent) {
          if (!npc.memoryEvents.includes(effects.memoryEvent)) {
            npc.memoryEvents.push(effects.memoryEvent);
          }
        }

        return { ...prev, [npcId]: npc };
      });
    },
    []
  );

  // Record conversation seen
  const markConversationSeen = useCallback(
    (npcId: 'lya' | 'eldran' | 'brak' | 'messenger', conversationId: string) => {
      setRelationships((prev) => {
        if (!prev || !prev[npcId]) return prev;

        const npc = { ...prev[npcId] };
        if (!npc.conversationsHad.includes(conversationId)) {
          npc.conversationsHad.push(conversationId);
        }
        npc.lastInteraction = Date.now();

        return { ...prev, [npcId]: npc };
      });
    },
    []
  );

  // Check if dialogue requirements are met
  const meetsRequirements = useCallback(
    (npcId: 'lya' | 'eldran' | 'brak' | 'messenger', requirements?: { minTrust?: number; maxTrust?: number; minAffection?: number; hasMemoryEvent?: string }) => {
      if (!requirements) return true;

      const npc = relationships?.[npcId];
      if (!npc) return false;

      if (requirements.minTrust !== undefined && npc.trust < requirements.minTrust) return false;
      if (requirements.maxTrust !== undefined && npc.trust > requirements.maxTrust) return false;
      if (requirements.minAffection !== undefined && npc.affection < requirements.minAffection) return false;
      if (requirements.hasMemoryEvent && !npc.memoryEvents.includes(requirements.hasMemoryEvent)) return false;

      return true;
    },
    [relationships]
  );

  // Get relationship level (HOSTILE, WARY, FRIENDLY, etc.)
  const getRelationshipLevel = useCallback(
    (npcId: 'lya' | 'eldran' | 'brak' | 'messenger', stat: 'trust' | 'affection' | 'anger'): string => {
      const npc = relationships?.[npcId];
      if (!npc) return 'UNKNOWN';

      const value = npc[stat];

      if (stat === 'trust') {
        if (value < 20) return 'HOSTILE';
        if (value < 40) return 'WARY';
        if (value < 60) return 'CAUTIOUS';
        if (value < 80) return 'FRIENDLY';
        return 'INTIMATE';
      }

      if (stat === 'affection') {
        if (value < 20) return 'INDIFFERENT';
        if (value < 40) return 'NEUTRAL';
        if (value < 60) return 'FOND';
        if (value < 80) return 'CARING';
        return 'IN_LOVE';
      }

      if (stat === 'anger') {
        if (value < 20) return 'CALM';
        if (value < 40) return 'IRRITATED';
        if (value < 60) return 'FRUSTRATED';
        return 'FURIOUS';
      }

      return 'UNKNOWN';
    },
    [relationships]
  );

  return {
    relationships,
    getNPC,
    applyChoice,
    markConversationSeen,
    meetsRequirements,
    getRelationshipLevel,
  };
}
