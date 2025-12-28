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
        <div
          className="event-tooltip"
        >
          {activeEvent.description}
        </div>
      )}
    </div>
  );
}
