import React from "react";
import { getWeaponDescription, getPlayerWeaponStats, getRarityMultiplier } from "@/app/game/weaponHelpers";

type Props = {
  player: any;
};

export default function WeaponInfo({ player }: Props) {
  const weaponDesc = getWeaponDescription(player);
  const weaponStats = getPlayerWeaponStats(player);
  const rarity = player.equippedWeapon?.rarity || 'common';
  
  // Color based on rarity
  const rarityColors: Record<string, string> = {
    common: '#999',
    uncommon: '#6eb3ff',
    rare: '#9d4edd',
    epic: '#ff006e',
    legendary: '#ffd60a',
    mythic: '#ff006e',
  };

  return (
    <div
      style={{
        fontSize: 12,
        padding: "8px 12px",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "4px",
        marginTop: "8px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
      title="Equipped weapon stats"
    >
      <span>⚔️</span>
      <span
        style={{
          display: "inline-block",
          padding: "2px 8px",
          backgroundColor: rarityColors[rarity],
          color: "#000",
          borderRadius: "3px",
          fontWeight: "600",
          fontSize: "11px",
          textTransform: "uppercase",
        }}
      >
        {weaponStats.type}
      </span>
      <span>{weaponDesc}</span>
    </div>
  );
}
