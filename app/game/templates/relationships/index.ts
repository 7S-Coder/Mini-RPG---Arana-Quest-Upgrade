/**
 * NPC Relationships System
 * Central export for all NPC relationship data and types
 */

export type { NPCRelation, PlayerRelationships, DialogueChoice, DialogueVariant, DialogueNode } from './types';
export { RELATIONSHIP_THRESHOLDS } from './types';

export { LYA_INITIAL, LYA_PERSONALITY } from './lya';
export { ELDRAN_INITIAL, ELDRAN_PERSONALITY } from './eldran';
export { BRAK_INITIAL, BRAK_PERSONALITY } from './brak';
export { MESSENGER_INITIAL, MESSENGER_PERSONALITY } from './messenger';
export type { MelethorThreat } from './melethor';
export { MELETHOR_INITIAL, MELETHOR_PERSONALITY, MELETHOR_WHISPERS, MELETHOR_OFFERS } from './melethor';

/**
 * Initialize all relationships at game start
 */
export function initializeRelationships() {
  const { LYA_INITIAL, ELDRAN_INITIAL, BRAK_INITIAL, MESSENGER_INITIAL } = require('./index');
  
  return {
    lya: { ...LYA_INITIAL },
    eldran: { ...ELDRAN_INITIAL },
    brak: { ...BRAK_INITIAL },
    messenger: { ...MESSENGER_INITIAL },
  };
}

/**
 * Get NPC personality traits
 */
export function getNPCPersonality(npcId: 'lya' | 'eldran' | 'brak' | 'messenger') {
  const personalities = {
    lya: require('./lya').LYA_PERSONALITY,
    eldran: require('./eldran').ELDRAN_PERSONALITY,
    brak: require('./brak').BRAK_PERSONALITY,
    messenger: require('./messenger').MESSENGER_PERSONALITY,
  };
  return personalities[npcId] || {};
}

/**
 * Get NPC memory events catalog
 */
export function getNPCMemoryEvents(npcId: 'lya' | 'eldran' | 'brak' | 'messenger') {
  const events = {
    lya: require('./lya').LYA_MEMORY_EVENTS,
    eldran: require('./eldran').ELDRAN_MEMORY_EVENTS,
    brak: require('./brak').BRAK_MEMORY_EVENTS,
    messenger: require('./messenger').MESSENGER_MEMORY_EVENTS,
  };
  return events[npcId] || {};
}
