import lyaDialoguesData from './lyaDialogues.json';
import type { DialogueNode, DialogueChoice, DialogueVariant } from '../relationships/types';

interface TavernDialogueConfig {
  id: string;
  category: string;
  question: string;
  baseGains: Record<string, number>;
  requirements?: {
    minTrust?: number;
    maxTrust?: number;
    minAffection?: number;
  };
  variants: Record<
    string,
    {
      trust?: string;
      affection?: string;
      text: string;
      extraGains?: Record<string, number>;
    }
  >;
}

interface NPCAsksConfig {
  id: string;
  category: string;
  question: string;
  playerChoices: Array<{
    id: string;
    text: string;
    requirements?: Record<string, number>;
    gains: Record<string, number>;
  }>;
}

/**
 * Convert stat range string (e.g., "0-30") to numbers
 */
function parseRange(rangeStr: string): [number, number] {
  const [min, max] = rangeStr.split('-').map(Number);
  return [min, max];
}

/**
 * Generate dialogue variants from config based on stat requirements
 */
function generateVariants(config: TavernDialogueConfig): DialogueVariant[] {
  const variants: DialogueVariant[] = [];

  Object.entries(config.variants).forEach(([variantKey, variantData]) => {
    const requirements: DialogueVariant['requirements'] = {};

    // Parse trust range if exists
    if (variantData.trust) {
      const [minTrust, maxTrust] = parseRange(variantData.trust);
      requirements.minTrust = minTrust;
      requirements.maxTrust = maxTrust;
    }

    // Parse affection requirement if exists
    if (variantData.affection) {
      const [minAffection] = parseRange(variantData.affection);
      requirements.minAffection = minAffection;
    }

    const variant: DialogueVariant = {
      text: variantData.text,
      requirements,
    };

    variants.push(variant);
  });

  return variants;
}

/**
 * Generate dialogue choice with stat gains
 */
function generateDialogueChoice(
  choiceData: NPCAsksConfig['playerChoices'][0],
  dialogueId: string
): DialogueChoice {
  return {
    id: choiceData.id,
    text: choiceData.text,
    effects: {
      trust: choiceData.gains.trust || undefined,
      affection: choiceData.gains.affection || undefined,
      anger: choiceData.gains.anger || undefined,
      respect: choiceData.gains.respect || undefined,
      intimacy: choiceData.gains.intimacy || undefined,
    },
    requirements: choiceData.requirements as any,
    nextDialogueId: undefined,
  };
}

/**
 * Load Lya player-initiated dialogues from JSON
 */
export function loadLyaPlayerAsks(): DialogueNode[] {
  const playerAsks = (lyaDialoguesData.lya?.playerAsks || []) as any[];

  return playerAsks.map((config: any) => ({
    id: config.id,
    npcId: 'lya' as const,
    initiatedBy: 'player' as const,
    variants: generateVariants(config),
    choices: [
      {
        id: 'default',
        text: 'Continue...',
        effects: {
          trust: config.baseGains?.trust,
          affection: config.baseGains?.affection,
          anger: config.baseGains?.anger,
          respect: config.baseGains?.respect,
          intimacy: config.baseGains?.intimacy,
        },
      },
    ],
  }));
}

/**
 * Load Lya NPC-initiated dialogues from JSON
 */
export function loadLyaNpcAsks(): DialogueNode[] {
  const npcAsks = (lyaDialoguesData.lya?.npcAsks || []) as any[];

  return npcAsks.map((config: any) => ({
    id: config.id,
    npcId: 'lya' as const,
    initiatedBy: 'npc' as const,
    variants: [
      {
        text: config.question,
        requirements: {},
      },
    ],
    choices: (config.playerChoices || []).map((choice: any) =>
      generateDialogueChoice(choice, config.id)
    ),
  }));
}

/**
 * Load all Lya tavern dialogues (both player and NPC asks)
 */
export function loadAllLyaTavernDialogues(): DialogueNode[] {
  return [...loadLyaPlayerAsks(), ...loadLyaNpcAsks()];
}
