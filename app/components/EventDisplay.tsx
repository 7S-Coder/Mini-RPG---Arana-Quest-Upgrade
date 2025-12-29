import React from "react";
import type { ActiveGameEvent } from "@/app/game/types";

const EVENT_ICON_PATHS: Record<string, string> = {
  blood_moon: "/assets/events/bloodMoon.svg",
  essence_storm: "/assets/events/essenceStorm.svg",
  whispering_shadows: "/assets/events/whisperingShadows.svg",
  swarm_surge: "/assets/events/swarmSurge.svg",
  plague_mist: "/assets/events/plagueMist.svg",
  frozen_peaks: "/assets/events/frozenPeaks.svg",
};

const EFFECT_LABELS: Record<string, string> = {
  enemy_bonus: "Enemy Damage",
  player_malus: "Player Damage",
  spawn_modifier: "Enemy Spawn",
  rage_modifier: "Enemy Rage",
  dodge_bonus: "Dodge Bonus",
  loot_bonus: "Loot Rarity",
  enemy_debuff: "Enemy Defense",
};

type Props = {
  activeEvent: ActiveGameEvent | null;
};

export default function EventDisplay({ activeEvent }: Props) {
  const [hoveredEvent, setHoveredEvent] = React.useState<boolean>(false);

  if (!activeEvent) return null;

  const pulseClass = activeEvent.consolePulse ? "event-pulse" : "";
  const eventStyle = {
    backgroundColor: activeEvent.consoleTint,
  };

  const iconPath = EVENT_ICON_PATHS[activeEvent.id];

  const formatEffects = () => {
    return activeEvent.effects.map((effect) => {
      const label = EFFECT_LABELS[effect.type] || effect.type;
      const sign = effect.value > 0 ? "+" : "";
      const suffix = effect.type === "spawn_modifier" ? " enemies" : "%";
      return `${label}: ${sign}${effect.value}${suffix}`;
    });
  };

  return (
    <div
      className={`event-display ${pulseClass}`}
      style={eventStyle}
      onMouseEnter={() => setHoveredEvent(true)}
      onMouseLeave={() => setHoveredEvent(false)}
    >
      <div className="event-header">
        {iconPath ? (
          <img 
            src={iconPath} 
            alt={activeEvent.name} 
            className="event-icon-svg"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : null}
        <span className="event-icon">{activeEvent.icon}</span>
        <span className="event-name">{activeEvent.name}</span>
        <span className="event-duration">
          {activeEvent.durationRemaining} battle{activeEvent.durationRemaining !== 1 ? "s" : ""} left
        </span>
      </div>
      {hoveredEvent && (
        <div className="event-tooltip">
          <div style={{ marginBottom: "8px" }}>
            {activeEvent.description}
          </div>
          <div style={{ borderTop: "1px solid rgba(255, 200, 80, 0.3)", paddingTop: "8px", fontSize: "11px", color: "rgba(255, 200, 80, 0.9)" }}>
            {formatEffects().map((effect, idx) => (
              <div key={idx}>{effect}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
