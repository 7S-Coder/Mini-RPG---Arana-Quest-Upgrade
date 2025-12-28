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
    lore: "Your blade tasted blood for the first time. Eldran watches and nods — your journey has truly begun.",
    narrator: "eldran" as NPCName,
    icon: "⚔️",
    reward: { gold: 50 },
    unlocked: false,
    category: "combat",
  },

  battle_10: {
    id: "battle_10",
    title: "Veteran Warrior",
    description: "Win 10 battles",
    lore: "After ten victories, Lya greets you with respect. You are no longer a mere novice — you are a warrior of the arena.",
    narrator: "lya" as NPCName,
    icon: "🗡️",
    reward: { gold: 200, essence: 10 },
    unlocked: false,
    category: "combat",
  },

  battle_50: {
    id: "battle_50",
    title: "Arena Legend",
    description: "Win 50 battles",
    lore: "Fifty victories. Brak stops his smithing to acknowledge your prowess. Legends are born from such feats.",
    narrator: "brak" as NPCName,
    icon: "👑",
    reward: { gold: 500, essence: 75 },
    unlocked: false,
    category: "combat",
  },

  battle_100: {
    id: "battle_100",
    title: "Unstoppable Force",
    description: "Win 100 battles",
    lore: "A hundred victories. Even the Masked Messenger speaks your name in hushed tones — you have transcended mortality.",
    narrator: "messenger" as NPCName,
    icon: "⭐",
    reward: { gold: 1000, essence: 100 },
    unlocked: false,
    category: "combat",
  },

  win_streak_10: {
    id: "win_streak_10",
    title: "Momentum",
    description: "Win 10 consecutive battles",
    lore: "Ten victories without pause. Lya smiles — each win feeds your fire. You are unstoppable.",
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
    lore: "Twenty-five consecutive victories. Eldran says, 'Your shadow grows long, and enemies fall before it like leaves.'",
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
    lore: "A goblin falls beneath your blade. Lya notes your prey — the hunt has begun.",
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
    lore: "A Troll's corpse marks your path. Brak says, 'That took the strength of a true warrior. The forges whisper your name.'",
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
    lore: "A dragon falls. The Masked Messenger appears from the shadows: 'Few mortals live to claim such a feat.'",
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
    lore: "A creature of darkness crumbles. Eldran whispers, 'You have pierced the veil between worlds. Beware — it remembers.'",
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
    lore: "The first true challenge overcome. Lya clasps your shoulder: 'You have tasted the blood of champions.'",
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
    lore: "Five mighty bosses have fallen. Brak forges you a crown of iron: 'You are the greatest warrior I have ever known.'",
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
    lore: "Five kingdoms open before you. Eldran says, 'The lands recognize their protector. Walk forward with purpose.'",
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
    reward: { gold: 250, essence: 60 },
    unlocked: false,
    category: "dungeon",
  },

  three_dungeons: {
    id: "three_dungeons",
    title: "Dungeon Master",
    description: "Complete 3 different dungeons",
    lore: "Three dungeons conquered. The Masked Messenger nods solemnly: 'You have walked where few dare tread. The depths know your name.'",
    narrator: "messenger" as NPCName,
    icon: "🎩",
    reward: { gold: 600, essence: 160 },
    unlocked: false,
    category: "dungeon",
  },

  // ===== SPECIAL ACHIEVEMENTS =====
  never_die: {
    id: "never_die",
    title: "Immortal",
    description: "Complete 10 battles without dying",
    lore: "Ten battles, not a scratch. Eldran whispers in awe, 'Perhaps you truly are immortal. Or perhaps your fate is yet unwritten.'",
    narrator: "eldran" as NPCName,
    icon: "✨",
    reward: { gold: 300, essence: 40 },
    unlocked: false,
    category: "special",
  },

  first_essence: {
    id: "first_essence",
    title: "Essence Touched",
    description: "Gain essence for the first time",
    lore: "Raw essence flows through you. Brak nods knowingly: 'You have been chosen by something greater. Use this power wisely.'",
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
    lore: "A legendary item gleams in your hands. Lya's eyes widen: 'The gods smile upon you this day.'",
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
    lore: "A mythic artifact awakens in your grasp. The Masked Messenger appears: 'You have been touched by the divine itself. The world has changed.'",
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
    lore: "The Fire Overlord falls, its tyranny broken. The Masked Messenger's voice trembles: 'Méléthor's chosen is vanquished, but the ancient one still dwells beyond the veil... waiting. Yet for now, the world draws breath. Your name is etched in legend.'",
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
