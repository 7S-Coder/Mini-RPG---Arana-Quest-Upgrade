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
  collectPickup?: (id: string) => void;
  pushLog?: (text: string) => void;
};

export default function ArenaPanel({ enemies, logs, onAttack, onRun, pickups = [], collectPickup }: Props) {
  return (
    <section className="arena-panel">
      <div className="arena-log">
        <EnemiesRow enemies={enemies} />
        <LogMessages logs={logs} />
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
                  const ok = collectPickup && collectPickup(p.id);
                  if (ok) {
                    if (p.kind === 'gold') pushLog && pushLog(`Ramassé: +${Number(p.amount).toFixed(2)} g`);
                    else pushLog && pushLog(`Ramassé: ${p.item?.name ?? 'Objet'}`);
                  }
                } catch (e) {}
              }}
              style={{ left: (p.x ?? 220), top: (p.y ?? 120), position: 'absolute' }}
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
