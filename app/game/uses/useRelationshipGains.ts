/**
 * Lya Relationship System Implementation
 * Handles all relationship gain formulas and stat interactions
 */

import type { NPCId } from '../templates/relationships/types';

export type StatType = 'trust' | 'affection' | 'anger' | 'respect' | 'intimacy';

export interface StatGain {
  trust?: number;
  affection?: number;
  anger?: number;
  respect?: number;
  intimacy?: number;
}

export interface RelationshipContext {
  npcId: NPCId;
  currentStats: {
    trust: number;
    affection: number;
    anger: number;
    respect: number;
    intimacy: number;
  };
  combatStats?: {
    consecutiveWins: number;
    consecutiveLosses: number;
    totalVictories: number;
    totalDefeats: number;
  };
  playerLevel: number;
  lastInteraction: number;
  memoryEvents: string[];
}

/**
 * CONFIANCE (TRUST) GAIN FORMULAS
 */
export const TrustGains = {
  // Combat related
  consecutiveWins15: 3,
  consecutiveLosses50: -10,
  firstVictoryAfterStruggle: 5,

  // Dungeon related
  dungeonCompletion: 5,
  dungeonCompletionHighHP: 7,
  dungeonFailure: -3,

  // Dialogue related
  defaultDialogueChoice: 2,
  missedYouResponse: 3,
  askingForAdvice: 2,
  decliningHelp: -3,
  vulnerableResponse: 4,

  // Time-based
  notSpeakingOverDay: -2,
  dailyInteraction: 1,
};

/**
 * AFFECTION GAIN FORMULAS (Gated by Trust ≥20 + Respect ≥20)
 */
export const AffectionGains = {
  // Dialogue choices
  emotionalVulnerability: 3,
  meaningFullResponse: 4,
  romanticDialogueOption: 5,
  memoryEventBonding: 3,
  dismissiveResponse: -2,
  flirtingResponse: 3,

  // Modifiers
  angerOverFiftyBlocker: 0, // Blocked entirely
  angerOver25Reduction: -0.3, // -30% all gains
  respectUnderTwentyReduction: -0.5, // -50% all gains
};

/**
 * ANGER GENERATION & REDUCTION
 */
export const AngerChanges = {
  // Generation
  coldRudeResponse: 3,
  rejectingHelp: 2,
  choosingOtherNPC: 4,
  flirtingWithOthers: 5,
  dismissive: 2,

  // Time-based
  notSpeakingOverDay: 2,
  notSpeakingOverThreeDays: 4,
  notSpeakingOverWeek: 6,

  // Reduction
  apologeticDialogue: -5,
  romanticGesture: -3,
  successfulCombatAndTalk: -2,
  giftOrFavor: -3,
  timePasses1Day: -1,
};

/**
 * RESPECT GAIN FORMULAS
 */
export const RespectGains = {
  // Combat related
  consecutiveWins15: 3,
  consecutiveLosses50: -10,
  victoryAgainstElite: 5,
  bossDefeated: 7,

  // Dungeon related
  dungeonCompletion: 5,
  dungeonPerfect: 8,
  dungeonFailure: -3,

  // Dialogue related
  showingConfidence: 2,
  strategicThinkingQuestion: 3,
  admittingWeaknessHonestly: 2,
  boastfulArrogant: -3,

  // Level thresholds
  levelFifteen: 3,
  levelThirty: 5,
  levelFifty: 7,
  levelSeventyFive: 10,
};

/**
 * INTIMACY GAIN FORMULAS (Gated by Affection ≥60 + Trust ≥70)
 */
export const IntimacyGains = {
  // Romantic dialogue
  romanticDialogueChoice: 4,
  vulnerableConfession: 3,
  iLoveYouEquivalent: 5,
  physicalClosenessDialogue: 3,
  memoryEventRomantic: 4,

  // Special conditions
  maxPerDay: 5,
  blockedIfAngerOver: 30,
};

/**
 * Calculate stat modifiers based on current stat levels
 */
