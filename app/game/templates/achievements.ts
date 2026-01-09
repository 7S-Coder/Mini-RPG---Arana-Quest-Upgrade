import type { Achievement } from "../types";
import type { NPCName } from "./narration";

/**
 * ACHIEVEMENTS CATALOG
 * 
 * All achievements are defined here with their unlock conditions.
 * The system tracks conditions through AchievementTrackingStats
 * and calls checkAchievements() after key events:
 * - Battle victory
 * - Boss defeat
 * - Dungeon completion
 * - Map unlock
 * - Chapter completion
 * 
 * Each achievement has a narrator (NPC) who will recount the tale
 */

export const ACHIEVEMENTS: Record<string, Achievement> = {
  // ===== COMBAT ACHIEVEMENTS =====
  first_blood: {
    id: "first_blood",
    title: "First Blood",
    description: "Win your first battle",
    lore: "Your weapon has finally found its purpose. The world does not forgive clean hands.",
    narrator: "eldran" as NPCName,
    icon: "⚔️",
    reward: { gold: 5 },
    unlocked: false,
    category: "combat",
  },

  battle_10: {
    id: "battle_10",
    title: "Veteran Warrior",
    description: "Win 10 battles",
    lore: "Ten enemies down. It's not the victory that impresses me... but the fact that you don't stop.",
    narrator: "lya" as NPCName,
    icon: "🗡️",
    reward: { gold: 50, essence: 2 },
    unlocked: false,
    category: "combat",
  },

  battle_50: {
    id: "battle_50",
    title: "Arena Legend",
    description: "Win 50 battles",
    context: "Brak inspects your blade without looking at you.",
    lore: "Fifty lives... or animals. Eventually, you stop counting. Those who still count never survive for long.",
    narrator: "brak" as NPCName,
    icon: "👑",
    reward: { gold: 100, essence: 4 },
    unlocked: false,
    category: "combat",
  },

  battle_100: {
    id: "battle_100",
    title: "Unstoppable Force",
    description: "Win 100 battles",
    lore: "One hundred confrontations. The world is beginning to remember you. Bad sign: what it remembers always ends up being erased.",
    narrator: "messenger" as NPCName,
    icon: "⭐",
    reward: { gold: 200, essence: 8 },
    unlocked: false,
    category: "combat",
  },

  win_streak_10: {
    id: "win_streak_10",
    title: "Momentum",
    description: "Win 10 consecutive battles",
    context: "Lya stares at you for a long time.",
    lore: "Ten wins without a fall. I don't know if it's talent... or stubbornness. Maybe both.",
    narrator: "lya" as NPCName,
    icon: "🔥",
    reward: { gold: 150, essence: 15 },
    unlocked: false,
    category: "combat",
  },

  win_streak_25: {
    id: "win_streak_25",
    title: "Unstoppable Streak",
    description: "Win 25 consecutive battles",
    lore: "Ten wins without a fall. I don't know if it's talent... or stubbornness. Maybe both.",
    narrator: "eldran" as NPCName,
    icon: "🌪️",
    reward: { gold: 350, essence: 35 },
    unlocked: false,
    category: "combat",
  },

  // ===== ENEMY TYPE DEFEATS =====
  goblin_slayer: {
    id: "goblin_slayer",
    title: "Goblin Slayer",
    description: "Defeat your first Goblin",
    lore: "Goblins have no honor. But they have despair. You have learned to overcome it.",
    narrator: "lya" as NPCName,
    icon: "🧌",
    reward: { gold: 25 },
    unlocked: false,
    category: "combat",
  },

  troll_hunter: {
    id: "troll_hunter",
    title: "Troll Hunter",
    description: "Defeat your first Troll",
    lore: "Trolls are stubborn. Yet you won. I would have preferred that tenacity alone were enough to save a son...",
    narrator: "brak" as NPCName,
    icon: "🪨",
    reward: { gold: 75, essence: 15 },
    unlocked: false,
    category: "combat",
  },

  dragon_slayer: {
    id: "dragon_slayer",
    title: "Dragon Slayer",
    description: "Defeat your first Dragon",
    lore: "A dragon never simply dies. It is persuaded. You succeeded. Others fail.",
    narrator: "messenger" as NPCName,
    icon: "🐉",
    reward: { gold: 300, essence: 75 },
    unlocked: false,
    category: "combat",
  },

  shadow_hunter: {
    id: "shadow_hunter",
    title: "Shadow Hunter",
    description: "Defeat your first Shadow Beast",
    lore: "Ghosts do not fear death. They fear being forgotten. You helped them to fear again.",
    narrator: "eldran" as NPCName,
    icon: "👻",
    reward: { gold: 100, essence: 20 },
    unlocked: false,
    category: "combat",
  },

  // ===== BOSS ACHIEVEMENTS =====
  first_boss: {
    id: "first_boss",
    title: "Boss Slayer",
    description: "Defeat your first boss",
    context: "Lya puts her hand on your sleeve.",
    lore: "You faced something that hoped to see you run away. You persisted. That's rare... and complicated.",
    narrator: "lya" as NPCName,
    icon: "💀",
    reward: { gold: 200, essence: 50 },
    unlocked: false,
    category: "boss",
  },

  five_bosses: {
    id: "five_bosses",
    title: "Champion of Champions",
    description: "Defeat 5 different bosses",
    lore: "Cinq. C’est plus que ce qu’on demande à un enfant. Plus que ce que j’ai demandé à un fils. Et pourtant tu es là.",
    narrator: "brak" as NPCName,
    icon: "🏆",
    reward: { gold: 500, essence: 150 },
    unlocked: false,
    category: "boss",
  },

  // ===== EXPLORATION ACHIEVEMENTS =====
  map_unlock_5: {
    id: "map_unlock_5",
    title: "Explorer",
    description: "Unlock 5 different maps",
    lore: "Five kingdoms opened, five wounds reopened. The world offers you no future... it offers you debts.",
    narrator: "eldran" as NPCName,
    icon: "🗺️",
    reward: { gold: 150, essence: 20 },
    unlocked: false,
    category: "exploration",
  },

  // ===== DUNGEON ACHIEVEMENTS =====
  first_dungeon: {
    id: "first_dungeon",
    title: "Dungeon Delver",
    description: "Complete your first dungeon",
    lore: "The depths have surrendered. Lya speaks with pride: 'You have conquered the darkness itself.'",
    narrator: "lya" as NPCName,
    icon: "🕳️",
    reward: { gold: 100, essence: 20 },
    unlocked: false,
    category: "dungeon",
  },

  three_dungeons: {
    id: "three_dungeons",
    title: "Dungeon Master",
    description: "Complete 3 different dungeons",
    lore: "Three mazes. You've learned that not everything hidden is precious—sometimes it's just doomed.",
    narrator: "messenger" as NPCName,
    icon: "🎩",
    reward: { gold: 200, essence: 50 },
    unlocked: false,
    category: "dungeon",
  },

  // ===== SPECIAL ACHIEVEMENTS =====
  never_die: {
    id: "never_die",
    title: "Immortal",
    description: "Complete 10 battles without dying",
    lore: "The absence of death is not a victory. It is a postponement.",
    narrator: "eldran" as NPCName,
    icon: "✨",
    reward: { gold: 100, essence: 10 },
    unlocked: false,
    category: "special",
  },

  first_essence: {
    id: "first_essence",
    title: "Essence Touched",
    description: "Gain essence for the first time",
    lore: "It was said that the essence chose only the living. That is false. It chooses those who refuse to die.",
    narrator: "brak" as NPCName,
    icon: "⚡",
    reward: { essence: 10 },
    unlocked: false,
    category: "special",
  },

  legendary_find: {
    id: "legendary_find",
    title: "Legendary Luck",
    description: "Find your first legendary item",
    context: "Her eyes light up, but her voice remains calm.",
    lore: "Legends say that these artifacts carried oaths. Few survived their promise.",
    narrator: "lya" as NPCName,
    icon: "💎",
    reward: { gold: 200, essence: 30 },
    unlocked: false,
    category: "special",
  },

  mythic_find: {
    id: "mythic_find",
    title: "Divine Blessing",
    description: "Find your first mythic item",
    lore: "Myths are not born... they are awakened. That is never a good sign.",
    narrator: "messenger" as NPCName,
    icon: "🌟",
    reward: { gold: 500, essence: 200 },
    unlocked: false,
    hidden: true,
    category: "special",
  },

  // ===== NARRATIVE ACHIEVEMENTS =====
  final_boss: {
    id: "final_boss",
    title: "World Saver",
    description: "Defeat the Fire Overlord",
    lore: "The Lord of Fire falls. One less tyrant. But Mélethor was only a general... not the king. The kingdom still burns. Stories don't end. They close.",
    narrator: "messenger" as NPCName,
    icon: "🔥👑",
    reward: { gold: 1000, essence: 500 },
    unlocked: false,
    hidden: true,
    category: "narrative",
  },

  // === FUTURE EXPANSION SLOTS ===
  // You can add seasonal achievements, challenge achievements, etc. here
};

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | null {
  return ACHIEVEMENTS[id] || null;
}

/**
 * Get all achievements
 */
export function getAllAchievements(): Achievement[] {
  return Object.values(ACHIEVEMENTS);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: string): Achievement[] {
  return Object.values(ACHIEVEMENTS).filter((a) => a.category === category);
}

/**
 * Get all locked achievements
 */
export function getLockedAchievements(): Achievement[] {
  return Object.values(ACHIEVEMENTS).filter((a) => !a.unlocked && !a.hidden);
}

/**
 * Get all unlocked achievements
 */
export function getUnlockedAchievements(): Achievement[] {
  return Object.values(ACHIEVEMENTS).filter((a) => a.unlocked);
}
