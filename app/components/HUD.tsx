
type Player = { x: number; y: number; hp: number; maxHp?: number; speed: number };

type Props = { player: Player };

export default function HUD({ player }: Props) {
	return (
		<div className="hud" style={{ position: "fixed", left: 10, top: 10 }}>
			<div>HP: {Math.round(player.hp)}{player.maxHp ? ` / ${Math.round(player.maxHp)}` : ''}</div>
			<div>Pos: {Math.round(player.x)}, {Math.round(player.y)}</div>
			<div>Speed: {player.speed} px/s</div>
		</div>
	);
}
