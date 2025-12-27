"use client";

import EssenceSVG from "@/app/assets/essence.svg";
import { useGameState } from "./uses/useGameState";
import { useGameLoop } from "./uses/useGameLoop";
import Player from "../components/Player";
import ArenaPanel from "../components/arena/ArenaPanel";
import RightSidebar from "../components/RightSidebar";
import InventoryModal from "../components/modales/InventoryModal";
import Modal from "../components/modales/Modal";
import StoreModal from "../components/modales/StoreModal";
import type { Rarity, Player as PlayerType } from "@/app/game/types";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import useCombat from "./uses/useCombat";
import EffectsLayer from "../components/EffectsLayer";
import BestiaryModal from "../components/modales/BestiaryModal";
import MapsModal from "../components/modales/MapsModal";
import CatalogModal from "../components/modales/CatalogModal";
import DialogueModal from "../components/modales/DialogueModal";
import { getMaps, pickEnemyFromMap, pickEnemyFromRoom, getRoomsForMap } from "./templates/maps";
import { ENEMY_TEMPLATES } from "./templates/enemies";
import { calcDamage } from "./damage";
import { useLogs } from "../hooks/useLogs";
import { useToasts } from "../hooks/useToasts";
import { useDungeon } from "../hooks/useDungeon";
import { useNarration } from "../hooks/useNarration";
import { getMapNarration, getCombatNarration, TUTORIAL_MESSAGES } from "./templates/narration";

