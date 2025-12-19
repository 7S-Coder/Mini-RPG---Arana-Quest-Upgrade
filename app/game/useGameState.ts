"use client";

import { useState, useEffect, useRef } from "react";
import { uid, clampToViewport } from "./utils";
import { ITEM_POOL, SLOTS, scaleStats, computeItemCost } from "./templates/items";
import { isTierAllowedOnMap, getMapById } from "./templates/maps";
import { ENEMY_TEMPLATES } from "./templates/enemies";
import {
  getLootConfigForMap,
  rollFromLootTable,
  getDropChanceForMap,
  LOOT_RARITY_ORDER,
} from "./templates/lootTables";
import type { Player, Enemy, Item, Pickup, ItemTemplate, Rarity } from "./types";
import useStatistics from "../hooks/useStatistics";
import useProgression from "../hooks/useProgression";

// ENEMY_TEMPLATES moved to ./enemies.ts

export function useGameState() {
  const { stats, record } = useStatistics();
  const { progression, addPoints, allocate, deallocate, reset } = useProgression();
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
    // player starts with 'common' tier unlocked for drops/forge
    unlockedTiers: ['common'],
  });

  // ref to hold latest player for synchronous checks
  const playerRef = useRef<Player>(player);
  useEffect(() => { playerRef.current = player; }, [player]);
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
    const cur = playerRef.current || player;
    try { console.log('[useGameState:core] addXp called ->', amount, 'curLevel', cur.level, 'curXp', cur.xp, 'need', xpToNextLevel(cur.level)); } catch (e) {}
    if (cur.level >= MAX_LEVEL) return;

    let totalXp = (cur.xp || 0) + amount;
    let lvl = cur.level || 1;
    let gained = 0;

    while (lvl < MAX_LEVEL && totalXp >= xpToNextLevel(lvl)) {
      totalXp -= xpToNextLevel(lvl);
      lvl += 1;
      gained += 1;
    }

    if (gained > 0) {
      // recalc stats from base and new level (updated growth rates)
      const newMaxHp = BASE_HP + Math.floor((lvl - 1) * 2);
      const newDmg = BASE_DMG + Math.floor((lvl - 1) / 10);
      const newDef = BASE_DEF + Math.floor((lvl - 1) / 30);
      const newDodge = BASE_DODGE + Math.floor((lvl - 1) * 0.03);
      const newCrit = BASE_CRIT + Math.floor((lvl - 1) * 0.02);

      const nextPlayer: Player = {
        ...cur,
        xp: totalXp,
        level: lvl,
        maxHp: newMaxHp,
        dmg: newDmg,
        def: newDef,
        dodge: newDodge,
        crit: newCrit,
        lastLevelUpAt: Date.now(),
        hp: newMaxHp, // restore to max on level up
      } as Player;

      // update ref synchronously so other rapid addXp calls see the new state
      try { playerRef.current = nextPlayer; } catch (e) {}
      setPlayer(nextPlayer);
      try { console.log('[useGameState:core] level gained ->', gained, 'awarding', gained * 5, 'points'); } catch (e) {}
      try { addPoints && addPoints(gained * 5); } catch (e) {}
      try { record && (record as any).levelUp && (record as any).levelUp(gained); } catch (e) {}
    } else {
      // no level gained, just update xp
      const next = { ...(cur || {}), xp: totalXp } as Player;
      try { playerRef.current = next; } catch (e) {}
      setPlayer((p) => ({ ...p, xp: totalXp }));
    }
  };

  // item generation / loot (ITEM_POOL and SLOTS imported from ./items)

  const INVENTORY_MAX = 48;

  // overall chance that an enemy will drop an item at all
  // NOTE: This is now map-specific, handled per-map configuration
  const getDropChance = (mapId?: string | null): number => {
    return getDropChanceForMap(mapId || undefined);
  };

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
    const nextInventory = inventory.filter((i) => i.id !== itemId);
    const nextPlayer = { ...player, gold: (player.gold || 0) + price } as Player;
    setInventory(nextInventory);
    setPlayer(nextPlayer);
    try { record.goldEarned && record.goldEarned(price); } catch (e) {}
    try { saveCoreGame({ player: pickPlayerData(nextPlayer), inventory: nextInventory, equipment }, 'sell_item'); } catch (e) {}
    return true;
  };

  const rollRarity = (): Rarity | null => {
    // Legacy fallback — use old probabilities if no map context
    const r = Math.random() * 100;
    if (r < 0.1) return "mythic";
    if (r < 1.1) return "legendary";
    if (r < 6.1) return "epic";
    if (r < 16.1) return "rare";
    if (r < 46.1) return "uncommon";
    if (r < 66.1) return "common";
    return null;
  };

  const createItemForEnemy = (enemy: Enemy, rarity: Rarity): Item => {
    const slot = SLOTS[Math.floor(Math.random() * SLOTS.length)];
    const baseName = enemy.name ?? "Item";
    const name = `${baseName} ${slot.charAt(0).toUpperCase() + slot.slice(1)} (${rarity})`;
    const stats: Record<string, number> = {};
    // Specialized stat assignment depending on slot
    const dmgFactor: Record<Rarity, number> = { common: 0.5, uncommon: 0.65, rare: 0.8, epic: 1.1, legendary: 1.6, mythic: 2.5 };
    const hpFactor: Record<Rarity, number> = { common: 0.03, uncommon: 0.04, rare: 0.05, epic: 0.08, legendary: 0.14, mythic: 0.25 };
    const defFactor: Record<Rarity, number> = { common: 0.05, uncommon: 0.065, rare: 0.08, epic: 0.12, legendary: 0.18, mythic: 0.3 };
    const critFactor: Record<Rarity, number> = { common: 0.5, uncommon: 0.7, rare: 0.9, epic: 1.4, legendary: 2.2, mythic: 3.5 };

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

  const maybeDropFromEnemy = (enemy: Enemy, mapId?: string | null, isBoss?: boolean, isDungeonRoom?: boolean): Item | null => {
    // Check drop chance (map-specific)
    const dropChance = getDropChance(mapId);
    if (Math.random() > dropChance) return null;

    // Determine which loot table to use
    const lootConfig = getLootConfigForMap(mapId || undefined);
    let selectedTable = lootConfig.trashLootTable;
    let allowedRarities = lootConfig.allowedRarities;

    if (isBoss && lootConfig.bossLootTable) {
      selectedTable = lootConfig.bossLootTable;
      allowedRarities = Object.keys(selectedTable) as Rarity[];
    } else if (isDungeonRoom && lootConfig.dungeonLootTable) {
      selectedTable = lootConfig.dungeonLootTable;
      allowedRarities = Object.keys(selectedTable) as Rarity[];
    }

    // Roll rarity from the selected table
    let finalRarity = rollFromLootTable(selectedTable);
    if (!finalRarity) {
      finalRarity = lootConfig.allowedRarities[0] || 'common';
    }

    try {
      console.debug('[DROP] rolled rarity', {
        mapId,
        isBoss,
        isDungeonRoom,
        selectedTable: selectedTable,
        rolled: finalRarity,
        enemyRarity: enemy.rarity,
      });
    } catch (e) {}

    // CRITICAL RULE: Mythics never drop from trash (common enemies)
    if (finalRarity === 'mythic' && enemy.rarity === 'common') {
      finalRarity = 'legendary';
      try {
        console.debug('[DROP] Downgraded mythic to legendary (mythic never drops from common trash)');
      } catch (e) {}
    }

    // Clamp rarity to max allowed on this map
    const rarityOrder = LOOT_RARITY_ORDER;
    const maxIdx = rarityOrder.indexOf(lootConfig.maxRarity);
    const currentIdx = rarityOrder.indexOf(finalRarity);

    if (currentIdx > maxIdx) {
      finalRarity = lootConfig.maxRarity;
      try {
        console.debug('[DROP] Clamped to map max rarity', { mapId, finalRarity });
      } catch (e) {}
    }

    // Clamp to allowed rarities on this map
    if (!allowedRarities.includes(finalRarity)) {
      // Find the closest lower rarity that is allowed
      let idx = rarityOrder.indexOf(finalRarity);
      while (idx >= 0 && !allowedRarities.includes(rarityOrder[idx])) {
        idx--;
      }
      if (idx < 0) {
        // No allowed rarity found, cancel drop
        try {
          console.debug('[DROP] No allowed rarity, cancelling drop', { mapId, finalRarity });
        } catch (e) {}
        return null;
      }
      finalRarity = rarityOrder[idx];
    }

    // Pick template first (weighted)
    const poolForPick = !mapId ? ITEM_POOL.filter((t) => (t.rarity ?? 'common') === 'common') : ITEM_POOL;
    const totalWeight = poolForPick.reduce((s, t) => s + (t.weight ?? 1), 0);
    let chosen: ItemTemplate;

    if (totalWeight <= 0) {
      chosen = poolForPick[Math.floor(Math.random() * poolForPick.length)];
    } else {
      let r = Math.random() * totalWeight;
      chosen = poolForPick[poolForPick.length - 1];
      for (const t of poolForPick) {
        r -= (t.weight ?? 1);
        if (r <= 0) {
          chosen = t;
          break;
        }
      }
    }

    const item: Item = {
      id: uid(),
      slot: chosen.slot,
      name: `${chosen.name} (${finalRarity})`,
      rarity: finalRarity,
      category: (chosen as any).category,
      stats: scaleStats(chosen.stats, finalRarity),
      cost: computeItemCost(scaleStats(chosen.stats, finalRarity) as Record<string, number> | undefined, finalRarity),
    };

    // Spawn the item as a pickup at the enemy location (player must collect)
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
        const nextPlayer = { ...player, gold: (player.gold ?? 0) + amount } as Player;
        setPlayer(nextPlayer);
        setPickups((prev) => prev.filter((p) => p.id !== pickupId));
          try { record.goldEarned && record.goldEarned(amount); } catch (e) {}
          try { saveCoreGame({ player: pickPlayerData(nextPlayer), inventory, equipment }, 'collect_gold'); } catch (e) {}
      } else if (pk.kind === 'item' && pk.item) {
        if (!inventory.find((i) => i.id === pk.item!.id)) {
          const next = [...inventory, pk.item];
          if (next.length > INVENTORY_MAX) next.shift();
          setInventory(next);
          setPickups((prev) => prev.filter((p) => p.id !== pickupId));
          try { saveCoreGame({ player: pickPlayerData(player), inventory: next, equipment }, 'collect_item'); } catch (e) {}
        } else {
          setPickups((prev) => prev.filter((p) => p.id !== pickupId));
        }
      }
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
    // snapshot next player and inventory to ensure save persists immediately
    const nextPlayer = { ...player, gold: +((Number(player.gold ?? 0) - cost).toFixed(2)) } as Player;
    const label = (type === 'small' ? 'Small potion' : type === 'medium' ? 'Medium potion' : 'Large potion');
    const potionName = `${label} (+${heal} HP)`;

    const nextInventory = (() => {
      const existingPotion = inventory.find((i) => i.name === potionName && (i.slot === 'consumable' || i.category === 'consumable'));
      if (existingPotion) {
        // Stack: increment quantity
        return inventory.map((i) => 
          i.id === existingPotion.id 
            ? { ...i, quantity: (i.quantity ?? 1) + 1 }
            : i
        );
      } else {
        // New potion: add with quantity 1
        const itm: Item = {
          id: uid(),
          slot: 'consumable' as any,
          name: potionName,
          rarity: 'common',
          category: 'consumable' as any,
          stats: { heal },
          cost,
          quantity: 1,
        };
        const next = [...inventory, itm];
        if (next.length > INVENTORY_MAX) next.shift();
        return next;
      }
    })();
    setPlayer(nextPlayer);
    setInventory(nextInventory);
    try { saveCoreGame({ player: pickPlayerData(nextPlayer), inventory: nextInventory, equipment }, 'forge'); } catch (e) {}
    return true;
  };

  // Tier unlock costs (purchaseable or granted by events)
  const TIER_UNLOCK_COSTS: Record<Rarity, number> = {
    rare: 100,
    epic: 500,
    legendary: 2000,
    mythic: 10000,
    common: 0
  };

  // Unlock a tier for the player (deducts gold). Returns a result object with message.
  const unlockTier = (tier: Rarity): { ok: boolean; msg: string } => {
    try {
      if (tier === 'common') return { ok: false, msg: 'Common tier is always available' };
      const already = player.unlockedTiers && player.unlockedTiers.includes(tier);
      if (already) return { ok: false, msg: `${tier} already unlocked` };
      const cost = TIER_UNLOCK_COSTS[tier] ?? 0;
      const currentGold = Number(player.gold ?? 0);
      if (currentGold < cost) return { ok: false, msg: `Not enough gold to unlock ${tier} (cost: ${cost} g)` };
      setPlayer((p) => ({ ...p, gold: +(((p.gold ?? 0) - cost).toFixed(2)), unlockedTiers: [...(p.unlockedTiers ?? ['common']), tier] }));
      return { ok: true, msg: `Unlocked tier: ${tier}` };
    } catch (e) {
      try { console.error('unlockTier error', e); } catch (e) {}
      return { ok: false, msg: 'Unable to unlock tier due to error' };
    }
  };

  // Convenience wrapper to attempt purchase/unlock (same behavior for now)
  const purchaseUnlockTier = (tier: Rarity) => unlockTier(tier);



  // consume a consumable item (by id) and apply its heal; returns true if applied
  const consumeItem = (itemId: string): boolean => {
    const it = inventory.find((i) => i.id === itemId);
    if (!it) return false;
    if ((it as any).category !== 'consumable') return false;
    const heal = Number((it.stats && (it.stats as any).heal) || 0);
    if (!heal) return false;
    const nextInventory = inventory.filter((i) => i.id !== itemId);
    const nextPlayer = { ...player, hp: Math.min((player.maxHp ?? player.hp), (player.hp ?? 0) + heal) } as Player;
    setInventory(nextInventory);
    setPlayer(nextPlayer);
    try { saveCoreGame({ player: pickPlayerData(nextPlayer), inventory: nextInventory, equipment }, 'equip_or_unequip'); } catch (e) {}
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

      // Generalized forging: 3 of same rarity -> next higher rarity (common->rare->epic->legendary->mythic)
      const RARITY_ORDER: Rarity[] = ["common", "rare", "epic", "legendary", "mythic"];
      const curIdx = RARITY_ORDER.indexOf(sample.rarity as Rarity);
      if (curIdx === -1) return { ok: false, msg: 'Invalid item rarity' };
      if (curIdx >= RARITY_ORDER.length - 1) return { ok: false, msg: 'This item cannot be forged to a higher rarity' };
      const targetRarity = RARITY_ORDER[curIdx + 1];
      // gating: ensure player has unlocked the target tier
      if (!(player.unlockedTiers && player.unlockedTiers.includes(targetRarity))) {
        return { ok: false, msg: `Forge locked: unlock the ${targetRarity} tier before crafting.` };
      }

      // build forged item: base off sample, upgrade rarity to target and boost two stats by +2
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
        rarity: targetRarity,
        category: sample.category,
        stats: boosted,
        cost: sample.cost ?? computeItemCost(boosted as Record<string, number> | undefined, targetRarity),
      } as any;

      // create forged item without auto-adding, then update inventory snapshot
      const forgedItem = createCustomItem(forgedPayload, false);
      const nextInventory = (() => {
        const without = inventory.filter((i) => !idsToRemove.includes(i.id));
        const next = [...without, forgedItem];
        if (next.length > INVENTORY_MAX) next.shift();
        return next;
      })();
      setInventory(nextInventory);
      try { saveCoreGame({ player: pickPlayerData(player), inventory: nextInventory, equipment }, 'consume_item'); } catch (e) {}
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

    // include allocated progression bonuses
    try {
      const alloc = progression && (progression as any).allocated ? (progression as any).allocated : { hp: 0, dmg: 0, def: 0, crit: 0, dodge: 0 };
      acc.hp = (acc.hp || 0) + (alloc.hp || 0) * 5;
      acc.dmg = (acc.dmg || 0) + (alloc.dmg || 0) * 1;
      acc.def = (acc.def || 0) + (alloc.def || 0) * 1;
      acc.crit = (acc.crit || 0) + (alloc.crit || 0) * 0.5;
      acc.dodge = (acc.dodge || 0) + (alloc.dodge || 0) * 0.5;
    } catch (e) {}

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
        dodge: Math.max(0, Number((baseDodge + (acc.dodge || 0)).toFixed(2))),
        crit: Math.max(0, Number((baseCrit + (acc.crit || 0)).toFixed(2))),
      } as Player;
    });
  }, [equipment, player.level, progression]);

  const [enemies, setEnemies] = useState<Enemy[]>([]);

  // keep enemiesRef in sync with state so other helpers can check combat state
  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);

  const spawnEnemy = (templateOverride?: string, levelOverride?: number, meta?: { isBoss?: boolean; roomId?: string }) => {
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
      isBoss: meta?.isBoss,
      roomId: meta?.roomId,
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
  const CORE_SAVE_KEY = "arenaquest_core_v1";
  const RUNTIME_SAVE_KEY = "arenaquest_runtime_v1";
  const STATS_SAVE_KEY = "arenaquest_stats_v1";

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
    unlockedTiers: p.unlockedTiers,
  });

  const buildCoreSave = (extra: Record<string, any> | null = null) => ({
    version: 1,
    player: pickPlayerData(player),
    inventory: inventory || [],
    equipment: equipment || {},
    // progression fields (map/dungeon) can be added here when available
    timestamp: Date.now(),
    ...(extra || {}),
  });

  const saveCoreGame = (extra: Record<string, any> | null = null, reason?: string) => {
    try {
      const payload = buildCoreSave(extra);
      try { console.debug('[SAVE CORE]', reason || 'manual', { key: CORE_SAVE_KEY, payload }); } catch (e) {}
      localStorage.setItem(CORE_SAVE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      try { console.error('saveCoreGame error', e); } catch (e) {}
      return false;
    }
  };

  // expose core save function to global so other local actions can force-save after state updates
  try { (window as any).__arenaquest_save_game = saveCoreGame; } catch (e) {}

  const migrateSave = (save: any) => {
    // placeholder for migration logic when save.version changes
    // currently only version 1 exists so we do nothing
    return save;
  };

  const loadGame = () => {
    try {
      const raw = localStorage.getItem(CORE_SAVE_KEY);
      try { console.debug('[LOAD] raw from localStorage', { key: CORE_SAVE_KEY, raw }); } catch (e) {}
      if (!raw) return null;
      const save = JSON.parse(raw);
      try { console.debug('[LOAD] parsed save', save); } catch (e) {}
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

  const isInCombat = () => (enemiesRef.current && enemiesRef.current.length > 0);

  return { player, setPlayer, enemies, setEnemies, spawnEnemy, addXp, xpToNextLevel, equipment, setEquipment, inventory, setInventory, pickups, maybeDropFromEnemy, equipItem, unequipItem, createCustomItem, createItemFromTemplate, sellItem, getEquippedRarity, collectPickup, spawnGoldPickup, buyPotion, consumeItem, forgeThreeIdentical, unlockTier, purchaseUnlockTier, saveCoreGame, loadGame, isInCombat, progression, allocate: allocate, deallocate: deallocate } as const;
}