export function calculateStatModifiers(context: RelationshipContext) {
  const { anger, trust, affection, respect, intimacy } = context.currentStats;

  const modifiers = {
    baseMultiplier: 1,
    affectionBlocked: false,
    intimacyBlocked: false,
    dialogueColdOverride: false,
  };

  // Anger modifiers
  if (anger > 75) {
    modifiers.baseMultiplier = 0; // No gains possible
    modifiers.affectionBlocked = true;
  } else if (anger > 50) {
    modifiers.baseMultiplier = 0.5; // -50% all gains
    modifiers.affectionBlocked = true;
  } else if (anger > 25) {
    modifiers.baseMultiplier = 0.7; // -30% all gains
  }

  // Affection gate check
  if (trust < 20 || respect < 20 || anger > 50) {
    modifiers.affectionBlocked = true;
  }

  // Intimacy gate check
  if (affection < 60 || trust < 70 || anger > 30 || respect < 50) {
    modifiers.intimacyBlocked = true;
  }

  // Cold dialogue override (emotional state over logic)
  if (anger > 50) {
    modifiers.dialogueColdOverride = true;
  }

  return modifiers;
}

/**
 * Apply stat gains with modifiers
 */
export function applyStatGains(
  gains: StatGain,
  context: RelationshipContext
): StatGain {
  const modifiers = calculateStatModifiers(context);

  // Create copy to avoid mutation
  const appliedGains = { ...gains };

  // Apply anger modifiers to gains
  if (gains.trust) appliedGains.trust = Math.round(gains.trust * modifiers.baseMultiplier);
  if (gains.respect) appliedGains.respect = Math.round(gains.respect * modifiers.baseMultiplier);

  // Block affection if conditions not met
  if (modifiers.affectionBlocked) {
    appliedGains.affection = 0;
  } else if (gains.affection && modifiers.baseMultiplier < 1) {
    appliedGains.affection = Math.round(gains.affection * modifiers.baseMultiplier);
  }

  // Block intimacy if conditions not met
  if (modifiers.intimacyBlocked) {
    appliedGains.intimacy = 0;
  }

  return appliedGains;
}

/**
 * Synergy bonuses
 */
export function applySynergyBonuses(
  gains: StatGain,
  context: RelationshipContext
): StatGain {
  const { trust, affection, anger, respect, intimacy } = context.currentStats;
  const appliedGains = { ...gains };

  // Synergy 1: High Trust + Affection + Low Anger
  if (trust >= 70 && affection >= 60 && anger <= 20) {
    if (appliedGains.affection) appliedGains.affection += 1;
  }

  // Synergy 2: Very High Trust + Respect
  if (trust >= 80 && respect >= 80) {
    if (appliedGains.trust) appliedGains.trust += 1;
    if (appliedGains.respect) appliedGains.respect += 1;
  }

  // Synergy 3: High Affection + Intimacy (romance unlock bonus)
  if (affection >= 80 && intimacy >= 50) {
    if (appliedGains.intimacy) appliedGains.intimacy += 1;
  }

  return appliedGains;
}

/**
 * Get dialogue-specific stat gains for Lya
 */
export function getLyaDialogueGains(dialogueId: string): StatGain | null {
  const gainMap: Record<string, StatGain> = {
    // Combat advice dialogues
    'lya_answer_combat__mechanical': { trust: 2 },
    'lya_answer_combat__scars': { trust: 3, affection: 1 },
    'lya_answer_combat__fire': { trust: 3, affection: 2 },
    'lya_answer_combat__spirit': { trust: 4, affection: 3, intimacy: 2 },

    // Past dialogues
    'lya_answer_past__concerned': { trust: -2, anger: 2 },
    'lya_answer_past__reckless': { trust: 3, affection: 1 },
    'lya_answer_past__darkness': { trust: 4, affection: 3, intimacy: 1 },
    'lya_answer_past__shadows': { trust: 5, affection: 4, intimacy: 3 },

    // Feelings dialogues
    'lya_answer_feelings__useful': { trust: 1, respect: 1 },
    'lya_answer_feelings__potential': { trust: 2, affection: 2, respect: 2 },
    'lya_answer_feelings__care': { trust: 3, affection: 4, intimacy: 1 },
    'lya_answer_feelings__love': { trust: 4, affection: 5, intimacy: 4 },

    // Training dialogues
    'lya_offers_training__handle': { trust: 1, respect: 2 },
    'lya_offers_training__hunger': { trust: 3, affection: 2, respect: 3 },
    'lya_offers_training__finest': { trust: 4, affection: 3, respect: 4 },

    // Support dialogues
    'lya_supports_you__doubt': { trust: 2, respect: 1 },
    'lya_supports_you__spirit': { trust: 3, affection: 4, intimacy: 1 },
    'lya_supports_you__worthy': { trust: 5, affection: 5, intimacy: 5 },

    // Story dialogues
    'lya_shares_story__lost': { trust: 2, affection: 2 },
    'lya_shares_story__human': { trust: 4, affection: 4, intimacy: 2 },
    'lya_shares_story__saved': { trust: 5, affection: 5, intimacy: 4 },
  };

  return gainMap[dialogueId] || null;
}

