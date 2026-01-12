/**
 * Lya - The Scout
 * Observer of the world and the player's journey
 * Role: Worldbuilding, contextual commentary, respiration
 */

import type { NPCRelation } from './types';

export const LYA_INITIAL: NPCRelation = {
  npcId: 'lya',
  trust: 0,
  affection: 0,
  anger: 0,
  intimacy: 0,
  respect: 0,
  lastInteraction: 0,
  conversationsHad: [],
  choicesMade: {},
  memoryEvents: [],
};

/**
 * Lya's role:
 * 
 * She provides:
 * → Lore and worldbuilding commentary
 * → Contextual observations about the player's journey
 * → Subtle narrative hints and foreshadowing
 * → Respiration moments between combat
 * → No explicit romance or stat-based progression
 * 
 * Her presence is felt through:
 * → Casual dialogue exchanges
 * → Observations about the world
 * → Subtle character depth (implicit care, protective tone)
 */

export const LYA_PERSONALITY = {
  // Core traits
  pragmatic: true,      // Values action and results
  protective: true,     // Shows care through actions, not words
  observant: true,      // Notices everything
  mysterious: true,     // Keeps her past close
  loyal: true,          // Faithful to those who earn it

  // Speech patterns
  thoughtful: true,     // Speaks with intention
  sarcastic: true,      // Dark humor as self-protection
  metaphorical: true,   // Uses imagery of survival and transformation
  listens: true,        // More silence than words
};
