export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";

export type EquipmentSlot = "familiar" | "boots" | "belt" | "hat" | "chestplate" | "ring" | "weapon" | "key";

export type Item = {
  id: string;
  slot: EquipmentSlot | "consumable";
  name: string;
  rarity: Rarity;
  category?: "weapon" | "armor" | "accessory" | "pet" | "consumable";
  cost?: number;
  stats?: Record<string, number>;
  weight?: number;
  quantity?: number; // for stackable items like potions
  lockedStats?: string[]; // stats that won't change during upgrades
  infused?: boolean; // has essence infusion
  isForged?: boolean; // created via forge
  description?: string; // item description
};

export type Enemy = {
  id: string;
  templateId?: string;
  name: string;
  x: number;
  y: number;
  level?: number;
  rarity?: Rarity;
  hp: number;
  dmg: number;
  dodge: number;
  crit: number;
  def: number;
  speed: number;
  rage?: number; // rageThreshold-100, triggers coordinated attack at 100
  rageThreshold?: number; // minimum rage value (default 0), represents bar start
  // optional flags for UI/logic
  isBoss?: boolean;
  roomId?: string;
};

export type Player = {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  dmg: number;
  dodge: number;
  crit: number;
  def: number;
  speed: number; // px per second
  regen?: number; // hp regeneration per second (out of combat)
  lastLevelUpAt?: number | null;
  gold?: number;
  essence?: number; // new currency for future essences
  // unlocked item tiers for crafting/forge and other gating (e.g. ['common','rare'])
  unlockedTiers?: Rarity[];
  // consecutive wins without dying
  consecWins?: number;
  // forge materials
  materials?: {
    essence_dust?: number;
    mithril_ore?: number;
    star_fragment?: number;
    void_shard?: number;
  };
};

export type ItemTemplate = Omit<Item, "id" | "rarity"> & { weight?: number; rarity?: Rarity; allowedMaps?: string[] };

export type Pickup = {
  id: string;
  kind: "gold" | "item";
  amount?: number;
  item?: Item;
  x?: number;
  y?: number;
  createdAt?: number;
};

export type RageEffect = 'multi_attack' | 'explosion' | 'heal' | 'debuff' | 'multiplier';

export type EnemyTemplate = {
  templateId: string;
  name: string;
  hp: number;
  dmg: number;
  def: number;
  dodge: number;
  crit: number;
  speed: number;
  rarity?: Rarity;
  rageEffect?: RageEffect; // Special effect when rage reaches 100
  rageThreshold?: number; // Minimum rage value (default 0), represents bar start
};

// === ACHIEVEMENTS SYSTEM ===
export type AchievementReward = {
  gold?: number;
  essence?: number;
  item?: Item; // Optional special item reward
  fragmentCount?: number; // Key fragment reward
  passiveBonus?: {
    dmg?: number;
    def?: number;
    dodge?: number;
    crit?: number;
    hp?: number;
  };
};

export type Achievement = {
  id: string;
  title: string;
  description: string; // Gameplay-focused description
  lore: string; // Narrative description (shown after unlock)
  narrator?: 'eldran' | 'lya' | 'brak' | 'messenger'; // NPC who narrates this achievement
  icon?: string; // Optional icon/emoji
  reward: AchievementReward;
  unlocked: boolean;
  unlockedAt?: number; // Timestamp when unlocked
  hidden?: boolean; // Hidden achievements aren't shown until unlocked
  category?: 'combat' | 'exploration' | 'boss' | 'dungeon' | 'narrative' | 'special';
};

export type AchievementTrackingStats = {
  totalBattlesWon: number;
  totalBattlesLost: number;
  dungeonCompleted: Record<string, number>; // { dungeonId: count }
  bossesDefeated: Record<string, number>; // { bossTemplateId: count }
  mapsUnlocked: Record<string, boolean>; // { mapId: true }
  enemyTypesDefeated: Record<string, number>; // { templateId: count }
  highestWinStreak: number;
  chaptersCompleted: Record<string, boolean>; // { chapterId: true }
};

// === EVENTS SYSTEM ===
export type EventEffectType = 'enemy_bonus' | 'player_malus' | 'spawn_modifier' | 'rage_modifier' | 'dodge_bonus' | 'loot_bonus' | 'enemy_debuff';

export type EventEffect = {
  type: EventEffectType;
  value: number;
};

export type GameEvent = {
  id: string;
  name: string;
  description: string; // UI-facing short description
  lore: string; // Narrative flavor text
  type: 'zone' | 'combat'; // zone events persist, combat events are single-encounter
  narrator?: 'eldran' | 'lya' | 'brak' | 'messenger'; // NPC who narrates this event
  icon?: string; // Emoji/icon for UI display
  duration: number; // remaining battles (for zone events) or 1 for combat events
  consoleTint: string; // rgba or hex color for console styling
  consolePulse?: boolean; // whether to add pulsing animation
  effects: EventEffect[];
  rarity?: Rarity; // event rarity for drop table modifications
};

export type ActiveGameEvent = GameEvent & {
  activatedAt: number; // timestamp when event started
  durationRemaining: number; // battles remaining for this event
};