/**
 * Apply combat-related stat changes
 */
export function applyCombatGains(
  context: RelationshipContext,
  result: 'victory' | 'defeat'
): StatGain {
  const gains: StatGain = {};
  const combatStats = context.combatStats;

  if (!combatStats) return gains;

  if (result === 'victory') {
    if (combatStats.consecutiveWins === 15) {
      gains.trust = TrustGains.consecutiveWins15;
      gains.respect = RespectGains.consecutiveWins15;
    }
    if (combatStats.totalVictories % 10 === 0) {
      gains.respect = (gains.respect || 0) + 1;
    }
  } else if (result === 'defeat') {
    if (combatStats.consecutiveLosses === 50) {
      gains.trust = TrustGains.consecutiveLosses50;
      gains.respect = RespectGains.consecutiveLosses50;
    }
  }

  return gains;
}

/**
 * Apply dungeon completion gains
 */
export function applyDungeonGains(
  context: RelationshipContext,
  result: 'success' | 'failure',
  healthPercentage?: number
): StatGain {
  const gains: StatGain = {};

  if (result === 'success') {
    gains.trust = TrustGains.dungeonCompletion;
    gains.respect = RespectGains.dungeonCompletion;

    if (healthPercentage && healthPercentage > 0.75) {
      gains.trust = TrustGains.dungeonCompletionHighHP;
      gains.respect = RespectGains.dungeonPerfect;
    }
  } else {
    gains.trust = TrustGains.dungeonFailure;
    gains.respect = RespectGains.dungeonFailure;
  }

  return gains;
}

/**
 * Apply level milestone gains
 */
export function applyLevelMilestoneGains(level: number): StatGain {
  const gains: StatGain = {};

  switch (level) {
    case 15:
      gains.respect = RespectGains.levelFifteen;
      break;
    case 30:
      gains.respect = RespectGains.levelThirty;
      break;
    case 50:
      gains.respect = RespectGains.levelFifty;
      break;
    case 75:
      gains.respect = RespectGains.levelSeventyFive;
      break;
  }

  return gains;
}

/**
 * Apply time-based relationship changes
 * Call once per day
 */
export function applyDailyRelationshipChanges(
  context: RelationshipContext,
  daysSinceLastInteraction: number
): StatGain {
  const gains: StatGain = {};

  // Trust penalty for not speaking
  if (daysSinceLastInteraction > 1) {
    gains.trust = TrustGains.notSpeakingOverDay;
  } else {
    gains.trust = TrustGains.dailyInteraction;
  }

  // Anger accumulation for not speaking
  if (daysSinceLastInteraction > 7) {
    gains.anger = AngerChanges.notSpeakingOverWeek;
  } else if (daysSinceLastInteraction > 3) {
    gains.anger = AngerChanges.notSpeakingOverThreeDays;
  } else if (daysSinceLastInteraction > 1) {
    gains.anger = AngerChanges.notSpeakingOverDay;
  } else {
    // Natural anger reduction over time
    gains.anger = AngerChanges.timePasses1Day;
  }

  return gains;
}
