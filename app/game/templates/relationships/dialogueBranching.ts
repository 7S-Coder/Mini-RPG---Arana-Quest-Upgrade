/**
 * Dialogue Branching Helpers
 * Utilities to select correct dialogue variant based on relationships
 */

import type { DialogueNode, DialogueVariant, NPCRelation } from '@/app/game/templates/relationships/types';

/**
 * Select the best matching dialogue variant based on relationship state
 * Returns the variant that best matches the current relationship stats
 */
export function selectDialogueVariant(
  dialogue: DialogueNode,
  npc: NPCRelation
): DialogueVariant {
  // Filter variants that meet requirements
  const validVariants = dialogue.variants.filter((variant) => {
    const req = variant.requirements;
    if (!req) return true; // No requirements = always valid

    if (req.minTrust !== undefined && npc.trust < req.minTrust) return false;
    if (req.maxTrust !== undefined && npc.trust > req.maxTrust) return false;
    if (req.minAffection !== undefined && npc.affection < req.minAffection) return false;
    if (req.maxAffection !== undefined && npc.affection > req.maxAffection) return false;
    if (req.minIntimacy !== undefined && npc.intimacy < req.minIntimacy) return false;
    if (req.hasMemoryEvent && !npc.memoryEvents.includes(req.hasMemoryEvent)) return false;

    return true;
  });

  // If no variants match, use first one as fallback
  if (validVariants.length === 0) {
    return dialogue.variants[0];
  }

  // Score variants based on relationship specificity
  // (more specific requirements = higher priority)
  const scoredVariants = validVariants.map((variant) => {
    let score = 0;
    const req = variant.requirements;
    if (!req) return { variant, score };

    // Bonus for requirement specificity
    if (req.minTrust !== undefined || req.maxTrust !== undefined) score += 1;
    if (req.minAffection !== undefined || req.maxAffection !== undefined) score += 1;
    if (req.minIntimacy !== undefined) score += 1;
    if (req.hasMemoryEvent) score += 2; // Memory events are important

    // Bonus for closeness to actual values
    if (req.minTrust !== undefined && npc.trust >= req.minTrust) score += 0.5;
    if (req.maxTrust !== undefined && npc.trust <= req.maxTrust) score += 0.5;
    if (req.minAffection !== undefined && npc.affection >= req.minAffection) score += 0.5;

    return { variant, score };
  });

  // Return highest scored variant
  return scoredVariants.sort((a, b) => b.score - a.score)[0].variant;
}

/**
 * Example: How to structure adaptive dialogue in narration.ts
 * This shows the pattern you should follow
 */
export const EXAMPLE_ADAPTIVE_DIALOGUE: DialogueNode = {
  id: 'lya_first_combat_aftermath',
  npcId: 'lya',
  variants: [
    {
      text: 'You swing. That\'s the first lesson. Everything else, you\'ll learn bleeding.',
      contextAction: '*Lya watches with cold assessment*',
      requirements: { minTrust: 0, maxTrust: 20 },
    },
    {
      text: 'You\'re getting stronger. I see it in every swing.',
      contextAction: '*Lya nods with subtle approval*',
      requirements: { minTrust: 40, maxTrust: 60 },
    },
    {
      text: 'That was beautiful. You fight like someone who has something to protect.',
      contextAction: '*Lya looks at you with unexpected tenderness*',
      requirements: { minTrust: 80, minAffection: 60 },
    },
  ],
  choices: [
    {
      id: 'lya_choice_respectful',
      text: '*Listen to her quietly*',
      effects: { trust: 10, affection: 5 },
    },
    {
      id: 'lya_choice_defiant',
      text: 'I don\'t need your advice.',
      effects: { trust: -5, anger: 10 },
    },
  ],
};

/**
 * Template for creating branching dialogues
 * Copy this structure for each dialogue node
 */
export interface DialogueTemplate {
  id: string;
  npcId: 'lya' | 'eldran' | 'brak' | 'messenger';
  
  // Fallback (always shown if no variants match)
  baseText: string;
  
  // Variants based on relationship thresholds
  variants: {
    hostile?: string;         // 0-20 trust
    wary?: string;            // 20-40 trust
    cautious?: string;        // 40-60 trust
    friendly?: string;        // 60-80 trust
    intimate?: string;        // 80-100 trust
    highAffection?: string;   // 60+ affection
    withAng?: string;         // 40+ anger
    withMemory?: Record<string, string>; // specific memory events
  };
  
  // Choice outcomes
  choices: {
    text: string;
    id: string;
    effects: { trust?: number; affection?: number; anger?: number; memoryEvent?: string };
  }[];
}

/**
 * Helper to build DialogueNode from DialogueTemplate
 */
export function buildDialogueFromTemplate(template: DialogueTemplate): DialogueNode {
  const variants: DialogueVariant[] = [];

  if (template.variants.hostile) {
    variants.push({
      text: template.variants.hostile,
      requirements: { minTrust: 0, maxTrust: 20 },
    });
  }
  if (template.variants.wary) {
    variants.push({
      text: template.variants.wary,
      requirements: { minTrust: 20, maxTrust: 40 },
    });
  }
  if (template.variants.cautious) {
    variants.push({
      text: template.variants.cautious,
      requirements: { minTrust: 40, maxTrust: 60 },
    });
  }
  if (template.variants.friendly) {
    variants.push({
      text: template.variants.friendly,
      requirements: { minTrust: 60, maxTrust: 80 },
    });
  }
  if (template.variants.intimate) {
    variants.push({
      text: template.variants.intimate,
      requirements: { minTrust: 80, maxTrust: 100 },
    });
  }
  if (template.variants.highAffection) {
    variants.push({
      text: template.variants.highAffection,
      requirements: { minAffection: 60 },
    });
  }

  // Fallback
  variants.push({
    text: template.baseText,
  });

  return {
    id: template.id,
    npcId: template.npcId,
    variants,
    choices: template.choices,
  };
}

/**
 * Real example: Adapt first victory dialogue
 */
export const LYA_FIRST_VICTORY: DialogueTemplate = {
  id: 'lya_first_victory',
  npcId: 'lya',
  baseText: 'So you won once. The dead don\'t care about your first victory. Neither should you.',
  variants: {
    hostile: 'You won. Don\'t let it go to your head.',
    wary: 'So you won once. The dead don\'t care about your first victory. Neither should you.',
    cautious: 'That was good. Not perfect, but good. You\'re learning.',
    friendly: 'You fought well. I saw potential in you. Prove it wasn\'t luck.',
    intimate: 'I was worried. But you came back. Don\'t ever do that to me again.',
  },
  choices: [
    {
      id: 'lya_victory_humble',
      text: 'I got lucky. You said that would happen.',
      effects: { trust: 10, affection: 5 },
    },
    {
      id: 'lya_victory_proud',
      text: 'I knew I could do it.',
      effects: { trust: -3, affection: 0 },
    },
    {
      id: 'lya_victory_thankyou',
      text: '*nod respectfully*',
      effects: { trust: 15, affection: 8, memoryEvent: 'lya_watched_victory' },
    },
  ],
};
