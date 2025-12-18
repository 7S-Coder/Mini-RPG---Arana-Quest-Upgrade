export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export type Item = {
  id: string;
  slot: "familiar" | "boots" | "belt" | "hat" | "chestplate" | "ring" | "weapon" | "key";
  name: string;
  rarity: Rarity;
  category?: "weapon" | "armor" | "accessory" | "pet";
  cost?: number;
  stats?: Record<string, number>;
  weight?: number;
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
  lastLevelUpAt?: number | null;
  gold?: number;
  // unlocked item tiers for crafting/forge and other gating (e.g. ['common','rare'])
  unlockedTiers?: Rarity[];
  // consecutive wins without dying
  consecWins?: number;
};

export type ItemTemplate = Omit<Item, "id" | "rarity"> & { weight?: number; rarity?: Rarity };

export type Pickup = {
  id: string;
  kind: "gold" | "item";
  amount?: number;
  item?: Item;
  x?: number;
  y?: number;
  createdAt?: number;
};

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
};