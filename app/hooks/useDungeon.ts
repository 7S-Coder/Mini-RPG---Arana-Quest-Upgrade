import { useEffect, useRef, useState } from "react";
import { getMaps } from "../game/templates/maps";

type DungeonProgress = {
  activeMapId?: string | null;
  activeDungeonIndex?: number | null;
  activeDungeonId?: string | null;
  remaining?: number;
  fightsRemainingBeforeDungeon?: number;
  lastProcessedEncounterId?: string;
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

  const dungeonProgressRef = useRef<DungeonProgress>({
    activeMapId: null,
    activeDungeonIndex: null,
    activeDungeonId: null,
    remaining: 0,
    fightsRemainingBeforeDungeon: 0,
    lastProcessedEncounterId: '',
  });

  const schedulingRef = useRef<boolean>(false);
  const [dungeonUI, setDungeonUI] = useState(() => ({ ...dungeonProgressRef.current }));
  const syncDungeonUI = () => setDungeonUI({ ...dungeonProgressRef.current });

  // Initialize dungeon progress when map changes
  useEffect(() => {
    try {
      const currentMap = getMaps().find((m) => m.id === selectedMapId) ?? null;
      if (currentMap?.dungeons && dungeonProgressRef.current.activeMapId !== currentMap.id) {
        const threshold = (currentMap as any).dungeonThreshold ?? 10;
        dungeonProgressRef.current.activeMapId = currentMap.id;
        dungeonProgressRef.current.activeDungeonIndex = null;
        dungeonProgressRef.current.activeDungeonId = null;
        dungeonProgressRef.current.remaining = 0;
        dungeonProgressRef.current.fightsRemainingBeforeDungeon = threshold;
        dungeonProgressRef.current.lastProcessedEncounterId = '';
        pushLog(`Selected map: farm ${threshold} fights to unlock dungeon.`);
        syncDungeonUI();
      } else if (!currentMap) {
        dungeonProgressRef.current.activeMapId = null;
        dungeonProgressRef.current.activeDungeonIndex = null;
        dungeonProgressRef.current.activeDungeonId = null;
        dungeonProgressRef.current.remaining = 0;
        syncDungeonUI();
      }
    } catch (e) {
      console.error('[useDungeon] init error', e);
    }
  }, [selectedMapId]);

  function processEndEncounter(args: { currentMap: any; player: any; opts?: any; msg?: string }) {
    try {
      const { currentMap, player, opts } = args;
      const resultType = opts?.type;
      const currentSession = encounterSessionRef.current || 0;
      
      const isInsideDungeon = dungeonProgressRef.current.activeDungeonIndex != null && 
                              dungeonProgressRef.current.activeMapId === currentMap?.id;

      try { 
        console.debug('[useDungeon] processEndEncounter:', { 
          session: currentSession,
          resultType,
          isInsideDungeon,
          remaining: dungeonProgressRef.current.remaining,
        }); 
      } catch(e) {}

      // Handle death in dungeon
      if (isInsideDungeon && resultType === 'death') {
        try {
          dungeonProgressRef.current.activeMapId = null;
          dungeonProgressRef.current.activeDungeonIndex = null;
          dungeonProgressRef.current.activeDungeonId = null;
          dungeonProgressRef.current.remaining = 0;
          dungeonProgressRef.current.fightsRemainingBeforeDungeon = (currentMap as any).dungeonThreshold ?? 10;
          dungeonProgressRef.current.lastProcessedEncounterId = '';
          syncDungeonUI();
          try { setPlayer && setPlayer((p: any) => ({ ...p, hp: (p.maxHp ?? p.hp) })); } catch (e) {}
          pushLog("You died — expelled from the dungeon!");
          try { addToast && addToast("Dungeon failed! Progress reset.", 'error', 4000); } catch (e) {}
        } catch (e) { console.error('[useDungeon] death error:', e); }
        return true;
      }

      // Handle death outside dungeon (farming phase)
      if (!isInsideDungeon && resultType === 'death' && currentMap?.dungeons) {
        dungeonProgressRef.current.fightsRemainingBeforeDungeon = (currentMap as any).dungeonThreshold ?? 10;
        dungeonProgressRef.current.lastProcessedEncounterId = '';
        syncDungeonUI();
        return false;
      }

      // FARMING PHASE: Count down to dungeon activation
      if (currentMap?.dungeons && 
          !isInsideDungeon && 
          resultType === 'clear') {
        const before = dungeonProgressRef.current.fightsRemainingBeforeDungeon || 0;
        dungeonProgressRef.current.fightsRemainingBeforeDungeon = Math.max(0, before - 1);
        const after = dungeonProgressRef.current.fightsRemainingBeforeDungeon || 0;
        syncDungeonUI();

        try { console.debug('[useDungeon] farming decrement:', { before, after }); } catch(e) {}

        // Activate dungeon
        if (after <= 0) {
          const idx = Math.floor(Math.random() * (currentMap.dungeons?.length || 1));
          const d = currentMap.dungeons ? currentMap.dungeons[idx] : undefined;
          
          dungeonProgressRef.current.activeDungeonIndex = idx;
          dungeonProgressRef.current.activeDungeonId = d?.id ?? null;
          dungeonProgressRef.current.remaining = d?.floors ?? 0;
          dungeonProgressRef.current.lastProcessedEncounterId = '';
          
          const dungeonName = d?.name ?? d?.id ?? 'dungeon';
          try { console.debug('[useDungeon] dungeon activated:', { idx, dungeonId: d?.id, floors: d?.floors }); } catch(e) {}
          syncDungeonUI();
          
          // Schedule dungeon entry
          if (!schedulingRef.current) {
            schedulingRef.current = true;
            window.setTimeout(() => {
              try { 
                console.debug('[useDungeon] triggering startEncounter');
                startEncounterRef.current && startEncounterRef.current(); 
              } catch (e) { console.error('[useDungeon] start error:', e); }
              schedulingRef.current = false;
            }, 50);
          }
          
          pushLog(`Dungeon unlocked! You enter '${dungeonName}' on ${currentMap.name}!`);
          try { addEffect && addEffect({ type: 'dungeon', text: dungeonName, target: 'player' }); } catch (e) {}
          return true;
        }
      }

      // INSIDE DUNGEON: Decrement when room clears
      if (isInsideDungeon && resultType === 'clear') {
        const encounterId = `${currentSession}`;
        
        // Only process once per session
        if (dungeonProgressRef.current.lastProcessedEncounterId !== encounterId) {
          dungeonProgressRef.current.lastProcessedEncounterId = encounterId;
          
          const beforeRem = dungeonProgressRef.current.remaining || 0;
          dungeonProgressRef.current.remaining = Math.max(0, beforeRem - 1);
          const afterRem = dungeonProgressRef.current.remaining || 0;
          
          try { console.debug('[useDungeon] room cleared:', { beforeRem, afterRem }); } catch(e) {}
          syncDungeonUI();

          // Dungeon complete
          if (afterRem === 0) {
            try {
              const idx = dungeonProgressRef.current.activeDungeonIndex ?? 0;
              const d = currentMap?.dungeons ? currentMap.dungeons[idx] : undefined;
              const dungeonName = d?.name ?? d?.id ?? 'dungeon';
              const floors = d?.floors ?? 0;
              const goldReward = Math.round(100 + (player.level || 1) * 10 + floors * 25);
              const xpReward = Math.round(50 + (player.level || 1) * 5 + floors * 20);
              
              try { setPlayer && setPlayer((p: any) => ({ ...p, gold: +(((p.gold ?? 0) + goldReward).toFixed(2)) })); } catch (e) {}
              try { addXp && addXp(xpReward); } catch (e) {}
              try {
                const rarity = Math.random() < 0.08 ? 'legendary' : Math.random() < 0.25 ? 'epic' : 'rare';
                const itemName = `${dungeonName} Reward ${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`;
                createCustomItem && createCustomItem({ slot: 'weapon' as any, name: itemName, rarity: rarity as any, category: 'weapon', stats: { dmg: Math.max(1, Math.round((player.dmg || 1) * (rarity === 'legendary' ? 1.6 : rarity === 'epic' ? 1.2 : 1))) } }, true);
              } catch (e) { console.error('[useDungeon] reward error:', e); }
              
              pushLog(`Dungeon complete! Earned +${goldReward} g and +${xpReward} XP!`);
              try { addToast && addToast(`Dungeon cleared! +${goldReward} g, +${xpReward} XP!`, 'ok', 6000); } catch (e) {}
              try { addEffect && addEffect({ type: 'pickup', text: `+${goldReward} g`, target: 'player' }); } catch (e) {}
            } catch (e) { console.error('[useDungeon] completion error:', e); }

            // Reset
            dungeonProgressRef.current.activeMapId = null;
            dungeonProgressRef.current.activeDungeonIndex = null;
            dungeonProgressRef.current.activeDungeonId = null;
            dungeonProgressRef.current.remaining = 0;
            dungeonProgressRef.current.fightsRemainingBeforeDungeon = (currentMap as any).dungeonThreshold ?? 10;
            dungeonProgressRef.current.lastProcessedEncounterId = '';
            syncDungeonUI();
          } else {
            pushLog(`Room cleared — ${afterRem} floor(s) remaining`);
          }
        }
      }

    } catch (e) { console.error('[useDungeon] error:', e); }
    return false;
  }

  return { dungeonProgressRef, dungeonUI, processEndEncounter, syncDungeonUI };
}
