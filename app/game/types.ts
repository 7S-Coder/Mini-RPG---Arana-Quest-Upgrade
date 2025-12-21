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