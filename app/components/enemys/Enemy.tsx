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
	return ( 
    <>
    </>
	);
}
