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
	regen?: number;
	lastLevelUpAt?: number | null;
	onOpenModal?: (name: string) => void;
	gold?: number;
	essence?: number;
	inCombat?: boolean;
	materials?: {
		essence_dust?: number;
		mithril_ore?: number;
		star_fragment?: number;
		void_shard?: number;
	};
};

export default function Player({ x, y, hp, maxHp, level, xp, dmg, def, dodge, crit, speed, regen, lastLevelUpAt, onOpenModal, gold, essence, inCombat, materials }: Props) {
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

	// detect hp loss and trigger damage flash (only in combat)
	useEffect(() => {
		const prev = prevHpRef.current;
		if (inCombat && hp < prev) {
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
	}, [hp, inCombat]);

	return (
		<div className="player-card" style={{ position: "relative" }}>
			{showLevelUp && (
					<div className="level-up-badge">Level up!</div>
			)}

			<div className="player-header">
				<div className="avatar" />
				<div>
					<h3>Player</h3>
				<div style={{ fontSize: 12, fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
					<div style={{ color: '#ffd700' }}>{(typeof gold === 'number' ? gold.toFixed(2) : (gold ?? 0))} g</div>
					 
					<div style={{ color: '#6eb3ff' }}>{(essence ?? 0).toFixed(0)} e</div>
				</div>
				<div style={{ fontSize: 11, marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
					<div style={{ color: '#a389d9' }}>⚪ {materials?.essence_dust ?? 0}</div>
					<div style={{ color: '#c0a080' }}>⬜ {materials?.mithril_ore ?? 0}</div>
					<div style={{ color: '#ffc100' }}>✨ {materials?.star_fragment ?? 0}</div>
					<div style={{ color: '#4a4a6a' }}>◆ {materials?.void_shard ?? 0}</div>
				</div>
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
			<div>HP: {Math.round(hp)} / {Math.round(maxHp)}</div>
				<div>Level: {level ?? 1} XP: {xp ?? 0}/{xpToNext(level ?? 1)}</div>
				<div>Damage: {dmg ?? 0} - Defense: {def ?? 0}</div>
				<div>Dodge: {dodge ?? 0} - Crit: {crit ?? 0}%</div>
				<div>Regen: {regen ?? 0} - Speed: {speed ?? 0}</div>
			</div>

			<div className="player-actions">
				<button className="btn" onClick={() => onOpenModal?.("inventory")}>Inventory</button>
			</div>
		</div>
	);
}
