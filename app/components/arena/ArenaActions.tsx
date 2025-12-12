import React from "react";

type Props = {
  onAttack?: () => void;
  onRun?: () => void;
};

export default function ArenaActions({ onAttack, onRun }: Props) {
  return (
    <div className="arena-actions">
      <button className="btn danger" onClick={() => onAttack && onAttack()}>Attaquer</button>
      <button className="btn" onClick={() => onRun && onRun()}>Fuir</button>
    </div>
  );
}
