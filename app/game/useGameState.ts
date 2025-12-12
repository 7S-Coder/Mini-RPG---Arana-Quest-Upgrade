"use client";

import { useState, useEffect } from "react";

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
  gold?: number;
};

type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

type Item = {
  id: string;
  slot: "familier" | "bottes" | "ceinture" | "chapeau" | "plastron" | "anneau" | "arme";
  name: string;
  rarity: Rarity;
  // category groups types of items (weapon, armor, accessory, pet)
  category?: "weapon" | "armor" | "accessory" | "pet";
  cost?: number;
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
    gold: 0,
  });

  // equipment slots and inventory
  const [equipment, setEquipment] = useState<Record<Item["slot"], Item | null>>({
    familier: null,
    bottes: null,
    ceinture: null,
    chapeau: null,
    plastron: null,
    anneau: null,
    arme: null,
  });
  const [inventory, setInventory] = useState<Item[]>([]);
  type Pickup = {
    id: string;
    kind: "gold" | "item";
    amount?: number; // for gold
    item?: Item; // for item pickups
    x?: number;
    y?: number;
    createdAt?: number;
  };
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const collectedRef = (typeof (globalThis as any) !== 'undefined' ? (globalThis as any).__collectedPickupIds : undefined) || { current: new Set<string>() } as React.MutableRefObject<Set<string>>;
  if (!('current' in collectedRef)) (collectedRef as any) = { current: new Set<string>() };

  // clamp coordinates to the visible viewport (avoid spawning pickups off-screen)
  const clampToViewport = (x?: number, y?: number) => {
    try {
      if (typeof window === 'undefined') return { x: x ?? 200, y: y ?? 120 };
      const padX = 48;
      const padTop = 80;
      const padBottom = 120;
      const w = window.innerWidth || 800;
      const h = window.innerHeight || 600;
      const cx = Math.min(Math.max(typeof x === 'number' ? x : w / 2, padX), Math.max(w - padX, padX));
      const cy = Math.min(Math.max(typeof y === 'number' ? y : h / 2, padTop), Math.max(h - padBottom, padTop));
      return { x: Math.round(cx), y: Math.round(cy) };
    } catch (e) {
      return { x: x ?? 200, y: y ?? 120 };
    }
  };

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

  // Static pool of item templates to draw from when an enemy drops loot.
  // Templates do not include `id` or `rarity` so they can be cloned and assigned a unique id + rarity on drop.
  type ItemTemplate = Omit<Item, "id" | "rarity"> & { weight?: number; rarity?: Rarity };
  const ITEM_POOL: ItemTemplate[] = [
    // Chapeaux
    { slot: "chapeau", name: "Chapeau de paille", category: "armor", stats: { hp: 1 }, weight: 4, rarity: "common" },
    { slot: "chapeau", name: "Toque du cuisinier", category: "armor", stats: { hp: 1, dodge: 1 }, weight: 4, rarity: "common" },
    { slot: "chapeau", name: "Bonnet en laine", category: "armor", stats: { hp: 4, dodge: 2 }, weight: 4, rarity: "rare" },
    { slot: "chapeau", name: "Casque de fer", category: "armor", stats: { hp: 6, def: 1 }, weight: 2, rarity: "rare" },
    { slot: "chapeau", name: "Heaume du guerrier", category: "armor", stats: { hp: 10, def: 2 }, weight: 1, rarity: "epic" },
    // Bottes
    { slot : "bottes", name: "Bottes en cuir", category: "armor", stats: { dodge: 1 }, weight: 4, rarity: "common" },
    { slot: "bottes", name: "Bottes du coursier", category: "armor", stats: { dmg: 1 }, weight: 4, rarity: "common" },
    { slot: "bottes", name: "Bottes agiles", category: "armor", stats: { dodge: 3, dmg: 1 }, weight: 2, rarity: "rare" },
    { slot: "bottes", name: "Bottes de rapidité", category: "armor", stats: { dodge: 5, speed: 10 }, weight: 1, rarity: "epic" },
    { slot: "bottes", name: "Bottes épiques", category: "armor", stats: { dodge: 7, speed: 12, dmg: 2 }, weight: 0.8, rarity: "epic" },
    { slot: "bottes", name: "Bottes légendaires", category: "armor", stats: { dodge: 8, speed: 15, dmg: 2 }, weight: 0.5, rarity: "legendary" },
    { slot: "bottes", name: "Bottes du Phoenix", category: "armor", stats: { dodge: 12, speed: 20, dmg: 3, crit: 6 }, weight: 0.2, rarity: "mythic" },
    // Anneaux
    { slot: "anneau", name: "Anneau en mousse", category: "accessory", stats: { hp: 1 }, weight: 3, rarity: "common" },
    { slot: "anneau", name: "Anneau modeste", category: "accessory", stats: { crit: 1, hp: 3 }, weight: 2, rarity: "rare" },
    { slot: "anneau", name: "Bague du coq", category: "accessory", stats: { dodge: 4, crit: 2 }, weight: 1.5, rarity: "rare" },
    { slot: "anneau", name: "Anneau de précision", category: "accessory", stats: { crit: 3, dmg: 2 }, weight: 1, rarity: "epic" },
    { slot: "anneau", name: "Anneau légendaire", category: "accessory", stats: { crit: 5, dmg: 3, hp: 8 }, weight: 0.5, rarity: "legendary" },
    { slot: "anneau", name: "Anneau du Dragon", category: "accessory", stats: { crit: 8, dmg: 5, hp: 12 }, weight: 0.2, rarity: "mythic" },
    // Plastrons
    { slot: "plastron", name: "Tunique simple", category: "armor", stats: { hp: 4 }, weight: 3, rarity: "common" },
    { slot: "plastron", name: "Cuirasse basique", category: "armor", stats: { hp: 6, def: 1 }, weight: 2, rarity: "common" },
    { slot: "plastron", name: "Plastron léger", category: "armor", stats: { hp: 8, def: 1 }, weight: 1, rarity: "rare" },
    { slot: "plastron", name: "Cuirasse solide", category: "armor", stats: { hp: 12, def: 3 }, weight: 0.8, rarity: "epic" },
    { slot: "plastron", name: "Armure lourde", category: "armor", stats: { hp: 18, def: 5 }, weight: 0.5, rarity: "legendary" },
    { slot: "plastron", name: "Armure titanesque", category: "armor", stats: { hp: 25, def: 8, crit: 4 }, weight: 0.3, rarity: "mythic" },
    // Ceintures
    { slot: "ceinture", name: "Ceinture en corde", category: "armor", stats: { hp: 2 }, weight: 4, rarity: "common" },
    { slot: "ceinture", name: "Ceinture de cuir", category: "armor", stats: { hp: 3, def: 1 }, weight: 3, rarity: "common" },
    { slot: "ceinture", name: "Ceinture renforcée", category: "armor", stats: { hp: 6, def: 2 }, weight: 2, rarity: "rare" },
    { slot: "ceinture", name: "Ceinture du combattant", category: "armor", stats: { hp: 8, def: 3 }, weight: 1.5, rarity: "rare" },
    { slot: "ceinture", name: "Ceinture de bataille", category: "armor", stats: { hp: 10, def: 5 }, weight: 1, rarity: "epic" },
    { slot: "ceinture", name: "Ceinture légendaire", category: "armor", stats: { hp: 15, def: 8 }, weight: 0.5, rarity: "legendary" },
    { slot: "ceinture", name: "Ceinture du Colosse", category: "armor", stats: { hp: 27, def: 10, dmg: 7 }, weight: 0.3, rarity: "mythic" },
    // Armes
    { slot: "arme", name: "Dague émoussée", category: "weapon", stats: { dmg: 2 }, weight: 4, rarity: "common" },
    { slot: "arme", name: "Épée courte", category: "weapon", stats: { dmg: 4 }, weight: 3, rarity: "common" },
    { slot: "arme", name: "Masse d'armes", category: "weapon", stats: { dmg: 6 }, weight: 2, rarity: "rare" },
    { slot: "arme", name: "Épée longue", category: "weapon", stats: { dmg: 8, crit: 2 }, weight: 1.5, rarity: "rare" },
    { slot: "arme", name: "Hache de bataille", category: "weapon", stats: { dmg: 12, crit: 3 }, weight: 1, rarity: "epic" },
    { slot: "arme", name: "Lame légendaire", category: "weapon", stats: { dmg: 16, crit: 5 }, weight: 0.5, rarity: "legendary" },
    { slot: "arme", name: "Excalibur", category: "weapon", stats: { dmg: 22, crit: 8, dodge: 4 }, weight: 0.2, rarity: "mythic" },
    // Familiers
    { slot: "familier", name: "Petit dragon", category: "pet", stats: { dmg: 3, hp: 5 }, weight: 1, rarity: "epic" },
    { slot: "familier", name: "Fée lumineuse", category: "pet", stats: { hp: 6, dodge: 5 }, weight: 1, rarity: "legendary" },
    { slot: "familier", name: "Phénix éternel", category: "pet", stats: { dmg: 12, hp: 20, crit: 8, dodge:1 }, weight: 0.5, rarity: "mythic" },
  ];

  const INVENTORY_MAX = 48;

  // overall chance that an enemy will drop an item at all
  const DROP_CHANCE = 0.10; // 10% chance by default

  const addToInventory = (item: Item) => {
    setInventory((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev;
      const next = [...prev, item];
      if (next.length > INVENTORY_MAX) next.shift();
      return next;
    });
  };

  // sell an item from inventory, credit player's gold by its cost
  const sellItem = (itemId: string): boolean => {
    const it = inventory.find((i) => i.id === itemId);
    if (!it) return false;
    const price = it.cost ?? computeItemCost(it.stats, it.rarity);
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
    setPlayer((p) => ({ ...p, gold: (p.gold || 0) + price }));
    return true;
  };

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

    const slotToCategory: Record<Item["slot"], Item["category"]> = {
      arme: "weapon",
      plastron: "armor",
      chapeau: "armor",
      bottes: "armor",
      ceinture: "armor",
      anneau: "accessory",
      familier: "pet",
    };

    const scaled = scaleStats(stats, rarity);
    return { id: uid(), slot, name, rarity, category: slotToCategory[slot], stats: scaled, cost: computeItemCost(scaled as Record<string, number> | undefined, rarity) };
  };

  const maybeDropFromEnemy = (enemy: Enemy): Item | null => {
    // overall roll: skip most item drops to keep loot rare
    if (Math.random() > DROP_CHANCE) return null;

    // pick template first (weighted) then determine rarity: template rarity wins, otherwise roll
    // weighted pick from ITEM_POOL (fall back to uniform if no weights)
    const totalWeight = ITEM_POOL.reduce((s, t) => s + (t.weight ?? 1), 0);
    let chosen: ItemTemplate;
    if (totalWeight <= 0) {
      chosen = ITEM_POOL[Math.floor(Math.random() * ITEM_POOL.length)];
    } else {
      let r = Math.random() * totalWeight;
      chosen = ITEM_POOL[ITEM_POOL.length - 1];
      for (const t of ITEM_POOL) {
        r -= (t.weight ?? 1);
        if (r <= 0) {
          chosen = t;
          break;
        }
      }
    }

    // determine rarity: use template rarity if present otherwise roll
    let finalRarity = chosen.rarity ?? rollRarity();
    // clamp to enemy rarity (do not allow higher-rarity drops than the enemy)
    // but allow an extremely small chance to upgrade above enemy rarity
    const RARITY_ORDER: Rarity[] = ["common", "rare", "epic", "legendary", "mythic"];
    const UPGRADE_CHANCE = 0.00001; // 0.001%
    if (finalRarity && enemy.rarity) {
      const gotIdx = RARITY_ORDER.indexOf(finalRarity);
      const enemyIdx = RARITY_ORDER.indexOf(enemy.rarity as Rarity);
      if (gotIdx > enemyIdx) {
        if (!(Math.random() < UPGRADE_CHANCE)) {
          finalRarity = enemy.rarity as Rarity;
        }
      }
    }
    if (!finalRarity) return null;


    const item: Item = {
      id: uid(),
      slot: chosen.slot,
      name: `${chosen.name} (${finalRarity})`,
      rarity: finalRarity,
      category: (chosen as any).category,
      stats: scaleStats(chosen.stats, finalRarity),
      cost: computeItemCost(scaleStats(chosen.stats, finalRarity) as Record<string, number> | undefined, finalRarity),
    };

    // spawn the item as a pickup at the enemy location (player must collect)
    const pos = clampToViewport(enemy.x, enemy.y);
    const itemPickup: Pickup = { id: uid(), kind: 'item', item, x: pos.x, y: pos.y, createdAt: Date.now() };
    setPickups((p) => [...p, itemPickup]);
    return item;
  };

  // collect a pickup (gold or item). returns true if collected
  const collectPickup = (pickupId: string): boolean => {
    try {
      if (collectedRef.current.has(pickupId)) return false;
      const pk = pickups.find((p) => p.id === pickupId);
      if (!pk) return false;
      // mark as collected immediately to avoid double-processing from fast double-clicks
      collectedRef.current.add(pickupId);
      if (pk.kind === 'gold') {
        const amount = pk.amount ?? 0;
        setPlayer((p) => ({ ...p, gold: (p.gold ?? 0) + amount }));
      } else if (pk.kind === 'item' && pk.item) {
        addToInventory(pk.item);
      }
      setPickups((prev) => prev.filter((p) => p.id !== pickupId));
      // cleanup collectedRef after short delay to avoid memory growth
      window.setTimeout(() => collectedRef.current.delete(pickupId), 3000);
      return true;
    } catch (e) {
      try { console.error('collectPickup error', e); } catch (e) {}
      return false;
    }
  };

  // spawn a gold or item pickup (used to create a single gold reward per encounter)
  const spawnGoldPickup = (amount: number, x?: number, y?: number) => {
    const safeAmount = Number((Math.round((amount || 0) * 100) / 100).toFixed(2));
    if (!safeAmount || safeAmount <= 0) return null; // do not spawn empty pickups
    const pos = clampToViewport(x, y);
    const goldPickup: Pickup = { id: uid(), kind: 'gold', amount: safeAmount, x: pos.x, y: pos.y, createdAt: Date.now() };
    setPickups((p) => [...p, goldPickup]);
    return goldPickup.id;
  };

  // scale stats by rarity multipliers (simple uniform scaling)
  const rarityMultiplier: Record<Rarity, number> = {
    common: 1,
    rare: 1.3,
    epic: 1.6,
    legendary: 2.2,
    mythic: 3.8,
  };

  const priceMultiplier: Record<Rarity, number> = {
    common: 1,
    rare: 1.6,
    epic: 2.6,
    legendary: 5,
    mythic: 12,
  };

  const computeItemCost = (stats: Record<string, number> | undefined, rarity: Rarity) => {
    const base = 10 + Object.values(stats || {}).reduce((s, v) => s + Number(v || 0), 0) * 5;
    const mult = priceMultiplier[rarity] ?? 1;
    return Math.max(1, Math.round(base * mult));
  };

  const scaleStats = (stats: Record<string, number> | undefined, rarity: Rarity) => {
    if (!stats) return undefined;
    const m = rarityMultiplier[rarity] ?? 1;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(stats)) {
      out[k] = Math.max(0, Math.round((v || 0) * m));
    }
    return out;
  };

  // Create an item from an arbitrary descriptor (useful for dev/testing or UI creation)
  const createCustomItem = (
    payload: Omit<Item, "id">,
    addToInv = true
  ): Item => {
    const stats = scaleStats(payload.stats, payload.rarity);
    const item: Item = { id: uid(), ...payload, stats, cost: computeItemCost(stats as Record<string, number> | undefined, payload.rarity) };
    if (addToInv) addToInventory(item);
    return item;
  };

  // Create item from a template name or slot with a chosen rarity
  const createItemFromTemplate = (key: string, rarity?: Rarity, addToInv = true): Item | null => {
    const lower = key.toLowerCase();
    let tmpl = ITEM_POOL.find((t) => (t.name || "").toLowerCase() === lower || (t.slot || "").toLowerCase() === lower);
    if (!tmpl) tmpl = ITEM_POOL.find((t) => (t.name || "").toLowerCase().includes(lower));
    if (!tmpl) return null;
    const finalRarity: Rarity | null = rarity ?? tmpl.rarity ?? rollRarity();
    if (!finalRarity) return null;
    const stats = scaleStats(tmpl.stats, finalRarity);
    const item: Item = {
      id: uid(),
      slot: tmpl.slot,
      name: `${tmpl.name} (${finalRarity})`,
      rarity: finalRarity,
      category: (tmpl as any).category,
      stats,
      cost: computeItemCost(stats as Record<string, number> | undefined, finalRarity),
    };
    if (addToInv) addToInventory(item);
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

    // stats are derived from `equipment` via effect; no incremental apply/remove here
    return true;
  };

  const unequipItem = (slot: Item["slot"]) => {
    try { console.log('unequipItem called', slot); } catch (e) {}
    // read current equipped
    const current = equipment[slot];
    // remove equipment entry
    setEquipment((prev) => ({ ...prev, [slot]: null }));
    // add the unequipped item back into inventory; stats are recomputed from `equipment`
    if (current) addToInventory(current);
  };

  // Helper to get the rarity of the currently equipped item in a slot
  const getEquippedRarity = (slot: Item["slot"]): Rarity | null => {
    const it = equipment[slot];
    return it ? it.rarity : null;
  };

  // Recompute derived player stats from base values + equipment whenever equipment or level changes
  useEffect(() => {
    const lvl = player.level;
    const baseMaxHp = BASE_HP + Math.floor((lvl - 1) * 4);
    const baseDmg = BASE_DMG + Math.floor((lvl - 1) * 0.2);
    const baseDef = BASE_DEF + Math.floor((lvl - 1) * 0.05);
    const baseDodge = BASE_DODGE + Math.floor((lvl - 1) * 0.03);
    const baseCrit = BASE_CRIT + Math.floor((lvl - 1) * 0.02);

    const acc: Record<string, number> = { hp: 0, dmg: 0, def: 0, dodge: 0, crit: 0 };
    for (const v of Object.values(equipment)) {
      if (!v || !v.stats) continue;
      for (const [k, val] of Object.entries(v.stats)) {
        acc[k] = (acc[k] || 0) + Number(val || 0);
      }
    }

    const newMaxHp = Math.max(1, Math.round(baseMaxHp + (acc.hp || 0)));

    setPlayer((prev) => {
      const prevMax = prev.maxHp ?? prev.hp ?? 0;
      const hpDelta = newMaxHp - prevMax;
      let newHp = prev.hp ?? prevMax;
      if (hpDelta > 0) newHp = Math.min(newMaxHp, newHp + hpDelta);
      else newHp = Math.max(0, Math.min(newMaxHp, newHp));

      return {
        ...prev,
        maxHp: newMaxHp,
        hp: newHp,
        dmg: Math.max(0, Math.round(baseDmg + (acc.dmg || 0))),
        def: Math.max(0, Math.round(baseDef + (acc.def || 0))),
        dodge: Math.max(0, Math.round(baseDodge + (acc.dodge || 0))),
        crit: Math.max(0, Math.round(baseCrit + (acc.crit || 0))),
      } as Player;
    });
  }, [equipment, player.level]);

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

  return { player, setPlayer, enemies, setEnemies, spawnEnemy, addXp, xpToNextLevel, equipment, setEquipment, inventory, setInventory, pickups, maybeDropFromEnemy, equipItem, unequipItem, createCustomItem, createItemFromTemplate, sellItem, getEquippedRarity, collectPickup, spawnGoldPickup } as const;
}

