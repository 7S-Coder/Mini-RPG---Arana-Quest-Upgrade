export type NPCName = 'eldran' | 'lya' | 'brak' | 'messenger';

export interface NarrativeMessage {
  npc: NPCName;
  text: string;
  context?: string;
}

// NPC descriptions
export const NPC_DATA: Record<NPCName, { name: string; title: string; }> = {
  eldran: {
    name: 'Eldran',
    title: 'The Watcher',
  },
  lya: {
    name: 'Lya',
    title: 'The Scout',
  },
  brak: {
    name: 'Brak',
    title: 'The Smith',
  },
  messenger: {
    name: 'The Masked Messenger',
    title: 'Enigmatic',
  },
};

// Map narrations removed - use level milestones instead

// Tutorial messages (progressive learning)
export const TUTORIAL_MESSAGES: Record<string, NarrativeMessage> = {
  firstCombatTutorial: {
    npc: 'eldran',
    text: 'Click "Attack" to strike. Every blow tests your reflexes.',
  },
  firstVictoryTutorial: {
    npc: 'eldran',
    text: 'Victory! You have defeated your first enemy. Loot drops automatically.',
  },
  firstLootTutorial: {
    npc: 'eldran',
    text: 'Items drop during combat. Collect them or equip them to grow stronger.',
  },
  firstInventoryTutorial: {
    npc: 'eldran',
    text: 'Ctrl+I opens your inventory. Equip weapons and armor to become more powerful.',
  },
  firstBossTutorial: {
    npc: 'eldran',
    text: 'A boss arrives... far more powerful. Bosses test your strategy, not just your strength.',
  },
  firstLevelUpTutorial: {
    npc: 'eldran',
    text: 'Level up! You can now allocate stat points. Be strategic.',
  },
  mapUnlockTutorial: {
    npc: 'eldran',
    text: 'You have unlocked a new map. Each region hides its secrets and dangers.',
  },
};

// Level milestone narrations - advance the lore at key progression points
export const LEVEL_MILESTONES: Record<number, NarrativeMessage> = {
  5: {
    npc: 'eldran',
    context: 'Eldran te regarde avec intérêt.',
    text: 'The forest protects nothing. It hides what it did not have the courage to bury.',
  },
  10: {
    npc: 'lya',
    context: 'Lya s\'approche de toi, souriante.',
    text: 'Caves are never empty. They breathe slowly, as if hesitating to spit you out again.',
  },
  15: {
    npc: 'brak',
    context: 'Brak pose son marteau et te juge.',
    text: 'This ore has been torn from the earth. Nothing comes out of the bowels without something down below awakening.',
  },
  20: {
    npc: 'eldran',
    context: 'Eldran ouvre un ancien grimoire.',
    text: `The scholars of Old Times had mapped the end of the world.
They failed, but their maps survive.`,
  },
  25: {
    npc: 'messenger',
    context: 'Le Messager masqué se lève lentement.',
    text: `Towers never wait. When they awaken, it is because the world's time has expired.`,
  },
  30: {
    npc: 'lya',
    context: 'Lya contemple l\'horizon avec gravité.',
    text: 'The volcano does not roar. It sighs. As if a worn-out beast hoped you would let it die. Why do you persist?',
  },
  40: {
    npc: 'eldran',
    context: 'Eldran tapote la table avec intention.',
    text: `There are five weapons. Not for killing, but for restraining.
They are not tools. They are jailers.`,
  },
  50: {
    npc: 'brak',
    context: 'Brak secoue la tête, pensif.',
    text: `I saw a child brandishing one of these weapons. Weapons choose.
Children, on the other hand, are merely victims.
She refused to protect him.`,
  },
  60: {
    npc: 'messenger',
    context: 'Le Messager murmure des paroles anciennes.',
    text: `The veil trembles. Mélethor stirs.
He refuses one more cycle.`,
  },
  75: {
    npc: 'lya',
    context: 'Lya te dévisage longuement.',
    text: `The volcano was not awakened.
It was begged. No one should depend on an invocation to exist.`,
  },
  100: {
    npc: 'eldran',
    context: 'Eldran se lève, l\'énergie ancienne rayonnant de lui.',
    text: `Above one hundred levels, there is no more play.
All that remains is cosmic debt. You don't seem to understand what you owe this world.
Maybe that's why it's shaking.`,
  },
};


/**
 * Get narration for a specific level milestone
 */
export function getLevelMilestoneNarration(level: number): NarrativeMessage | null {
  return LEVEL_MILESTONES[level] ?? null;
}

