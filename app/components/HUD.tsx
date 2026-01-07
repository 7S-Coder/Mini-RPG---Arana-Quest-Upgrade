
type Player = { x: number; y: number; hp: number; maxHp?: number; speed: number };

type Props = { player: Player };

export default function HUD({ player }: Props) {
	// Tooltip helper for Speed stat
	const getSpeedTooltip = () => {
		const bonusHitsChance = Math.min(50, Math.max(0, (player.speed / 200) * 100)).toFixed(1);
		const rageReduction = Math.min(50, Math.max(0, (player.speed / 500) * 100)).toFixed(1);
		return `Governs turn order (act first), bonus hits (${bonusHitsChance}%), and enemy rage reduction (${rageReduction}%)`;
	};

	return (
		<div className="hud" style={{ position: "fixed", left: 10, top: 10 }}>
			<div>HP: {Math.round(player.hp)}{player.maxHp ? ` / ${Math.round(player.maxHp)}` : ''}</div>
			<div>Pos: {Math.round(player.x)}, {Math.round(player.y)}</div>
			<div title={getSpeedTooltip()} style={{ cursor: 'help' }}>Speed: {player.speed} px/s</div>
		</div>
	);
}
