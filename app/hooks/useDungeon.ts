import { useEffect, useRef, useState } from "react";
import { getMaps } from "../game/templates/maps";

type DungeonProgress = {
  activeMapId?: string | null;
  activeDungeonIndex?: number | null;
  activeDungeonId?: string | null;
  remaining?: number;
  fightsRemainingBeforeDungeon?: number;
  lastProcessedSession?: number | undefined;
  lastDungeonProcessedSession?: number | undefined;
  suppressUntilSession?: number | undefined;
};

export function useDungeon(opts: {
  selectedMapId: string | null;
  pushLog: (s: string) => void;
  addEffect?: (e: any) => void;
  addToast?: (t: string, type?: string, ttl?: number) => void;
  createCustomItem?: (arg0: any, arg1?: boolean) => void;
  addXp?: (n: number) => void;
  setPlayer?: (updater: any) => void;
  encounterSessionRef: React.MutableRefObject<number>;
  startEncounterRef: React.MutableRefObject<(() => void) | null>;
}) {
  const { selectedMapId, pushLog, addEffect, addToast, createCustomItem, addXp, setPlayer, encounterSessionRef, startEncounterRef } = opts;

  const dungeonProgressRef = useRef<DungeonProgress>({ activeMapId: null, activeDungeonIndex: null, activeDungeonId: null, remaining: 0, fightsRemainingBeforeDungeon: 0, lastProcessedSession: undefined, lastDungeonProcessedSession: undefined, suppressUntilSession: undefined });
  const [dungeonUI, setDungeonUI] = useState(() => ({ ...dungeonProgressRef.current }));
  const syncDungeonUI = () => setDungeonUI({ ...dungeonProgressRef.current });

  // initialize/reset dungeon progress when map selection changes
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMapId]);

  function processEndEncounter(args: { currentMap: any; player: any; opts?: any; msg?: string }) {
    try {
      const { currentMap, player, opts, msg } = args;
      const wasDungeonActiveAtStart = (dungeonProgressRef.current.activeDungeonIndex != null && dungeonProgressRef.current.activeMapId === currentMap?.id);
      const currentSession = encounterSessionRef.current || 0;
      const resultType = opts?.type ?? (msg && String(msg).toLowerCase().includes("mort") ? 'death' : 'clear');

      // If the player died while inside a dungeon, expel them and reset progression
      if (resultType === 'death' && dungeonProgressRef.current.activeDungeonIndex != null && dungeonProgressRef.current.activeMapId === currentMap?.id) {
        try {
          dungeonProgressRef.current.activeMapId = currentMap?.id || null;
          dungeonProgressRef.current.activeDungeonIndex = null;
          dungeonProgressRef.current.activeDungeonId = null;
          dungeonProgressRef.current.remaining = 0;
          dungeonProgressRef.current.fightsRemainingBeforeDungeon = 0;
          try { console.log('the dungeon gate moves away from you..'); } catch (e) {}
          try { addToast && addToast("The dungeon gate moves away from you..", 'error', 4000); } catch (e) {}
          const sess = encounterSessionRef.current || 0;
          dungeonProgressRef.current.lastProcessedSession = sess;
          dungeonProgressRef.current.lastDungeonProcessedSession = sess;
          dungeonProgressRef.current.suppressUntilSession = sess + 1;
          syncDungeonUI();
          try { setPlayer && setPlayer((p: any) => ({ ...p, hp: (p.maxHp ?? p.hp) })); } catch (e) {}
          pushLog("You died — expelled from the dungeon. Progress has been reset.");
        } catch (e) { console.error('[DEBUG] error resetting dungeon on death', e); }
        return true; // handled => exit caller early
      }

      // farming progress: decrement fightsRemainingBeforeDungeon when applicable
      if (currentMap?.dungeons && dungeonProgressRef.current.activeMapId === currentMap.id && (dungeonProgressRef.current.activeDungeonIndex == null) && resultType === 'clear') {
        if (dungeonProgressRef.current.suppressUntilSession && currentSession <= (dungeonProgressRef.current.suppressUntilSession || 0)) {
          // skip
        } else if (dungeonProgressRef.current.lastProcessedSession !== currentSession) {
          dungeonProgressRef.current.lastProcessedSession = currentSession;
          const before = dungeonProgressRef.current.fightsRemainingBeforeDungeon || 0;
          dungeonProgressRef.current.fightsRemainingBeforeDungeon = Math.max(0, before - 1);
          const after = dungeonProgressRef.current.fightsRemainingBeforeDungeon || 0;
          const remaining = after;
          syncDungeonUI();
          if (remaining <= 0) {
            const idx = Math.floor(Math.random() * (currentMap.dungeons?.length || 1));
            const d = currentMap?.dungeons ? currentMap.dungeons[idx] : undefined;
            dungeonProgressRef.current.activeDungeonIndex = idx;
            dungeonProgressRef.current.activeDungeonId = d?.id ?? null;
            dungeonProgressRef.current.remaining = d?.floors ?? 0;
            dungeonProgressRef.current.suppressUntilSession = (encounterSessionRef.current || 0) + 1;
            const dungeonName = d?.name ?? d?.id ?? 'dungeon';
            syncDungeonUI();
            try {
              window.setTimeout(() => {
                try {
                  startEncounterRef.current && startEncounterRef.current();
                } catch (e) { console.error('[DEBUG] scheduled startEncounter error', e); }
              }, 50);
            } catch (e) { console.error('[DEBUG] scheduling startEncounter error', e); }
            pushLog(`You enter the dungeon '${dungeonName}' on ${currentMap.name} — good luck!`);
            try { addEffect && addEffect({ type: 'dungeon', text: `Entrance: ${dungeonName}`, target: 'player' }); } catch (e) {}
            return true;
          }
        }
      }

      // If we are inside a dungeon room completion, decrement remaining
      if (wasDungeonActiveAtStart && dungeonProgressRef.current.activeDungeonIndex != null && dungeonProgressRef.current.activeMapId === currentMap?.id && resultType === 'clear') {
        if (dungeonProgressRef.current.suppressUntilSession && currentSession <= (dungeonProgressRef.current.suppressUntilSession || 0)) {
          // skip
        } else if (dungeonProgressRef.current.lastDungeonProcessedSession !== currentSession) {
          dungeonProgressRef.current.lastDungeonProcessedSession = currentSession;
          const beforeRem = dungeonProgressRef.current.remaining || 0;
          dungeonProgressRef.current.remaining = Math.max(0, (dungeonProgressRef.current.remaining || 0) - 1);
          const afterRem = dungeonProgressRef.current.remaining || 0;
          syncDungeonUI();
          if (afterRem === 0) {
            try {
              const idx = dungeonProgressRef.current.activeDungeonIndex ?? 0;
              const d = currentMap?.dungeons ? currentMap.dungeons[idx] : undefined;
              const dungeonName = d?.name ?? d?.id ?? 'dungeon';
              const floors = d?.floors ?? 0;
              const goldReward = Math.round(100 + (player.level || 1) * 10 + floors * 25);
              const xpReward = Math.round(50 + (player.level || 1) * 5 + floors * 20);
              try { setPlayer && setPlayer((p: any) => ({ ...p, gold: +(((p.gold ?? 0) + goldReward).toFixed(2)) })); } catch (e) {}
              try { console.log('[useDungeon] awarding dungeon XP ->', xpReward); } catch (e) {}
              try { addXp && addXp(xpReward); } catch (e) {}
              try {
                const rarity = Math.random() < 0.08 ? 'legendary' : Math.random() < 0.25 ? 'epic' : 'rare';
                const itemName = `${dungeonName} Reward ${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`;
                createCustomItem && createCustomItem({ slot: 'weapon' as any, name: itemName, rarity: rarity as any, category: 'weapon', stats: { dmg: Math.max(1, Math.round((player.dmg || 1) * (rarity === 'legendary' ? 1.6 : rarity === 'epic' ? 1.2 : 1))) } }, true);
              } catch (e) { console.error('create reward item error', e); }
              pushLog(`Dungeon complete! You earned +${goldReward} g and +${xpReward} XP.`);
              try { addToast && addToast(`Dungeon cleared! Reward: +${goldReward} g, +${xpReward} XP.`, 'ok', 6000); } catch (e) {}
              try { addEffect && addEffect({ type: 'pickup', text: `+${goldReward} g`, target: 'player' }); } catch (e) {}
            } catch (e) { console.error('[DEBUG] dungeon reward error', e); }
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
    return false;
  }

  return { dungeonProgressRef, dungeonUI, processEndEncounter, syncDungeonUI };
}
