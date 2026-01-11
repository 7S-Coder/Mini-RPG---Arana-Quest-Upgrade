/**
 * NPC Relationship System
 * Tracks emotional bonds and dialogue branching with NPCs
 */

export type NPCId = 'lya' | 'eldran' | 'brak' | 'messenger';

export interface NPCRelation {
  npcId: NPCId;
  trust: number;        // 0-100: confiance/méfiance
  affection: number;    // 0-100: affection/amour
  anger: number;        // 0-100: colère/ressentiment
  intimacy: number;     // 0-100: intimité (romance)
  respect: number;      // 0-100: respect (pour Eldran/Brak)
  lastInteraction: number; // timestamp
  conversationsHad: string[]; // liste des dialogues vus (dialogueId)
  choicesMade: Record<string, string>; // {choiceId: 'option_selected'}
  memoryEvents: string[]; // "lya_first_victory", "lya_betrayal", etc.
}

export interface PlayerRelationships {
  lya: NPCRelation;
  eldran: NPCRelation;
  brak: NPCRelation;
  messenger: NPCRelation;
}

/**
 * Dialogue choice with effects on relationship
 */
export interface DialogueChoice {
  id: string;
  text: string;
  effects: {
    trust?: number;
    affection?: number;
    anger?: number;
    intimacy?: number;
    respect?: number;
    memoryEvent?: string;
  };
  requirements?: {
    minTrust?: number;
    minAffection?: number;
    minLevel?: number;
    hasMemoryEvent?: string;
  };
}

/**
 * Dialogue variant based on relationship level
 */
export interface DialogueVariant {
  text: string;
  contextAction?: string; // "*Lya stares at you*", etc.
  requirements?: {
    minTrust?: number;
    maxTrust?: number;
    minAffection?: number;
    maxAffection?: number;
    minIntimacy?: number;
    hasMemoryEvent?: string;
  };
}

/**
 * Full dialogue node with choices
 */
export interface DialogueNode {
  id: string;
  npcId: NPCId;
  variants: DialogueVariant[];
  choices?: DialogueChoice[];
  isRomanceOption?: boolean;
  isCritical?: boolean; // Cannot be avoided
}

/**
 * Emotional state thresholds for branching
 */
export const RELATIONSHIP_THRESHOLDS = {
  TRUST: {
    HOSTILE: { min: 0, max: 20 },      // Refuses to talk
    WARY: { min: 20, max: 40 },        // Minimal trust
    CAUTIOUS: { min: 40, max: 60 },    // Willing to interact
    FRIENDLY: { min: 60, max: 80 },    // Open and helpful
    INTIMATE: { min: 80, max: 100 },   // Full trust
  },
  AFFECTION: {
    INDIFFERENT: { min: 0, max: 20 },
    NEUTRAL: { min: 20, max: 40 },
    FOND: { min: 40, max: 60 },
    CARING: { min: 60, max: 80 },
    IN_LOVE: { min: 80, max: 100 },
  },
  ANGER: {
    CALM: { min: 0, max: 20 },
    IRRITATED: { min: 20, max: 40 },
    FRUSTRATED: { min: 40, max: 60 },
    FURIOUS: { min: 60, max: 100 },
  },
};
