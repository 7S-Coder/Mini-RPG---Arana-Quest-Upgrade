import Enemy from "./Enemy";

type Props = {
  enemies: any[];
};

export default function EnemiesRow({ enemies }: Props) {
  return (
    <div className="enemies-row">
      {enemies.map((e) => (
        <div key={e.id} style={{ display: "inline-block", marginRight: 12, verticalAlign: 'top' }}>
          <Enemy {...e} />
          <div style={{ color: "#ccc", fontSize: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span className={`enemy-name ${e.rarity ?? 'common'}`}>{e.name} - {e.level ?? 1}</span>
              {e.isBoss ? (
                <span style={{ background: '#e74c3c', color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>BOSS</span>
              ) : null}
            </span>
            <div>HP: {e.hp}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
