import React from "react";
import EnemiesRow from "./EnemiesRow";
import LogMessages from "./LogMessages";
import ArenaActions from "./ArenaActions";

type Props = {
  enemies: any[];
  logs: string[];
  onAttack: () => void;
  onRun: () => void;
};

export default function ArenaPanel({ enemies, logs, onAttack, onRun }: Props) {
  return (
    <section className="arena-panel">
      <div className="arena-log">
        <EnemiesRow enemies={enemies} />
        <LogMessages logs={logs} />
      </div>

      <ArenaActions onAttack={onAttack} onRun={onRun} />
    </section>
  );
}
