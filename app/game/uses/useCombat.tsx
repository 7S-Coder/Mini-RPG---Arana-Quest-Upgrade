"use client";

import { useCallback, useRef } from "react";

type Player = any;
type Enemy = any;

export default function useCombat({
  player,
  setPlayer,
  enemies,
  setEnemies,
  addXp,
  pushLog,
  endEncounter,
  onEffect,
  onDrop,
}: {
  player: Player;
  setPlayer: (updater: any) => void;
  enemies: Enemy[];
  setEnemies: (updater: any) => void;
  addXp?: (n: number) => void;
  pushLog: (s: React.ReactNode) => void;
  endEncounter: (msg?: string, opts?: { type?: 'clear' | 'flee' | 'death'; isBoss?: boolean; bossName?: string }) => void;
  onEffect?: (eff: { type: string; text?: string; kind?: string; target?: string; id?: string }) => void;
  onDrop?: (enemy: Enemy) => any;
}) {
  const lockedRef = useRef(false);
  const rollChance = useCallback((percent = 0) => Math.random() * 100 < (percent ?? 0), []);

  const calcDamage = useCallback((atk: number, def: number, isCrit = false) => {
    const variance = 0.85 + Math.random() * 0.3; // 0.85 .. 1.15
    let base = Math.max(1, atk * variance);
    if (isCrit) base = base * (1.5 + Math.random() * 0.4);
    const mitigation = 100 / (100 + Math.max(0, def));
    const dmg = Math.max(1, Math.round(base * mitigation));
    return dmg;
  }, []);

  const onAttack = useCallback(() => {
    // prevent re-entrancy / repeated clicks while processing
    if (lockedRef.current) {
      pushLog("Action in progress...");
      return;
    }
    if (!enemies || enemies.length === 0) {
      pushLog("No enemies to attack.");
      return;
    }
    lockedRef.current = true;

    // Build alive enemies snapshot
    const aliveEnemies = (enemies || []).filter((e) => e.hp > 0);
    if (aliveEnemies.length === 0) {
      // nothing to do
      lockedRef.current = false;
      return;
    }

    // Partition enemies by speed relative to player: fast act before player, slow act after
    const pSpeed = player?.speed ?? 0;
    const fastEnemies = aliveEnemies.filter((e) => (e.speed ?? 0) > pSpeed);
    const slowEnemies = aliveEnemies.filter((e) => (e.speed ?? 0) <= pSpeed);

    // Get the target enemy (the one we'll attack)
    const target = (enemies || []).find((e) => e.hp > 0);
    if (!target) {
      // no target, nothing else to do
      lockedRef.current = false;
      return;
    }

    // Helper to apply a series of enemy attacks to a player snapshot
    const applyEnemyAttacksToPlayer = (elist: any[], playerSnap: any) => {
      let snap = { ...playerSnap };
      for (const e of elist) {
        if (e.hp <= 0) continue;
        
        // Enemy can attack 1-3 times with decreasing chance
        let attackCount = 0;
        let canAttackAgain = true;
        
        while (canAttackAgain && attackCount < 3) {
          const dodgePlayer = rollChance(snap.dodge ?? 0);
          if (dodgePlayer) {
            pushLog(<>Dodge! You avoid the attack from <span className={`enemy-name ${e.rarity ?? 'common'}`}>{e.name ?? e.id}</span>.</>);
            if (onEffect) onEffect({ type: 'dodge', text: 'Dodge', target: 'player' });
            break;
          }
          const enemyCrit = rollChance(e.crit ?? 0);
          const edmg = calcDamage(Math.max(1, e.dmg ?? 1), snap.def ?? 0, enemyCrit);
          snap.hp = Math.max(0, snap.hp - edmg);
          if (enemyCrit) {
            pushLog(<>💥 Critical hit! <span className={`enemy-name ${e.rarity ?? 'common'}`}>{e.name ?? e.id}</span> deals {edmg} damage to you.</>);
            if (onEffect) onEffect({ type: 'damage', text: String(edmg), kind: 'crit', target: 'player' });
          } else {
            pushLog(<> <span className={`enemy-name ${e.rarity ?? 'common'}`}>{e.name ?? e.id}</span> hits you for {edmg} damage.</>);
            if (onEffect) onEffect({ type: 'damage', text: String(edmg), kind: 'hit', target: 'player' });
          }
          attackCount++;
          
          // 20% chance to attack again (decreases with each attack)
          const extraAttackChance = 20 - (attackCount * 8);
          canAttackAgain = rollChance(extraAttackChance);
        }
      }
      return snap;
    };

    // 1) Fast enemies attack first - they can all attack regardless of being targeted
    let playerSnap = { ...player };
    if (fastEnemies.length > 0) {
      playerSnap = applyEnemyAttacksToPlayer(fastEnemies, playerSnap);
      setPlayer((currentPlayer: Player) => ({
        ...currentPlayer,
        hp: playerSnap.hp,
      }));
      if (playerSnap.hp <= 0) {
        pushLog('You are dead...');
        endEncounter('You died. Respawned at the tavern.', { type: 'death' });
        lockedRef.current = false;
        return;
      }
    }

    // 2) Player attacks (single target)
    const critRoll = rollChance(player.crit ?? 0);
    const dodgeRoll = rollChance(target.dodge ?? 0);
    let postAttackEnemies = (enemies || []).slice();
    if (dodgeRoll) {
      pushLog(<> <span className={`enemy-name ${target.rarity ?? 'common'}`}>{target.name ?? target.id}</span> dodges your attack!</>);
      if (onEffect) onEffect({ type: 'dodge', text: 'Dodge', target: 'enemy', id: target.id });
    } else {
      const baseAtk = Math.max(1, player.dmg ?? 1);
      const dmg = calcDamage(baseAtk, target.def ?? 0, critRoll);
      if (critRoll) {
        pushLog(<>💥 Critical hit! You deal {dmg} damage to <span className={`enemy-name ${target.rarity ?? 'common'}`}>{target.name ?? target.id}</span>.</>);
      } else {
        pushLog(<>You hit <span className={`enemy-name ${target.rarity ?? 'common'}`}>{target.name ?? target.id}</span> for {dmg} damage.</>);
      }
      const updated = (enemies || []).map((e) => (e.id === target.id ? { ...e, hp: Math.max(0, e.hp - dmg) } : e));
      // update state and keep a local snapshot to avoid reading stale `enemies` later
      setEnemies(updated);
      postAttackEnemies = updated;
      if (onEffect) onEffect({ type: 'damage', text: String(dmg), kind: critRoll ? 'crit' : 'hit', target: 'enemy', id: target.id });

      const killed = updated.find((e) => e.id === target.id && e.hp === 0);
      if (killed) {
      pushLog(<> <span className={`enemy-name ${killed.rarity ?? 'common'}`}>{killed.name ?? killed.id}</span> defeated!</>);
        const baseXp = 6 + Math.floor(Math.random() * 11);
        const levelFactor = 1 + (killed.level ?? 1) / 10;
        const rarityMults: Record<string, number> = { common: 1, rare: 1.5, epic: 2, legendary: 3, mythic: 6 };
        const rarityKey = (killed.rarity ?? 'common') as string;
        const rarityMultiplier = rarityMults[rarityKey] ?? 1;
        const xpGain = Math.floor(baseXp * levelFactor * rarityMultiplier);
        pushLog(`Gain XP: ${xpGain}`);
        try { console.log('[useCombat] calling addXp ->', xpGain); } catch (e) {}
        if (typeof addXp === 'function') addXp(xpGain);
        
        // Boss rewards: essence and materials (dungeon only)
        if (killed.isBoss) {
          const essenceReward = Math.floor(Math.random() * 3) + 1; // 1-3 essences
          const isDungeonRoom = !!killed.roomId;
          
          try {
            let logMsg = `Boss drops: +${essenceReward}✨`;
            const updateObj: any = {
              essence: (p: any) => (p.essence ?? 0) + essenceReward,
            };
            
            // Materials only drop in dungeon
            if (isDungeonRoom) {
              const materials = ['essence_dust', 'mithril_ore', 'star_fragment', 'void_shard'] as const;
              const randomMaterial = materials[Math.floor(Math.random() * materials.length)];
              updateObj.materials = (p: any) => ({
                ...p.materials,
                [randomMaterial]: (p.materials?.[randomMaterial] ?? 0) + 1
              });
              logMsg += ` and +1 ${randomMaterial}`;
            }
            
            setPlayer((p: any) => ({
              ...p,
              essence: updateObj.essence(p),
              materials: updateObj.materials ? updateObj.materials(p) : p.materials,
            }));
            pushLog(logMsg);
          } catch (e) {}
        }
        
        // try drop
        try {
          const dropped = typeof onDrop === 'function' ? onDrop(killed) : null;
            if (dropped) {
            const statsText = dropped.stats && Object.keys(dropped.stats).length > 0
              ? Object.entries(dropped.stats).map(([k, v]) => `+${k} ${v}`).join(' • ')
              : '';
            pushLog(`Loot obtained: ${dropped.name} (${dropped.rarity})${statsText ? ' — ' + statsText : ''}`);
            if (onEffect) onEffect({ type: 'item', text: dropped.name, target: 'player', id: dropped.id });
          }
        } catch (e) {
          // ignore drop errors
        }
      }
    }

    // after player attack, check if all enemies are dead (use the snapshot)
    ((): void => {
      const alive = postAttackEnemies.filter((e: Enemy) => e.hp > 0);
      if (alive.length === 0) {
        // Check if any defeated enemy was a boss
        const defeatedBoss = postAttackEnemies.find((e: Enemy) => e.isBoss);
        const opts: any = { type: 'clear' };
        if (defeatedBoss) {
          opts.isBoss = true;
          opts.bossName = defeatedBoss.name;
        }
        endEncounter('All enemies defeated!', opts);
      }
    })();

    // 3) Slow enemies attack after player (use the updated snapshot so dead enemies don't act)
    // Only the target enemy can counterattack
    const postEnemies = postAttackEnemies.filter((e) => e.hp > 0);
    const slowTargetEnemy = postEnemies.filter((e) => (e.speed ?? 0) <= pSpeed && e.id === target.id);
    if (slowTargetEnemy.length > 0) {
      playerSnap = applyEnemyAttacksToPlayer(slowTargetEnemy, playerSnap);
      setPlayer((currentPlayer: Player) => ({
        ...currentPlayer,
        hp: playerSnap.hp,
      }));
      if (playerSnap.hp <= 0) {
        pushLog('You are dead...');
        endEncounter('You died. Respawned at the tavern.', { type: 'death' });
        lockedRef.current = false;
        return;
      }
    }

    // finalize: small delay to allow UI updates then release lock
    setTimeout(() => {
      lockedRef.current = false;
    }, 120);
  }, [enemies, player, setEnemies, setPlayer, addXp, pushLog, endEncounter, rollChance, calcDamage]);

  const onRun = useCallback(() => {
    if (lockedRef.current) {
      pushLog("Action in progress...");
      return;
    }
    if (!enemies || enemies.length === 0) return pushLog("You're not in combat.");
    lockedRef.current = true;
    const success = Math.random() < 0.6;
    if (success) {
      endEncounter('You successfully fled.', { type: 'flee' });
      lockedRef.current = false;
      return;
    }

    // failed run: only allow each enemy to attack once; fast enemies before player, slow after
    pushLog('Run failed! Enemies attack.');
    const aliveEnemies = (enemies || []).filter((e) => e.hp > 0);
    const pSpeed = player?.speed ?? 0;
    const fast = aliveEnemies.filter((e) => (e.speed ?? 0) > pSpeed);
    const slow = aliveEnemies.filter((e) => (e.speed ?? 0) <= pSpeed);

    let playerSnap = { ...player };
    if (fast.length > 0) {
      for (const e of fast) {
        if (e.hp <= 0) continue;
        const dodgePlayer = rollChance(playerSnap.dodge ?? 0);
        if (dodgePlayer) {
          pushLog(<>Dodge! You avoid the attack from <span className={`enemy-name ${e.rarity ?? 'common'}`}>{e.name ?? e.id}</span>.</>);
          continue;
        }
        const enemyCrit = rollChance(e.crit ?? 0);
        const edmg = calcDamage(Math.max(1, e.dmg ?? 1), playerSnap.def ?? 0, enemyCrit);
        playerSnap.hp = Math.max(0, playerSnap.hp - edmg);
        if (enemyCrit) pushLog(<>💥 Critical hit! <span className={`enemy-name ${e.rarity ?? 'common'}`}>{e.name ?? e.id}</span> deals {edmg} damage to you.</>);
        else pushLog(<> <span className={`enemy-name ${e.rarity ?? 'common'}`}>{e.name ?? e.id}</span> hits you for {edmg} damage.</>);
      }
      setPlayer(() => playerSnap);
      if (playerSnap.hp <= 0) {
        pushLog('You are dead...');
        endEncounter('You died. Respawned at the tavern.', { type: 'death' });
        lockedRef.current = false;
        return;
      }
    }

    // player failed to run; slow enemies attack
    if (slow.length > 0) {
      for (const e of slow) {
        if (e.hp <= 0) continue;
        const dodgePlayer = rollChance(playerSnap.dodge ?? 0);
          if (dodgePlayer) {
            pushLog(<>Dodge! You avoid the attack from <span className={`enemy-name ${e.rarity ?? 'common'}`}>{e.name ?? e.id}</span>.</>);
          continue;
        }
        const enemyCrit = rollChance(e.crit ?? 0);
        const edmg = calcDamage(Math.max(1, e.dmg ?? 1), playerSnap.def ?? 0, enemyCrit);
        playerSnap.hp = Math.max(0, playerSnap.hp - edmg);
        if (enemyCrit) pushLog(<>💥 Critical hit! <span className={`enemy-name ${e.rarity ?? 'common'}`}>{e.name ?? e.id}</span> deals {edmg} damage to you.</>);
        else pushLog(<> <span className={`enemy-name ${e.rarity ?? 'common'}`}>{e.name ?? e.id}</span> hits you for {edmg} damage.</>);
      }
      setPlayer(() => playerSnap);
      if (playerSnap.hp <= 0) {
        pushLog('You are dead...');
        endEncounter('You died. Respawned at the tavern.', { type: 'death' });
        lockedRef.current = false;
        return;
      }
    }

    setTimeout(() => {
      lockedRef.current = false;
    }, 120);
  }, [enemies, setPlayer, pushLog, endEncounter, rollChance, calcDamage]);

  return { onAttack, onRun } as const;
}
