"use client";

import { useGameState } from "./useGameState";
import { useGameLoop } from "./useGameLoop";
import Player from "../components/Player";
import ArenaPanel from "../components/arena/ArenaPanel";
import RightSidebar from "../components/RightSidebar";
import InventoryModal from "../components/modales/InventoryModal";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import useCombat from "./useCombat";
import EffectsLayer from "../components/EffectsLayer";

export default function Game() {
  const { player, setPlayer, enemies, setEnemies, spawnEnemy, addXp, maybeDropFromEnemy, equipment, setEquipment, inventory, setInventory, equipItem, unequipItem } = useGameState();

  // modal system (generalized)
  const [modalName, setModalName] = useState<string | null>(null);
  const [modalProps, setModalProps] = useState<any>(null);
  const openModal = (name: string, props?: any) => {
    // debug log to help verify clicks
    try { console.log("openModal ->", name, props); } catch (e) {}
    setModalName(name);
    // if opening inventory, include current inventory/equipment when no props provided
    if (name === "inventory") {
      setModalProps(props ?? { inventory, equipment });
    } else {
      setModalProps(props ?? null);
    }
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
  const [effects, setEffects] = useState<Array<{ id: string; type: string; text?: string; kind?: string; target?: string; x?: number; y?: number }>>([]);
  const logClearRef = useRef<number | null>(null);

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
    for (let i = 0; i < count; i++) spawnEnemy();
    pushLog(`Nouvelle rencontre: ${count} ennemi(s) apparu(s).`);
    setInCombat(true);
  }, [spawnEnemy, pushLog]);

  const endEncounter = useCallback((msg?: string) => {
    setInCombat(false);
    setEnemies([]);
    if (msg) pushLog(msg);
    // schedule clearing the logs after a short delay so player can read result
    if (logClearRef.current) clearTimeout(logClearRef.current);
    logClearRef.current = window.setTimeout(() => {
      setLogs([]);
      logClearRef.current = null;
    }, 1000);
  }, [setEnemies, pushLog]);

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

  return (
    <div className="app-shell">
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

          <div style={{ position: 'relative' }}>
            <ArenaPanel enemies={enemies} logs={logs} onAttack={onAttack} onRun={onRun} />
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
          onClose={closeModal}
        />
      )}
    </div>
  );
}
