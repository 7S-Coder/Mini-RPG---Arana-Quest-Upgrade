/**
 * Mélethor - The Awakening Threat
 * Ancient entity imprisoned, seeking escape/dominion
 * Personality: Tempting, seductive, dangerous, inevitable
 * 
 * NARRATIVE STRUCTURE:
 * This is the emotional and ideological endgame.
 * 
 * It's not a sudden invasion. It's a slow seduction.
 * Like Dark Souls + Berserk + Dofus tragedy.
 * 
 * By Level 50, you're not weak. You're TIRED.
 * That's when Mélethor has leverage.
 * He doesn't threaten. He ASKS.
 * 
 * "Who will pay you for your suffering?"
 * "What has this world done for you?"
 * "You deserve more than this."
 * 
 * The Parallel:
 *   Mélethor = cosmic avarice (wants everything)
 *   Brak = loss (lost his craft to survival)
 *   Lya = tenderness (protecting you quietly)
 *   Eldran = knowledge (witnessing without interfering)
 *   You = decision (which version of yourself?)
 */

import type { NPCRelation } from './types';

export const MELETHOR_INITIAL: NPCRelation = {
  npcId: 'messenger' as any,  // Hack: use messenger type, but track separately
  // Note: Mélethor is not a traditional "relation" - it's a THREAT level
  trust: 0,           // Absolute zero - you don't know him
  affection: 0,       // Non applicable
  anger: 0,           // Replaced by "temptation"
  intimacy: 0,        // Non applicable - but seduction is intimate
  respect: 0,         // You fear it, not respect it
  lastInteraction: 0,
  conversationsHad: [],
  choicesMade: {},
  memoryEvents: [],
};

/**
 * Mélethor-specific stats (separate from traditional relations)
 */
export interface MelethorThreat {
  // Emotional corruption
  whisperIntensity: number;    // 0-100: How loud/constant the voice
  temptation: number;          // 0-100: How appealing the offers
  corruption: number;          // 0-100: How much you're tainted
  doubt: number;               // 0-100: How much you doubt your allies
  awareness: number;           // 0-100: How aware you are of the threat
  
  // Counter-force
  resistance: number;          // 0-100: Your ability to say no (tied to Lya/Eldran)
  resolve: number;             // 0-100: Your will to reject temptation
  
  // Timeline
  firstContact: number;        // Level when first whisper (always 50)
  contactsAttempted: number;   // How many times has it tried
  offersAccepted: number;      // How many temptations accepted
  choiceMade: null | 'pact' | 'resistance';  // The Level 70 choice
  
  // Memory & dialogue
  memoryEvents: string[];
  whispersSeen: string[];      // Which whispers has player seen
}

