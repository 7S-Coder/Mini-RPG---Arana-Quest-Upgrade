import React from "react";

type Props = {
	id: string;
	name?: string;
	rarity?: "common" | "rare" | "epic" | "legendary" | "mythic";
	level?: number;
	x: number;
	y: number;
	hp: number;
	speed?: number;
};

export default function Enemy({ id, name, rarity, level, x, y, hp }: Props) {
	const cls = rarity ? `enemy-name ${rarity}` : "enemy-name";
	return (
		<div className="enemy" data-id={id} style={{ position: "absolute", left: x, top: y }}>
			<div className={cls}>{name ?? id}{level ? ` (lvl ${level})` : ''}</div>
			<div>HP: {hp}</div>
		</div>
	);
}
