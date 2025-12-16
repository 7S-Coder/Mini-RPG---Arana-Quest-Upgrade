"use client";

import { useGameState } from "./uses/useGameState";
import { useGameLoop } from "./uses/useGameLoop";
import Player from "../components/Player";
import ArenaPanel from "../components/arena/ArenaPanel";
import RightSidebar from "../components/RightSidebar";
import InventoryModal from "../components/modales/InventoryModal";
import Modal from "../components/modales/Modal";
import StoreModal from "../components/modales/StoreModal";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import useCombat from "./uses/useCombat";
import EffectsLayer from "../components/EffectsLayer";
import BestiaryModal from "../components/modales/BestiaryModal";
import MapsModal from "../components/modales/MapsModal";
import CatalogModal from "../components/modales/CatalogModal";
import { getMaps, pickEnemyFromMap, pickEnemyFromRoom } from "./templates/maps";
import { ENEMY_TEMPLATES } from "./templates/enemies";
import { calcDamage } from "./damage";
import { useLogs } from "../hooks/useLogs";
import { useToasts } from "../hooks/useToasts";
import { useDungeon } from "../hooks/useDungeon";

export default function Game() {
  const { player, setPlayer, enemies, setEnemies, spawnEnemy, addXp, maybeDropFromEnemy, equipment, setEquipment, inventory, setInventory, equipItem, unequipItem, sellItem, spawnGoldPickup, pickups, collectPickup, collectAllPickups, buyPotion, consumeItem, createCustomItem, forgeThreeIdentical, progression, allocate, deallocate } = useGameState();

  // modal system (generalized)
  const [modalName, setModalName] = useState<string | null>(null);
  const [modalProps, setModalProps] = useState<any>(null);
  const openModal = (name: string, props?: any) => {
    // compute final props (apply defaults for inventory modal)
    const resolved = name === "inventory" ? (props ?? { inventory, equipment, player, progression, allocate, deallocate }) : (props ?? null);
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
      const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [effects, setEffects] = useState<Array<{ id: string; type: string; text?: string; kind?: string; target?: string; x?: number; y?: number }>>([]);
  const logClearRef = useRef<number | null>(null);
  const encounterCountRef = useRef<number>(0);
  const encounterSessionRef = useRef<number>(0);
  const startEncounterRef = useRef<() => void>(() => {});

  // useLogs hook will be used below (extracted)
  const { logs, pushLog, clearLogs } = useLogs();
  const { toasts, addToast } = useToasts();

  // show toast when player levels up: inform gained allocation points
  const lastLevelRef = useRef<number | null>(null);
  useEffect(() => {
    try {
      const cur = player?.level ?? null;
      // initialize ref on first render
      if (lastLevelRef.current === null) {
        lastLevelRef.current = cur;
        return;
      }
      if (cur !== null && lastLevelRef.current !== null && cur > lastLevelRef.current) {
        const gained = (cur - lastLevelRef.current) || 0;
        const points = gained * 5;
        try { addToast && addToast(`Level up! ${points} points to be allocated.`, 'ok', 4000); } catch (e) {}
      }
      lastLevelRef.current = cur;
    } catch (e) {}
  }, [player && player.level, addToast]);

  useEffect(() => { inCombatRef.current = inCombat; }, [inCombat]);

  // show a welcome message once when the game component mounts (spawn)
  useEffect(() => {
    try { pushLog && pushLog('Welcome, adventurer — you have arrived in the arena.'); } catch (e) {}
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


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
    // prevent starting encounter on a locked map (min level only)
    if (selectedMap?.minLevel && player.level < selectedMap.minLevel) {
      try { pushLog(`Map locked: requires level ${selectedMap.minLevel}+`); } catch (e) {}
      try { addToast && addToast(`Map locked: requires level ${selectedMap.minLevel}+`, 'error'); } catch (e) {}
      return;
    }

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
    // dungeon initialization is handled by useDungeon

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
            const dungeonId = (selectedMap?.dungeons && typeof idx === 'number') ? selectedMap.dungeons[idx].id : undefined;
            const roomId = dungeonId ? `${dungeonId}_floor_1` : undefined;
            spawnEnemy(bossId, undefined, { isBoss: true, roomId });
            spawned++;
          } else {
            console.log('[DEBUG] boss template not in map.enemyPool, skipping spawn', { bossId, selectedMapId, bossTpl, pool: selectedMap?.enemyPool });
          }
        }
      } else {
          // If inside a dungeon (non-boss floor), prefer room-based deterministic spawns
          if (isDungeonActive && dungeonProgressRef.current.activeDungeonId) {
            const dungeonId = dungeonProgressRef.current.activeDungeonId;
            const remaining = dungeonProgressRef.current.remaining || 0;
            const roomId = `${dungeonId}_floor_${remaining}`;
            const tid = pickEnemyFromRoom(selectedMapId ?? undefined, roomId);
            if (tid) {
              // If this room is defined, allow it even if not present in map.enemyPool
              const roomObj = selectedMap?.rooms ? selectedMap.rooms.find((r) => r.id === roomId) : undefined;
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
    setInCombat(true);
  }, [spawnEnemy, pushLog, selectedMapId]);

  // expose the startEncounter function to the dungeon hook so it can schedule auto-enter
  useEffect(() => {
    try { startEncounterRef.current = startEncounter as any; } catch (e) {}
  }, [startEncounter]);


  const endEncounter = useCallback((msg?: string, opts?: { type?: 'clear' | 'flee' | 'death' }) => {
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
  }, [setEnemies, pushLog, spawnGoldPickup, player.x, player.y, selectedMapId, startEncounter, setPlayer, addXp, createCustomItem, addToast, addEffect]);

  // clear timeout on unmount
  useEffect(() => {
    return () => {
      if (logClearRef.current) clearTimeout(logClearRef.current);
    };
  }, []);

  const rollChance = useCallback((percent = 0) => Math.random() * 100 < (percent ?? 0), []);

  // damage calculation extracted to game/damage.ts (calcDamage)

  const { onAttack, onRun } = useCombat({ player, setPlayer, enemies, setEnemies, addXp, pushLog, endEncounter, onEffect: addEffect, onDrop: (enemy: any) => maybeDropFromEnemy(enemy, selectedMapId) });

  const mapsList = getMaps();
  const selectedMap = useMemo(() => mapsList.find((m) => m.id === selectedMapId) ?? null, [mapsList, selectedMapId]);

  // dungeon initialization is handled by useDungeon

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
      {/* debug overlay: progression + localStorage (temporary) */}
      {/* debug overlay removed in production */}
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
                return <ArenaPanel enemies={enemies} logs={logs} onAttack={onAttack} onRun={onRun} pickups={pickups} collectPickup={collectPickup} collectAllPickups={collectAllPickups} pushLog={pushLog} logColor={selectedMap?.logColor} disableRun={!!inDungeonActive} />;
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
        <StoreModal onClose={closeModal} buyPotion={storeBuy} playerGold={player.gold ?? 0} />
      )}
      {modalName === 'catalogue' && (
        <CatalogModal onClose={closeModal} />
      )}
      {modalName === 'bestiary' && (
        <BestiaryModal onClose={closeModal} enemies={enemies} selectedMapId={selectedMapId} />
      )}
      {modalName === 'maps' && (
        <MapsModal playerLevel={player.level} onClose={closeModal} onSelect={(id?: string | null) => {
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
