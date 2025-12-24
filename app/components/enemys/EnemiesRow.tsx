import Enemy from "./Enemy";

type Props = {
  enemies: any[];
};

export default function EnemiesRow({ enemies }: Props) {
  return (
    <div className="enemies-row">
      {enemies.map((e) => {
        const maxHp = e.hp + (e.maxHp ?? 0) - (e.hp ?? 0); // fallback if no maxHp
        // Estimate maxHp from initial spawn (rough estimate if not tracked)
        const estimatedMaxHp = e.maxHp || e.hp || 100;
        const hpPercent = Math.max(0, Math.min(100, (e.hp / estimatedMaxHp) * 100));
        const ragePercent = Math.max(0, Math.min(100, (e.rage ?? 0)));
        
        return (
          <div key={e.id} className={`enemy-card ${e.rarity ?? 'common'}`} style={{ flex: '0 0 auto', minWidth: 140 }}>
            <Enemy {...e} />
            <div style={{ color: "#ccc", fontSize: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className={`enemy-name ${e.rarity ?? 'common'}`}>{e.name} - {e.level ?? 1}</span>
                {e.isBoss ? (
                  <span style={{ background: '#e74c3c', color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>BOSS</span>
                ) : null}
              </span>
              
              {/* HP Bar */}
              <div style={{ marginTop: 6, marginBottom: 4 }}>
                <div style={{ fontSize: 11, color: '#bbb', marginBottom: 2 }}>HP: {e.hp}</div>
                <div style={{ width: '100%', height: 8, background: '#222', borderRadius: 4, overflow: 'hidden', border: '1px solid #444' }}>
                  <div style={{ 
                    width: `${hpPercent}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)',
                    transition: 'width 0.2s'
                  }} />
                </div>
              </div>
              
              {/* Rage Bar */}
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 11, color: '#bbb', marginBottom: 2 }}>Rage: {Math.round(ragePercent)}%</div>
                <div style={{ width: '100%', height: 6, background: '#222', borderRadius: 4, overflow: 'hidden', border: '1px solid #444' }}>
                  <div style={{ 
                    width: `${ragePercent}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #ff9500 0%, #ff6b00 100%)',
                    transition: 'width 0.2s',
                    boxShadow: ragePercent >= 100 ? '0 0 12px rgba(255, 107, 0, 0.8)' : 'none'
                  }} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
