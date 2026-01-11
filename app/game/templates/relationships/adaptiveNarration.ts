/**
 * Adaptive Narration System
 * Tutorial messages and milestone narrations with relationship branching
 * 
 * Pattern:
 *   Instead of single text, use variants[] with requirements
 *   selectDialogueVariant() picks the right one based on NPCRelation
 */

import type { DialogueNode } from './types';

/**
 * TUTORIAL MESSAGES - Lya as mentor
 * Each tutorial branching based on trust level
 */

export const TUTORIAL_FIRST_COMBAT: DialogueNode = {
  id: 'tutorial_first_combat',
  npcId: 'lya',
  variants: [
    {
      text: 'You swing. That\'s the first lesson. Everything else, you\'ll learn bleeding.',
      contextAction: '*Lya watches with cold assessment*',
      requirements: { minTrust: 0, maxTrust: 20 },
    },
    {
      text: 'You swing. Every blow teaches something. Pay attention.',
      contextAction: '*Lya nods slightly*',
      requirements: { minTrust: 40, maxTrust: 60 },
    },
    {
      text: 'Attack. I believe you have the instinct for this.',
      contextAction: '*Lya\'s eyes hold unexpected warmth*',
      requirements: { minTrust: 80 },
    },
  ],
};

export const TUTORIAL_FIRST_VICTORY: DialogueNode = {
  id: 'tutorial_first_victory',
  npcId: 'lya',
  variants: [
    {
      text: 'So you won once. The dead don\'t care about your first victory. Neither should you.',
      requirements: { minTrust: 0, maxTrust: 25 },
    },
    {
      text: 'You won. That\'s acceptable. Do it again without luck next time.',
      requirements: { minTrust: 25, maxTrust: 50 },
    },
    {
      text: 'You fought well. I saw it. That matters.',
      contextAction: '*slight smile*',
      requirements: { minTrust: 50, maxTrust: 75 },
    },
    {
      text: 'I knew you could. I was watching.',
      contextAction: '*Lya\'s gaze is tender*',
      requirements: { minTrust: 75, minAffection: 40 },
    },
  ],
  choices: [
    {
      id: 'victory_humble',
      text: 'I got lucky.',
      effects: { trust: 10, affection: 5 },
    },
    {
      id: 'victory_proud',
      text: 'I was better. Obviously.',
      effects: { trust: -5, anger: 5 },
    },
    {
      id: 'victory_grateful',
      text: 'Your lessons helped.',
      effects: { trust: 15, affection: 10, memoryEvent: 'lya_first_victory' },
    },
  ],
};

export const TUTORIAL_FIRST_LOOT: DialogueNode = {
  id: 'tutorial_first_loot',
  npcId: 'lya',
  variants: [
    {
      text: 'The earth gives what it takes from corpses. Use it or die poorer than you lived.',
      requirements: { minTrust: 0, maxTrust: 30 },
    },
    {
      text: 'Dead things provide for the living. Don\'t waste what they offer.',
      requirements: { minTrust: 30, maxTrust: 60 },
    },
    {
      text: 'See? The world provides if you\'re strong enough to take it.',
      contextAction: '*Lya gestures at the loot*',
      requirements: { minTrust: 60 },
    },
  ],
};

export const TUTORIAL_FIRST_INVENTORY: DialogueNode = {
  id: 'tutorial_first_inventory',
  npcId: 'lya',
  variants: [
    {
      text: 'You carry more than just your body now. Equipment shapes survival. Choose carefully.',
      requirements: { minTrust: 0, maxTrust: 30 },
    },
    {
      text: 'What you wear matters. Not for pride. For living another day.',
      requirements: { minTrust: 30, maxTrust: 60 },
    },
    {
      text: 'You\'re becoming strategic about your gear. Good. That\'s wisdom.',
      contextAction: '*approves*',
      requirements: { minTrust: 60 },
    },
  ],
};

export const TUTORIAL_FIRST_BOSS: DialogueNode = {
  id: 'tutorial_first_boss',
  npcId: 'lya',
  variants: [
    {
      text: 'Some things don\'t just fight. They *decide* how you will die. Respect that difference.',
      requirements: { minTrust: 0, maxTrust: 30 },
    },
    {
      text: 'That\'s not an enemy. That\'s a force. Adapt or perish.',
      requirements: { minTrust: 30, maxTrust: 60 },
    },
    {
      text: 'You\'ve earned this trial. Show me what you\'ve learned.',
      contextAction: '*Lya\'s expression is serious but trusting*',
      requirements: { minTrust: 60 },
    },
  ],
};

