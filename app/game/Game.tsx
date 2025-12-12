"use client";

import { useGameState } from "./useGameState";
import { useGameLoop } from "./useGameLoop";
import Player from "../components/Player";
import ArenaPanel from "../components/arena/ArenaPanel";
import RightSidebar from "../components/RightSidebar";
import InventoryModal from "../components/modales/InventoryModal";
import Modal from "../components/modales/Modal";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import useCombat from "./useCombat";
import EffectsLayer from "../components/EffectsLayer";
import BestiaryModal from "../components/modales/BestiaryModal";
import MapsModal from "../components/modales/MapsModal";
import { getMaps, pickEnemyFromMap } from "./maps";

export default function Game() {
  const { player, setPlayer, enemies, setEnemies, spawnEnemy, addXp, maybeDropFromEnemy, equipment, setEquipment, inventory, setInventory, equipItem, unequipItem, sellItem, spawnGoldPickup, pickups, collectPickup } = useGameState();

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
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [effects, setEffects] = useState<Array<{ id: string; type: string; text?: string; kind?: string; target?: string; x?: number; y?: number }>>([]);
  const logClearRef = useRef<number | null>(null);
  const encounterCountRef = useRef<number>(0);
  const dungeonProgressRef = useRef<{ activeMapId?: string | null; remaining?: number }>({ activeMapId: null, remaining: 0 });

  const pushLog = useCallback((text: string) => {
    setLogs((l) => {
      const next = [...l, text];
      return next.slice(Math.max(0, next.length - 100));
    });
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

  const startEncounter = useCallback(() => {
    // prevent spawning if already in combat
    if (inCombat) {
      pushLog("Vous êtes déjà en combat.");
      return;
    }
    // spawn 1-3 enemies
    // clear pending log clear timeout if any
    if (logClearRef.current) {
      clearTimeout(logClearRef.current);
      logClearRef.current = null;
    }
    const count = 1 + Math.floor(Math.random() * 3);
    encounterCountRef.current = count;
    // initialize dungeon progress when entering a new dungeon map
    if (selectedMap?.dungeon) {
      if (dungeonProgressRef.current.activeMapId !== selectedMap.id) {
        dungeonProgressRef.current.activeMapId = selectedMap.id;
        dungeonProgressRef.current.remaining = selectedMap.dungeon?.floors ?? 0;
      }
    } else {
      // not a dungeon: reset progress
      dungeonProgressRef.current.activeMapId = null;
      dungeonProgressRef.current.remaining = 0;
    }

    const isDungeonActive = dungeonProgressRef.current.activeMapId === selectedMap?.id && (dungeonProgressRef.current.remaining || 0) > 0;
    for (let i = 0; i < count; i++) {
      // if this is the last dungeon floor, spawn the boss instead
      if (isDungeonActive && (dungeonProgressRef.current.remaining || 0) === 1 && selectedMap?.dungeon?.bossTemplateId) {
        spawnEnemy(selectedMap.dungeon.bossTemplateId);
      } else {
        const tid = selectedMapId ? pickEnemyFromMap(selectedMapId) : undefined;
        spawnEnemy(tid);
      }
    }
    // after spawning, if in dungeon and we consumed a floor, decrement
    if (isDungeonActive) {
      dungeonProgressRef.current.remaining = Math.max(0, (dungeonProgressRef.current.remaining || 0) - 1);
      if ((dungeonProgressRef.current.remaining || 0) === 0) {
        // dungeon complete next encounter
        dungeonProgressRef.current.activeMapId = null;
      }
    }
    pushLog(`Nouvelle rencontre: ${count} ennemi(s) apparu(s).`);
    setInCombat(true);
  }, [spawnEnemy, pushLog, inCombat, selectedMapId]);


  const endEncounter = useCallback((msg?: string) => {
    // spawn a single gold pickup for the encounter (sum of per-enemy dust)
    const count = encounterCountRef.current || 0;
    let total = 0;
    for (let i = 0; i < count; i++) total += (Math.random() * (2 - 0.8) + 0.8);
    total = Number(total.toFixed(2));
    try {
      spawnGoldPickup(total, player.x, player.y);
      // notify player via log and a short effect so drops are visible
      pushLog(`Pièces tombées: +${total} g`);
      try { addEffect({ type: 'pickup', text: `+${total} g`, target: 'player' }); } catch (e) {}
    } catch (e) {}
    encounterCountRef.current = 0;
    setInCombat(false);
    setEnemies([]);
    if (msg) pushLog(msg);
    // schedule clearing the logs after a short delay so player can read result
    if (logClearRef.current) clearTimeout(logClearRef.current);
    logClearRef.current = window.setTimeout(() => {
      setLogs([]);
      logClearRef.current = null;
    }, 1000);
  }, [setEnemies, pushLog, spawnGoldPickup, player.x, player.y]);

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
        <p className="subtitle">Adventure mmorp - mobile first</p>
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
              {inCombat ? "En combat..." : "Aller à l'arène"}
            </button>
          </div>

          <div style={{ position: 'relative' }}><ArenaPanel enemies={enemies} logs={logs} onAttack={onAttack} onRun={onRun} pickups={pickups} collectPickup={collectPickup} pushLog={pushLog} logColor={selectedMap?.logColor} />
     
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
              if (ok) pushLog(`Équipé: ${item.name} (${item.slot})`);
              else pushLog(`Impossible d'équiper ${item.name} — introuvable dans l'inventaire.`);
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
            if (!it) { pushLog('Vente impossible.'); return; }
            const high = ['epic', 'legendary', 'mythic'];
            if (high.includes(it.rarity)) {
              // open confirm modal
              setModalName('confirm');
              setModalProps({ item: it });
              return;
            }
            const ok = sellItem(itemId);
            if (ok) pushLog(`Vend: +${it.cost ?? 0} g`);
            else pushLog('Vente impossible.');
          }}
          onClose={closeModal}
        />
      )}
      {modalName === 'bestiary' && (
        <BestiaryModal onClose={closeModal} enemies={enemies} />
      )}
      {modalName === 'maps' && (
        <MapsModal onClose={closeModal} onSelect={(id?: string | null) => {
          try {
            setSelectedMapId(id ?? null);
            if (id) {
              const mm = mapsList.find((x) => x.id === id);
              pushLog && pushLog(`Carte sélectionnée: ${mm?.name ?? id}`);
            } else {
              pushLog && pushLog('Carte désactivée');
            }
          } catch (e) {}
        }} selectedId={selectedMapId} />
      )}
      {modalName === 'confirm' && modalProps && (
        <Modal title="Confirmer la vente" onClose={closeModal}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>Voulez-vous réellement vendre <strong>{modalProps.item.name}</strong> pour <strong>{modalProps.item.cost ?? 0} g</strong> ?</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn primary" onClick={() => {
                try { const ok = sellItem(modalProps.item.id); if (ok) pushLog(`Vend: +${modalProps.item.cost ?? 0} g`); else pushLog('Vente impossible.'); } catch(e){ try{console.error(e)}catch(e){} }
                closeModal();
              }}>Vendre</button>
              <button className="btn" onClick={closeModal}>Annuler</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
