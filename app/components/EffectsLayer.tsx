import React, { useState, useEffect } from "react";

type Effect = {
  id: string;
  type: string; // damage | dodge
  text?: string;
  kind?: string; // crit | hit
  target?: string; // player | enemy
  x?: number;
  y?: number;
};

export default function EffectsLayer({ effects }: { effects: Effect[] }) {
  const [displayedEffects, setDisplayedEffects] = useState<Map<string, Effect>>(new Map());

  useEffect(() => {
    // Update the displayed effects map
    const newMap = new Map<string, Effect>();
    effects.forEach((e) => {
      newMap.set(e.id, e);
    });
    setDisplayedEffects(newMap);
  }, [effects]);

  return (
    <div className="effects-layer" aria-hidden>
      {Array.from(displayedEffects.values()).map((e) => (
        <div
          key={e.id}
          className={`damage-popup ${e.kind ?? ""} ${e.type}`}
          style={{ left: e.x ?? "50%", top: e.y ?? "40%" }}
        >
          {e.type === "dodge" ? "Dodge" : e.kind === "crit" ? `💥 ${e.text}` : e.text}
        </div>
      ))}
    </div>
  );
}
