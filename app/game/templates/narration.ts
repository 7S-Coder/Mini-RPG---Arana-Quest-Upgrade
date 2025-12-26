export type NPCName = 'eldran' | 'lya' | 'brak' | 'messenger';

export interface NarrativeMessage {
  npc: NPCName;
  text: string;
  emoji: string;
}

export interface MapNarration {
  mapId: number;
  mapName: string;
  npcIntro: NPCName[];
  events: {
    arrival?: NarrativeMessage;
    firstCombat?: NarrativeMessage;
    afterNCombats?: {
      count: number;
      message: NarrativeMessage;
    }[];
    bossBefore?: {
      bossName: string;
      message: NarrativeMessage;
    };
    bossVictory?: {
      bossName: string;
      message: NarrativeMessage;
    };
    playerDeath?: NarrativeMessage;
    dungeonEntry?: NarrativeMessage;
  };
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

export const NARRATIONS: MapNarration[] = [
  // MAP 0 - Initiation
  {
    mapId: 0,
    mapName: 'Arena',
    npcIntro: ['eldran'],
    events: {
      arrival: {
        npc: 'eldran',
        emoji: '🎭',
        text: "The arena is not a place. It is a trial.",
      },
      firstCombat: {
        npc: 'eldran',
        emoji: '⚔️',
        text: 'Watch carefully. Each strike tells a story.',
      },
      playerDeath: {
        npc: 'eldran',
        emoji: '✨',
        text: "You haven't failed. You have learned.",
      },
    },
  },

  // MAP 1 - Forest
  {
    mapId: 1,
    mapName: 'Forest',
    npcIntro: ['eldran', 'lya'],
    events: {
      arrival: {
        npc: 'lya',
        emoji: '🌲',
        text: 'The trees are watching. Do not provoke them.',
      },
      afterNCombats: [
        {
          count: 10,
          message: {
            npc: 'eldran',
            emoji: '🧘',
            text: 'The forest tests your patience, not your strength.',
          },
        },
      ],
      bossBefore: {
        bossName: 'Queen Bee',
        message: {
          npc: 'lya',
          emoji: '👑',
          text: 'She protects the hive... like a kingdom.',
        },
      },
      bossVictory: {
        bossName: 'Queen Bee',
        message: {
          npc: 'eldran',
          emoji: '🌙',
          text: 'The queen has fallen. But the hive endures.',
        },
      },
      dungeonEntry: {
        npc: 'lya',
        emoji: '🌳',
        text: 'Some trees bear no fruit. They judge.',
      },
    },
  },

  // MAP 2 - Caves
  {
    mapId: 2,
    mapName: 'Caves',
    npcIntro: ['brak'],
    events: {
      arrival: {
        npc: 'brak',
        emoji: '⛏️',
        text: 'Here, light deceives. Trust your steel.',
      },
      afterNCombats: [
        {
          count: 5,
          message: {
            npc: 'brak',
            emoji: '🔨',
            text: 'Three identical objects... or nothing solid.',
          },
        },
      ],
      bossBefore: {
        bossName: 'Rabid Hyenas',
        message: {
          npc: 'brak',
          emoji: '🐕',
          text: "They don't attack to eat. They attack to survive.",
        },
      },
      bossVictory: {
        bossName: 'Rabid Hyenas',
        message: {
          npc: 'eldran',
          emoji: '🔇',
          text: 'The pack is broken. Silence returns.',
        },
      },
    },
  },

  // MAP 3 - Ruins
  {
    mapId: 3,
    mapName: 'Ruins',
    npcIntro: ['messenger'],
    events: {
      arrival: {
        npc: 'messenger',
        emoji: '👁️',
        text: 'Mélethor has been watching you for a long time.',
      },
      afterNCombats: [
        {
          count: 3,
          message: {
            npc: 'messenger',
            emoji: '🎭',
            text: 'You believe you choose your path... how adorable.',
          },
        },
      ],
      bossBefore: {
        bossName: 'Guardian of the Ruins',
        message: {
          npc: 'messenger',
          emoji: '🏛️',
          text: 'I guard what remains. Not what must be reborn.',
        },
      },
      bossVictory: {
        bossName: 'Guardian of the Ruins',
        message: {
          npc: 'messenger',
          emoji: '🌀',
          text: 'The ruins remember you.',
        },
      },
    },
  },

  // MAP 4 - Volcano
  {
    mapId: 4,
    mapName: 'Volcano',
    npcIntro: ['eldran', 'brak', 'messenger'],
    events: {
      arrival: {
        npc: 'eldran',
        emoji: '🌋',
        text: 'If you continue... you will not be able to return.',
      },
      bossBefore: {
        bossName: 'Mélethor',
        message: {
          npc: 'messenger',
          emoji: '👑',
          text: 'Mélethor does not reign. He prepares.',
        },
      },
      bossVictory: {
        bossName: 'Mélethor',
        message: {
          npc: 'messenger',
          emoji: '⚡',
          text: "You have destroyed only a fragment.",
        },
      },
    },
  },

  // MAP 5 - Final Arena
  {
    mapId: 5,
    mapName: 'Burning Throne',
    npcIntro: ['eldran', 'messenger'],
    events: {
      arrival: {
        npc: 'eldran',
        emoji: '🔥',
        text: 'At last... the Fire Overlord awaits. Your fate ends here.',
      },
      bossBefore: {
        bossName: 'Fire Overlord',
        message: {
          npc: 'messenger',
          emoji: '👺',
          text: 'The king of ash and flame. Undefeated for a thousand years.',
        },
      },
      bossVictory: {
        bossName: 'Fire Overlord',
        message: {
          npc: 'eldran',
          emoji: '🏆',
          text: 'Against all odds... you have conquered the Burning Throne. Do you think you can also defeat Melethor?',
        },
      },
    },
  },
];

// Helper to get narration for map
export function getMapNarration(mapId: number): MapNarration | undefined {
  return NARRATIONS.find((n) => n.mapId === mapId);
}

// Helper to get next combat narration
export function getCombatNarration(
  mapId: number,
  combatCount: number
): NarrativeMessage | undefined {
  const mapNarration = getMapNarration(mapId);
  if (!mapNarration?.events.afterNCombats) return undefined;

  const narration = mapNarration.events.afterNCombats.find(
    (n) => n.count === combatCount
  );
  return narration?.message;
}

// Tutorial messages (progressive learning)
export const TUTORIAL_MESSAGES: Record<string, NarrativeMessage> = {
  firstCombatTutorial: {
    npc: 'eldran',
    emoji: '⚔️',
    text: 'Click "Attack" to strike. Every blow tests your reflexes.',
  },
  firstVictoryTutorial: {
    npc: 'eldran',
    emoji: '🎉',
    text: 'Victory! You have defeated your first enemy. Loot drops automatically.',
  },
  firstLootTutorial: {
    npc: 'eldran',
    emoji: '✨',
    text: 'Items drop during combat. Collect them or equip them to grow stronger.',
  },
  firstInventoryTutorial: {
    npc: 'eldran',
    emoji: '📦',
    text: 'Ctrl+I opens your inventory. Equip weapons and armor to become more powerful.',
  },
  firstBossTutorial: {
    npc: 'eldran',
    emoji: '👑',
    text: 'A boss arrives... far more powerful. Bosses test your strategy, not just your strength.',
  },
  firstLevelUpTutorial: {
    npc: 'eldran',
    emoji: '📈',
    text: 'Level up! You can now allocate stat points. Be strategic.',
  },
  mapUnlockTutorial: {
    npc: 'eldran',
    emoji: '🗺️',
    text: 'You have unlocked a new map. Each region hides its secrets and dangers.',
  },
};
