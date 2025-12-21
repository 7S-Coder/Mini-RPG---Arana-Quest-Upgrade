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
	const [hoveredStat, setHoveredStat] = useState<string | null>(null);
	const [hoveredResource, setHoveredResource] = useState<string | null>(null);
	const prevHpRef = useRef<number>(hp);
	const hpPerc = Math.max(0, Math.min(1, hp / Math.max(1, maxHp)));
	const prevHpPerc = Math.max(0, Math.min(1, prevHpRef.current / Math.max(1, maxHp)));
	const xpToNext = (lvl = level ?? 1) => Math.max(20, 100 * lvl);
	const xpPerc = Math.max(0, Math.min(1, (xp ?? 0) / xpToNext(level ?? 1)));

	const STAT_TOOLTIPS: Record<string, string> = {
		hp: 'Health Points - Your current life. Regenerates out of combat.',
		level: 'Character level determines encounter difficulty and stat scaling.',
		xp: 'Experience points earned from defeating enemies. Level up at the threshold.',
		damage: 'Physical damage dealt to enemies. Scales with level and equipment.',
		defense: 'Reduces damage taken from enemies. Higher defense = less damage.',
		dodge: 'Chance to avoid incoming attacks completely. Stacks with other defenses.',
		crit: 'Chance to deal 50% extra damage on an attack. Scales with equipment.',
		regen: 'Health recovered per second out of combat. Removed in battle.',
		speed: 'Movement and attack speed. Higher is faster combat.',
		gold: 'Currency earned from battles. Used to purchase items and upgrades.',
		essence: 'Magical resource for crafting and forging. Obtained from monsters.',
		essence_dust: 'Common material from weak enemies. Used in basic crafting.',
		mithril_ore: 'Rare material from stronger foes. Essential for forging equipment.',
		star_fragment: 'Precious material. Increases item rarity when used in forge.',
		void_shard: 'Mystic material. Adds special properties to forged items.',
		hp_bar: 'Health bar showing current vs maximum HP. Red bar warns when low.',
		xp_bar: 'Experience bar to next level. Fill it to gain new level and stats.',
	};

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
						<div style={{ position: 'relative' }} onMouseEnter={() => setHoveredResource('gold')} onMouseLeave={() => setHoveredResource(null)}>
							<div style={{ color: '#ffd700' }}>{(typeof gold === 'number' ? gold.toFixed(2) : (gold ?? 0))} g</div>
							{hoveredResource === 'gold' && (
								<div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: 6, padding: 8, fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8 }}>
									{STAT_TOOLTIPS.gold}
								</div>
							)}
						</div>
						 
						<div style={{ position: 'relative' }} onMouseEnter={() => setHoveredResource('essence')} onMouseLeave={() => setHoveredResource(null)}>
							<div style={{ color: '#6eb3ff' }}>{(essence ?? 0).toFixed(0)} e</div>
							{hoveredResource === 'essence' && (
								<div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: 6, padding: 8, fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8 }}>
									{STAT_TOOLTIPS.essence}
								</div>
							)}
						</div>
					</div>
					<div style={{ fontSize: 11, marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
						<div style={{ position: 'relative' }} onMouseEnter={() => setHoveredResource('essence_dust')} onMouseLeave={() => setHoveredResource(null)}>
							<div style={{ color: '#a389d9' }}>⚪ {materials?.essence_dust ?? 0}</div>
							{hoveredResource === 'essence_dust' && (
								<div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: 6, padding: 8, fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8 }}>
									{STAT_TOOLTIPS.essence_dust}
								</div>
							)}
						</div>
						<div style={{ position: 'relative' }} onMouseEnter={() => setHoveredResource('mithril_ore')} onMouseLeave={() => setHoveredResource(null)}>
							<div style={{ color: '#c0a080' }}>⬜ {materials?.mithril_ore ?? 0}</div>
							{hoveredResource === 'mithril_ore' && (
								<div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: 6, padding: 8, fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8 }}>
									{STAT_TOOLTIPS.mithril_ore}
								</div>
							)}
						</div>
						<div style={{ position: 'relative' }} onMouseEnter={() => setHoveredResource('star_fragment')} onMouseLeave={() => setHoveredResource(null)}>
							<div style={{ color: '#ffc100' }}>✨ {materials?.star_fragment ?? 0}</div>
							{hoveredResource === 'star_fragment' && (
								<div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: 6, padding: 8, fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8 }}>
									{STAT_TOOLTIPS.star_fragment}
								</div>
							)}
						</div>
						<div style={{ position: 'relative' }} onMouseEnter={() => setHoveredResource('void_shard')} onMouseLeave={() => setHoveredResource(null)}>
							<div style={{ color: '#4a4a6a' }}>◆ {materials?.void_shard ?? 0}</div>
							{hoveredResource === 'void_shard' && (
								<div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: 6, padding: 8, fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8 }}>
									{STAT_TOOLTIPS.void_shard}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* floating damage number near avatar (MMO-style) */}
			{damageFlash && (
				<div className="damage-number" key={damageFlash.key}>-{damageFlash.amount}</div>
			)}

			<div className="bars">
			<div style={{ position: 'relative' }} onMouseEnter={() => setHoveredResource('hp_bar')} onMouseLeave={() => setHoveredResource(null)}>
				<div className="hp-bar" style={{ position: "relative" }}>
					<div className="track">
						<div className={`fill ${hpPerc <= 0.1 ? 'hp-low' : ''}`} style={{ width: `${hpPerc * 100}%` }} />
					</div>
				</div>
				{hoveredResource === 'hp_bar' && (
					<div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: 6, padding: 8, fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8 }}>
						{STAT_TOOLTIPS.hp_bar}
					</div>
				)}
			</div>
			<div style={{ position: 'relative' }} onMouseEnter={() => setHoveredResource('xp_bar')} onMouseLeave={() => setHoveredResource(null)}>
				<div className="xp-bar">
					<div className="track"><div className="fill" style={{ width: `${xpPerc * 100}%` }} /></div>
				</div>
				{hoveredResource === 'xp_bar' && (
					<div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: 6, padding: 8, fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8 }}>
						{STAT_TOOLTIPS.xp_bar}
					</div>
				)}
			</div>		</div>
			<div className="player-stats">
			<div style={{ position: 'relative' }} onMouseEnter={() => setHoveredStat('hp')} onMouseLeave={() => setHoveredStat(null)}>
				HP: {Math.round(hp)} / {Math.round(maxHp)}
				{hoveredStat === 'hp' && (
					<div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: 6, padding: 8, fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8 }}>
						{STAT_TOOLTIPS.hp}
					</div>
				)}
			</div>
			<div style={{ position: 'relative' }} onMouseEnter={() => setHoveredStat('level')} onMouseLeave={() => setHoveredStat(null)}>
				Level: {level ?? 1} XP: {xp ?? 0}/{xpToNext(level ?? 1)}
				{hoveredStat === 'level' && (
					<div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: 6, padding: 8, fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8 }}>
						{STAT_TOOLTIPS.level}
					</div>
				)}
			</div>
			<div style={{ position: 'relative' }} onMouseEnter={() => setHoveredStat('damage')} onMouseLeave={() => setHoveredStat(null)}>
				Damage: {dmg ?? 0} - Defense: {def ?? 0}
				{hoveredStat === 'damage' && (
					<div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: 6, padding: 8, fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8 }}>
						{STAT_TOOLTIPS.damage}
					</div>
				)}
			</div>
			<div style={{ position: 'relative' }} onMouseEnter={() => setHoveredStat('dodge')} onMouseLeave={() => setHoveredStat(null)}>
				Dodge: {dodge ?? 0} - Crit: {crit ?? 0}%
				{hoveredStat === 'dodge' && (
					<div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: 6, padding: 8, fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8 }}>
						{STAT_TOOLTIPS.dodge}
					</div>
				)}
			</div>
			<div style={{ position: 'relative' }} onMouseEnter={() => setHoveredStat('regen')} onMouseLeave={() => setHoveredStat(null)}>
				Regen: {regen ?? 0} - Speed: {speed ?? 0}
				{hoveredStat === 'regen' && (
					<div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: 6, padding: 8, fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8 }}>
						{STAT_TOOLTIPS.regen}
					</div>
				)}
			</div>
			</div>

			<div className="player-actions">
				<button className="btn" onClick={() => onOpenModal?.("inventory")}>Inventory</button>
			</div>
		</div>
	);
}
