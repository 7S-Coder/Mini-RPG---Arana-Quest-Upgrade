"use client";

import React, { useEffect, useState, useRef } from "react";

type Props = {
	x: number;
	y: number;
	hp: number;
	maxHp: number;
	level?: number;
	xp?: number;
	dmg?: number;
	def?: number;
	dodge?: number;
	crit?: number;
	speed?: number;
	lastLevelUpAt?: number | null;
	onOpenModal?: (name: string) => void;
	gold?: number;
};

export default function Player({ x, y, hp, maxHp, level, xp, dmg, def, dodge, crit, speed, lastLevelUpAt, onOpenModal, gold }: Props) {
	const [showLevelUp, setShowLevelUp] = useState(false);
	const [damageFlash, setDamageFlash] = useState<{ amount: number; key: string } | null>(null);
	const prevHpRef = useRef<number>(hp);
	const hpPerc = Math.max(0, Math.min(1, hp / Math.max(1, maxHp)));
	const prevHpPerc = Math.max(0, Math.min(1, prevHpRef.current / Math.max(1, maxHp)));
	const xpToNext = (lvl = level ?? 1) => Math.max(20, 100 * lvl);
	const xpPerc = Math.max(0, Math.min(1, (xp ?? 0) / xpToNext(level ?? 1)));

	useEffect(() => {
		if (!lastLevelUpAt) return;
		setShowLevelUp(true);
		const t = setTimeout(() => setShowLevelUp(false), 2200);
		return () => clearTimeout(t);
	}, [lastLevelUpAt]);

	// detect hp loss and trigger damage flash
	useEffect(() => {
		const prev = prevHpRef.current;
		if (hp < prev) {
			const amount = prev - hp;
			const gen = () => {
				try {
					// @ts-ignore
					if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
						// @ts-ignore
						return (crypto as any).randomUUID();
					}
				} catch (e) {}
				return `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
			};
			const key = gen();
			setDamageFlash({ amount, key });
			prevHpRef.current = hp;
			const t = setTimeout(() => setDamageFlash(null), 900);
			return () => clearTimeout(t);
		}
		prevHpRef.current = hp;
	}, [hp]);

	return (
		<div className="player-card" style={{ position: "relative" }}>
			{showLevelUp && (
				<div className="level-up-badge">Niveau +1 !</div>
			)}

			<div className="player-header">
				<div className="avatar" />
				<div>
					<h3>Joueur</h3>
					<div style={{ fontSize: 12, color: '#ffd700', fontWeight: 700, marginTop: 4 }}>{(typeof gold === 'number' ? gold.toFixed(2) : (gold ?? 0))} g</div>
				</div>
			</div>

			{/* floating damage number near avatar (MMO-style) */}
			{damageFlash && (
				<div className="damage-number" key={damageFlash.key}>-{damageFlash.amount}</div>
			)}

			<div className="bars">
				<div className="hp-bar" style={{ position: "relative" }}>
					<div className="track">
						<div className={`fill ${hpPerc <= 0.1 ? 'hp-low' : ''}`} style={{ width: `${hpPerc * 100}%` }} />
					</div>
				</div>
				<div className="xp-bar">
					<div className="track"><div className="fill" style={{ width: `${xpPerc * 100}%` }} /></div>
				</div>
			</div>

			<div className="player-stats">
				<div>PV: {hp} / {maxHp}</div>
				<div>Niveau: {level ?? 1} XP: {xp ?? 0}/{xpToNext(level ?? 1)}</div>
				<div>Dégâts: {dmg ?? 0} Défense: {def ?? 0} ESQ: {dodge ?? 0}% CRIT: {crit ?? 0}%</div>
			</div>

			<div className="player-actions">
				<button className="btn" onClick={() => onOpenModal?.("inventory")}>Inventaire & Équipement</button>
			</div>
		</div>
	);
}
