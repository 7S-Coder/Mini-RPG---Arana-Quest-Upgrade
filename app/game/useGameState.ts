"use client";

import { useState, useEffect, useRef } from "react";
import { uid, clampToViewport } from "./utils";
import { ITEM_POOL, SLOTS, scaleStats, computeItemCost } from "./templates/items";
import { isTierAllowedOnMap } from "./templates/maps";
import { ENEMY_TEMPLATES } from "./templates/enemies";
import type { Player, Enemy, Item, Pickup, ItemTemplate, Rarity } from "./types";

// ENEMY_TEMPLATES moved to ./enemies.ts

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
    familiar: null,
    boots: null,
    belt: null,
    hat: null,
    chestplate: null,
    ring: null,
    weapon: null,
  });
  const [inventory, setInventory] = useState<Item[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  // create or reuse a shared collected-pickup ref on the global (prevents double-collect on fast clicks)
  let collectedRef: React.MutableRefObject<Set<string>>;
  try {
    const g = (globalThis as any) || {};
    if (g.__collectedPickupIds && g.__collectedPickupIds.current instanceof Set) {
      collectedRef = g.__collectedPickupIds as React.MutableRefObject<Set<string>>;
    } else {
      collectedRef = { current: new Set<string>() } as React.MutableRefObject<Set<string>>;
      try { g.__collectedPickupIds = collectedRef; } catch (e) {}
    }
  } catch (e) {
    collectedRef = { current: new Set<string>() } as React.MutableRefObject<Set<string>>;
  }

  const xpToNextLevel = (lvl: number) => Math.max(20, 100 * lvl);

  const MAX_LEVEL = 80;

  // track enemies via a ref so functions defined earlier can check combat state
  const enemiesRef = useRef<Enemy[]>([]);

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

  // item generation / loot (ITEM_POOL and SLOTS imported from ./items)

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
    // prevent selling equipment during combat (allow consumables)
    const inCombat = enemiesRef.current && enemiesRef.current.length > 0;
    if (inCombat && (it.slot as any) !== 'consumable') return false;
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
    const baseName = enemy.name ?? "Item";
    const name = `${baseName} ${slot.charAt(0).toUpperCase() + slot.slice(1)} (${rarity})`;
    const stats: Record<string, number> = {};
    // Specialized stat assignment depending on slot
    const dmgFactor: Record<Rarity, number> = { common: 0.5, rare: 0.8, epic: 1.1, legendary: 1.6, mythic: 2.5 };
    const hpFactor: Record<Rarity, number> = { common: 0.03, rare: 0.05, epic: 0.08, legendary: 0.14, mythic: 0.25 };
    const defFactor: Record<Rarity, number> = { common: 0.05, rare: 0.08, epic: 0.12, legendary: 0.18, mythic: 0.3 };
    const critFactor: Record<Rarity, number> = { common: 0.5, rare: 0.9, epic: 1.4, legendary: 2.2, mythic: 3.5 };

    switch (slot) {
      case "weapon":
        stats.dmg = Math.max(1, Math.round((enemy.dmg || 1) * dmgFactor[rarity]));
        stats.crit = Math.max(0, Math.round((enemy.crit || 0) * critFactor[rarity]));
        break;
      case "boots":
        // boots: increase damage and crit
        stats.dmg = Math.max(0, Math.round((enemy.dmg || 1) * (dmgFactor[rarity] * 0.6)));
        stats.crit = Math.max(0, Math.round((enemy.crit || 0) * (critFactor[rarity] * 0.7)));
        break;
      case "belt":
        // belt: hp and def
        stats.hp = Math.max(1, Math.round((enemy.hp || 1) * hpFactor[rarity] * 1.2));
        stats.def = Math.max(0, Math.round((enemy.def || 0) * (defFactor[rarity] * 1.5)));
        break;
      case "chestplate":
        // chest: primarily HP (tank)
        stats.hp = Math.max(1, Math.round((enemy.hp || 1) * hpFactor[rarity]));
        stats.def = Math.max(0, Math.round((enemy.def || 0) * defFactor[rarity]));
        break;
      case "hat":
        // hat: crit and dodge
        stats.crit = Math.max(0, Math.round((enemy.crit || 0) * (critFactor[rarity] * 0.8)));
        stats.dodge = Math.max(0, Math.round(((enemy.dodge || 0) * (rarity === "mythic" ? 1.5 : 0.6)))) ;
        break;
      case "ring":
        // ring: small mixed bonus (hp + crit)
        stats.hp = Math.max(0, Math.round((enemy.hp || 0) * (hpFactor[rarity] * 0.6)));
        stats.crit = Math.max(0, Math.round((enemy.crit || 0) * (critFactor[rarity] * 0.6)));
        break;
      case "familiar":
        // familiars: small damage and HP
        stats.dmg = Math.max(0, Math.round((enemy.dmg || 1) * (dmgFactor[rarity] * 0.35)));
        stats.hp = Math.max(0, Math.round((enemy.hp || 1) * (hpFactor[rarity] * 0.6)));
        break;
      default:
        break;
    }

    const slotToCategory: Record<Item["slot"], Item["category"]> = {
      weapon: "weapon",
      chestplate: "armor",
      hat: "armor",
      boots: "armor",
      belt: "armor",
      ring: "accessory",
      familiar: "pet",
    };

    const scaled = scaleStats(stats, rarity);
    return { id: uid(), slot, name, rarity, category: slotToCategory[slot], stats: scaled, cost: computeItemCost(scaled as Record<string, number> | undefined, rarity) };
  };

  const maybeDropFromEnemy = (enemy: Enemy, mapId?: string | null): Item | null => {
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

    // Enforce map allowed tiers: if the map disallows this rarity, degrade to the highest allowed lower rarity
    try {
      const order = RARITY_ORDER;
      let idx = order.indexOf(finalRarity);
      while (idx >= 0 && !isTierAllowedOnMap(mapId, order[idx])) {
        idx -= 1; // step down rarity
      }
      if (idx < 0) return null;
      finalRarity = order[idx];
    } catch (e) {}


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
      // if we're in combat, disallow picking up equipment items (but allow gold and consumables)
      const inCombat = enemiesRef.current && enemiesRef.current.length > 0;
      if (inCombat && pk.kind === 'item' && pk.item && (pk.item.slot as any) !== 'consumable') {
        // do not collect equipment while in combat
        return false;
      }
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

  // scale and pricing helpers imported from ./items

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

  // Buy a potion from the store. types: small(20), medium(50), large(100)
  const buyPotion = (type: 'small' | 'medium' | 'large'): boolean => {
    const costs: Record<string, number> = { small: 5, medium: 12, large: 25 };
    const heals: Record<string, number> = { small: 20, medium: 50, large: 100 };
    const cost = costs[type] ?? 5;
    const heal = heals[type] ?? 20;
    const currentGold = Number((player.gold ?? 0));
    if (currentGold < cost) {
      return false;
    }
    // deduct immediately based on snapshot
    setPlayer((p) => ({ ...p, gold: +(((p.gold ?? 0) - cost).toFixed(2)) } as any));
    // create consumable item and add to inventory
    const itm: Item = {
      id: uid(),
      slot: 'consumable' as any,
      name: `${type === 'small' ? 'Small potion' : type === 'medium' ? 'Medium potion' : 'Large potion'} (+${heal} HP)`,
      rarity: 'common',
      category: 'consumable' as any,
      stats: { heal },
      cost,
    };
    addToInventory(itm);
    return true;
  };

  // consume a consumable item (by id) and apply its heal; returns true if applied
  const consumeItem = (itemId: string): boolean => {
    const it = inventory.find((i) => i.id === itemId);
    if (!it) return false;
    if ((it as any).category !== 'consumable') return false;
    const heal = Number((it.stats && (it.stats as any).heal) || 0);
    if (!heal) return false;
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
    setPlayer((p) => ({ ...p, hp: Math.min((p.maxHp ?? p.hp), (p.hp ?? 0) + heal) }));
    return true;
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

  // Forge: combine three identical common items into one rare item with two stats boosted (+2)
  const forgeThreeIdentical = (sampleItemId: string): { ok: boolean; msg: string } => {
    try {
      const sample = inventory.find((i) => i.id === sampleItemId);
      if (!sample) return { ok: false, msg: 'Item not found in inventory' };
      if (sample.rarity !== 'common') return { ok: false, msg: 'Only common items can be forged' };
      // find identical items by name and slot and rarity
      const matches = inventory.filter((i) => i.name === sample.name && i.slot === sample.slot && i.rarity === 'common');
      if (matches.length < 3) return { ok: false, msg: 'Not enough identical common items (need 3)' };

      // remove three matching items (first three occurrences)
      const idsToRemove = matches.slice(0, 3).map((i) => i.id);
      setInventory((prev) => prev.filter((i) => !idsToRemove.includes(i.id)));

      // build forged item: base off sample, upgrade rarity to rare and boost two stats by +2
      const baseStats = { ...(sample.stats || {}) } as Record<string, number>;
      const statKeys = Object.keys(baseStats).filter((k) => typeof baseStats[k] === 'number');
      const boosted: Record<string, number> = { ...baseStats };
      // ensure we have at least two stats to boost
      let chosen: string[] = [];
      if (statKeys.length >= 2) {
        // pick two distinct random keys
        while (chosen.length < 2) {
          const k = statKeys[Math.floor(Math.random() * statKeys.length)];
          if (!chosen.includes(k)) chosen.push(k);
        }
      } else if (statKeys.length === 1) {
        chosen = [statKeys[0], statKeys[0]];
      } else {
        // fallback: add hp and dmg
        if (!('hp' in boosted)) boosted.hp = 0;
        if (!('dmg' in boosted)) boosted.dmg = 0;
        chosen = ['hp', 'dmg'];
      }
      // apply +2 to the chosen stats
      for (const k of chosen) {
        boosted[k] = (boosted[k] || 0) + 2;
      }

      const forgedName = `${sample.name} (Forged)`;
      const forgedPayload: Omit<Item, 'id'> = {
        slot: sample.slot,
        name: forgedName,
        rarity: 'rare',
        category: sample.category,
        stats: boosted,
        cost: sample.cost ?? computeItemCost(boosted as Record<string, number> | undefined, 'rare'),
      } as any;

      // create and add to inventory
      createCustomItem(forgedPayload, true);
      return { ok: true, msg: `Forge successful: created ${forgedName}` };
    } catch (e) {
      console.error('forge error', e);
      return { ok: false, msg: 'Forge failed due to error' };
    }
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
    // prevent equipping during combat
    if (enemiesRef.current && enemiesRef.current.length > 0) {
      try { console.warn('equipItem blocked during combat'); } catch (e) {}
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
    // force-save shortly after to avoid race with state flush
    try { window.setTimeout(() => { try { const fn = (window as any).__arenaquest_save_game; if (typeof fn === 'function') fn(); } catch (e) {} }, 50); } catch (e) {}
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
    // ensure save occurs after state updates
    try { window.setTimeout(() => { try { const fn = (window as any).__arenaquest_save_game; if (typeof fn === 'function') fn(); } catch (e) {} }, 50); } catch (e) {}
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

  // keep enemiesRef in sync with state so other helpers can check combat state
  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);

  const spawnEnemy = (templateOverride?: string, levelOverride?: number) => {
    // pick a template (optionally by templateId)
    let template = undefined as any;
    if (templateOverride) {
      template = ENEMY_TEMPLATES.find((t) => t.templateId === templateOverride);
      try { console.log('[DEBUG] spawnEnemy - templateOverride provided', { templateOverride, resolved: template && template.templateId }); } catch (e) {}
    }
    if (!template) {
      template = ENEMY_TEMPLATES[Math.floor(Math.random() * ENEMY_TEMPLATES.length)];
      try { console.log('[DEBUG] spawnEnemy - fallback random template', { chosen: template.templateId }); } catch (e) {}
    }

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
      templateId: template.templateId,
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

  // --- Save / Load (localStorage persistence) ---------------------------------
  const SAVE_KEY = "arenaquest_save";

  const pickPlayerData = (p: Player) => ({
    x: p.x,
    y: p.y,
    hp: p.hp,
    maxHp: p.maxHp,
    level: p.level,
    xp: p.xp,
    dmg: p.dmg,
    dodge: p.dodge,
    crit: p.crit,
    def: p.def,
    speed: p.speed,
    gold: p.gold,
  });

  const saveGame = (extra: Record<string, any> | null = null) => {
    try {
      const save = {
        version: 1,
        player: pickPlayerData(player),
        inventory: inventory || [],
        equipment: equipment || {},
        pickups: pickups || [],
        timestamp: Date.now(),
        ...(extra || {}),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
      return true;
    } catch (e) {
      try { console.error('saveGame error', e); } catch (e) {}
      return false;
    }
  };

  // expose save function to global so other local actions can force-save after state updates
  try { (window as any).__arenaquest_save_game = saveGame; } catch (e) {}

  const migrateSave = (save: any) => {
    // placeholder for migration logic when save.version changes
    // currently only version 1 exists so we do nothing
    return save;
  };

  const loadGame = () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const save = JSON.parse(raw);
      if (save.version !== 1) {
        migrateSave(save);
      }

      if (save.player) {
        setPlayer((p) => ({ ...p, ...save.player } as Player));
      }
      if (Array.isArray(save.inventory)) {
        // when loading inventory, we'll apply it but remove any items that are currently equipped
        const inv = save.inventory as any[];
        // collect ids from equipment in the save
        const equippedIds = new Set<string>();
        if (save.equipment && typeof save.equipment === 'object') {
          for (const k of Object.keys(save.equipment)) {
            const it = (save.equipment as any)[k];
            if (it && it.id) equippedIds.add(it.id);
          }
        }
        // filter inventory to avoid duplicates of equipped items
        setInventory(inv.filter((i) => !equippedIds.has(i.id)));
      }
      if (save.equipment && typeof save.equipment === 'object') {
        // merge loaded equipment into the default shape to avoid losing empty slots
        setEquipment((prev) => ({ ...prev, ...(save.equipment as any) }));
      }
      if (Array.isArray(save.pickups)) setPickups(save.pickups as any[]);
      return save;
    } catch (e) {
      try { console.error('loadGame error', e); } catch (e) {}
      return null;
    }
  };

  // Auto-load once on mount
  useEffect(() => {
    try {
      const s = loadGame();
      if (s) {
        try { console.log('[SAVE] loaded save from localStorage'); } catch (e) {}
      }
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave on important state changes (debounced)
  useEffect(() => {
    const t = window.setTimeout(() => {
      try { saveGame(); } catch (e) {}
    }, 800);
    return () => window.clearTimeout(t);
  }, [player, inventory, equipment, pickups]);

  const isInCombat = () => (enemiesRef.current && enemiesRef.current.length > 0);

  return { player, setPlayer, enemies, setEnemies, spawnEnemy, addXp, xpToNextLevel, equipment, setEquipment, inventory, setInventory, pickups, maybeDropFromEnemy, equipItem, unequipItem, createCustomItem, createItemFromTemplate, sellItem, getEquippedRarity, collectPickup, spawnGoldPickup, buyPotion, consumeItem, forgeThreeIdentical, saveGame, loadGame, isInCombat } as const;
}

