"use client";

import { useGameState } from "./useGameState";
import { useGameLoop } from "./useGameLoop";
import Player from "../components/Player";
import ArenaPanel from "../components/arena/ArenaPanel";
import RightSidebar from "../components/RightSidebar";
import InventoryModal from "../components/modales/InventoryModal";
import Modal from "../components/modales/Modal";
import StoreModal from "../components/modales/StoreModal";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import useCombat from "./useCombat";
import EffectsLayer from "../components/EffectsLayer";
import BestiaryModal from "../components/modales/BestiaryModal";
import MapsModal from "../components/modales/MapsModal";
import CatalogModal from "../components/modales/CatalogModal";
import { getMaps, pickEnemyFromMap } from "./maps";
import { ENEMY_TEMPLATES } from "./enemies";

export default function Game() {
  const { player, setPlayer, enemies, setEnemies, spawnEnemy, addXp, maybeDropFromEnemy, equipment, setEquipment, inventory, setInventory, equipItem, unequipItem, sellItem, spawnGoldPickup, pickups, collectPickup, buyPotion, consumeItem, createCustomItem, forgeThreeIdentical } = useGameState();

  // modal system (generalized)
  const [modalName, setModalName] = useState<string | null>(null);
  const [modalProps, setModalProps] = useState<any>(null);
  const openModal = (name: string, props?: any) => {
    // compute final props (apply defaults for inventory modal)
    const resolved = name === "inventory" ? (props ?? { inventory, equipment }) : (props ?? null);
    // debug log to help verify clicks and show resolved props
    try { console.log("openModal ->", name, resolved); } catch (e) {}
    setModalName(name);
    setModalProps(resolved);
  };
  const closeModal = () => { setModalName(null); setModalProps(null); };

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
  const [logs, setLogs] = useState<React.ReactNode[]>([]);
  const [toasts, setToasts] = useState<Array<{ id: string; text: string; type?: 'ok' | 'error' }>>([]);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [effects, setEffects] = useState<Array<{ id: string; type: string; text?: string; kind?: string; target?: string; x?: number; y?: number }>>([]);
  const logClearRef = useRef<number | null>(null);
  const encounterCountRef = useRef<number>(0);
  const encounterSessionRef = useRef<number>(0);
  const dungeonProgressRef = useRef<{ activeMapId?: string | null; activeDungeonIndex?: number | null; activeDungeonId?: string | null; remaining?: number; fightsRemainingBeforeDungeon?: number; lastProcessedSession?: number; lastDungeonProcessedSession?: number; suppressUntilSession?: number }>({ activeMapId: null, activeDungeonIndex: null, activeDungeonId: null, remaining: 0, fightsRemainingBeforeDungeon: 0, lastProcessedSession: undefined, lastDungeonProcessedSession: undefined, suppressUntilSession: undefined });
  const [dungeonUI, setDungeonUI] = useState(() => ({ ...dungeonProgressRef.current }));
  const syncDungeonUI = () => setDungeonUI({ ...dungeonProgressRef.current });

  const pushLog = useCallback((node: React.ReactNode) => {
    setLogs((l) => {
      const next = [...l, node];
      return next.slice(Math.max(0, next.length - 100));
    });
  }, []);

  useEffect(() => { inCombatRef.current = inCombat; }, [inCombat]);


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

  const addToast = useCallback((text: string, type: 'ok' | 'error' = 'ok', ttl = 3000) => {
    const id = uid();
    setToasts((t) => [...t, { id, text, type }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ttl);
  }, []);

  const startEncounter = useCallback(() => {
    // prevent spawning if already in combat (use ref to avoid stale closure)
    if (inCombatRef.current) {
      pushLog("You're already in combat.");
      return;
    }
    // clear any existing enemies from a previous session to avoid mixed spawns
    try { setEnemies([]); } catch (e) {}
    console.log('[DEBUG] startEncounter - entering', { session: encounterSessionRef.current + 1, selectedMapId, dungeonProgress: dungeonProgressRef.current });
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
    const isDungeonActive = dungeonProgressRef.current.activeMapId === selectedMap?.id && (dungeonProgressRef.current.remaining || 0) > 0;
    if (isDungeonActive) {
      // if this is the final floor, spawn boss only, otherwise spawn 4 mobs
      if ((dungeonProgressRef.current.remaining || 0) === 1) {
        count = 1; // boss only
      } else {
        count = 4;
      }
    }
    // we'll set actual spawned count after attempting to spawn available templates
    // initialize dungeon progress when entering a new dungeon map
    if (selectedMap?.dungeons && selectedMap.dungeons.length > 0) {
      if (dungeonProgressRef.current.activeMapId !== selectedMap.id) {
        // start farming phase for this map: require N combats before the dungeon appears
        const threshold = (selectedMap as any).dungeonThreshold ?? 20;
        dungeonProgressRef.current.activeMapId = selectedMap.id;
        dungeonProgressRef.current.activeDungeonIndex = null; // not yet activated
        dungeonProgressRef.current.activeDungeonId = null;
        dungeonProgressRef.current.remaining = 0;
        dungeonProgressRef.current.fightsRemainingBeforeDungeon = threshold;
        pushLog(`Selected map: farm ${threshold} fights required before dungeon.`);
      }
    } else {
      // not a dungeon-capable map: reset progress
      dungeonProgressRef.current.activeMapId = null;
      dungeonProgressRef.current.activeDungeonIndex = null;
      dungeonProgressRef.current.activeDungeonId = null;
      dungeonProgressRef.current.remaining = 0;
      dungeonProgressRef.current.fightsRemainingBeforeDungeon = 0;
    }

    // spawn enemies according to count and dungeon rules, but only if templates explicitly belong to this map
    let spawned = 0;
    for (let i = 0; i < count; i++) {
      if (isDungeonActive && (dungeonProgressRef.current.remaining || 0) === 1) {
        // boss floor: spawn boss once
        const idx = dungeonProgressRef.current.activeDungeonIndex ?? null;
        const bossId = (idx !== null && selectedMap?.dungeons && selectedMap.dungeons[idx]) ? selectedMap.dungeons[idx].bossTemplateId : undefined;
        if (bossId) {
          // ensure boss template is listed in the map's enemyPool
          const bossTpl = ENEMY_TEMPLATES.find((t) => t.templateId === bossId);
          const bossBelongs = bossTpl && selectedMap?.enemyPool && selectedMap.enemyPool.includes(bossId);
          if (bossBelongs) {
            spawnEnemy(bossId);
            spawned++;
          } else {
            console.log('[DEBUG] boss template not in map.enemyPool, skipping spawn', { bossId, selectedMapId, bossTpl, pool: selectedMap?.enemyPool });
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
    setInCombat(true);
  }, [spawnEnemy, pushLog, selectedMapId]);


  const endEncounter = useCallback((msg?: string, opts?: { type?: 'clear' | 'flee' | 'death' }) => {
    // spawn a single gold pickup for the encounter (sum of per-enemy dust)
    const count = encounterCountRef.current || 0;
    let total = 0;
    for (let i = 0; i < count; i++) total += (Math.random() * (2 - 0.8) + 0.8);
    total = Number(total.toFixed(2));
      try {
      spawnGoldPickup(total, player.x, player.y);
      // notify player via log and a short effect so drops are visible
      pushLog(`Gold dropped: +${total} g`);
      try { addEffect({ type: 'pickup', text: `+${total} g`, target: 'player' }); } catch (e) {}
    } catch (e) {}
    encounterCountRef.current = 0;
    setInCombat(false);
    setEnemies([]);
    // if this endEncounter reports a death, restore player HP to max (respawn)
    if (opts?.type === 'death') {
      try { setPlayer((p) => ({ ...p, hp: (p.maxHp ?? p.hp) })); } catch (e) {}
      try { addToast && addToast(msg ? String(msg) : 'You died.', 'error', 4000); } catch (e) {}
    }
    if (msg) pushLog(msg);
    // Track farming progress: if player is on a map that has dungeons but the dungeon
    // hasn't been activated yet, count this completed encounter toward the threshold.
      try {
        const mapsListNow = getMaps();
        const currentMap = mapsListNow.find((m) => m.id === selectedMapId) ?? null;
        // capture whether we were already inside a dungeon at the start of this encounter
        const wasDungeonActiveAtStart = (dungeonProgressRef.current.activeDungeonIndex != null && dungeonProgressRef.current.activeMapId === currentMap?.id);
        const currentSession = encounterSessionRef.current || 0;
        console.log('[DEBUG] endEncounter start', { msg, opts: (opts as any) ?? null, currentSession, dungeonProgress: dungeonProgressRef.current, wasDungeonActiveAtStart });
        // determine encounter result type (default to 'clear' when not provided)
        const resultType = opts?.type ?? (msg && String(msg).toLowerCase().includes("mort") ? 'death' : 'clear');

        // If the player died while inside a dungeon, expel them and reset progression
          if (resultType === 'death' && dungeonProgressRef.current.activeDungeonIndex != null && dungeonProgressRef.current.activeMapId === currentMap?.id) {
          try {
            const threshold = (currentMap as any)?.dungeonThreshold ?? 20;
            // keep the map as active so the fights counter is visible, but clear the active dungeon
            dungeonProgressRef.current.activeMapId = currentMap?.id || null;
            dungeonProgressRef.current.activeDungeonIndex = null;
            dungeonProgressRef.current.activeDungeonId = null;
              dungeonProgressRef.current.remaining = 0;
              // reset the fightsRemainingBeforeDungeon to 0 after a death so the dungeon threshold is cleared
              dungeonProgressRef.current.fightsRemainingBeforeDungeon = 0;
              try { console.log('the dungeon gate moves away from you..'); } catch (e) {}
              try { addToast && addToast("The dungeon gate moves away from you..", 'error', 4000); } catch (e) {}
            // mark the current encounter session as processed so no residual endEncounter call will decrement counters
            const sess = encounterSessionRef.current || 0;
            dungeonProgressRef.current.lastProcessedSession = sess;
            dungeonProgressRef.current.lastDungeonProcessedSession = sess;
            dungeonProgressRef.current.suppressUntilSession = sess + 1;
            syncDungeonUI();
            console.log('[DEBUG] reset dungeon progress on death', { map: currentMap?.id, threshold, session: sess, dungeonProgress: dungeonProgressRef.current });
            // respawn player
            try { setPlayer((p) => ({ ...p, hp: (p.maxHp ?? p.hp) })); } catch (e) {}
            pushLog("You died — expelled from the dungeon. Progress has been reset.");
          } catch (e) { console.error('[DEBUG] error resetting dungeon on death', e); }
          // stop further processing in this endEncounter to avoid immediately decrementing the farm counter
          return;
        }

        if (currentMap?.dungeons && dungeonProgressRef.current.activeMapId === currentMap.id && (dungeonProgressRef.current.activeDungeonIndex == null) && resultType === 'clear') {
        // only decrement once per encounter session
        console.log('[DEBUG] endEncounter - session check', { currentSession, lastProcessed: dungeonProgressRef.current.lastProcessedSession, selectedMapId, currentMapId: currentMap.id, fightsRemainingBeforeDungeon: dungeonProgressRef.current.fightsRemainingBeforeDungeon, suppressUntil: dungeonProgressRef.current.suppressUntilSession });
        if (dungeonProgressRef.current.suppressUntilSession && currentSession <= (dungeonProgressRef.current.suppressUntilSession || 0)) {
          console.log('[DEBUG] skipping farm decrement due to suppressUntilSession', { currentSession, suppressUntil: dungeonProgressRef.current.suppressUntilSession });
        } else if (dungeonProgressRef.current.lastProcessedSession !== currentSession) {
            dungeonProgressRef.current.lastProcessedSession = currentSession;
            // decrement fights remaining
            const before = dungeonProgressRef.current.fightsRemainingBeforeDungeon || 0;
            dungeonProgressRef.current.fightsRemainingBeforeDungeon = Math.max(0, before - 1);
            const after = dungeonProgressRef.current.fightsRemainingBeforeDungeon || 0;
            console.log('[DEBUG] decrement fightsRemainingBeforeDungeon', { before, after });
            const remaining = after;
            syncDungeonUI();
              if (remaining > 0) {
              } else {
              // threshold reached -> activate a dungeon for this map and auto-enter
              const idx = Math.floor(Math.random() * (currentMap.dungeons?.length || 1));
              const d = currentMap.dungeons ? currentMap.dungeons[idx] : undefined;
              dungeonProgressRef.current.activeDungeonIndex = idx;
              dungeonProgressRef.current.activeDungeonId = d?.id ?? null;
              dungeonProgressRef.current.remaining = d?.floors ?? 0;
              // suppress decrements for the session that activated the dungeon
              dungeonProgressRef.current.suppressUntilSession = (encounterSessionRef.current || 0) + 1;
                      const dungeonName = d?.name ?? d?.id ?? 'dungeon';
              console.log('[DEBUG] activating dungeon', { dungeonIndex: idx, dungeonId: dungeonProgressRef.current.activeDungeonId, dungeonName, currentMap: currentMap.id });
              syncDungeonUI();
              // start the dungeon encounter immediately, then notify the player
                try { window.setTimeout(() => { try { startEncounter(); console.log('[DEBUG] scheduled startEncounter invoked'); } catch (e) { console.error('[DEBUG] scheduled startEncounter error', e); } }, 50); } catch (e) { console.error('[DEBUG] scheduling startEncounter error', e); }
                pushLog(`You enter the dungeon '${dungeonName}' on ${currentMap.name} — good luck!`);
                  try { addEffect({ type: 'dungeon', text: `Entrance: ${dungeonName}`, target: 'player' }); } catch (e) {}
                // stop further processing in this endEncounter to avoid immediately decrementing dungeon remaining
                return;
          }
        }
      }
        // If we are inside a dungeon (active index set) and this endEncounter corresponds
        // to a dungeon room (not farming), decrement the dungeon remaining floors once.
        // only decrement dungeon remaining if the dungeon was already active when the encounter started
        if (wasDungeonActiveAtStart && dungeonProgressRef.current.activeDungeonIndex != null && dungeonProgressRef.current.activeMapId === currentMap?.id && resultType === 'clear') {
          console.log('[DEBUG] processing dungeon room completion', { currentSession, lastDungeonProcessed: dungeonProgressRef.current.lastDungeonProcessedSession, suppressUntil: dungeonProgressRef.current.suppressUntilSession });
          if (dungeonProgressRef.current.suppressUntilSession && currentSession <= (dungeonProgressRef.current.suppressUntilSession || 0)) {
            console.log('[DEBUG] skipping dungeon remaining decrement due to suppressUntilSession', { currentSession, suppressUntil: dungeonProgressRef.current.suppressUntilSession });
          } else if (dungeonProgressRef.current.lastDungeonProcessedSession !== currentSession) {
            dungeonProgressRef.current.lastDungeonProcessedSession = currentSession;
            // decrement remaining floors
            const beforeRem = dungeonProgressRef.current.remaining || 0;
            dungeonProgressRef.current.remaining = Math.max(0, (dungeonProgressRef.current.remaining || 0) - 1);
            const afterRem = dungeonProgressRef.current.remaining || 0;
            console.log('[DEBUG] dungeon room completed - remaining floors', { beforeRem, afterRem });
            syncDungeonUI();
            if (afterRem === 0) {
                // Grant end-of-dungeon rewards: gold, XP, and a guaranteed item
                try {
                  const idx = dungeonProgressRef.current.activeDungeonIndex ?? 0;
                  const d = currentMap?.dungeons ? currentMap.dungeons[idx] : undefined;
                  const dungeonName = d?.name ?? d?.id ?? 'dungeon';
                  const floors = d?.floors ?? 0;
                  const goldReward = Math.round(100 + (player.level || 1) * 10 + floors * 25);
                  const xpReward = Math.round(50 + (player.level || 1) * 5 + floors * 20);
                  // credit gold immediately
                  try { setPlayer((p) => ({ ...p, gold: +(((p.gold ?? 0) + goldReward).toFixed(2)) })); } catch (e) {}
                  // credit XP (may level up)
                  try { addXp && addXp(xpReward); } catch (e) {}
                  // create a guaranteed reward item and add to inventory
                  try {
                    const rarity = Math.random() < 0.08 ? 'legendary' : Math.random() < 0.25 ? 'epic' : 'rare';
                    const itemName = `${dungeonName} Reward ${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`;
                    createCustomItem && createCustomItem({ slot: 'weapon' as any, name: itemName, rarity: rarity as any, category: 'weapon', stats: { dmg: Math.max(1, Math.round((player.dmg || 1) * (rarity === 'legendary' ? 1.6 : rarity === 'epic' ? 1.2 : 1))) } }, true);
                  } catch (e) { console.error('create reward item error', e); }
                  // notify player
                  pushLog(`Dungeon complete! You earned +${goldReward} g and +${xpReward} XP.`);
                  try { addToast && addToast(`Dungeon cleared! Reward: +${goldReward} g, +${xpReward} XP.`, 'ok', 6000); } catch (e) {}
                  try { addEffect && addEffect({ type: 'pickup', text: `+${goldReward} g`, target: 'player' }); } catch (e) {}
                } catch (e) { console.error('[DEBUG] dungeon reward error', e); }
                // clear dungeon progress
                dungeonProgressRef.current.activeMapId = null;
                dungeonProgressRef.current.activeDungeonIndex = null;
                dungeonProgressRef.current.activeDungeonId = null;
                syncDungeonUI();
              } else {
              pushLog(`Room cleared — ${afterRem} floor(s) remaining`);
            }
          }
        }
    } catch (e) { console.error('[DEBUG] endEncounter error', e); }
    // schedule clearing the logs after a short delay so player can read result
    if (logClearRef.current) clearTimeout(logClearRef.current);
    logClearRef.current = window.setTimeout(() => {
      setLogs([]);
      logClearRef.current = null;
    }, 1000);
  }, [setEnemies, pushLog, spawnGoldPickup, player.x, player.y, selectedMapId, startEncounter, setPlayer, addXp, createCustomItem, addToast, addEffect]);

  // clear timeout on unmount
  useEffect(() => {
    return () => {
      if (logClearRef.current) clearTimeout(logClearRef.current);
    };
  }, []);

  const rollChance = useCallback((percent = 0) => Math.random() * 100 < (percent ?? 0), []);

  const calcDamage = useCallback((atk: number, def: number, isCrit = false) => {
    // atk: raw attack value, def: raw defense value
    // add small variance to attack
    const variance = 0.85 + Math.random() * 0.3; // 0.85 .. 1.15
    let base = Math.max(1, atk * variance);
    // crit increases damage by 1.5..1.9
    if (isCrit) base = base * (1.5 + Math.random() * 0.4);
    // simple armor mitigation: 100 / (100 + def)
    const mitigation = 100 / (100 + Math.max(0, def));
    const dmg = Math.max(1, Math.round(base * mitigation));
    return dmg;
  }, []);

  const { onAttack, onRun } = useCombat({ player, setPlayer, enemies, setEnemies, addXp, pushLog, endEncounter, onEffect: addEffect, onDrop: maybeDropFromEnemy });

  const mapsList = getMaps();
  const selectedMap = useMemo(() => mapsList.find((m) => m.id === selectedMapId) ?? null, [mapsList, selectedMapId]);

  // Initialize dungeon farming progress when the player selects a map (ensure threshold set immediately)
  useEffect(() => {
    try {
      const currentMap = getMaps().find((m) => m.id === selectedMapId) ?? null;
      if (currentMap?.dungeons && dungeonProgressRef.current.activeMapId !== currentMap.id) {
        const threshold = (currentMap as any).dungeonThreshold ?? 20;
        dungeonProgressRef.current.activeMapId = currentMap.id;
        dungeonProgressRef.current.activeDungeonIndex = null;
        dungeonProgressRef.current.activeDungeonId = null;
        dungeonProgressRef.current.remaining = 0;
        dungeonProgressRef.current.fightsRemainingBeforeDungeon = threshold;
        dungeonProgressRef.current.lastProcessedSession = undefined as any;
        pushLog(`Selected map: farm ${threshold} fights required before dungeon.`);
        console.log('[DEBUG] map selected - init farming', { mapId: currentMap.id, threshold, dungeonProgress: dungeonProgressRef.current });
        syncDungeonUI();
      } else if (!currentMap) {
        dungeonProgressRef.current.activeMapId = null;
        dungeonProgressRef.current.activeDungeonIndex = null;
        dungeonProgressRef.current.activeDungeonId = null;
        dungeonProgressRef.current.remaining = 0;
        dungeonProgressRef.current.fightsRemainingBeforeDungeon = 0;
        syncDungeonUI();
      }
    } catch (e) {}
  }, [selectedMapId]);

  // wrapper used by store modal so it returns a result message usable by the modal
  const storeBuy = useCallback((type: 'small' | 'medium' | 'large') => {
    try {
      const ok = buyPotion(type);
      if (ok) {
        const label = type === 'small' ? 'small potion' : (type === 'medium' ? 'medium potion' : 'large potion');
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

  return (
    <div className="app-shell">
      {/* debug badge: shows current modalName (temporary) */}
      {modalName && (
        <div style={{ position: 'fixed', right: 14, top: 14, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 10px', borderRadius: 8, zIndex: 99999, fontSize: 12 }}>
          modal: {modalName}
        </div>
      )}
      <header className="app-header">
        <h1>Arena Quest</h1>
        <p className="subtitle">Adventure mmorp</p>
      </header>

      <div className="main-grid">
        <aside className="sidebar-left">
          <Player {...player} onOpenModal={openModal} />
        </aside>

        <main className="center-area">
          <div className="center-top">
            <button
              className={`btn primary ${inCombat ? "disabled" : ""}`}
              onClick={startEncounter}
              disabled={inCombat}
            >
              {inCombat ? "In combat..." : (selectedMap?.dungeons && dungeonUI.activeMapId === selectedMap.id && dungeonUI.activeDungeonIndex != null ? "Next room" : "Go to Arena")}
            </button>
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
                return <ArenaPanel enemies={enemies} logs={logs} onAttack={onAttack} onRun={onRun} pickups={pickups} collectPickup={collectPickup} pushLog={pushLog} logColor={selectedMap?.logColor} disableRun={!!inDungeonActive} />;
              })()
            }
     
                   <EffectsLayer effects={effects} />
          </div>
        </main>

        <aside className="sidebar-right">
          <RightSidebar onOpenModal={openModal} />
        </aside>
      </div>
      {modalName === "inventory" && (
          <InventoryModal
          inventory={inventory}
          equipment={equipment}
          onEquip={(item: any) => {
            try { console.log('equip requested', item && item.id, item && item.slot); } catch (e) {}
            try {
              const ok = equipItem(item);
              if (ok) pushLog(`Equipped: ${item.name} (${item.slot})`);
              else {
                const msg = `Unable to equip ${item.name} (${item.rarity ?? 'unknown'}) — not found in inventory.`;
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
                  try { pushLog && pushLog(r.msg); } catch (e) {}
                  try { addToast && addToast(r.msg, r.ok ? 'ok' : 'error'); } catch (e) {}
                  return r;
                }).catch((err) => {
                  console.error('forge promise error', err);
                  const r = { ok: false, msg: 'Forge failed' };
                  try { pushLog && pushLog(r.msg); } catch (e) {}
                  try { addToast && addToast(r.msg, 'error'); } catch (e) {}
                  return r;
                });
              } else {
                const r = res as { ok: boolean; msg: string };
                try { pushLog && pushLog(r.msg); } catch (e) {}
                try { addToast && addToast(r.msg, r.ok ? 'ok' : 'error'); } catch (e) {}
                return r;
              }
            } catch (e) { console.error('onForge handler error', e); return { ok: false, msg: 'Forge error' }; }
          }}
          onClose={closeModal}
        />
      )}
      {modalName === 'store' && (
        <StoreModal onClose={closeModal} buyPotion={storeBuy} playerGold={player.gold ?? 0} />
      )}
      {modalName === 'catalogue' && (
        <CatalogModal onClose={closeModal} />
      )}
      {modalName === 'bestiary' && (
        <BestiaryModal onClose={closeModal} enemies={enemies} selectedMapId={selectedMapId} />
      )}
      {modalName === 'maps' && (
        <MapsModal onClose={closeModal} onSelect={(id?: string | null) => {
              try {
            setSelectedMapId(id ?? null);
            if (id) {
              const mm = mapsList.find((x) => x.id === id);
              pushLog && pushLog(`Map selected: ${mm?.name ?? id}`);
            } else {
              pushLog && pushLog('Map deselected — Spawn active');
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