/**
 * MÉLETHOR'S NARRATIVE ARC
 * 
 * ============================================================
 * LEVEL 50 — L'INFILTRATION COMMENCE (The Infiltration)
 * ============================================================
 * 
 * whisperIntensity: 0 → 15
 * temptation: 0
 * doubt: 0
 * 
 * First contact. No choice yet.
 * Just... a voice.
 * A question.
 * 
 * The player doesn't know what this is.
 * They might think it's their own thought.
 * 
 * Sample: "You have bled for this world. Tell me... what has it given you in return?"
 * 
 * Lya notices nothing yet.
 * Eldran's warnings become suddenly relevant.
 * Brak is too focused on craft.
 * Messenger says nothing (he KNOWS).
 * 
 * ============================================================
 * LEVEL 55 — TENTATION (The First Temptation)
 * ============================================================
 * 
 * whisperIntensity: 15 → 30
 * temptation: 0 → 15
 * doubt: 0 → 5
 * 
 * Mélethor offers a small advantage.
 * Not power. Just... a small help.
 * A boost to loot. A slight edge in combat.
 * 
 * Sample: "I can help you. Just a small gift. You've earned it."
 * 
 * Lya NOTICES.
 * "You're different. Something changed."
 * 
 * This creates dialogue branch where she asks what's wrong.
 * The player can:
 *   a) Lie ("I'm fine")
 *   b) Confide ("Something's... calling to me")
 *   c) Deflect ("Just tired")
 * 
 * Each affects trust and affection.
 * If affection is high, she doesn't push.
 * If low, she withdraws.
 * 
 * ============================================================
 * LEVEL 60 — CRACKS (Emotional Fractures)
 * ============================================================
 * 
 * whisperIntensity: 30 → 45
 * temptation: 15 → 30
 * doubt: 5 → 20
 * resolve: starts mattering
 * 
 * Mélethor speaks more directly now.
 * Shows you things. Offers explanations.
 * "This world is finite. I am infinite. Join the infinite."
 * 
 * GAMEPLAY: Resolve stat becomes visible on UI
 * (tied to willpower/inner strength)
 * 
 * NARRATIVE:
 * - Lya presses harder for answers
 * - Eldran's dialogue shifts (he's preparing you)
 * - Brak is concerned but says nothing
 * - Romance tension if high affection
 * 
 * Critical dialogue option appears:
 * "I hear something. Someone. Offering me..."
 * 
 * This can strengthen Lya bond (if she supports you)
 * or weaken it (if she judges you).
 * 
 * ============================================================
 * LEVEL 65 — IDÉOLOGIE (The Worldview Collision)
 * ============================================================
 * 
 * whisperIntensity: 45 → 60
 * temptation: 30 → 50
 * doubt: 20 → 40
 * 
 * Now Mélethor EXPLAINS himself.
 * He's not evil, he's HONEST.
 * 
 * "This world runs on suffering. I am just the truth it hides."
 * 
 * Simultaneously:
 * ELDRAN explains his version:
 * "The cycle must end. But not through surrender."
 * 
 * LYA takes position:
 * "I don't care about cosmic truth. I care about you."
 * 
 * BRAK is quiet (too late for him to save the world).
 * 
 * MESSENGER says almost nothing.
 * Just watches. Waiting.
 * 
 * The player sees TWO TRUTHS:
 * - Mélethor's cosmic perspective (seductive)
 * - Eldran's cosmic perspective (duty-bound)
 * - Lya's human perspective (love)
 * 
 * This is not a choice yet.
 * This is UNDERSTANDING.
 * 
 * ============================================================
 * LEVEL 70 — L'HEURE DU CHOIX (The Hour of Choice)
 * ============================================================
 * 
 * whisperIntensity: 60 → 100
 * temptation: 50 → 100
 * doubt: 40 → 70
 * resolve: CRITICAL
 * 
 * **EXPLICIT CHOICE:**
 * 
 * This is the pivot point.
 * No return after this.
 * 
 * Option A: PACTISER (Make the Pact)
 *   - Accept Mélethor's power
 *   - corruption: 100
 *   - resistance: 0
 *   - All stats +20
 *   - Lya romance CLOSES (she can't follow you there)
 *   - Eldran becomes enemy
 *   - Brak despairs
 *   - Messenger smiles (he knew)
 *   - Level 90 becomes possession fight
 * 
 * Option B: RÉSISTER (Resist)
 *   - corruption: 0
 *   - resistance: 100
 *   - Mélethor becomes FURIOUS
 *   - Lya commits fully (+ affection)
 *   - Eldran becomes visible ally
 *   - Brak forges the counter-weapon
 *   - Level 90 becomes war
 * 
 * No middle ground.
 * No "maybe later."
 * 
 * Sample dialogue (if pact):
 *   Mélethor: "Welcome home."
 *   Lya: *steps back* "No. Not like this."
 *   Eldran: "Then you have chosen."
 * 
 * Sample dialogue (if resist):
 *   Mélethor: "FOOL. I will remake you."
 *   Lya: *grabs your hand* "We'll face it together."
 *   Eldran: "Now we fight."
 */

export const MELETHOR_PERSONALITY = {
  // Core traits
  ancient: true,        // Existed before everything
  seductive: true,      // Not threatening, asking
  honest: true,         // Says uncomfortable truths
  tempting: true,       // Offers real things
  inevitable: true,     // Feels like destiny
  patient: true,        // Doesn't rush (levels 50-70 is slow build)

  // Speech patterns
  speaks_to_exhaustion: true,   // Targets your fatigue
  asks_questions: true,         // "Don't you want...?"
  reveals_truths: true,         // Cosmically honest
  never_threatens: true,        // Just offers alternatives
  respects_resolve: true,       // Won't force if you're strong
};

/**
 * Memory events for Mélethor arc
 */
export const MELETHOR_MEMORY_EVENTS = {
  'melethor_first_whisper': 'Level 50: First voice heard',
  'melethor_lya_noticed': 'Level 55: Lya noticed you changed',
  'melethor_confided_to_lya': 'Level 60: Told Lya about the voice',
  'melethor_confided_to_eldran': 'Level 65: Asked Eldran about the voice',
  'melethor_understood_choice': 'Level 70: Understood the nature of choice',
  'melethor_pact_made': 'Level 70: CHOSE TO PACT - point of no return',
  'melethor_pact_rejected': 'Level 70: CHOSE TO RESIST - point of no return',
  'melethor_final_confrontation': 'Level 90: Final battle/possession',
};

/**
 * WHISPER PROGRESSION
 * 
 * Each whisper is NOT a choice.
 * It's just... voice in your head.
 * 
 * The voice gets LOUDER.
 * The arguments get BETTER.
 * The temptation gets HARDER.
 * 
 * By level 70, you can't ignore it anymore.
 * You must CHOOSE.
 */
