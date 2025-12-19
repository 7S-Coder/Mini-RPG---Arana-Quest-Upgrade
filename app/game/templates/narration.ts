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
export const NPC_DATA: Record<NPCName, { name: string; title: string; color: string }> = {
  eldran: {
    name: 'Eldran',
    title: 'Le Veilleur',
    color: '#9370DB', // Purple
  },
  lya: {
    name: 'Lya',
    title: "L'Éclaireuse",
    color: '#52B788', // Green
  },
  brak: {
    name: 'Brak',
    title: 'Le Forgeron',
    color: '#D4A574', // Brown/Bronze
  },
  messenger: {
    name: 'Le Messager Masqué',
    title: 'Énigmatique',
    color: '#8B7355', // Dark brown
  },
};

export const NARRATIONS: MapNarration[] = [
  // MAP 0 - Initiation
  {
    mapId: 0,
    mapName: 'Arène',
    npcIntro: ['eldran'],
    events: {
      arrival: {
        npc: 'eldran',
        emoji: '🎭',
        text: "L'arène n'est pas un lieu. C'est une épreuve.",
      },
      firstCombat: {
        npc: 'eldran',
        emoji: '⚔️',
        text: 'Observe. Chaque coup raconte une histoire.',
      },
      playerDeath: {
        npc: 'eldran',
        emoji: '✨',
        text: "Tu n'as pas échoué. Tu as appris.",
      },
    },
  },

  // MAP 1 - Forest
  {
    mapId: 1,
    mapName: 'Forêt',
    npcIntro: ['eldran', 'lya'],
    events: {
      arrival: {
        npc: 'lya',
        emoji: '🌲',
        text: 'Les arbres regardent. Ne les provoque pas.',
      },
      afterNCombats: [
        {
          count: 10,
          message: {
            npc: 'eldran',
            emoji: '🧘',
            text: 'La forêt teste ta patience, pas ta force.',
          },
        },
      ],
      bossBefore: {
        bossName: 'Queen Bee',
        message: {
          npc: 'lya',
          emoji: '👑',
          text: 'Elle protège la ruche… comme un royaume.',
        },
      },
      bossVictory: {
        bossName: 'Queen Bee',
        message: {
          npc: 'eldran',
          emoji: '🌙',
          text: 'La reine est tombée. Mais la ruche survit.',
        },
      },
      dungeonEntry: {
        npc: 'lya',
        emoji: '🌳',
        text: 'Certains arbres ne donnent pas de fruits. Ils jugent.',
      },
    },
  },

  // MAP 2 - Caves
  {
    mapId: 2,
    mapName: 'Cavernes',
    npcIntro: ['brak'],
    events: {
      arrival: {
        npc: 'brak',
        emoji: '⛏️',
        text: 'Ici, la lumière ment. Fie-toi à ton acier.',
      },
      afterNCombats: [
        {
          count: 5,
          message: {
            npc: 'brak',
            emoji: '🔨',
            text: 'Trois objets identiques… ou rien de solide.',
          },
        },
      ],
      bossBefore: {
        bossName: 'Rabid Hyenas',
        message: {
          npc: 'brak',
          emoji: '🐕',
          text: "Elles n'attaquent pas pour manger. Elles attaquent pour survivre.",
        },
      },
      bossVictory: {
        bossName: 'Rabid Hyenas',
        message: {
          npc: 'eldran',
          emoji: '🔇',
          text: 'La meute est brisée. Le silence revient.',
        },
      },
    },
  },

  // MAP 3 - Ruins
  {
    mapId: 3,
    mapName: 'Ruines',
    npcIntro: ['messenger'],
    events: {
      arrival: {
        npc: 'messenger',
        emoji: '👁️',
        text: 'Mélethor t\'observe depuis longtemps.',
      },
      afterNCombats: [
        {
          count: 3,
          message: {
            npc: 'messenger',
            emoji: '🎭',
            text: 'Tu crois choisir ton chemin… adorable.',
          },
        },
      ],
      bossBefore: {
        bossName: 'Gardien des Ruines',
        message: {
          npc: 'messenger',
          emoji: '🏛️',
          text: 'Je garde ce qui reste. Pas ce qui doit renaître.',
        },
      },
      bossVictory: {
        bossName: 'Gardien des Ruines',
        message: {
          npc: 'messenger',
          emoji: '🌀',
          text: 'Les ruines se souviennent de toi.',
        },
      },
    },
  },

  // MAP 4 - Volcano
  {
    mapId: 4,
    mapName: 'Volcan',
    npcIntro: ['eldran', 'brak', 'messenger'],
    events: {
      arrival: {
        npc: 'eldran',
        emoji: '🌋',
        text: 'Si tu continues… tu ne pourras plus revenir.',
      },
      bossBefore: {
        bossName: 'Mélethor',
        message: {
          npc: 'messenger',
          emoji: '👑',
          text: 'Mélethor ne règne pas. Il prépare.',
        },
      },
      bossVictory: {
        bossName: 'Mélethor',
        message: {
          npc: 'messenger',
          emoji: '⚡',
          text: "Tu n'as détruit qu'un fragment.",
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
    text: 'Clique sur "Attack" pour frapper. Chaque coup teste tes réflexes.',
  },
  firstVictoryTutorial: {
    npc: 'eldran',
    emoji: '🎉',
    text: 'Victoire ! Tu as vaincu ton premier ennemi. Le loot tombe automatiquement.',
  },
  firstLootTutorial: {
    npc: 'eldran',
    emoji: '✨',
    text: 'Les objets tombent au combat. Ramasse-les ou équipe-les pour progresser.',
  },
  firstInventoryTutorial: {
    npc: 'eldran',
    emoji: '📦',
    text: 'Ctrl+I ouvre l\'inventaire. Équipe tes armes et armures pour devenir plus fort.',
  },
  firstBossTutorial: {
    npc: 'eldran',
    emoji: '👑',
    text: 'Un boss arrive... bien plus puissant. Les boss testent ta stratégie, pas juste ta force.',
  },
  firstLevelUpTutorial: {
    npc: 'eldran',
    emoji: '📈',
    text: 'Level up ! Tu peux maintenant allouer des points de stats. Sois stratégique.',
  },
  mapUnlockTutorial: {
    npc: 'eldran',
    emoji: '🗺️',
    text: 'Tu as déverrouillé une nouvelle map. Chaque région cache ses secrets et ses dangers.',
  },
};
