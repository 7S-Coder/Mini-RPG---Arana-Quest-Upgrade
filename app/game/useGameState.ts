"use client";

import { useState } from "react";

type Player = {
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
};

type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

type Item = {
  id: string;
  slot: "familier" | "bottes" | "ceinture" | "chapeau" | "plastron" | "anneau" | "arme";
  name: string;
  rarity: Rarity;
  stats?: Record<string, number>;
};

type Enemy = {
  id: string;
  name: string;
  x: number;
  y: number;
  level?: number;
  rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
  hp: number;
  dmg: number;
  dodge: number;
  crit: number;
  def: number;
  speed: number; // px per second
};

// helper: stable unique id generator (uses crypto.randomUUID when available)
const uid = () => {
  try {
    // @ts-ignore
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
      // @ts-ignore
      return (crypto as any).randomUUID();
    }
  } catch (e) {
    // fallthrough
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
};

type EnemyTemplate = {
  templateId: string;
  name: string;
  hp: number;
  dmg: number;
  def: number;
  dodge: number;
  crit: number;
  speed: number;
};

const ENEMY_TEMPLATES: EnemyTemplate[] = [
  { templateId: "gobelin", name: "Gobelin", hp: 18, dmg: 6, def: 1, dodge: 5, crit: 2, speed: 30 },
  { templateId: "slime", name: "Slime", hp: 14, dmg: 4, def: 0, dodge: 2, crit: 0, speed: 20 },
  { templateId: "brigand", name: "Brigand", hp: 22, dmg: 8, def: 2, dodge: 8, crit: 6, speed: 36 },
  { templateId: "ogre", name: "Ogre", hp: 40, dmg: 14, def: 4, dodge: 1, crit: 3, speed: 18 },
  { templateId: "golem", name: "Golem", hp: 60, dmg: 18, def: 8, dodge: 0, crit: 1, speed: 10 },
  { templateId: "wyrm", name: "Wyrm", hp: 45, dmg: 16, def: 5, dodge: 4, crit: 4, speed: 28 },
  { templateId: "seigneur", name: "Seigneur du Fléau", hp: 120, dmg: 28, def: 10, dodge: 6, crit: 8, speed: 24 },
  { templateId: "spectre", name: "Spectre", hp: 30, dmg: 10, def: 2, dodge: 12, crit: 10, speed: 40 },
  { templateId: "loup", name: "Loup", hp: 20, dmg: 7, def: 1, dodge: 10, crit: 5, speed: 44 },
  { templateId: "bandit", name: "Bandit", hp: 24, dmg: 9, def: 2, dodge: 7, crit: 7, speed: 34 },
];