export const TUTORIAL_FIRST_LEVEL_UP: DialogueNode = {
  id: 'tutorial_first_level_up',
  npcId: 'lya',
  variants: [
    {
      text: 'You grow. Strength is not given—it is *chosen*. How you shape yourself matters.',
      requirements: { minTrust: 0, maxTrust: 30 },
    },
    {
      text: 'You\'re stronger. What you do with it is your choice.',
      requirements: { minTrust: 30, maxTrust: 60 },
    },
    {
      text: 'I see you becoming who you were meant to be. I\'m proud.',
      contextAction: '*genuine warmth in her voice*',
      requirements: { minTrust: 60, minAffection: 40 },
    },
  ],
};

export const TUTORIAL_MAP_UNLOCK: DialogueNode = {
  id: 'tutorial_map_unlock',
  npcId: 'lya',
  variants: [
    {
      text: 'New paths open. The world is vast because vast things live in it. Tread carefully.',
      requirements: { minTrust: 0, maxTrust: 30 },
    },
    {
      text: 'You\'re ready to see more. But be prepared—more choices mean more dangers.',
      requirements: { minTrust: 30, maxTrust: 60 },
    },
    {
      text: 'Go. I\'ll be here if you need guidance.',
      contextAction: '*nods with trust*',
      requirements: { minTrust: 60 },
    },
  ],
};

/**
 * LEVEL MILESTONES - Branching dialogue for key story moments
 * 
 * Example: Level 50 (Mélethor first contact)
 */

export const MILESTONE_LEVEL_50: DialogueNode = {
  id: 'milestone_level_50',
  npcId: 'lya',
  variants: [
    {
      text: 'You\'ve come far. Too far maybe. I feel something... changing.',
      contextAction: '*Lya looks troubled*',
      requirements: { minTrust: 40, minAffection: 0 },
    },
    {
      text: 'You\'re stronger than I thought possible. But I feel danger now. Something watches us.',
      contextAction: '*Lya\'s protective instinct shows*',
      requirements: { minTrust: 60, minAffection: 30 },
    },
    {
      text: 'You\'ve reached a point where choices matter in ways you can\'t imagine yet. Be careful.',
      contextAction: '*Lya takes your hand gently*',
      requirements: { minTrust: 80, minAffection: 60 },
    },
  ],
};

/**
 * LEVEL 65 - Lya responds to Mélethor temptation
 */
export const MILESTONE_LEVEL_65_LYA_RESPONSE: DialogueNode = {
  id: 'milestone_level_65_lya',
  npcId: 'lya',
  variants: [
    {
      text: 'I don\'t understand what you\'re hearing. But I know it\'s taking you from me.',
      contextAction: '*distant and hurt*',
      requirements: { minTrust: 30, minAffection: 10, hasMemoryEvent: 'melethor_lya_noticed' },
    },
    {
      text: 'I know what\'s calling to you. And I know you\'re stronger than it. Trust yourself. Trust me.',
      contextAction: '*reaches for you*',
      requirements: { minTrust: 60, minAffection: 50, hasMemoryEvent: 'melethor_confided_to_lya' },
    },
    {
      text: 'What he offers is power. What I offer is different. Choose what truly matters.',
      contextAction: '*Lya\'s eyes are vulnerable but resolute*',
      requirements: { minTrust: 80, minAffection: 70, hasMemoryEvent: 'melethor_confided_to_lya' },
    },
  ],
  choices: [
    {
      id: 'choice_lya_65_distance',
      text: 'You wouldn\'t understand. No one does.',
      effects: { trust: -10, affection: -15, anger: 5, memoryEvent: 'lya_misunderstood' },
    },
    {
      id: 'choice_lya_65_confide',
      text: 'I\'m scared. And I don\'t know what to choose.',
      effects: { trust: 15, affection: 20, memoryEvent: 'lya_supported_fear' },
    },
    {
      id: 'choice_lya_65_commit',
      text: 'You matter to me. More than any power.',
      effects: { trust: 25, affection: 30, intimacy: 10, memoryEvent: 'lya_chose_her' },
    },
  ],
};

/**
 * Helper function: Get all dialogue nodes
 * Useful for initializing dialogue system
 */
export function getAllDialogueNodes(): DialogueNode[] {
  return [
    TUTORIAL_FIRST_COMBAT,
    TUTORIAL_FIRST_VICTORY,
    TUTORIAL_FIRST_LOOT,
    TUTORIAL_FIRST_INVENTORY,
    TUTORIAL_FIRST_BOSS,
    TUTORIAL_FIRST_LEVEL_UP,
    TUTORIAL_MAP_UNLOCK,
    MILESTONE_LEVEL_50,
    MILESTONE_LEVEL_65_LYA_RESPONSE,
  ];
}
