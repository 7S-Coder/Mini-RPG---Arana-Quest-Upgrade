"use client";

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
  const { player, setPlayer, enemies, setEnemies, spawnEnemy, addXp, maybeDropFromEnemy, equipment, setEquipment, inventory, setInventory, equipItem, unequipItem, sellItem, spawnGoldPickup, pickups, collectPickup, collectAllPickups, buyPotion, consumeItem, createCustomItem, createItemFromTemplate, forgeThreeIdentical, progression, allocate, deallocate, saveCoreGame, consecWins, incConsecWins, resetConsecWins } = useGameState();

  // streak per map (instead of global streak)
  const [mapStreaks, setMapStreaks] = useState<Record<string, number>>({});

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
    try { console.log("openModal ->", name, resolved); } catch (e) {}
    setModalName(name);
    setModalProps(resolved);
  }, [inventory, equipment, player, progression, allocate, deallocate]);

  const closeModal = useCallback(() => { setModalName(null); setModalProps(null); }, []);

  // Keyboard shortcut: Ctrl/Cmd + I opens the inventory modal (unless typing in input)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      try {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
          const active = document.activeElement as HTMLElement | null;
          if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as any).isContentEditable)) return;
          e.preventDefault();
          if (modalName === 'inventory') closeModal();
          else openModal('inventory');
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
    setPlayer((p) => ({ ...p, x: p.x + p.speed * seconds }));
    setEnemies((prev) => prev.map((e) => ({ ...e, x: e.x - e.speed * seconds })));
  });

    const [inCombat, setInCombat] = useState(false);
      const inCombatRef = useRef<boolean>(false);
      const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
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


  const addEffect = useCallback((eff: { type: string; text?: string; kind?: string; target?: string; id?: string }) => {
    const id = eff.id ? `${eff.id}_${uid()}` : uid();
    // randomize position a bit
    const x = eff.target === "player" ? 80 : 300 + Math.random() * 260;
    const y = 120 + Math.random() * 80;
    const obj = { ...eff, id, x, y };
    setEffects((s) => [...s, obj]);
    // remove after animation
    window.setTimeout(() => setEffects((s) => s.filter((x) => x.id !== id)), 1800);
  }, []);

  const { dungeonProgressRef, dungeonUI, processEndEncounter } = useDungeon({ selectedMapId, pushLog, addEffect: addEffect, addToast: (text: string, type?: string, ttl?: number) => addToast(text, type as "ok" | "error" | undefined, ttl), createCustomItem, addXp, setPlayer, encounterSessionRef, startEncounterRef });
  // toast/log hooks used instead of local state

  // Reset streak when dungeon is activated
  const prevDungeonRemainingRef = useRef<number>(0);
  useEffect(() => {
    if (dungeonUI.remaining && dungeonUI.remaining > 0 && prevDungeonRemainingRef.current === 0) {
      // Dungeon just activated
      resetMapStreak(dungeonUI.activeMapId ?? null);
      try { console.log('[Game] dungeon activated, streak reset for map:', dungeonUI.activeMapId); } catch (e) {}
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
    // bump encounter session id so endEncounter can know which encounter finished
    encounterSessionRef.current = (encounterSessionRef.current || 0) + 1;
    console.log('[DEBUG] startEncounter - entering', { session: encounterSessionRef.current, selectedMapId, dungeonProgress: dungeonProgressRef.current });
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
      
      try { console.log('[DEBUG] startEncounter dungeon capture:', { 
        mapId: selectedMapId,
        dungeonId, 
        remaining: dungeonRemaining, 
        dungeonIndex: idx, 
        totalFloors: def?.floors, 
        calculatedFloor: dungeonCurrentFloor,
        session: encounterSessionRef.current 
      }); } catch (e) {}
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

    for (let i = 0; i < count; i++) {
      if (isDungeonActive && dungeonRemaining === 1) {
        // boss floor: spawn boss once (use captured floor from encounter start)
        const idx = dungeonProgressRef.current.activeDungeonIndex ?? null;
        const bossId = (idx !== null && selectedMap?.dungeons && selectedMap.dungeons[idx]) ? selectedMap.dungeons[idx].bossTemplateId : undefined;
        const def = (idx !== null && selectedMap?.dungeons) ? selectedMap.dungeons[idx] : undefined;
        if (bossId) {
          // allow boss spawn if the template exists (bosses may be outside the generic pool)
          const bossTpl = ENEMY_TEMPLATES.find((t) => t.templateId === bossId);
          if (bossTpl) {
            const mapId = selectedMapId ?? 'unknown';
            const dungeonId = (selectedMap?.dungeons && typeof idx === 'number') ? selectedMap.dungeons[idx].id : undefined;
            const roomId = dungeonId ? `${mapId}_${dungeonId}_floor_${dungeonCurrentFloor}` : undefined;
            spawnEnemy(bossId, undefined, { isBoss: true, roomId });
            spawned++;
          } else {
            console.log('[DEBUG] boss template not found, skipping boss spawn', { bossId, selectedMapId, pool: selectedMap?.enemyPool });
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
                  spawnEnemy(tid, undefined, { isBoss: !!roomObj?.isBossRoom, roomId });
                  spawned++;
                } else {
                  console.log('[DEBUG] resolved room template not allowed for map - skipping spawn', { selectedMapId, tid, tpl, pool: selectedMap?.enemyPool, roomId });
                }
              } else {
                // fallback to area pool
                const tid2 = pickEnemyFromMap(selectedMapId ?? undefined);
                if (tid2) {
                  const tpl = ENEMY_TEMPLATES.find((t) => t.templateId === tid2);
                  const areaName = selectedMap?.name ?? 'Spawn';
                  const tplBelongs = selectedMap ? (tpl && selectedMap?.enemyPool && selectedMap.enemyPool.includes(tid2)) : !!tpl;
                  if (tplBelongs) {
                    spawnEnemy(tid2);
                    spawned++;
                  } else {
                    console.log('[DEBUG] resolved template not in selectedMap.enemyPool - skipping spawn', { selectedMapId, tid2, tpl, pool: selectedMap?.enemyPool });
                  }
                } else {
                  const areaName = selectedMap?.name ?? 'Spawn';
                  console.log('[DEBUG] no enemy templates belong to this area, skipping spawn', { selectedMapId, areaName });
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
                spawnEnemy(tid);
                spawned++;
              } else {
                console.log('[DEBUG] resolved template not in selectedMap.enemyPool - skipping spawn', { selectedMapId, tid, tpl, pool: selectedMap?.enemyPool });
              }
            } else {
              const areaName = selectedMap?.name ?? 'Spawn';
              console.log('[DEBUG] no enemy templates belong to this area, skipping spawn', { selectedMapId, areaName });
            }
          }
      }
    }

    encounterCountRef.current = spawned;
    if (spawned === 0) {
      const areaName = selectedMap?.name ?? 'Spawn';
      pushLog(`No enemies available for ${areaName}.`);
      console.log('[DEBUG] spawned encounter - none', { session: encounterSessionRef.current, isDungeonActive, dungeonProgress: dungeonProgressRef.current });
      return;
    }

    const areaName = selectedMap?.name ?? 'Spawn';
    pushLog(`New encounter in ${areaName}: ${spawned} enemy(s) appeared.`);
    console.log('[DEBUG] spawned encounter', { session: encounterSessionRef.current, requested: count, spawned, isDungeonActive, dungeonProgress: dungeonProgressRef.current });
    
    // record start time for this encounter
    lastEncounterTimestampRef.current = Date.now();
    setInCombat(true);
  }, [spawnEnemy, pushLog, selectedMapId]);

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
      const inDungeonActive = dungeonUI.activeMapId === selectedMapId && dungeonUI.activeDungeonIndex != null;
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
    // schedule clearing the logs after a short delay so player can read result
    if (logClearRef.current) clearTimeout(logClearRef.current);
    logClearRef.current = window.setTimeout(() => {
      clearLogs();
      logClearRef.current = null;
    }, 1000);
  }, [setEnemies, pushLog, spawnGoldPickup, player.x, player.y, selectedMapId, startEncounter, setPlayer, addXp, createCustomItem, addToast, addEffect, showNarration]);

  // clear timeout on unmount
  useEffect(() => {
    return () => {
      if (logClearRef.current) clearTimeout(logClearRef.current);
    };
  }, []);

  const rollChance = useCallback((percent = 0) => Math.random() * 100 < (percent ?? 0), []);

  // damage calculation extracted to game/damage.ts (calcDamage)

  const { onAttack, onRun } = useCombat({ player, setPlayer, enemies, setEnemies, addXp, pushLog, endEncounter, onEffect: addEffect, onDrop: (enemy: any) => {
    const isDungeonRoom = !!enemy.roomId;
    return maybeDropFromEnemy(enemy, selectedMapId, !!enemy.isBoss, isDungeonRoom);
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

  const storeBuyLootBox = useCallback((rarity: Rarity) => {
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
      
      // Définir le prix basé sur la rareté
      const LOOT_BOX_PRICES: Record<Rarity, number> = {
        common: 10,
        uncommon: 20,
        rare: 35,
        epic: 100,
        legendary: 250,
        mythic: 500,
      };
      const price = LOOT_BOX_PRICES[rarity];
      const currentGold = player.gold ?? 0;
      
      if (currentGold < price) {
        const msg = 'Not enough gold';
        pushLog(msg);
        return { ok: false, msg };
      }
      
      const nextPlayer = { ...player, gold: +((currentGold - price).toFixed(2)) } as PlayerType;
      setPlayer(nextPlayer);
      
      // Créer l'item dans l'inventaire
      createItemFromTemplate(randomItem.name, rarity, true);
      const msg = `Loot box opened! You got: ${randomItem.name}.`;
      pushLog(msg);
      try { saveCoreGame && saveCoreGame(null, 'buy_lootbox'); } catch (e) {}
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
        <p className="subtitle">Adventure mmorp</p>
      </header>

      <div className="main-grid">
        <aside className="sidebar-left" >
          <Player {...player} onOpenModal={openModal} />
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
                return <ArenaPanel enemies={enemies} logs={logs} onAttack={onAttack} onRun={onRun} pickups={pickups} collectPickup={collectPickup} collectAllPickups={collectAllPickups} pushLog={pushLog} logColor={selectedMap?.logColor} disableRun={!!inDungeonActive} />;
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
            try { console.log('equip requested', item && item.id, item && item.slot); } catch (e) {}
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
            try { console.log('unequip requested', slot); } catch (e) {}
            unequipItem(slot as any);
          }}
          onSell={(itemId: string) => {
            try { console.log('sell requested', itemId); } catch (e) {}
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
            try { console.log('use requested', itemId); } catch (e) {}
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
          onClose={closeModal}
        />
      )}
      {modalName === 'store' && (
        <StoreModal onClose={closeModal} buyPotion={storeBuy} buyLootBox={storeBuyLootBox} playerGold={player.gold ?? 0} unlockedRarities={getUnlockedRarities()} />
      )}
      {modalName === 'catalogue' && (
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
          <div key={t.id} style={{ minWidth: 220, maxWidth: 360, padding: '8px 12px', borderRadius: 8, background: t.type === 'ok' ? 'linear-gradient(90deg,#103218,#144a2a)' : 'linear-gradient(90deg,#3b0b0b,#521010)', color: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.6)', fontWeight: 700 }}>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
