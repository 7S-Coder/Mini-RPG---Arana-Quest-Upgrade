"use client";

import React, { useEffect, useState, useRef } from "react";
import EssenceSVG from "@/app/assets/essence.svg";
import GoldSVG from "@/app/assets/gold.svg";

import DodgeSVG from "@/app/assets/stats/dodge.svg";
import CritSVG from "@/app/assets/stats/crit.svg";
import SpeedSVG from "@/app/assets/stats/speed.svg";
import RegenSVG from "@/app/assets/stats/regen.svg";

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

	// Debug: log hp, maxHp, and hpPerc
	useEffect(() => {
	}, [hp, maxHp, hpPerc]);

	// Debug: log materials
	useEffect(() => {
	}, [materials]);

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
		essence: 'Magical resource for crafting and forging. Obtained from bosses in dungeons.',
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
		<div className="player-card" style={{ position: "relative", display: 'flex', flexDirection: 'column', gap: 8 }}>
			{showLevelUp && (
				<div className="level-up-badge">Level up!</div>
			)}

			{/* ZONE 1 — IDENTITÉ & TENSION */}
			
			{/* Avatar + Nom */}
			<div className="player-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
				<div className="avatar" style={{ width: 40, height: 40, flexShrink: 0 }} />
				<div>
					<h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Player</h3>
				</div>
			</div>

			{/* Floating damage (MMO-style) */}
			{damageFlash && (
				<div className="damage-number" key={damageFlash.key}>-{damageFlash.amount}</div>
			)}

			{/* HP BAR — L'ÉLÉMENT LE PLUS IMPORTANT */}
			<div style={{ position: 'relative' }} onMouseEnter={() => setHoveredResource('hp_bar')} onMouseLeave={() => setHoveredResource(null)}>
				<div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#fff' }}>
					HP: {Math.round(hp)} / {Math.round(maxHp)}
				</div>
				<div className="hp-bar" style={{ 
					position: "relative",
					height: 28,
					backgroundColor: '#1a1a1a',
					borderRadius: 4,
					border: '1px solid #444',
					overflow: 'hidden'
				}}>
					<div className="track" style={{ width: '100%', height: '100%' }}>
						<div 
							className={`fill ${hpPerc <= 0.2 ? 'hp-critical' : hpPerc <= 0.5 ? 'hp-low' : 'hp-normal'}`}
							style={{ 
								width: `${hpPerc * 100}%`,
								height: '100%',
								backgroundColor: hpPerc <= 0.2 ? '#cc3333' : hpPerc <= 0.5 ? '#ca2020ff' : '#cc3333',
								animation: hpPerc <= 0.2 ? 'pulse-critical 0.6s infinite' : hpPerc <= 0.5 ? 'pulse-low 1s infinite' : 'none'
							}} 
						/>
					</div>
				</div>
				{hoveredResource === 'hp_bar' && (
					<div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: 6, padding: '12px 16px', fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8, lineHeight: 1.4 }}>
						{STAT_TOOLTIPS.hp_bar}
					</div>
				)}
			</div>

			{/* LEVEL + XP BAR */}
			<div style={{ position: 'relative' }} onMouseEnter={() => setHoveredResource('xp_bar')} onMouseLeave={() => setHoveredResource(null)}>
				<div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#fff' }}>
					LEVEL {level ?? 1}
				</div>
				<div className="xp-bar" style={{
					position: 'relative',
					height: 18,
					backgroundColor: '#1a1a1a',
					borderRadius: 3,
					border: '1px solid #444',
					overflow: 'hidden'
				}}>
					<div className="track" style={{ width: '100%', height: '100%' }}>
						<div 
							className="fill"
							style={{ 
								width: `${xpPerc * 100}%`,
								height: '100%',
								backgroundColor: '#6eb3ff',
								transition: 'width 0.3s ease'
							}}
						/>
					</div>
				</div>
				<div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
					XP: {xp ?? 0}/{xpToNext(level ?? 1)}
				</div>
				{hoveredResource === 'xp_bar' && (
					<div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: '#111', border: '1px solid #666', borderRadius: 6, padding: '12px 16px', fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8, lineHeight: 1.4, minWidth: 160 }}>
						{STAT_TOOLTIPS.xp_bar}
					</div>
				)}
			</div>

			{/* ZONE 2 — PUISSANCE DE COMBAT */}

			{/* Stats primaires */}
			<div style={{ 
				display: 'grid', 
				gridTemplateColumns: '1fr 1fr', 
				gap: 12,
				fontSize: 12,
				fontWeight: 600,
				padding: '12px 0',
				borderTop: '1px solid #333',
				borderBottom: '1px solid #333'
			}}>
				<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onMouseEnter={() => setHoveredStat('damage')} onMouseLeave={() => setHoveredStat(null)}>
					<div style={{ color: '#ff9999' }}>⚔ Damage</div>
					<div style={{ fontSize: 14, fontWeight: 700, color: '#ff9999', marginTop: 2 }}>{dmg ?? 0}</div>
					{hoveredStat === 'damage' && (
						<div style={{ position: 'absolute', bottom: '105%', left: '50%', transform: 'translateX(-50%)', background: '#111', border: '1px solid #666', borderRadius: 6, padding: '12px 16px', fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8, lineHeight: 1.4, minWidth: 160 }}>
							{STAT_TOOLTIPS.damage}
						</div>
					)}
				</div>
				<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onMouseEnter={() => setHoveredStat('defense')} onMouseLeave={() => setHoveredStat(null)}>
					<div style={{ color: '#99ccff' }}>🛡 Defense</div>
					<div style={{ fontSize: 14, fontWeight: 700, color: '#99ccff', marginTop: 2 }}>{def ?? 0}</div>
					{hoveredStat === 'defense' && (
						<div style={{ position: 'absolute', bottom: '105%', left: '50%', transform: 'translateX(-50%)', background: '#111', border: '1px solid #666', borderRadius: 6, padding: '12px 16px', fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8, lineHeight: 1.4, minWidth: 160 }}>
							{STAT_TOOLTIPS.defense}
						</div>
					)}
				</div>
			</div>

			{/* Stats secondaires */}
			<div style={{ 
				display: 'grid', 
				gridTemplateColumns: '1fr 1fr 1fr 1fr', 
				gap: 8,
				fontSize: 11,
				color: '#aaa'
			}}>
				<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'  }} onMouseEnter={() => setHoveredStat('crit')} onMouseLeave={() => setHoveredStat(null)}>
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}><img src={CritSVG.src} alt="Crit" style={{ width: 24, height: 24 }} /> Crit</div>
					<div style={{ fontSize: 12, fontWeight: 600, color: '#ddd', marginTop: 2 }}>{crit ?? 0}%</div>
					{hoveredStat === 'crit' && (
						<div style={{ position: 'absolute', bottom: '105%', left: '50%', transform: 'translateX(-50%)', background: '#111', border: '1px solid #666', borderRadius: 6, padding: '12px 16px', fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8, lineHeight: 1.4, minWidth: 160 }}>
							{STAT_TOOLTIPS.crit}
						</div>
					)}
				</div>
				<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'  }} onMouseEnter={() => setHoveredStat('dodge')} onMouseLeave={() => setHoveredStat(null)}>
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}><img src={DodgeSVG.src} alt="Dodge" style={{ width: 24, height: 24 }} />  Dodge</div>
					<div style={{ fontSize: 12, fontWeight: 600, color: '#ddd', marginTop: 2 }}>{dodge ?? 0}</div>
					{hoveredStat === 'dodge' && (
						<div style={{ position: 'absolute', bottom: '105%', left: '50%', transform: 'translateX(-50%)', background: '#111', border: '1px solid #666', borderRadius: 6, padding: '12px 16px', fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8, lineHeight: 1.4, minWidth: 160 }}>
							{STAT_TOOLTIPS.dodge}
						</div>
					)}
				</div>
				<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'  }} onMouseEnter={() => setHoveredStat('speed')} onMouseLeave={() => setHoveredStat(null)}>
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}><img src={SpeedSVG.src} alt="Speed" style={{ width: 24, height: 24 }} />  Speed</div>
					<div style={{ fontSize: 12, fontWeight: 600, color: '#ddd', marginTop: 2 }}>{speed ?? 0}</div>
					{hoveredStat === 'speed' && (
						<div style={{ position: 'absolute', bottom: '105%', left: '50%', transform: 'translateX(-50%)', background: '#111', border: '1px solid #666', borderRadius: 6, padding: '12px 16px', fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8, lineHeight: 1.4, minWidth: 160 }}>
							{STAT_TOOLTIPS.speed}
						</div>
					)}
				</div>
				<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={() => setHoveredStat('regen')} onMouseLeave={() => setHoveredStat(null)}>
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}><img src={RegenSVG.src} alt="Regen" style={{ width: 24, height: 24 }} />  Regen</div>
					<div style={{ fontSize: 12, fontWeight: 600, color: '#ddd', marginTop: 2 }}>{regen ?? 0}</div>
					{hoveredStat === 'regen' && (
						<div style={{ position: 'absolute', bottom: '105%', left: '50%', transform: 'translateX(-50%)', background: '#111', border: '1px solid #666', borderRadius: 6, padding: '12px 16px', fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8, lineHeight: 1.4, minWidth: 160 }}>
							{STAT_TOOLTIPS.regen}
						</div>
					)}
				</div>
			</div>

			{/* ZONE 3 — ÉCONOMIE & RESSOURCES */}

			{/* Or + Essence */}
			<div style={{ 
				fontSize: 12, 
				fontWeight: 600,
				padding: '8px 0',
				borderTop: '1px solid #333',
				display: 'grid',
				gridTemplateColumns: '1fr 1fr',
				gap: 12
			}}>
				<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onMouseEnter={() => setHoveredResource('gold')} onMouseLeave={() => setHoveredResource(null)}>
				<div style={{ color: '#ffd700', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
					<img src={GoldSVG.src} alt="Gold" style={{ width: 20, height: 20 }} />
					{(typeof gold === 'number' ? gold.toFixed(2) : (gold ?? 0))}
				</div>
					{hoveredResource === 'gold' && (
						<div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', maxWidth: '150px', background: '#111', border: '1px solid #666', borderRadius: 6, padding: '12px 16px', fontSize: 11, color: '#ccc', zIndex: 1000, whiteSpace: 'normal', lineHeight: 1.4, minWidth: 160 }}>
							{STAT_TOOLTIPS.gold}
						</div>
					)}
				</div>
				<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onMouseEnter={() => setHoveredResource('essence')} onMouseLeave={() => setHoveredResource(null)}>
				<div style={{ color: '#6eb3ff', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
					<img src={EssenceSVG.src} alt="Essence" style={{ width: 20, height: 20 }} />
					{(essence ?? 0).toFixed(0)}
				</div>
					{hoveredResource === 'essence' && (
						<div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', maxWidth: '150px', background: '#111', border: '1px solid #666', borderRadius: 6, padding: '12px 16px', fontSize: 11, color: '#ccc', zIndex: 1000, whiteSpace: 'normal', lineHeight: 1.4, minWidth: 160 }}>
							{STAT_TOOLTIPS.essence}
						</div>
					)}
				</div>
			</div>

			{/* Forge Materials — TRÈS DISCRET */}
			<div style={{ 
				fontSize: 10,
				color: '#777',
				padding: '8px 0',
				opacity: 0.75,
				borderTop: '1px solid #2a2a2a'
			}}>
				<div style={{ fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Forge Materials</div>
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
					<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onMouseEnter={() => setHoveredResource('essence_dust')} onMouseLeave={() => setHoveredResource(null)}>
						<div style={{ color: '#a389d9' }}>⚪ Essence Dust</div>
						<div style={{ fontSize: 11, fontWeight: 500, color: '#aaa' }}>x{materials?.essence_dust ?? 0}</div>
						{hoveredResource === 'essence_dust' && (
							<div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', maxWidth: '140px', background: '#111', border: '1px solid #666', borderRadius: 6, padding: '12px 16px', fontSize: 11, color: '#ccc', zIndex: 1000, whiteSpace: 'normal', lineHeight: 1.4, minWidth: 160 }}>
								{STAT_TOOLTIPS.essence_dust}
							</div>
						)}
					</div>
					<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onMouseEnter={() => setHoveredResource('mithril_ore')} onMouseLeave={() => setHoveredResource(null)}>
						<div style={{ color: '#c0a080' }}>⬜ Mithril Ore</div>
						<div style={{ fontSize: 11, fontWeight: 500, color: '#aaa' }}>x{materials?.mithril_ore ?? 0}</div>
						{hoveredResource === 'mithril_ore' && (
							<div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', maxWidth: '150px', background: '#111', border: '1px solid #666', borderRadius: 6, padding: '12px 16px', fontSize: 11, color: '#ccc', zIndex: 1000, whiteSpace: 'normal', lineHeight: 1.4, minWidth: 160 }}>
								{STAT_TOOLTIPS.mithril_ore}
							</div>
						)}
					</div>
					<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onMouseEnter={() => setHoveredResource('star_fragment')} onMouseLeave={() => setHoveredResource(null)}>
						<div style={{ color: '#ffc100' }}>✨ Star Fragment</div>
						<div style={{ fontSize: 11, fontWeight: 500, color: '#aaa' }}>x{materials?.star_fragment ?? 0}</div>
						{hoveredResource === 'star_fragment' && (
							<div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', maxWidth: '140px', background: '#111', border: '1px solid #666', borderRadius: 6, padding: '12px 16px', fontSize: 11, color: '#ccc', zIndex: 1000, whiteSpace: 'normal', lineHeight: 1.4, minWidth: 160 }}>
								{STAT_TOOLTIPS.star_fragment}
							</div>
						)}
					</div>
					<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onMouseEnter={() => setHoveredResource('void_shard')} onMouseLeave={() => setHoveredResource(null)}>
						<div style={{ color: '#4a4a6a' }}>◆ Void Shard</div>
						<div style={{ fontSize: 11, fontWeight: 500, color: '#aaa' }}>x{materials?.void_shard ?? 0}</div>
						{hoveredResource === 'void_shard' && (
							<div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', maxWidth: '150px', background: '#111', border: '1px solid #666', borderRadius: 6, padding: '12px 16px', fontSize: 11, color: '#ccc', zIndex: 1000, whiteSpace: 'normal', lineHeight: 1.4, minWidth: 160 }}>
								{STAT_TOOLTIPS.void_shard}
							</div>
						)}
					</div>
				</div>
			</div>


		</div>
	);
}