export default function Game() {
  const { player, setPlayer, enemies, setEnemies, spawnEnemy, addXp, maybeDropFromEnemy, equipment, setEquipment, inventory, setInventory, equipItem, unequipItem, sellItem, spawnGoldPickup, addEssence, maybeDropEssenceFromEnemy, pickups, collectPickup, collectAllPickups, buyPotion, consumeItem, createCustomItem, createItemFromTemplate, forgeThreeIdentical, upgradeStat, lockStat, infuseItem, mythicEvolution, progression, allocate, deallocate, saveCoreGame, consecWins, incConsecWins, resetConsecWins } = useGameState();

  // streak per map (instead of global streak)
  const [mapStreaks, setMapStreaks] = useState<Record<string, number>>({});

  // Turn modifiers (debuffs from previous action)
  const [nextTurnModifier, setNextTurnModifier] = useState<{ skipped?: boolean; defenseDebuff?: boolean } | null>(null);

  // Attack cooldowns (2 turns for Safe/Risky, independent)
  const [safeCooldown, setSafeCooldown] = useState<number>(0);
  const [riskyCooldown, setRiskyCooldown] = useState<number>(0);

  // helper: convert hex color to rgba with provided alpha
  const hexToRgba = (hex: string, alpha = 1) => {
    try {
      const h = hex.replace('#', '');
      const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
      return hex;
    }
  };

  // modal system (generalized)
  const [modalName, setModalName] = useState<string | null>(null);
  const [modalProps, setModalProps] = useState<any>(null);
  const openModal = useCallback((name: string, props?: any) => {
    // compute final props (apply defaults for inventory modal)
    const resolved = name === "inventory" ? (props ?? { inventory, equipment, player, progression, allocate, deallocate }) : (props ?? null);
    // debug log to help verify clicks and show resolved props
    try { 

    } catch (e) {}
    setModalName(name);
    setModalProps(resolved);
  }, [inventory, equipment, player, progression, allocate, deallocate]);

  const closeModal = useCallback(() => { setModalName(null); setModalProps(null); }, []);

  // Keyboard shortcuts for modals
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      try {
        const active = document.activeElement as HTMLElement | null;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as any).isContentEditable)) return;
        
        if (e.ctrlKey || e.metaKey) {
          const key = e.key.toLowerCase();
          
          if (key === 'i') {
            e.preventDefault();
            if (modalName === 'inventory') closeModal();
            else openModal('inventory');
          } else if (key === 'b') {
            e.preventDefault();
            if (modalName === 'bestiary') closeModal();
            else openModal('bestiary');
          } else if (key === 's') {
            e.preventDefault();
            if (modalName === 'store') closeModal();
            else openModal('store');
          } else if (key === 'm') {
            e.preventDefault();
            if (modalName === 'maps') closeModal();
            else openModal('maps');
          } else if (key === 'c') {
            e.preventDefault();
            if (modalName === 'catalog') closeModal();
            else openModal('catalog');
          }
        }
      } catch (err) {}
    };
    window.addEventListener('keydown', handler as any);
    return () => window.removeEventListener('keydown', handler as any);
  }, [openModal, closeModal, modalName]);

  // uid helper to avoid duplicate keys across fast calls / HMR
  const uid = () => {
    try {
      // @ts-ignore
      if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
        // @ts-ignore
        return (crypto as any).randomUUID();
      }
    } catch (e) {}
    return `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  };

  useGameLoop((delta: number) => {
    const seconds = delta / 1000;
    setPlayer((p) => {
      let updated = { ...p, x: p.x + p.speed * seconds };
      
      // Out-of-combat regeneration
      if (!inCombatRef.current && (p.regen ?? 0) > 0) {
        const hpRegen = (p.regen ?? 0) * seconds;
        const newHp = p.hp + hpRegen;
        // Ensure hp never exceeds maxHp
        updated.hp = Math.min(p.maxHp ?? p.hp, newHp);
      }
      
      return updated;
    });
    setEnemies((prev) => prev.map((e) => ({ ...e, x: e.x - e.speed * seconds })));
  });

    const [inCombat, setInCombat] = useState(false);
      const inCombatRef = useRef<boolean>(false);
      const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [effects, setEffects] = useState<Array<{ id: string; type: string; text?: string; kind?: string; target?: string; x?: number; y?: number }>>([]);
  const logClearRef = useRef<number | null>(null);
  const encounterCountRef = useRef<number>(0);
  const encounterSessionRef = useRef<number>(0);
  const lastEncounterKeyRef = useRef<string | null>(null);
  const lastEncounterTimestampRef = useRef<number>(0);
  const consecWinsRef = useRef<number | undefined>(consecWins);
  useEffect(() => { consecWinsRef.current = consecWins; }, [consecWins]);
  const startEncounterRef = useRef<() => void>(() => {});

  // helpers for per-map streak management
  const getMapStreak = (mapId: string | null) => mapId ? (mapStreaks[mapId] ?? 0) : 0;
  const incMapStreak = (mapId: string | null) => {
    if (!mapId) return;
    setMapStreaks((prev) => ({ ...prev, [mapId]: (prev[mapId] ?? 0) + 1 }));
  };
  const resetMapStreak = (mapId: string | null) => {
    if (!mapId) return;
    setMapStreaks((prev) => ({ ...prev, [mapId]: 0 }));
  };

  // useLogs hook will be used below (extracted)
  const { logs, pushLog, clearLogs } = useLogs();
  const { toasts, addToast } = useToasts();
  const { currentMessage, showNarration, closeNarration, markTutorialShown, isTutorialShown } = useNarration();

  // Narration tracking
  const mapArrivalShownRef = useRef<Set<string>>(new Set());
  const mapCombatCountRef = useRef<Record<string, number>>({});

  // show toast when player levels up: inform gained allocation points
  const lastLevelRef = useRef<number | null>(null);
  const mountTimeRef = useRef<number>(Date.now());
  useEffect(() => {
    try {
      const cur = player?.level ?? null;
      const timeSinceMountMs = Date.now() - mountTimeRef.current;
      
      // Initialize on first valid level
      if (lastLevelRef.current === null && cur !== null) {
        lastLevelRef.current = cur;
        return;
      }
      
      // Only show toast if: level increased AND more than 1 second has passed since mount
      // (this prevents showing toast during initial page load)
      if (
        cur !== null && 
        lastLevelRef.current !== null && 
        cur > lastLevelRef.current &&
        timeSinceMountMs > 1000
      ) {
        const gained = (cur - lastLevelRef.current) || 0;
        const points = gained * 5;
        try { addToast && addToast(`Level up! ${points} points to be allocated.`, 'ok', 4000); } catch (e) {}
      }
      lastLevelRef.current = cur;
    } catch (e) {}
  }, [player && player.level, addToast]);

  // show toast when maps are unlocked
  const unlockedMapsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    try {
      const mapsList = getMaps();
      const playerLevel = player?.level ?? 0;
      
      // On first run, initialize the ref with already-unlocked maps (no toast)
      const isFirstRun = unlockedMapsRef.current.size === 0;
      
      mapsList.forEach((map) => {
        // Skip spawn area
        if (map.id === 'spawn') return;
        
        // Check if already notified
        if (unlockedMapsRef.current.has(map.id)) return;
        
        // Check level requirement
        const levelRequirement = map.minLevel ?? 0;
        const levelMet = playerLevel >= levelRequirement;
        
        // Check fragment requirements
        let fragmentsMet = true;
        if (Array.isArray(map.requiredKeyFragments) && map.requiredKeyFragments.length > 0) {
          fragmentsMet = map.requiredKeyFragments.every((frag) => 
            (inventory as any[]).some((item: any) => item && item.name === frag)
          );
        }
        
        // If all requirements met, add to ref and show toast only if not first run
        if (levelMet && fragmentsMet) {
          unlockedMapsRef.current.add(map.id);
          if (!isFirstRun) {
            try { addToast && addToast(`🗺️ Map unlocked: ${map.name}`, 'ok', 3000); } catch (e) {}
          }
        }
      });
    } catch (e) {}
  }, [player && player.level, inventory, addToast]);

  useEffect(() => { inCombatRef.current = inCombat; }, [inCombat]);

  // show a welcome message once when the game component mounts (spawn)
  useEffect(() => {
    try { pushLog && pushLog('Welcome, adventurer — you have arrived in the arena.'); } catch (e) {}
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle map arrival narration
  useEffect(() => {
    if (!selectedMapId || selectedMapId === 'spawn') {
      mapArrivalShownRef.current.delete('arrival');
      mapCombatCountRef.current = {};
      return;
    }

    // Show arrival message once per map selection
    if (!mapArrivalShownRef.current.has(selectedMapId)) {
      const narration = getMapNarration(selectedMapId as any);
      if (narration?.events.arrival) {
        showNarration(narration.events.arrival);
        mapArrivalShownRef.current.add(selectedMapId);
      }
      // Reset combat counter for this map
      mapCombatCountRef.current[selectedMapId] = 0;
    }
  }, [selectedMapId, showNarration]);

  // Handle boss encounter narration
  useEffect(() => {
    try {
      if (inCombat && enemies && enemies.length > 0) {
        const boss = enemies.find((e) => e.isBoss);
        if (boss) {
          const narration = getMapNarration(parseInt(selectedMapId || '0'));
          if (narration?.events.bossBefore && narration.events.bossBefore.bossName === boss.name) {
            showNarration(narration.events.bossBefore.message);
          }
        }
      }
    } catch (e) {}
  }, [inCombat, enemies, selectedMapId, showNarration]);

  // Tutorial: First combat explanation
  useEffect(() => {
    if (inCombat && !isTutorialShown('firstCombat')) {
      const combatCount = mapCombatCountRef.current[selectedMapId || 'spawn'] ?? 0;
      if (combatCount === 1) {
        showNarration(TUTORIAL_MESSAGES.firstCombatTutorial);
        markTutorialShown('firstCombat');
      }
    }
  }, [inCombat, selectedMapId, showNarration, isTutorialShown, markTutorialShown]);

  // Tutorial: First victory
  useEffect(() => {
    if (!inCombat && !isTutorialShown('firstVictory') && mapCombatCountRef.current[selectedMapId || 'spawn'] === 1) {
      showNarration(TUTORIAL_MESSAGES.firstVictoryTutorial);
      markTutorialShown('firstVictory');
    }
  }, [inCombat, selectedMapId, showNarration, isTutorialShown, markTutorialShown]);

  // Tutorial: First loot pickup
  useEffect(() => {
    if (pickups && pickups.length > 0 && !isTutorialShown('firstLoot')) {
      showNarration(TUTORIAL_MESSAGES.firstLootTutorial);
      markTutorialShown('firstLoot');
    }
  }, [pickups, showNarration, isTutorialShown, markTutorialShown]);

  // Tutorial: First inventory usage (when player has loot)
  useEffect(() => {
    if (inventory && (inventory as any[]).length > 0 && !isTutorialShown('firstInventory')) {
      showNarration(TUTORIAL_MESSAGES.firstInventoryTutorial);
      markTutorialShown('firstInventory');
    }
  }, [inventory, showNarration, isTutorialShown, markTutorialShown]);

  // Tutorial: First boss encounter
  useEffect(() => {
    if (inCombat && enemies && enemies.length > 0) {
      const boss = enemies.find((e) => e.isBoss);
      if (boss && !isTutorialShown('firstBoss')) {
        showNarration(TUTORIAL_MESSAGES.firstBossTutorial);
        markTutorialShown('firstBoss');
      }
    }
  }, [inCombat, enemies, showNarration, isTutorialShown, markTutorialShown]);

  // Tutorial: First level up
  useEffect(() => {
    if ((player?.level ?? 0) > 1 && !isTutorialShown('firstLevelUp')) {
      showNarration(TUTORIAL_MESSAGES.firstLevelUpTutorial);
      markTutorialShown('firstLevelUp');
    }
  }, [player?.level, showNarration, isTutorialShown, markTutorialShown]);

  // Tutorial: Map unlock
  useEffect(() => {
    if (selectedMapId && selectedMapId !== 'spawn' && !isTutorialShown('mapUnlock')) {
      // Check if this is a newly unlocked map (not spawn, not arena)
      if (selectedMapId !== '0') {
        showNarration(TUTORIAL_MESSAGES.mapUnlockTutorial);
        markTutorialShown('mapUnlock');
      }
    }
  }, [selectedMapId, showNarration, isTutorialShown, markTutorialShown]);


  // Track active timeouts for cleanup
  const effectTimeoutsRef = useRef<Map<string, number>>(new Map());

  const addEffect = useCallback((eff: { type: string; text?: string; kind?: string; target?: string; id?: string }) => {
    const id = eff.id ? `${eff.id}_${uid()}` : uid();
    // randomize position a bit
    const x = eff.target === "player" ? 80 : 300 + Math.random() * 260;
    const y = 120 + Math.random() * 80;
    const obj = { ...eff, id, x, y };
    setEffects((s) => [...s, obj]);
    
    // Clear any existing timeout for this effect ID
    const existingTimeout = effectTimeoutsRef.current.get(id);
    if (existingTimeout) clearTimeout(existingTimeout);
    
    // remove after animation
    const timeout = window.setTimeout(() => {
      setEffects((s) => s.filter((x) => x.id !== id));
      effectTimeoutsRef.current.delete(id);
    }, 1800);
    
    effectTimeoutsRef.current.set(id, timeout);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      effectTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      effectTimeoutsRef.current.clear();
    };
  }, []);

  const { dungeonProgressRef, dungeonUI, processEndEncounter } = useDungeon({ selectedMapId, pushLog, addEffect: addEffect, addToast: (text: string, type?: string, ttl?: number, icon?: string) => addToast(text, type as "ok" | "error" | undefined, ttl, icon), createCustomItem, addXp, setPlayer, encounterSessionRef, startEncounterRef, player, inventory, equipment });
  // toast/log hooks used instead of local state

  // Reset streak when dungeon is activated
  const prevDungeonRemainingRef = useRef<number>(0);
  useEffect(() => {
    if (dungeonUI.remaining && dungeonUI.remaining > 0 && prevDungeonRemainingRef.current === 0) {
      // Dungeon just activated
      resetMapStreak(dungeonUI.activeMapId ?? null);
      try { 

       } catch (e) {}
    }
    prevDungeonRemainingRef.current = dungeonUI.remaining ?? 0;
  }, [dungeonUI.remaining, dungeonUI.activeMapId]);

  const startEncounter = useCallback(() => {
    // idempotency guard: avoid double-invoking startEncounter for same encounter
    // Use a combination of time window and dungeon state to detect duplicates
    try {
      const now = Date.now();
      const dp = dungeonProgressRef.current || {};
      const currentKey = `${selectedMapId}|${dp.activeDungeonId}|${dp.remaining}`;
      
      // If same key called within 2500ms, suppress (handles rapid re-clicks and race conditions)
      if (lastEncounterKeyRef.current === currentKey && (now - (lastEncounterTimestampRef.current || 0)) < 2500) {
        try { console.debug('[DEBUG] startEncounter suppressed (duplicate call within 2500ms)', { currentKey }); } catch (e) {}
        return;
      }
      
      // Update guard
      lastEncounterKeyRef.current = currentKey;
      lastEncounterTimestampRef.current = now;
    } catch (e) {}

    // prevent spawning if already in combat (use ref to avoid stale closure)
    if (inCombatRef.current) {
      pushLog("You're already in combat.");
      return;
    }
    // clear any existing enemies from a previous session to avoid mixed spawns
    try { setEnemies([]); } catch (e) {}
    // Reset cooldowns and modifiers at the start of a new encounter
    setSafeCooldown(0);
    setRiskyCooldown(0);
    setNextTurnModifier(null);
    // bump encounter session id so endEncounter can know which encounter finished
    encounterSessionRef.current = (encounterSessionRef.current || 0) + 1;
  
    // spawn 1-3 enemies
    // clear pending log clear timeout if any
    if (logClearRef.current) {
      clearTimeout(logClearRef.current);
      logClearRef.current = null;
    }
    // determine count based on dungeon state: normal area random 1-3, dungeon rooms fixed 4, boss room single
    let count = 1 + Math.floor(Math.random() * 3);
    // prevent starting encounter on a locked map (min level only)
    if (selectedMap?.minLevel && player.level < selectedMap.minLevel) {
      try { pushLog(`Map locked: requires level ${selectedMap.minLevel}+`); } catch (e) {}
      try { addToast && addToast(`Map locked: requires level ${selectedMap.minLevel}+`, 'error'); } catch (e) {}
      return;
    }

    const isDungeonActive = dungeonProgressRef.current.activeMapId === selectedMap?.id && (dungeonProgressRef.current.remaining || 0) > 0;
    // Note: floor calculation deferred until we capture dungeon state below
    
    // Capture all dungeon state at encounter start
    let dungeonRemaining = 0;
    let dungeonCurrentFloor = 0;
    if (isDungeonActive && dungeonProgressRef.current.activeDungeonId) {
      const dungeonId = dungeonProgressRef.current.activeDungeonId;
      dungeonRemaining = dungeonProgressRef.current.remaining || 0;
      const idx = dungeonProgressRef.current.activeDungeonIndex ?? null;
      const def = (idx !== null && selectedMap?.dungeons) ? selectedMap.dungeons[idx] : undefined;
      dungeonCurrentFloor = def ? (def.floors - dungeonRemaining + 1) : dungeonRemaining;
      
      try { 

       } catch (e) {}
    }
    // we'll set actual spawned count after attempting to spawn available templates
    // dungeon initialization is handled by useDungeon

    // spawn enemies according to count and dungeon rules, but only if templates explicitly belong to this map
    let spawned = 0;

    // if inside a dungeon non-boss floor, prepare a non-repeating pool for deterministic room spawns
    let roomSpawnCandidates: string[] | null = null;
    let roomObjGlobal: any | undefined = undefined;
    if (isDungeonActive && dungeonProgressRef.current.activeDungeonId) {
      const mapId = selectedMapId ?? 'unknown';
      const dungeonId = dungeonProgressRef.current.activeDungeonId;
      const roomId = `${mapId}_${dungeonId}_floor_${dungeonCurrentFloor}`;
      roomObjGlobal = getRoomsForMap(selectedMapId ?? undefined).find((r) => r.id === roomId) as any | undefined;
      if (roomObjGlobal && Array.isArray(roomObjGlobal.enemyPool) && roomObjGlobal.enemyPool.length > 0) {
        // clone to avoid modifying original
        roomSpawnCandidates = [...roomObjGlobal.enemyPool];
      }
      // Set count based on captured dungeon state
      if (dungeonRemaining === 1) {
        count = 1; // boss only
      } else {
        count = 4;
      }
    }

    // For boss floors with minions, set count to spawn all enemies from the room
    if (isDungeonActive && dungeonRemaining === 1 && roomObjGlobal?.isBossRoom && roomSpawnCandidates) {
      count = roomSpawnCandidates.length;
    }

    // Handle boss floor differently: spawn all enemies from pool (minions + boss)
    // Boss identification happens via isBoss flag based on actualBossId match
    if (isDungeonActive && dungeonRemaining === 1 && roomObjGlobal?.isBossRoom && roomSpawnCandidates && roomSpawnCandidates.length > 0) {
      // Boss room with minions: spawn all from pool
      const idx = dungeonProgressRef.current.activeDungeonIndex ?? null;
      const actualBossId = (idx !== null && selectedMap?.dungeons && selectedMap.dungeons[idx]) ? selectedMap.dungeons[idx].bossTemplateId : undefined;
      
      for (let i = 0; i < count; i++) {
        let tid: string | undefined = undefined;
        if (roomSpawnCandidates && roomSpawnCandidates.length > 0) {
          const ri = Math.floor(Math.random() * roomSpawnCandidates.length);
          tid = roomSpawnCandidates.splice(ri, 1)[0];
        }
        if (tid) {
          const isBoss = tid === actualBossId;
          const mapId = selectedMapId ?? 'unknown';
          const dungeonId = (selectedMap?.dungeons && typeof idx === 'number') ? selectedMap.dungeons[idx].id : undefined;
          const roomId = dungeonId ? `${mapId}_${dungeonId}_floor_${dungeonCurrentFloor}` : undefined;
          spawnEnemy(tid, undefined, { isBoss, roomId, mapId: selectedMapId ?? undefined });
          spawned++;
        }
      }
    } else {
      // Normal spawn loop (non-boss rooms or single-enemy boss rooms)
      for (let i = 0; i < count; i++) {
        // Single-enemy boss floor (old behavior)
        if (isDungeonActive && dungeonRemaining === 1) {
          const idx = dungeonProgressRef.current.activeDungeonIndex ?? null;
          const bossId = (idx !== null && selectedMap?.dungeons && selectedMap.dungeons[idx]) ? selectedMap.dungeons[idx].bossTemplateId : undefined;
          if (bossId) {
            const bossTpl = ENEMY_TEMPLATES.find((t) => t.templateId === bossId);
            if (bossTpl) {
              const mapId = selectedMapId ?? 'unknown';
              const dungeonId = (selectedMap?.dungeons && typeof idx === 'number') ? selectedMap.dungeons[idx].id : undefined;
              const roomId = dungeonId ? `${mapId}_${dungeonId}_floor_${dungeonCurrentFloor}` : undefined;
              spawnEnemy(bossId, undefined, { isBoss: true, roomId, mapId: selectedMapId ?? undefined });
              spawned++;
            }
          }
        } else {
            // If inside a dungeon (non-boss floor), prefer room-based deterministic spawns (use captured floor)
            if (isDungeonActive && dungeonProgressRef.current.activeDungeonId) {
              const mapId = selectedMapId ?? 'unknown';
              const dungeonId = dungeonProgressRef.current.activeDungeonId;
              const roomId = `${mapId}_${dungeonId}_floor_${dungeonCurrentFloor}`;
              // If we have a prepared non-repeating candidate list, draw from it without replacement
              let tid: string | undefined = undefined;
              if (roomSpawnCandidates && roomSpawnCandidates.length > 0) {
                // pick a random index from candidates and remove it
                const ri = Math.floor(Math.random() * roomSpawnCandidates.length);
                tid = roomSpawnCandidates.splice(ri, 1)[0];
              } else {
                // fallback to old behavior
                tid = pickEnemyFromRoom(selectedMapId ?? undefined, roomId);
              }
              if (tid) {
                const roomObj = roomObjGlobal || getRoomsForMap(selectedMapId ?? undefined).find((r) => r.id === roomId) as any | undefined;
                const tpl = ENEMY_TEMPLATES.find((t) => t.templateId === tid);
                const tplBelongs = roomObj ? true : (selectedMap ? (tpl && selectedMap?.enemyPool && selectedMap.enemyPool.includes(tid)) : !!tpl);
                if (tplBelongs) {
                  spawnEnemy(tid, undefined, { isBoss: !!roomObj?.isBossRoom, roomId, mapId: selectedMapId ?? undefined });
                  spawned++;
                } else {
                  }
              } else {
                // fallback to area pool
                const tid2 = pickEnemyFromMap(selectedMapId ?? undefined);
                if (tid2) {
                  const tpl = ENEMY_TEMPLATES.find((t) => t.templateId === tid2);
                  const areaName = selectedMap?.name ?? 'Spawn';
                  const tplBelongs = selectedMap ? (tpl && selectedMap?.enemyPool && selectedMap.enemyPool.includes(tid2)) : !!tpl;
                  if (tplBelongs) {
                    spawnEnemy(tid2, undefined, { mapId: selectedMapId ?? undefined });
                    spawned++;
                  } else {
                    }
                } else {
                  const areaName = selectedMap?.name ?? 'Spawn';
                 }
              }
            } else {
            const tid = pickEnemyFromMap(selectedMapId ?? undefined);
            if (tid) {
              // extra guard: ensure the resolved template is inside the map's enemyPool
              const tpl = ENEMY_TEMPLATES.find((t) => t.templateId === tid);
              const areaName = selectedMap?.name ?? 'Spawn';
              const tplBelongs = selectedMap ? (tpl && selectedMap?.enemyPool && selectedMap.enemyPool.includes(tid)) : !!tpl;
              if (tplBelongs) {
                spawnEnemy(tid, undefined, { mapId: selectedMapId ?? undefined });
                spawned++;
              } else {
               }
            } else {
              const areaName = selectedMap?.name ?? 'Spawn';
              }
          }
        }
      }
    }

    encounterCountRef.current = spawned;
    if (spawned === 0) {
      const areaName = selectedMap?.name ?? 'Spawn';
      pushLog(`No enemies available for ${areaName}.`);
      return;
    }

    const areaName = selectedMap?.name ?? 'Spawn';
    pushLog(`New encounter in ${areaName}: ${spawned} enemy(s) appeared.`);
    
    // record start time for this encounter
    lastEncounterTimestampRef.current = Date.now();
    setInCombat(true);
    
    // Auto-target first enemy
    if (enemies && enemies.length > 0) {
      setSelectedTargetId(enemies[0].id);
    }
  }, [spawnEnemy, pushLog, selectedMapId, enemies]);

  // expose the startEncounter function to the dungeon hook so it can schedule auto-enter
  useEffect(() => {
    try {
      // wrap assignment so any invocation via the ref is logged
      startEncounterRef.current = (() => {
        try { console.debug('[startEncounterRef] invoked via ref', { session: encounterSessionRef.current, selectedMapId }); } catch (e) {}
        try { return startEncounter(); } catch (e) { console.error('[startEncounterRef] startEncounter threw', e); }
      }) as any;
    } catch (e) {}
  }, [startEncounter]);


  const endEncounter = useCallback((msg?: string, opts?: { type?: 'clear' | 'flee' | 'death'; isBoss?: boolean; bossName?: string }) => {
    // spawn a single gold pickup for the encounter (sum of per-enemy dust)
    // Do NOT award gold when the encounter ends due to fleeing.
    if (opts?.type !== 'flee') {
      // Reduced drop rates: much smaller gold per enemy (drastic reduction)
      const count = encounterCountRef.current || 0;
      let total = 0;
      // per enemy: 0.05 - 0.20 g
      for (let i = 0; i < count; i++) total += (Math.random() * (0.20 - 0.05) + 0.05);
      total = Number(total.toFixed(2));
      try {
        spawnGoldPickup(total, player.x, player.y);
        // notify player via log and a short effect so drops are visible
        pushLog(`Gold dropped: +${total} g`);
        try { addEffect({ type: 'pickup', text: `+${total} g`, target: 'player' }); } catch (e) {}
      } catch (e) {}
    }
    encounterCountRef.current = 0;
    setInCombat(false);
    setEnemies([]);
    setSelectedTargetId(null); // Clear target when combat ends
    setNextTurnModifier(null); // Reset modifier when combat ends
    setSafeCooldown(0); // Reset safe cooldown
    setRiskyCooldown(0); // Reset risky cooldown
    // if this endEncounter reports a death, restore player HP to max (respawn)
    if (opts?.type === 'death') {
      try { setPlayer((p) => ({ ...p, hp: (p.maxHp ?? p.hp) })); } catch (e) {}
      try { addToast(msg ? String(msg) : 'You died.', 'error', 4000); } catch (e) {}
      try { resetMapStreak(selectedMapId); } catch (e) {}
      // Show death narration
      try {
        const narration = getMapNarration(selectedMapId as any);
        if (narration?.events.playerDeath) {
          showNarration(narration.events.playerDeath);
        }
      } catch (e) {}
    }
    else if (opts?.type !== 'flee') {
      // Only increment streak during farming (not in dungeon)
      // Use dungeonProgressRef directly to avoid race conditions with state updates
      const inDungeonActive = dungeonProgressRef.current.activeDungeonIndex != null && dungeonProgressRef.current.activeMapId === selectedMapId;
      if (!inDungeonActive) {
        try { incMapStreak(selectedMapId); console.debug('[Game] incremented map streak', { mapId: selectedMapId, streak: getMapStreak(selectedMapId) }); } catch (e) {}
      }
      
      // Handle combat narration
      try {
        // Increment combat count for this map
        mapCombatCountRef.current[selectedMapId || 'spawn'] = (mapCombatCountRef.current[selectedMapId || 'spawn'] ?? 0) + 1;
        const combatCount = mapCombatCountRef.current[selectedMapId || 'spawn'];
        
        // Check for narration on specific combat counts
        const combatNarration = getCombatNarration(parseInt(selectedMapId || '0'), combatCount);
        if (combatNarration) {
          showNarration(combatNarration);
        }
        
        // Check for boss victory narration
        if (opts?.isBoss && opts?.bossName) {
          // Special handling for Fire Overlord (final boss)
          if (opts.bossName === 'Fire Overlord' && selectedMapId === 'final_arena') {
            try {
              addToast('🏆 VICTORY! You have conquered the world!', 'ok', 5000);
              pushLog('▓▓▓▓▓ VICTORY ▓▓▓▓▓');
              pushLog('You have defeated the Fire Overlord and saved the world!');
              pushLog('Congratulations on completing Arena Quest!');
              addEffect({ type: 'explosion', text: 'VICTORY!', target: 'player' });
            } catch (e) {}
          }
          
          const narration = getMapNarration(parseInt(selectedMapId || '0'));
          if (narration?.events.bossVictory && narration.events.bossVictory.bossName === opts.bossName) {
            showNarration(narration.events.bossVictory.message);
          }
        }
      } catch (e) {}
    }
    if (msg) pushLog(msg);
    // Track farming progress: if player is on a map that has dungeons but the dungeon
    // hasn't been activated yet, count this completed encounter toward the threshold.
      try {
        const mapsListNow = getMaps();
        const currentMap = mapsListNow.find((m) => m.id === selectedMapId) ?? null;
        const handled = processEndEncounter({ currentMap, player, opts, msg });
        if (handled) return;
      } catch (e) { console.error('[DEBUG] endEncounter error', e); }
    // Save the game state after encounter ends (including any HP changes)
    try { saveCoreGame && saveCoreGame(null, 'end_encounter'); } catch (e) {}
    // schedule clearing the logs after a short delay so player can read result
    if (logClearRef.current) clearTimeout(logClearRef.current);
    const currentSessionId = encounterSessionRef.current; // capture current session
    logClearRef.current = window.setTimeout(() => {
      // Only clear if we're still in the same encounter session
      if (encounterSessionRef.current === currentSessionId) {
        clearLogs();
      }
      logClearRef.current = null;
    }, 1000);
  }, [setEnemies, pushLog, spawnGoldPickup, player.x, player.y, selectedMapId, startEncounter, setPlayer, addXp, createCustomItem, addToast, addEffect, showNarration, setSafeCooldown, setRiskyCooldown, setNextTurnModifier]);

  // clear timeout on unmount
  useEffect(() => {
    return () => {
      if (logClearRef.current) clearTimeout(logClearRef.current);
    };
  }, []);

  const rollChance = useCallback((percent = 0) => Math.random() * 100 < (percent ?? 0), []);

  // damage calculation extracted to game/damage.ts (calcDamage)

  const { onAttack, onRun } = useCombat({ player, setPlayer, enemies, setEnemies, addXp, pushLog, endEncounter, onEffect: addEffect, saveCoreGame, onModifierChange: setNextTurnModifier, turnModifier: nextTurnModifier, onSafeCooldownChange: setSafeCooldown, onRiskyCooldownChange: setRiskyCooldown, safeCooldown, riskyCooldown, selectedTargetId, onDrop: (enemy: any) => {
    const isDungeonRoom = !!enemy.roomId;
    const droppedItem = maybeDropFromEnemy(enemy, selectedMapId, !!enemy.isBoss, isDungeonRoom);
    
    // Drop essence for mythic enemies (endgame mechanic)
    const essenceDropped = maybeDropEssenceFromEnemy(enemy, !!enemy.isBoss);
    if (essenceDropped > 0) {
      try {
        pushLog(`Essence gained: +${essenceDropped} ⚡`);
        addEffect({ type: 'pickup', text: `+${essenceDropped} ${EssenceSVG}`, target: 'player', kind: 'essence' });
      } catch (e) {}
    }
    
    return droppedItem;
  } });

  const mapsList = getMaps();
  const selectedMap = useMemo(() => mapsList.find((m) => m.id === selectedMapId) ?? null, [mapsList, selectedMapId]);

  // dungeon initialization is handled by useDungeon

  // wrapper used by store modal so it returns a result message usable by the modal
  const storeBuy = useCallback((type: 'small' | 'medium' | 'large' | 'huge' | 'giant') => {
    
    try {
      const ok = buyPotion(type);
      if (ok) {
        const label = type === 'small' ? 'small potion' : (type === 'medium' ? 'medium potion' : (type === 'large' ? 'large potion' : (type === 'huge' ? 'huge potion' : 'giant potion')));
        const msg = `Purchase successful: ${label}.`;
        pushLog(msg);
        return { ok: true, msg };
      } else {
        const msg = "Not enough gold";
        pushLog(msg);
        return { ok: false, msg };
      }
    } catch (e) {
      const msg = 'Error during purchase';
      pushLog(msg);
      return { ok: false, msg };
    }
  }, [buyPotion, pushLog]);

  const getUnlockedRarities = (): Rarity[] => {
    const rarities = new Set<Rarity>();
    // Check inventory
    for (const item of inventory) {
      if (item.rarity) rarities.add(item.rarity);
    }
    // Check equipment
    for (const item of Object.values(equipment)) {
      if (item && item.rarity) rarities.add(item.rarity);
    }
    return Array.from(rarities);
  };

  const storeBuyLootBox = useCallback((rarity: Rarity, currency: 'gold' | 'essence' = 'gold') => {
    try {
      const { ITEM_POOL } = require('../game/templates/items');
      // Filtrer les items de la rareté demandée
      const itemsOfRarity = ITEM_POOL.filter((item: any) => (item.rarity ?? 'common') === rarity);
      if (itemsOfRarity.length === 0) {
        const msg = 'No items available for this rarity';
        pushLog(msg);
        return { ok: false, msg };
      }
      // Choisir un item aléatoire
      const randomItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
      
      // Définir les prix basés sur la rareté et la devise (SYNCHRONISÉ avec StoreModal)
      const LOOT_BOX_PRICES_GOLD: Record<Rarity, number> = {
        common: 200,
        uncommon: 400,
        rare: 700,
        epic: 1100,
        legendary: 2500,
        mythic: 5000,
      };
      const LOOT_BOX_PRICES_ESSENCE: Record<Rarity, number> = {
        common: 1,
        uncommon: 3,
        rare: 8,
        epic: 20,
        legendary: 50,
        mythic: 120,
      };

      if (currency === 'gold') {
        const price = LOOT_BOX_PRICES_GOLD[rarity];
        const currentGold = player.gold ?? 0;
        
        if (currentGold < price) {
          const msg = 'Not enough gold';
          pushLog(msg);
          return { ok: false, msg };
        }
        
        const nextPlayer = { ...player, gold: +((currentGold - price).toFixed(2)) } as PlayerType;
        setPlayer(nextPlayer);
      } else if (currency === 'essence') {
        const price = LOOT_BOX_PRICES_ESSENCE[rarity];
        const currentEssence = player.essence ?? 0;
        
        if (currentEssence < price) {
          const msg = 'Not enough essence';
          pushLog(msg);
          return { ok: false, msg };
        }
        
        const nextPlayer = { ...player, essence: (currentEssence - price) } as PlayerType;
        setPlayer(nextPlayer);
      }

      // Créer l'item dans l'inventaire
      createItemFromTemplate(randomItem.name, rarity, true);
      const msg = `Loot box opened! You got: ${randomItem.name}.`;
      pushLog(msg);
      // Force save after state updates complete
      setTimeout(() => {
        try {
          if (typeof window !== 'undefined' && (window as any).__arenaquest_save_game) {
            (window as any).__arenaquest_save_game(null, 'lootbox_purchase');
          }
        } catch (e) {
          console.error('Force save error:', e);
        }
      }, 100);
      return { ok: true, msg };
    } catch (e) {
      const msg = 'Error during purchase';
      pushLog(msg);
      return { ok: false, msg };
    }
  }, [player, createItemFromTemplate, pushLog, saveCoreGame]);

  return (
    <div className="app-shell">
      {/* debug badge: shows current modalName (temporary) */}
      {modalName && (
        <div style={{ position: 'fixed', right: 14, top: 14, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 10px', borderRadius: 8, zIndex: 99999, fontSize: 12 }}>
          modal: {modalName}
        </div>
      )}
      {/* debug overlay: progression + localStorage (temporary) */}
      {/* debug overlay removed in production */}
      <header className="app-header">
        <h1>Arena Quest</h1>
        <p className="subtitle">Adventure mmorpg - v0.22</p>
      </header>

      <div className="main-grid">
        <aside className="sidebar-left" >
          <Player {...player} inCombat={inCombat} onOpenModal={openModal} />
        </aside>

        <main className="center-area">
          <div className="center-top" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className={`btn primary ${inCombat ? "disabled" : ""}`}
              onClick={startEncounter}
              disabled={inCombat}
            >
              {inCombat ? "In combat..." : (selectedMap?.dungeons && dungeonUI.activeMapId === selectedMap.id && dungeonUI.activeDungeonIndex != null ? "Next room" : "Go to Arena")}
            </button>
            {/* Streak display: animated counter for current map */}
            {(() => {
              // Don't show streak if in dungeon
              const inDungeonActive = selectedMap?.dungeons && dungeonUI.activeMapId === selectedMap.id && dungeonUI.activeDungeonIndex != null;
              if (inDungeonActive) return null;
              
              const currentStreak = getMapStreak(selectedMapId);
              if (currentStreak <= 0) return null;
              const isHot = currentStreak >= 5;
              return (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: isHot ? 'linear-gradient(135deg, rgba(255,107,107,0.2), rgba(255,180,90,0.15))' : 'rgba(100,100,100,0.2)',
                  border: `1px solid ${isHot ? 'rgba(255,107,107,0.4)' : 'rgba(150,150,150,0.3)'}`,
                  animation: isHot ? 'streakPulse 1.2s ease-in-out infinite' : 'none',
                }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{isHot ? '🔥' : '⚔️'}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isHot ? '#ff6b6b' : '#aaa' }}>
                    {currentStreak} {currentStreak === 1 ? 'win' : 'wins'}
                  </span>
                </div>
              );
            })()}
            
            {/* dungeon banner when active */}
            {selectedMap?.dungeons && dungeonUI.activeMapId === selectedMap.id && (dungeonUI.activeDungeonIndex != null) && (
              (() => {
                const idx = dungeonUI.activeDungeonIndex as number;
                const def = selectedMap.dungeons?.[idx];
                const total = def?.floors ?? dungeonUI.remaining ?? 0;
                const current = Math.min(total, (def ? (def.floors - (dungeonUI.remaining ?? 0) + 1) : 1));
                return (
                  <div style={{ marginTop: 8, padding: '6px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.45)', color: '#fff', fontWeight: 700 }}>
                    Dungeon: {def?.name ?? def?.id} — Room {current}/{total}
                  </div>
                );
              })()
            )}
          </div>

          <div style={{ position: 'relative' }}>
            {
              (() => {
                const inDungeonActive = selectedMap?.dungeons && dungeonUI.activeMapId === selectedMap.id && dungeonUI.activeDungeonIndex != null;
                return <ArenaPanel enemies={enemies} logs={logs} onAttack={onAttack} onRun={onRun} pickups={pickups} collectPickup={collectPickup} collectAllPickups={collectAllPickups} pushLog={pushLog} logColor={selectedMap?.logColor} disableRun={!!inDungeonActive} inDungeonActive={!!inDungeonActive} nextTurnModifier={nextTurnModifier} safeCooldown={safeCooldown} riskyCooldown={riskyCooldown} selectedTargetId={selectedTargetId} onSelectTarget={setSelectedTargetId} />;
              })()
            }
     
                   <EffectsLayer effects={effects} />
          </div>
        </main>

        <aside className="sidebar-right" >
          <RightSidebar onOpenModal={openModal} />
        </aside>
      </div>
      {modalName === "inventory" && (
          <InventoryModal
          inventory={inventory}
          equipment={equipment}
          player={player}
          progression={progression}
          allocate={allocate}
          deallocate={deallocate}
          onEquip={(item: any) => {
            try {  } catch (e) {}
            try {
              const ok = equipItem(item);
              if (ok) pushLog(`Equipped: ${item.name} (${item.slot})`);
              else {
                const msg = `Unable to equip ${item.name} `;
                pushLog(msg);
                try { addToast && addToast(msg, 'error'); } catch (e) {}
              }
            } catch (e) {
              try { console.error('equip error', e); } catch (e) {}
            }
          }}
          onUnequip={(slot: string) => {
            try {  } catch (e) {}
            unequipItem(slot as any);
          }}
          onSell={(itemId: string) => {
            try {  } catch (e) {}
            const it = inventory.find((i) => i.id === itemId);
            if (!it) { pushLog('Unable to sell.'); return; }
            const high = ['epic', 'legendary', 'mythic'];
            if (high.includes(it.rarity)) {
              // open confirm modal
              setModalName('confirm');
              setModalProps({ item: it });
              return;
            }
            const ok = sellItem(itemId);
            if (ok) pushLog(`Sold: +${it.cost ?? 0} g`);
            else pushLog('Unable to sell.');
          }}
          onUse={(itemId: string) => {
            try {  } catch (e) {}
            const ok = consumeItem(itemId);
            if (ok) pushLog('Potion used. HP restored.');
            else pushLog("Unable to use this item.");
            // also show a global toast so user always sees feedback
            try { addToast(ok ? 'Potion used. HP restored.' : "Unable to use this item.", ok ? 'ok' : 'error'); } catch (e) {}
            return ok;
          }}
          onForge={(itemId: string) => {
            try {
              const res = forgeThreeIdentical ? forgeThreeIdentical(itemId) : { ok: false, msg: 'Forge not available' };
              if (res && typeof (res as any).then === 'function') {
                return (res as unknown as Promise<any>).then((r) => {
                  try { pushLog(r.msg); } catch (e) {}
                  try { addToast(r.msg, r.ok ? 'ok' : 'error'); } catch (e) {}
                  return r;
                }).catch((err) => {
                  console.error('forge promise error', err);
                  const r = { ok: false, msg: 'Forge failed' };
                  try { pushLog(r.msg); } catch (e) {}
                  try { addToast(r.msg, 'error'); } catch (e) {}
                  return r;
                });
              } else {
                const r = res as { ok: boolean; msg: string };
                try { pushLog(r.msg); } catch (e) {}
                try { addToast(r.msg, r.ok ? 'ok' : 'error'); } catch (e) {}
                return r;
              }
            } catch (e) { console.error('onForge handler error', e); return { ok: false, msg: 'Forge error' }; }
          }}
          onUpgradeStat={(itemId: string, statKey: string) => {
            const res = upgradeStat(itemId, statKey);
            try { pushLog(res.msg); } catch (e) {}
            try { addToast(res.msg, res.ok ? 'ok' : 'error'); } catch (e) {}
            return res;
          }}
          onLockStat={(itemId: string, statKey: string) => {
            const res = lockStat(itemId, statKey);
            try { pushLog(res.msg); } catch (e) {}
            try { addToast(res.msg, res.ok ? 'ok' : 'error'); } catch (e) {}
            return res;
          }}
          onInfuse={(itemId: string) => {
            const res = infuseItem(itemId);
            try { pushLog(res.msg); } catch (e) {}
            try { addToast(res.msg, res.ok ? 'ok' : 'error'); } catch (e) {}
            return res;
          }}
          onMythicEvolution={(itemId: string) => {
            const res = mythicEvolution(itemId);
            try { pushLog(res.msg); } catch (e) {}
            try { addToast(res.msg, res.ok ? 'ok' : 'error'); } catch (e) {}
            return res;
          }}
          onClose={closeModal}
        />
      )}
      {modalName === 'store' && (
        <StoreModal onClose={closeModal} buyPotion={storeBuy} buyLootBox={storeBuyLootBox} playerGold={player.gold ?? 0} playerEssence={player.essence ?? 0} playerLevel={player.level} unlockedRarities={getUnlockedRarities()} />
      )}
      {modalName === 'catalog' && (
        <CatalogModal onClose={closeModal} />
      )}
      {modalName === 'bestiary' && (
        <BestiaryModal onClose={closeModal} enemies={enemies} selectedMapId={selectedMapId} />
      )}
      {modalName === 'maps' && (
        <MapsModal inventory={inventory} playerLevel={player.level} onClose={closeModal} onSelect={(id?: string | null) => {
              try {
              if (id) {
                const mm = mapsList.find((x) => x.id === id);
                if (mm?.minLevel && player.level < mm.minLevel) {
                  const msg = `Map locked: requires level ${mm.minLevel}+`;
                  try { pushLog(msg); } catch (e) {}
                  try { addToast(msg, 'error'); } catch (e) {}
                  return;
                }
              }
              setSelectedMapId(id ?? null);
              // auto-unlock highest allowed tier for this map if player meets threshold
              try {
                if (id) {
                  const mm = mapsList.find((x) => x.id === id);
                  const RARITY_ORDER = ['common','rare','epic','legendary','mythic'];
                  const allowed = mm?.allowedTiers ?? [];
                  if (allowed.length > 0) {
                    let highestIdx = 0;
                    for (const t of allowed) {
                      const idx = RARITY_ORDER.indexOf(t as any);
                      if (idx > highestIdx) highestIdx = idx;
                    }
                    const target = RARITY_ORDER[highestIdx];
                    if (target && target !== 'common' && !(player.unlockedTiers && player.unlockedTiers.includes(target as Rarity))) {
                      const threshold = mm?.dungeonThreshold ?? mm?.minLevel ?? 0;
                      if ((player.level ?? 0) >= (threshold || 0)) {
                        setPlayer((p) => ({ ...p, unlockedTiers: [...(p.unlockedTiers ?? ['common']), target as Rarity] }));
                        try { saveCoreGame && saveCoreGame(null, 'auto_unlock_map_tier'); } catch (e) {}
                        try { pushLog && pushLog(`Unlocked tier: ${target} (map ${mm?.name})`); } catch (e) {}
                        try { addToast && addToast(`Unlocked tier: ${target}`, 'ok'); } catch (e) {}
                      }
                    }
                  }
                }
              } catch (e) { console.error('auto-unlock map tier error', e); }
              if (id) {
                const mm = mapsList.find((x) => x.id === id);
                const tierInfo = mm?.loot && mm.loot.length > 0 ? mm.loot : (mm?.allowedTiers && mm.allowedTiers.length > 0 ? `loot: ${mm.allowedTiers.join(' - ')}` : 'loot: any');
                const levelInfo = mm?.minLevel ? `Required level: ${mm.minLevel}+` : '';
                const msg = `Map selected: ${mm?.name ?? id}${levelInfo ? ' — ' + levelInfo : ''} — ${tierInfo}`;
                try { pushLog(msg); } catch (e) {}
                try { addToast(msg, 'ok'); } catch (e) {}
              } else {
              try { pushLog('Map deselected — Spawn active'); } catch (e) {}
              try { addToast('Map deselected — Spawn active', 'ok'); } catch (e) {}
            }
          } catch (e) {}
        }} selectedId={selectedMapId} dungeonProgress={dungeonProgressRef.current} />
      )}
      {modalName === 'confirm' && modalProps && (
        <Modal title="Confirmer la vente" onClose={closeModal}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>Do you really want to sell <strong>{modalProps.item.name}</strong> for <strong>{modalProps.item.cost ?? 0} g</strong>?</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn primary" onClick={() => {
                try { const ok = sellItem(modalProps.item.id); if (ok) pushLog(`Sold: +${modalProps.item.cost ?? 0} g`); else pushLog('Unable to sell.'); } catch(e){ try{console.error(e)}catch(e){} }
                closeModal();
              }}>Sell</button>
              <button className="btn" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      {/* Dialogue Modal */}
      <DialogueModal message={currentMessage} onClose={closeNarration} />
      {/* Toast container */}
      <div style={{ position: 'fixed', right: 16, top: 16, zIndex: 999999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ minWidth: 220, maxWidth: 360, padding: '8px 12px', borderRadius: 8, background: t.type === 'ok' ? 'linear-gradient(90deg,#103218,#144a2a)' : 'linear-gradient(90deg,#3b0b0b,#521010)', color: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.6)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            {t.icon && <img src={t.icon} alt="icon" style={{ width: 20, height: 20, flexShrink: 0 }} />}
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
