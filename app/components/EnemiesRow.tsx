import React from "react";
import Enemy from "./Enemy";

type Props = {
  enemies: any[];
};

export default function EnemiesRow({ enemies }: Props) {
  return (
    <div className="enemies-row">
      {enemies.map((e) => (
        <div key={e.id} style={{ display: "inline-block", marginRight: 12 }}>
          <Enemy {...e} />
          <div style={{ color: "#ccc", fontSize: 12 }}>{e.name} HP: {e.hp}</div>
        </div>
      ))}
    </div>
  );
}
