import React from "react";
import { getWeaponDescription } from "@/app/game/weaponHelpers";

type Props = {
  player: any;
};

export default function WeaponInfo({ player }: Props) {
  const weaponDesc = getWeaponDescription(player);

  return (
    <div
      style={{
        fontSize: 12,
        padding: "8px 12px",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "4px",
        marginTop: "8px",
      }}
      title="Equipped weapon stats"
    >
      ⚔️ {weaponDesc}
    </div>
  );
}
