import React from "react";
import EnemiesRow from "../enemys/EnemiesRow";
import LogMessages from "../LogMessages";
import ArenaActions from "./ArenaActions";

type Props = {
  enemies: any[];
  logs: string[];
  onAttack: () => void;
  onRun: () => void;
  pickups?: any[];
  collectPickup?: (id: string) => boolean | void;
  pushLog?: (text: string) => void;
  logColor?: string;
};

export default function ArenaPanel({ enemies, logs, onAttack, onRun, pickups = [], collectPickup, pushLog, logColor }: Props) {
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

  return (
    <section className="arena-panel" style={arenaStyle}>
      <div className="arena-log">
        <EnemiesRow enemies={enemies} />
        <LogMessages logs={logs} logColor={logColor} />
      </div>

      {/* pickups rendered as absolute positioned elements within the arena wrapper */}
      {pickups && pickups.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
          {pickups.map((p) => (
            <div
              key={p.id}
              className={`pickup ${p.kind === 'gold' ? 'gold' : 'item'} spawn`}
              onClick={() => {
                try {
                  const ok = collectPickup ? collectPickup(p.id) : false;
                  if (ok) {
                    if (p.kind === 'gold') pushLog && pushLog(`Ramassé: +${Number(p.amount).toFixed(2)} g`);
                    else pushLog && pushLog(`Ramassé: ${p.item?.name ?? 'Objet'}`);
                  }
                } catch (e) { console.error(e); }
              }}
              style={{ left: (p.x ?? 220), top: (p.y ?? 120), position: 'absolute', pointerEvents: 'auto' }}
            >
              <div className="icon">{p.kind === 'gold' ? '💰' : '📦'}</div>
              <div className="label">{p.kind === 'gold' ? `${Number(p.amount).toFixed(2)} g` : (p.item?.name ?? 'Objet')}</div>
            </div>
          ))}
        </div>
      )}

      <ArenaActions onAttack={onAttack} onRun={onRun} />
    </section>
  );
}
