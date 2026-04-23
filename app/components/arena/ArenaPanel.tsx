import React, { useEffect, useCallback, useState, useRef } from "react";
import GoldSVG from "@/app/assets/gold.svg";
import EnemiesRow from "../enemys/EnemiesRow";
import LogMessages from "../LogMessages";
import ArenaActions from "./ArenaActions";
import EventDisplay from "../EventDisplay";
import type { ActiveGameEvent } from "@/app/game/types";

type Props = {
  enemies: any[];
  logs: React.ReactNode[];
  onAttack: (type: 'quick' | 'safe' | 'risky') => void;
  onRun: () => void;
  onSpecial?: () => void;
  disableRun?: boolean;
  pickups?: any[];
  collectPickup?: (id: string, logger?: (msg: React.ReactNode) => void) => boolean | void;
  collectAllPickups?: (logger?: (msg: React.ReactNode) => void) => number;
  pushLog?: (node: React.ReactNode) => void;
  logColor?: string;
  activeEvent?: ActiveGameEvent | null;
  nextTurnModifier?: { skipped?: boolean; defenseDebuff?: boolean } | null;
  safeCooldown?: number;
  riskyCooldown?: number;
  specialCooldown?: number;
  weaponType?: string;
  selectedTargetId?: string | null;
  onSelectTarget?: (targetId: string) => void;
  lastCritAt?: number;
  lastPlayerCritAt?: number;
};

