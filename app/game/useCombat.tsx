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
  pushLog: (s: string) => void;
  endEncounter: (msg?: string) => void;
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
      pushLog("Action en cours...");
      return;
    }
    if (!enemies || enemies.length === 0) {
      pushLog("Aucun ennemi à attaquer.");
      return;
    }
    lockedRef.current = true;
    const target = enemies.find((e) => e.hp > 0);
    if (!target) return;

    const critRoll = rollChance(player.crit ?? 0);
    const dodgeRoll = rollChance(target.dodge ?? 0);
    if (dodgeRoll) {
      pushLog(`${target.name ?? target.id} esquive votre attaque !`);
      if (onEffect) onEffect({ type: "dodge", text: "Esquive", target: "enemy", id: target.id });
    } else {
      const baseAtk = Math.max(1, player.dmg ?? 1);
      const dmg = calcDamage(baseAtk, target.def ?? 0, critRoll);
      if (critRoll) {
        pushLog(`💥 Coup critique ! Vous infligez ${dmg} dégâts à ${target.name ?? target.id}.`);
      } else {
        pushLog(`Vous frappez ${target.name ?? target.id} pour ${dmg} dégâts.`);
      }
      const updated = enemies.map((e) => (e.id === target.id ? { ...e, hp: Math.max(0, e.hp - dmg) } : e));
      setEnemies(updated);
      if (onEffect) onEffect({ type: "damage", text: String(dmg), kind: critRoll ? "crit" : "hit", target: "enemy", id: target.id });

      const killed = updated.find((e) => e.id === target.id && e.hp === 0);
      if (killed) {
        pushLog(`${killed.name ?? killed.id} vaincu !`);
        const baseXp = 6 + Math.floor(Math.random() * 11);
        const levelFactor = 1 + (killed.level ?? 1) / 10;
        const rarityMults: Record<string, number> = { common: 1, rare: 1.5, epic: 2, legendary: 3, mythic: 6 };
        const rarityKey = (killed.rarity ?? "common") as string;
        const rarityMultiplier = rarityMults[rarityKey] ?? 1;
        const xpGain = Math.floor(baseXp * levelFactor * rarityMultiplier);
        pushLog(`Gain XP: ${xpGain}`);
        if (typeof addXp === "function") addXp(xpGain);
        // try drop
        try {
          const dropped = typeof onDrop === "function" ? onDrop(killed) : null;
          if (dropped) {
            // build a compact stats summary for the log
            const statsText = dropped.stats && Object.keys(dropped.stats).length > 0
              ? Object.entries(dropped.stats).map(([k, v]) => `+${k} ${v}`).join(' • ')
              : '';
            pushLog(`Loot obtenu: ${dropped.name} (${dropped.rarity})${statsText ? ' — ' + statsText : ''}`);
            if (onEffect) onEffect({ type: "item", text: dropped.name, target: "player", id: dropped.id });
          }
        } catch (e) {
          // ignore drop errors
        }
      }
    }

    // enemies retaliate
    setTimeout(() => {
      setPlayer((p: Player) => {
        let newP = { ...p };
        enemies.forEach((e) => {
          if (e.hp <= 0) return;
          const dodgePlayer = rollChance(p.dodge ?? 0);
          if (dodgePlayer) {
            pushLog(`Esquive ! Vous évitez l'attaque de ${e.name ?? e.id}.`);
            if (onEffect) onEffect({ type: "dodge", text: "Esquive", target: "player" });
            return;
          }
          const enemyCrit = rollChance(e.crit ?? 0);
          const edmg = calcDamage(Math.max(1, e.dmg ?? 1), p.def ?? 0, enemyCrit);
          newP.hp = Math.max(0, newP.hp - edmg);
          if (enemyCrit) {
            pushLog(`💥 Coup critique ! ${e.name ?? e.id} vous inflige ${edmg} dégâts.`);
            if (onEffect) onEffect({ type: "damage", text: String(edmg), kind: "crit", target: "player" });
          } else {
            pushLog(`${e.name ?? e.id} vous frappe pour ${edmg} dégâts.`);
            if (onEffect) onEffect({ type: "damage", text: String(edmg), kind: "hit", target: "player" });
          }
        });
        return newP;
      });

    setEnemies((prev: Enemy[]) => {
      const alive = prev.filter((e: Enemy) => e.hp > 0);
      if (alive.length === 0) {
        endEncounter("Tous les ennemis vaincus !");
      }
      return prev;
    });

      setTimeout(() => {
        setPlayer((p: Player) => {
          if (p.hp <= 0) {
            pushLog("Vous êtes mort...");
            endEncounter("Vous êtes mort. Respawné à la taverne.");
            return { ...p, hp: p.maxHp ?? p.hp };
          }
          return p;
        });
        // release lock after retaliation finished
        lockedRef.current = false;
      }, 120);
    }, 200);
  }, [enemies, player, setEnemies, setPlayer, addXp, pushLog, endEncounter, rollChance, calcDamage]);

  const onRun = useCallback(() => {
    if (lockedRef.current) {
      pushLog("Action en cours...");
      return;
    }
    if (!enemies || enemies.length === 0) return pushLog("Vous n'êtes pas en combat.");
    lockedRef.current = true;
    const success = Math.random() < 0.6;
    if (success) {
      endEncounter("Vous avez fui avec succès.");
      lockedRef.current = false;
    } else {
      pushLog("Fuite échouée ! Les ennemis attaquent.");
      setPlayer((p: Player) => {
        let newP = { ...p };
        enemies.forEach((e) => {
          if (e.hp <= 0) return;
          const dodgePlayer = rollChance(p.dodge ?? 0);
          if (dodgePlayer) {
            pushLog(`Esquive ! Vous évitez l'attaque de ${e.name ?? e.id}.`);
            return;
          }
          const enemyCrit = rollChance(e.crit ?? 0);
          const edmg = calcDamage(Math.max(1, e.dmg ?? 1), p.def ?? 0, enemyCrit);
          newP.hp = Math.max(0, newP.hp - edmg);
          if (enemyCrit) {
            pushLog(`💥 Coup critique ! ${e.name ?? e.id} vous inflige ${edmg} dégâts.`);
          } else {
            pushLog(`${e.name ?? e.id} vous frappe pour ${edmg} dégâts.`);
          }
        });
        return newP;
      });

      setTimeout(() => {
        setPlayer((p: Player) => {
          if (p.hp <= 0) {
            pushLog("Vous êtes mort...");
            endEncounter("Vous êtes mort. Respawné à la taverne.");
            return { ...p, hp: p.maxHp ?? p.hp };
          }
          return p;
        });
        lockedRef.current = false;
      }, 120);
    }
  }, [enemies, setPlayer, pushLog, endEncounter, rollChance, calcDamage]);

  return { onAttack, onRun } as const;
}
