/**
 * useRelationships - Hook for managing NPC relationships
 * Handles state, persistence, branching logic, and memory events
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PlayerRelationships, NPCRelation, DialogueChoice } from '@/app/game/templates/relationships/types';
import { initializeRelationships } from '@/app/game/templates/relationships';
import {
  applyStatGains,
  applySynergyBonuses,
  getLyaDialogueGains,
  applyCombatGains,
  applyDungeonGains,
  applyLevelMilestoneGains,
  applyDailyRelationshipChanges,
  type StatGain,
  type RelationshipContext,
} from './useRelationshipGains';

const STORAGE_KEY = 'arena_relationships';
const LAST_INTERACTION_KEY = 'arena_last_interaction';

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
    (npcId: 'lya' | 'eldran' | 'brak' | 'messenger', choice: DialogueChoice, dialogueId?: string) => {
      setRelationships((prev) => {
        if (!prev || !prev[npcId]) return prev;

        const npc = { ...prev[npcId] };
        
        // Get stat gains for this specific dialogue choice
        const dialogueGains = dialogueId && npcId === 'lya' ? getLyaDialogueGains(dialogueId) : null;
        
        if (dialogueGains && Object.keys(dialogueGains).length > 0) {
          // Build relationship context
          const context: RelationshipContext = {
            npcId,
            currentStats: {
              trust: npc.trust,
              affection: npc.affection,
              anger: npc.anger,
              respect: npc.respect,
              intimacy: npc.intimacy,
            },
            playerLevel: 1, // Would come from game state
            lastInteraction: npc.lastInteraction,
            memoryEvents: npc.memoryEvents,
          };

          // Apply modifiers and blocking gates
          let appliedGains = applyStatGains(dialogueGains, context);
          appliedGains = applySynergyBonuses(appliedGains, context);

          // Apply gains with clamping
          if (appliedGains.trust) npc.trust = Math.max(5, Math.min(100, npc.trust + appliedGains.trust));
          if (appliedGains.affection) npc.affection = Math.max(0, Math.min(100, npc.affection + appliedGains.affection));
          if (appliedGains.anger) npc.anger = Math.max(0, Math.min(100, npc.anger + appliedGains.anger));
          if (appliedGains.respect) npc.respect = Math.max(0, Math.min(100, npc.respect + appliedGains.respect));
          if (appliedGains.intimacy) npc.intimacy = Math.max(0, Math.min(100, npc.intimacy + appliedGains.intimacy));
        } else {
          // Fallback to legacy effects system
          const effects = choice.effects;
          if (effects.trust) npc.trust = Math.max(0, Math.min(100, npc.trust + effects.trust));
          if (effects.affection) npc.affection = Math.max(0, Math.min(100, npc.affection + effects.affection));
          if (effects.anger) npc.anger = Math.max(0, Math.min(100, npc.anger + effects.anger));
          if (effects.intimacy) npc.intimacy = Math.max(0, Math.min(100, npc.intimacy + effects.intimacy));
        }

        // Track choice
        npc.choicesMade[choice.id] = choice.id;

        // Add memory event if applicable
        const effects = choice.effects;
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

  // Apply relationship gains with full modifier system
  const applyRelationshipGains = useCallback(
    (npcId: 'lya' | 'eldran' | 'brak' | 'messenger', gains: StatGain) => {
      setRelationships((prev) => {
        if (!prev || !prev[npcId]) return prev;

        const npc = { ...prev[npcId] };
        const context: RelationshipContext = {
          npcId,
          currentStats: {
            trust: npc.trust,
            affection: npc.affection,
            anger: npc.anger,
            respect: npc.respect,
            intimacy: npc.intimacy,
          },
          playerLevel: 1, // Would be passed from game state
          lastInteraction: npc.lastInteraction,
          memoryEvents: npc.memoryEvents,
        };

        // Apply modifiers and synergy
        let appliedGains = applyStatGains(gains, context);
        appliedGains = applySynergyBonuses(appliedGains, context);

        // Clamp stats to valid ranges
        if (appliedGains.trust) npc.trust = Math.max(5, Math.min(100, npc.trust + appliedGains.trust));
        if (appliedGains.affection) npc.affection = Math.max(0, Math.min(100, npc.affection + appliedGains.affection));
        if (appliedGains.anger) npc.anger = Math.max(0, Math.min(100, npc.anger + appliedGains.anger));
        if (appliedGains.respect) npc.respect = Math.max(0, Math.min(100, npc.respect + appliedGains.respect));
        if (appliedGains.intimacy) npc.intimacy = Math.max(0, Math.min(100, npc.intimacy + appliedGains.intimacy));

        npc.lastInteraction = Date.now();

        return { ...prev, [npcId]: npc };
      });
    },
    []
  );

  // Apply combat-related stat changes
  const applyCombatChange = useCallback(
    (npcId: 'lya' | 'eldran' | 'brak' | 'messenger', result: 'victory' | 'defeat', consecutiveWins: number = 0, consecutiveLosses: number = 0) => {
      const npc = relationships?.[npcId];
      if (!npc) return;

      const context: RelationshipContext = {
        npcId,
        currentStats: {
          trust: npc.trust,
          affection: npc.affection,
          anger: npc.anger,
          respect: npc.respect,
          intimacy: npc.intimacy,
        },
        combatStats: {
          consecutiveWins,
          consecutiveLosses,
          totalVictories: 0,
          totalDefeats: 0,
        },
        playerLevel: 1,
        lastInteraction: npc.lastInteraction,
        memoryEvents: npc.memoryEvents,
      };

      const gains = applyCombatGains(context, result);
      applyRelationshipGains(npcId, gains);
    },
    [relationships, applyRelationshipGains]
  );

  // Apply dungeon completion gains
  const applyDungeonChange = useCallback(
    (npcId: 'lya' | 'eldran' | 'brak' | 'messenger', result: 'success' | 'failure', healthPercentage: number = 100) => {
      const npc = relationships?.[npcId];
      if (!npc) return;

      const gains = applyDungeonGains(
        {
          npcId,
          currentStats: {
            trust: npc.trust,
            affection: npc.affection,
            anger: npc.anger,
            respect: npc.respect,
            intimacy: npc.intimacy,
          },
          playerLevel: 1,
          lastInteraction: npc.lastInteraction,
          memoryEvents: npc.memoryEvents,
        },
        result,
        healthPercentage
      );
      applyRelationshipGains(npcId, gains);
    },
    [relationships, applyRelationshipGains]
  );

  // Apply level up milestone gains
  const applyLevelUpChange = useCallback(
    (npcId: 'lya' | 'eldran' | 'brak' | 'messenger', newLevel: number) => {
      const gains = applyLevelMilestoneGains(newLevel);
      if (Object.keys(gains).length > 0) {
        applyRelationshipGains(npcId, gains);
      }
    },
    [applyRelationshipGains]
  );

  return {
    relationships,
    getNPC,
    applyChoice,
    markConversationSeen,
    meetsRequirements,
    getRelationshipLevel,
    applyRelationshipGains,
    applyCombatChange,
    applyDungeonChange,
    applyLevelUpChange,
  };
}