export default function ArenaPanel({ enemies, logs, onAttack, onRun, onSpecial, pickups = [], collectPickup, collectAllPickups, pushLog, logColor, activeEvent, disableRun = false, inDungeonActive, nextTurnModifier, safeCooldown = 0, riskyCooldown = 0, specialCooldown = 0, weaponType = 'barehand', selectedTargetId, onSelectTarget, lastCritAt = 0, lastPlayerCritAt = 0 }: Props & { inDungeonActive?: boolean }) {
  const [critFlash, setCritFlash] = useState(false);
  const critTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playerCritFlash, setPlayerCritFlash] = useState(false);
  const playerCritTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lastCritAt) return;
    if (critTimeoutRef.current) clearTimeout(critTimeoutRef.current);
    setCritFlash(true);
    critTimeoutRef.current = setTimeout(() => {
      setCritFlash(false);
      critTimeoutRef.current = null;
    }, 550);
    return () => { if (critTimeoutRef.current) clearTimeout(critTimeoutRef.current); };
  }, [lastCritAt]);

  useEffect(() => {
    if (!lastPlayerCritAt) return;
    if (playerCritTimeoutRef.current) clearTimeout(playerCritTimeoutRef.current);
    setPlayerCritFlash(true);
    playerCritTimeoutRef.current = setTimeout(() => {
      setPlayerCritFlash(false);
      playerCritTimeoutRef.current = null;
    }, 500);
    return () => { if (playerCritTimeoutRef.current) clearTimeout(playerCritTimeoutRef.current); };
  }, [lastPlayerCritAt]);

  // helper: convert hex to rgba for subtle background tint
  const hexToRgba = (hex?: string, alpha = 0.06) => {
    if (!hex) return undefined;
    try {
      const h = hex.replace('#', '');
      const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
      const bigint = parseInt(full, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
      return hex;
    }
  };

  const arenaStyle = logColor ? { backgroundColor: hexToRgba(logColor, 0.08) } : undefined;

  // Spacebar shortcut: collect all pickups when ≥2 are present
  const doCollectAll = useCallback(() => {
    if (collectAllPickups && pickups.length >= 2) {
      try { collectAllPickups((m) => { try { pushLog && pushLog(m); } catch (e) {} }); } catch (e) { console.error(e); }
    }
  }, [collectAllPickups, pickups, pushLog]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== ' ') return;
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as any).isContentEditable)) return;
      if (pickups.length >= 2 && collectAllPickups) {
        e.preventDefault();
        doCollectAll();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [doCollectAll, pickups, collectAllPickups]);

  return (
    <section className="arena-panel" style={arenaStyle}>
      <div className="arena-log" style={{position:'relative'}}>
        {critFlash && (
          <div style={{
            position:'absolute', inset:0, zIndex:20, borderRadius:8, pointerEvents:'none',
            background:'rgba(220,30,30,0.22)',
            boxShadow:'inset 0 0 0 3px #ff3c3c, 0 0 32px 8px rgba(255,60,60,0.5)',
            animation:'critFlash 0.55s ease-out forwards',
          }} />
        )}
        {playerCritFlash && (
          <div style={{
            position:'absolute', inset:0, zIndex:20, borderRadius:8, pointerEvents:'none',
            background:'rgba(255,215,0,0.18)',
            boxShadow:'inset 0 0 0 3px #ffd700, 0 0 32px 8px rgba(255,215,0,0.45)',
            animation:'playerCritFlash 0.5s ease-out forwards',
          }} />
        )}
        {/* Active event display at top of log */}
        {activeEvent && <EventDisplay activeEvent={activeEvent} />}
        
        <EnemiesRow enemies={enemies} selectedTargetId={selectedTargetId} onSelectTarget={onSelectTarget} />
        <LogMessages logs={logs} logColor={logColor} inDungeonActive={inDungeonActive} />
      </div>

      {/* pickups rendered as absolute positioned elements within the arena wrapper */}
      {pickups && pickups.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
          {/* Batch collect button when many pickups present */}
          {pickups.length >= 2 && collectAllPickups && (
            <div style={{ position: 'absolute', right: 18, top: 18, pointerEvents: 'auto', zIndex: 10000 }}>
              <button
                className="btn primary"
                onClick={() => {
                  try {
                    if (collectAllPickups) collectAllPickups((m) => { try { pushLog && pushLog(m); } catch (e) {} });
                  } catch (e) { console.error(e); }
                }}
              >
                Take everything
              </button>
            </div>
          )}

          {pickups.map((p) => (
            <div
              key={p.id}
              className={`pickup ${p.kind === 'gold' ? 'gold' : `item ${p.item?.rarity ?? ''}`} spawn`}
                  onClick={() => {
                try {
                  const ok = collectPickup ? collectPickup(p.id, (m) => { try { pushLog && pushLog(m); } catch (e) {} }) : false;
                  // collectPickup will log via provided logger; keep existing behavior for success
                } catch (e) { console.error(e); }
              }}
              style={{ left: (p.x ?? 220), top: (p.y ?? 120), position: 'absolute', pointerEvents: 'auto' }}
            >
              <div className="icon">{p.kind === 'gold' ? <img src={GoldSVG.src} alt="Gold" style={{ width: 32, height: 32 }} /> : '📦'}</div>
              <div className="label">{p.kind === 'gold' ? `${Number(p.amount).toFixed(2)} g` : (p.item?.name ?? 'Item')}</div>
            </div>
          ))}
        </div>
      )}

      {nextTurnModifier && enemies.length > 0 && (
        <div style={{ 
          padding: '12px 20px', 
          marginBottom: 12,
          borderRadius: 8, 
          background: 'rgba(255, 107, 107, 0.3)', 
          border: '2px solid #ff6b6b',
          color: '#ff6b6b',
          fontSize: 13,
          fontWeight: 700,
          textAlign: 'center',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 24px rgba(255, 107, 107, 0.3)'
        }}>
          {nextTurnModifier.skipped && '⏸️ RECOVERY MODE - NEXT TURN SKIPPED!'}
          {nextTurnModifier.defenseDebuff && '🔥 DEFENSE WEAKENED - TAKE 2X DAMAGE NEXT TURN!'}
        </div>
      )}

      <ArenaActions onAttack={onAttack} onRun={onRun} onSpecial={onSpecial} disableRun={disableRun} safeCooldown={safeCooldown} riskyCooldown={riskyCooldown} specialCooldown={specialCooldown} weaponType={weaponType} />
    </section>
  );
}