export function useGameState() {
  const [player, setPlayer] = useState<Player>({
    x: 100,
    y: 100,
    hp: 80,
    maxHp: 80,
    level: 1,
    xp: 0,
    dmg: 15,
    dodge: 5,
    crit: 3,
    def: 2,
    speed: 120, // default 120 px/s
  });

  // equipment slots and inventory
  const [equipment, setEquipment] = useState<Record<string, Item | null>>({
    familier: null,
    bottes: null,
    ceinture: null,
    chapeau: null,
    plastron: null,
    anneau: null,
    arme: null,
  });
  const [inventory, setInventory] = useState<Item[]>([]);

  const xpToNextLevel = (lvl: number) => Math.max(20, 100 * lvl);

  const MAX_LEVEL = 80;

  // small, predictable growth per level derived from base stats
  const BASE_HP = 80;
  const BASE_DMG = 15;
  const BASE_DEF = 2;
  const BASE_DODGE = 5;
  const BASE_CRIT = 3;

  const addXp = (amount: number) => {
    setPlayer((p) => {
      if (p.level >= MAX_LEVEL) return p;
      let xp = p.xp + amount;
      let lvl = p.level;
      while (lvl < MAX_LEVEL && xp >= xpToNextLevel(lvl)) {
        xp = xp - xpToNextLevel(lvl);
        lvl += 1;
        // recalc stats from base and new level (small per-level increases)
        const newMaxHp = BASE_HP + Math.floor((lvl - 1) * 4); // +4 HP per level
        const newDmg = BASE_DMG + Math.floor((lvl - 1) * 0.2); // +1 DMG every ~5 levels
        const newDef = BASE_DEF + Math.floor((lvl - 1) * 0.05); // +1 DEF every 20 levels
        const newDodge = BASE_DODGE + Math.floor((lvl - 1) * 0.03);
        const newCrit = BASE_CRIT + Math.floor((lvl - 1) * 0.02);

        p = {
          ...p,
          level: lvl,
          maxHp: newMaxHp,
          dmg: newDmg,
          def: newDef,
          dodge: newDodge,
          crit: newCrit,
          lastLevelUpAt: Date.now(),
        } as Player;
        // restore to max on level up
        p.hp = p.maxHp;
      }
      return { ...p, xp, level: lvl };
    });
  };

  // item generation / loot
  const SLOTS: Item["slot"][] = ["familier", "bottes", "ceinture", "chapeau", "plastron", "anneau", "arme"];

  const rollRarity = (): Rarity | null => {
    // probabilities (percent): mythic 0.1, legendary 1, epic 5, rare 10, common 30
    const r = Math.random() * 100;
    if (r < 0.1) return "mythic";
    if (r < 1.1) return "legendary";
    if (r < 6.1) return "epic";
    if (r < 16.1) return "rare";
    if (r < 46.1) return "common";
    return null;
  };

  const createItemForEnemy = (enemy: Enemy, rarity: Rarity): Item => {
    const slot = SLOTS[Math.floor(Math.random() * SLOTS.length)];
    const baseName = enemy.name ?? "Objet";
    const name = `${baseName} ${slot.charAt(0).toUpperCase() + slot.slice(1)} (${rarity})`;
    const stats: Record<string, number> = {};
    // Specialized stat assignment depending on slot
    const dmgFactor: Record<Rarity, number> = { common: 0.5, rare: 0.8, epic: 1.1, legendary: 1.6, mythic: 2.5 };
    const hpFactor: Record<Rarity, number> = { common: 0.03, rare: 0.05, epic: 0.08, legendary: 0.14, mythic: 0.25 };
    const defFactor: Record<Rarity, number> = { common: 0.05, rare: 0.08, epic: 0.12, legendary: 0.18, mythic: 0.3 };
    const critFactor: Record<Rarity, number> = { common: 0.5, rare: 0.9, epic: 1.4, legendary: 2.2, mythic: 3.5 };

    switch (slot) {
      case "arme":
        stats.dmg = Math.max(1, Math.round((enemy.dmg || 1) * dmgFactor[rarity]));
        stats.crit = Math.max(0, Math.round((enemy.crit || 0) * critFactor[rarity]));
        break;
      case "bottes":
        // boots: increase damage and crit
        stats.dmg = Math.max(0, Math.round((enemy.dmg || 1) * (dmgFactor[rarity] * 0.6)));
        stats.crit = Math.max(0, Math.round((enemy.crit || 0) * (critFactor[rarity] * 0.7)));
        break;
      case "ceinture":
        // belt: hp and def
        stats.hp = Math.max(1, Math.round((enemy.hp || 1) * hpFactor[rarity] * 1.2));
        stats.def = Math.max(0, Math.round((enemy.def || 0) * (defFactor[rarity] * 1.5)));
        break;
      case "plastron":
        // chest: primarily HP (tank)
        stats.hp = Math.max(1, Math.round((enemy.hp || 1) * hpFactor[rarity]));
        stats.def = Math.max(0, Math.round((enemy.def || 0) * defFactor[rarity]));
        break;
      case "chapeau":
        // hat: crit and dodge
        stats.crit = Math.max(0, Math.round((enemy.crit || 0) * (critFactor[rarity] * 0.8)));
        stats.dodge = Math.max(0, Math.round(((enemy.dodge || 0) * (rarity === "mythic" ? 1.5 : 0.6)))) ;
        break;
      case "anneau":
        // ring: small mixed bonus (hp + crit)
        stats.hp = Math.max(0, Math.round((enemy.hp || 0) * (hpFactor[rarity] * 0.6)));
        stats.crit = Math.max(0, Math.round((enemy.crit || 0) * (critFactor[rarity] * 0.6)));
        break;
      case "familier":
        // familiars: small damage and HP
        stats.dmg = Math.max(0, Math.round((enemy.dmg || 1) * (dmgFactor[rarity] * 0.35)));
        stats.hp = Math.max(0, Math.round((enemy.hp || 1) * (hpFactor[rarity] * 0.6)));
        break;
      default:
        break;
    }

    return { id: uid(), slot, name, rarity, stats };
  };

  const maybeDropFromEnemy = (enemy: Enemy): Item | null => {
    const rarity = rollRarity();
    if (!rarity) return null;
    const item = createItemForEnemy(enemy, rarity);
    setInventory((inv) => {
      // prevent accidental duplicate ids
      if (inv.find((i) => i.id === item.id)) return inv;
      return [...inv, item];
    });
    return item;
  };

  // Equip / Unequip helpers to keep logic centralized and avoid race conditions
  const equipItem = (item: Item): boolean => {
    try { console.log('equipItem called', item && item.id, item && item.slot); } catch (e) {}
    // ensure item is actually in inventory before equipping
    const has = inventory.find((i) => i.id === item.id);
    if (!has) {
      try { console.warn('equipItem: item not found in inventory', item && item.id); } catch (e) {}
      return false;
    }
    // read current equipped for this slot (synchronously from closure)
    const currentEquipped = equipment[item.slot];

    // update equipment (pure)
    setEquipment((prevEquip) => ({ ...prevEquip, [item.slot]: item }));

    // update inventory: remove the equipped item, and return previous equipped into inventory if any
    setInventory((prevInv) => {
      const without = prevInv.filter((i) => i.id !== item.id);
      if (currentEquipped && currentEquipped.id !== item.id) {
        if (without.find((i) => i.id === currentEquipped.id)) return without;
        return [...without, currentEquipped];
      }
      return without;
    });

    // adjust player stats outside of state updater callbacks to avoid double-calls in StrictMode
    try {
      if (currentEquipped && currentEquipped.stats) applyItemStatsToPlayer(currentEquipped.stats, -1);
      if (item && item.stats) applyItemStatsToPlayer(item.stats, 1);
    } catch (e) {
      try { console.error('applyItemStats error', e); } catch (e) {}
    }
    return true;
  };

  const unequipItem = (slot: Item["slot"]) => {
    try { console.log('unequipItem called', slot); } catch (e) {}
    // read current equipped
    const current = equipment[slot];
    // remove equipment entry
    setEquipment((prev) => ({ ...prev, [slot]: null }));
    // remove stats and add to inventory if present
    if (current) {
      try { if (current.stats) applyItemStatsToPlayer(current.stats, -1); } catch (e) { try { console.error(e); } catch (e) {} }
      setInventory((inv) => {
        if (inv.find((i) => i.id === current.id)) return inv;
        return [...inv, current];
      });
    }
  };

  const [enemies, setEnemies] = useState<Enemy[]>([]);

  const spawnEnemy = (templateOverride?: string, levelOverride?: number) => {
    // pick a template (optionally by templateId)
    const template =
      (templateOverride && ENEMY_TEMPLATES.find((t) => t.templateId === templateOverride)) ||
      ENEMY_TEMPLATES[Math.floor(Math.random() * ENEMY_TEMPLATES.length)];

    // choose level near the player (dynamic delta) unless overridden
    const MAX_SPAWN_LEVEL = 120;
    const MIN_SPAWN_LEVEL = 1;
    let level: number;
    if (typeof levelOverride === "number") {
      level = Math.max(MIN_SPAWN_LEVEL, Math.min(MAX_SPAWN_LEVEL, Math.floor(levelOverride)));
    } else {
      // delta grows slowly with player level so higher-level players still face nearby threats
      const delta = Math.max(3, Math.round(player.level * 0.08));
      const minL = Math.max(MIN_SPAWN_LEVEL, player.level - delta);
      const maxL = Math.min(MAX_SPAWN_LEVEL, player.level + delta);
      level = minL + Math.floor(Math.random() * (maxL - minL + 1));
    }

    // rarity by level ranges
    const rarity = level <= 9 ? "common" : level <= 29 ? "rare" : level <= 59 ? "epic" : level <= 89 ? "legendary" : "mythic";

    // base random factors
    const r1 = 0.6 + Math.random() * 1.0; // for dmg
    const r2 = 0.9 + Math.random() * 0.4; // for hp multiplier
    const r3 = 0.2 + Math.random() * 0.6; // for def

    const rarityHpMult: Record<string, number> = { common: 1, rare: 1.04, epic: 1.12, legendary: 1.28, mythic: 1.5 };
    const rarityDmgMult: Record<string, number> = { common: 1, rare: 1.06, epic: 1.15, legendary: 1.3, mythic: 1.7 };
    const rarityDefMult: Record<string, number> = { common: 1, rare: 1.02, epic: 1.08, legendary: 1.18, mythic: 1.35 };

    const hp = Math.max(6, Math.round(8 + Math.pow(level, 1.2) * (3 + Math.random() * 3) * rarityHpMult[rarity] * r2));
    const dmg = Math.max(1, Math.round(level * (0.6 + Math.random() * 1.0) * rarityDmgMult[rarity] * r1));
    const def = Math.max(0, Math.round(level * (0.2 + Math.random() * 0.4) * rarityDefMult[rarity] * r3));

    const inst: Enemy = {
      id: uid(),
      name: template.name,
      level,
      rarity: rarity as any,
      x: Math.random() * 500,
      y: Math.random() * 500,
      hp,
      dmg,
      dodge: Math.max(0, Math.round(Math.random() * 10 + level * 0.05)),
      crit: Math.max(0, Math.round(Math.random() * 8 + level * 0.03)),
      def,
      speed: Math.max(8, Math.round(10 + Math.random() * 40 - level * 0.05)),
    };

    setEnemies((prev) => [...prev, inst]);
  };

  // helper to apply or remove item stats to player
  const applyItemStatsToPlayer = (stats: Record<string, number> | undefined, sign: number) => {
    if (!stats) return;
    try { console.log('applyItemStatsToPlayer', { stats, sign }); console.trace(); } catch (e) {}
    setPlayer((p) => {
      const next: any = { ...p } as any;
      for (const [k, v] of Object.entries(stats)) {
        const val = Number(v || 0) * sign;
        if (k === "hp") {
          const prevMax = next.maxHp ?? next.hp ?? 0;
          const newMax = Math.max(1, Math.round(prevMax + val));
          if (sign > 0) {
            next.maxHp = newMax;
            next.hp = Math.min(newMax, (next.hp ?? 0) + Math.round(val));
          } else {
            next.maxHp = newMax;
            next.hp = Math.max(0, Math.min(newMax, next.hp ?? 0));
          }
        } else {
          const current = Number((next as any)[k] ?? 0);
          (next as any)[k] = Math.max(0, Math.round(current + val));
        }
      }
      return next as Player;
    });
  };

  return { player, setPlayer, enemies, setEnemies, spawnEnemy, addXp, xpToNextLevel, equipment, setEquipment, inventory, setInventory, maybeDropFromEnemy, equipItem, unequipItem } as const;
}