export const MELETHOR_WHISPERS = {
  LEVEL_50: {
    title: 'The First Voice',
    intensity: 'whisper',
    text: `You have bled for this world, haven't you?
Spike after spike. Blow after blow.
Tell me... what has it given you in return?`,
    effect: { whisperIntensity: 15, doubt: 5 },
    npcReaction: {
      lya: null,      // She doesn't notice yet
      eldran: 'speaks cryptically about walls breaking',
      brak: null,
      messenger: 'watches',
    },
  },
  LEVEL_55: {
    title: 'The Gift',
    intensity: 'present',
    text: `I can help you. Not with false promises.
Just... a small gift. You've earned it.
Feel how good it is to have aid?`,
    effect: { whisperIntensity: 30, temptation: 15 },
    gameplayBonus: 'small loot/essence boost (noticeable)',
    npcReaction: {
      lya: 'asks "what changed? You seem... different"',
      eldran: 'warns more explicitly',
      brak: null,
      messenger: 'slight nod',
    },
  },
  LEVEL_60: {
    title: 'The Doubt',
    intensity: 'conversation',
    text: `Do you truly believe they understand you?
Lya hides behind pragmatism.
Eldran watches but never acts.
Brak has lost his own fight.
Only I see your potential.`,
    effect: { whisperIntensity: 45, temptation: 30, doubt: 20 },
    npcReaction: {
      lya: 'presses if affection high, withdraws if low',
      eldran: 'speaks of sacrifice and duty',
      brak: 'expresses concern silently',
      messenger: 'first real eye contact',
    },
  },
  LEVEL_65: {
    title: 'The Truth',
    intensity: 'explanation',
    text: `This world runs on suffering.
Not cruelty. Not injustice.
Just... the nature of existence here.
I don't judge it. I merely offer an exit.`,
    effect: { whisperIntensity: 60, temptation: 50, doubt: 40 },
    triggersDialogues: [
      'eldran_cosmic_perspective',
      'lya_personal_commitment',
      'brak_loss_acceptance',
    ],
    npcReaction: {
      lya: 'says "I don\'t care about cosmic truth. I care about you."',
      eldran: 'reveals more of the lore (volcan, weapons, cycle)',
      brak: 'silent',
      messenger: 'nearly speaks',
    },
  },
  LEVEL_70: {
    title: 'The Choice',
    intensity: 'inevitable',
    text: `We have talked enough.
At level 90, you will face me.
You can come willingly.
Or you can come broken.
Choose.`,
    effect: { choiceRequired: true },
    choiceA: {
      text: 'Accept the pact',
      consequences: {
        corruption: 100,
        resistance: 0,
        lyaClosesRomance: true,
        eldranBecomes: 'enemy',
        brakDesperately: 'forges anyway',
        stats: 'all +20',
      },
    },
    choiceB: {
      text: 'Reject and resist',
      consequences: {
        corruption: 0,
        resistance: 100,
        lyaCommits: 'fully + affection',
        eldranAllies: 'openly',
        brakForges: 'counter-weapon',
        melethorBecomes: 'furious',
      },
    },
  },
};

/**
 * Dialogue offers (temptations) - subtle and appealing
 */
export const MELETHOR_OFFERS = {
  UNDERSTANDING: {
    id: 'offer_truth',
    title: 'Understanding',
    text: 'Know why the world breaks. Know what you truly are.',
    subtextSeductive: 'Knowledge as power. Comfort in understanding.',
    effects: { awareness: 30, doubt: 10 },
    consequence: 'You see the world differently now.',
  },
  ACKNOWLEDGMENT: {
    id: 'offer_seen',
    title: 'To Be Seen',
    text: 'You suffer alone. I see your suffering. That matters.',
    subtextSeductive: 'Validation. Recognition. Being understood.',
    effects: { affection: 20, temptation: 15 },
    consequence: 'You feel less lonely. But also more bound.',
  },
  POWER: {
    id: 'offer_power',
    title: 'Strength',
    text: 'You fight without rest. Let me amplify what you are.',
    subtextSeductive: 'Efficiency. Less suffering through more power.',
    effects: { corrupted: true, power: 20, resistancePenalty: 5 },
    consequence: 'You feel invincible. And farther from Lya.',
  },
  ESCAPE: {
    id: 'offer_escape',
    title: 'Release',
    text: 'End this. Not death. Just... acceptance.',
    subtextSeductive: 'Exhaustion speaks. Rest promised. Peace promised.',
    effects: { corrupted: true, fatigue: 'gone', commitment: 'lost' },
    consequence: 'You stop trying. Which feels good. Too good.',
  },
};
