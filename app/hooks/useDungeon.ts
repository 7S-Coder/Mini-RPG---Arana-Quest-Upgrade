import { useEffect, useRef, useState } from "react";
import { getMaps } from "../game/templates/maps";
import { ITEM_POOL, scaleStats, computeItemCost } from "../game/templates/items";
import EssenceDustSVG from "@/app/assets/forges/essence.svg";
import MithrilOreSVG from "@/app/assets/forges/mithril.svg";
import StarFragmentSVG from "@/app/assets/forges/star.svg";
import VoidShardSVG from "@/app/assets/forges/void.svg";
import type { Rarity } from "../game/types";

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
  addToast?: (t: string, type?: string, ttl?: number, icon?: string) => void;
  createCustomItem?: (arg0: any, arg1?: boolean) => void;
  addXp?: (n: number) => void;
  setPlayer?: (updater: any) => void;
  encounterSessionRef: React.MutableRefObject<number>;
  startEncounterRef: React.MutableRefObject<(() => void) | null>;
  player?: any;
  inventory?: any[];
  equipment?: any;
}) {
  const { selectedMapId, pushLog, addEffect, addToast, createCustomItem, addXp, setPlayer, encounterSessionRef, startEncounterRef, player, inventory, equipment } = opts;

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
          // Keep activeMapId so the system knows we're still farming on this map
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

      // Log why farming phase didn't trigger
      if (resultType === 'clear' && !isInsideDungeon) {
        try { 
          
        } catch(e) {}
      }

      // FARMING PHASE: Count down to dungeon activation
      if (currentMap?.dungeons && 
          !isInsideDungeon && 
          resultType === 'clear') {
        const before = dungeonProgressRef.current.fightsRemainingBeforeDungeon || 0;
        dungeonProgressRef.current.fightsRemainingBeforeDungeon = Math.max(0, before - 1);
        const after = dungeonProgressRef.current.fightsRemainingBeforeDungeon || 0;
        syncDungeonUI();

        try {  } catch(e) {}

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
              const essenceReward = Math.floor(Math.random() * 3) + 1; // 1-3 essences
              
              try { setPlayer && setPlayer((p: any) => ({ ...p, gold: +(((p.gold ?? 0) + goldReward).toFixed(2)), essence: (p.essence ?? 0) + essenceReward })); } catch (e) {}
              try { addXp && addXp(xpReward); } catch (e) {}
              try {
                // Get unlocked rarities from player inventory and equipment
                const unlockedRarities = new Set<Rarity>();
                unlockedRarities.add('common'); // Always unlock common
                
                // Check inventory
                if (inventory) {
                  for (const item of inventory) {
                    if (item.rarity) unlockedRarities.add(item.rarity);
                  }
                }
                
                // Check equipment
                if (equipment) {
                  for (const item of Object.values(equipment)) {
                    if (item && (item as any).rarity) unlockedRarities.add((item as any).rarity);
                  }
                }
                
                // Roll rarity from unlocked ones
                let rarity: Rarity = 'common';
                const rarityRoll = Math.random() * 100;
                const unlockedArray = Array.from(unlockedRarities).sort((a, b) => {
                  const order = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
                  return order.indexOf(a) - order.indexOf(b);
                });
                
                if (unlockedArray.includes('mythic') && rarityRoll < 8) rarity = 'mythic';
                else if (unlockedArray.includes('legendary') && rarityRoll < 15) rarity = 'legendary';
                else if (unlockedArray.includes('epic') && rarityRoll < 30) rarity = 'epic';
                else if (unlockedArray.includes('rare') && rarityRoll < 50) rarity = 'rare';
                else if (unlockedArray.includes('uncommon') && rarityRoll < 70) rarity = 'uncommon';
                else rarity = unlockedArray[unlockedArray.length - 1] || 'common';
                
                // Pick random item from pool with the rolled rarity and unlocked
                const poolWithRarity = ITEM_POOL.filter(t => {
                  const itemRarity = (t.rarity ?? 'common') as Rarity;
                  return itemRarity === rarity && unlockedRarities.has(itemRarity);
                });
                
                if (poolWithRarity.length > 0) {
                  const chosen = poolWithRarity[Math.floor(Math.random() * poolWithRarity.length)];
                  const displayName = (chosen.name || '').replace(/\b(common|rare|epic|legendary|mythic)\b/gi, '').trim();
                  const itemName = displayName.length > 0 ? displayName : chosen.name;
                  const scaledStats = scaleStats(chosen.stats, rarity);
                  
                  createCustomItem && createCustomItem({
                    slot: chosen.slot,
                    name: itemName,
                    rarity: rarity,
                    category: chosen.category,
                    stats: scaledStats
                  }, true);
                }
              } catch (e) { console.error('[useDungeon] reward error:', e); }
              
              pushLog(`Dungeon complete! Earned +${goldReward} g, +${xpReward} XP and +${essenceReward}!`);
              
              // Build materials message with icons
              const materialIcons: Record<string, string> = {
                essence_dust: EssenceDustSVG.src,
                mithril_ore: MithrilOreSVG.src,
                star_fragment: StarFragmentSVG.src,
                void_shard: VoidShardSVG.src,
              };
              
              // Create a simple text message with emoji representations
              let materialsMsg = '';
              const materials = player?.materials ?? {};
              if (materials.essence_dust) materialsMsg += `Essence Dust x${materials.essence_dust}`;
              if (materials.mithril_ore) materialsMsg += `Mithril Ore x${materials.mithril_ore}`;
              if (materials.star_fragment) materialsMsg += `Star Fragment x${materials.star_fragment}`;
              if (materials.void_shard) materialsMsg += `Void Shard x${materials.void_shard}`;
              
              try { addToast && addToast(`Dungeon cleared! +${goldReward} g, +${xpReward} XP, +${essenceReward}${materialsMsg}`, 'ok', 8000); } catch (e) {}
              try { addEffect && addEffect({ type: 'pickup', text: `+${goldReward} g`, target: 'player' }); } catch (e) {}
            } catch (e) { console.error('[useDungeon] completion error:', e); }

            // Reset - Keep activeMapId so we can farm again
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
