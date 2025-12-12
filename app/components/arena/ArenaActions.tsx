import React from "react";

type Props = {
  onAttack?: () => void;
  onRun?: () => void;
  disableRun?: boolean;
};

export default function ArenaActions({ onAttack, onRun, disableRun }: Props) {
  return (
    <div className="arena-actions">
      <button className="btn danger" onClick={() => onAttack && onAttack()}>Attaquer</button>
      <button className={`btn ${disableRun ? 'disabled' : ''}`} onClick={() => onRun && onRun()} disabled={!!disableRun}>Fuir</button>
    </div>
  );
}
