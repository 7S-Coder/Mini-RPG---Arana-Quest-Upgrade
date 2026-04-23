import React from "react";

type Props = {
  onAttack?: (type: 'quick' | 'safe' | 'risky') => void;
  onRun?: () => void;
  onSpecial?: () => void;
  disableRun?: boolean;
  safeCooldown?: number;
  riskyCooldown?: number;
  specialCooldown?: number;
  weaponType?: string;
};

const SPECIAL_META: Record<string, { label: string; color: string; border: string; glow: string; tooltip: string }> = {
  axe:    { label: 'Vortex',        color: 'linear-gradient(135deg, #ffb347 0%, #e07800 100%)', border: '#ffa500', glow: 'rgba(255,165,0,0.45)',    tooltip: 'Vortex — 3 AoE hits on all enemies at 65% dmg each. Cooldown: 4 turns.' },
  sword:  { label: 'Blade Dance',   color: 'linear-gradient(135deg, #7fffff 0%, #00b3b3 100%)', border: '#4ecdc4', glow: 'rgba(78,205,196,0.45)',  tooltip: 'Blade Dance — 3 swift cuts at 85% dmg. Overflows to next enemy on kill. Cooldown: 3 turns.' },
  spear:  { label: 'Hammer Throw',  color: 'linear-gradient(135deg, #adf7c0 0%, #30a855 100%)', border: '#95e1d3', glow: 'rgba(149,225,211,0.45)', tooltip: 'Hammer Throw — 1 devastating hit on all enemies at 150% dmg. Cooldown: 3 turns.' },
  dagger: { label: 'Clear Tear',    color: 'linear-gradient(135deg, #ff9999 0%, #cc2222 100%)', border: '#ff6b6b', glow: 'rgba(255,107,107,0.45)', tooltip: 'Clear Tear — 3–5 rapid hits at 75% dmg with +20% crit. Chains on kill. Cooldown: 3 turns.' },
};

export default function ArenaActions({ onAttack, onRun, onSpecial, disableRun, safeCooldown = 0, riskyCooldown = 0, specialCooldown = 0, weaponType = 'barehand' }: Props) {
  const special = weaponType && weaponType !== 'barehand' ? SPECIAL_META[weaponType] : null;
  return (
    <div className="arena-actions">
      <div className="tooltip-wrapper">
        <button 
          className="btn combat-btn quick-btn" 
          style={{ 
            background: 'linear-gradient(135deg, #ff9966 0%, #ff7733 100%)',
            border: '2px solid #ff5500',
            boxShadow: '0 4px 12px rgba(255, 119, 51, 0.4), inset 0 -2px 4px rgba(0,0,0,0.3)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 14,
            letterSpacing: 0.5
          }} 
          onClick={() => onAttack && onAttack('quick')}
        >
          Quick
        </button>
        <div className="tooltip">Always available. Fast and reliable attack with balanced damage.</div>
      </div>
      
      <div className="tooltip-wrapper">
        <button 
          className="btn combat-btn safe-btn" 
          style={{ 
            background: 'linear-gradient(135deg, #66b2ff 0%, #3385ff 100%)',
            border: '2px solid #0066ff',
            boxShadow: '0 4px 12px rgba(51, 133, 255, 0.4), inset 0 -2px 4px rgba(0,0,0,0.3)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 14,
            letterSpacing: 0.5,
            opacity: safeCooldown > 0 ? 0.5 : 1,
            cursor: safeCooldown > 0 ? 'not-allowed' : 'pointer'
          }} 
          onClick={() => safeCooldown === 0 && onAttack && onAttack('safe')} 
          disabled={safeCooldown > 0}
        >
          Safe{safeCooldown > 0 && ` (${safeCooldown})`}
        </button>
        <div className="tooltip">Reduce incoming damage by 50% this turn. 2-turn cooldown.</div>
      </div>
      
      <div className="tooltip-wrapper">
        <button 
          className="btn combat-btn risky-btn" 
          style={{ 
            background: 'linear-gradient(135deg, #ff66b2 0%, #dd2266 100%)',
            border: '2px solid #dd0055',
            boxShadow: '0 4px 12px rgba(221, 34, 102, 0.4), inset 0 -2px 4px rgba(0,0,0,0.3)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 14,
            letterSpacing: 0.5,
            opacity: riskyCooldown > 0 ? 0.5 : 1,
            cursor: riskyCooldown > 0 ? 'not-allowed' : 'pointer'
          }} 
          onClick={() => riskyCooldown === 0 && onAttack && onAttack('risky')} 
          disabled={riskyCooldown > 0}
        >
          Risky{riskyCooldown > 0 && ` (${riskyCooldown})`}
        </button>
        <div className="tooltip">Deal 80% more damage but skip next turn. 2-turn cooldown.</div>
      </div>
      
      {special && (
        <div className="tooltip-wrapper">
          <button
            className="btn combat-btn special-btn"
            style={{
              background: specialCooldown > 0 ? 'linear-gradient(135deg, #333 0%, #1a1a1a 100%)' : special.color,
              border: `2px solid ${specialCooldown > 0 ? '#555' : special.border}`,
              boxShadow: specialCooldown > 0 ? 'none' : `0 4px 12px ${special.glow}, inset 0 -2px 4px rgba(0,0,0,0.3)`,
              color: specialCooldown > 0 ? '#666' : '#fff',
              fontWeight: 'bold',
              fontSize: 13,
              letterSpacing: 0.5,
              opacity: specialCooldown > 0 ? 0.5 : 1,
              cursor: specialCooldown > 0 ? 'not-allowed' : 'pointer',
              gridColumn: '1 / -1',
              marginTop: 2,
            }}
            onClick={() => specialCooldown === 0 && onSpecial && onSpecial()}
            disabled={specialCooldown > 0}
          >
            ✦ {special.label}{specialCooldown > 0 && ` (${specialCooldown})`}
          </button>
          <div className="tooltip">{special.tooltip}</div>
        </div>
      )}

      <div className="tooltip-wrapper">
        <button 
          className={`btn flee-btn ${disableRun ? 'disabled' : ''}`} 
          style={{
            background: 'linear-gradient(135deg, #444 0%, #222 100%)',
            border: '2px solid #666',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 -2px 4px rgba(255,255,255,0.1)',
            color: '#ccc',
            fontWeight: 'bold',
            fontSize: 14,
            letterSpacing: 0.5,
            opacity: disableRun ? 0.5 : 1,
            cursor: disableRun ? 'not-allowed' : 'pointer'
          }} 
          onClick={() => onRun && onRun()} 
          disabled={!!disableRun}
        >
          Flee
        </button>
        <div className="tooltip">Attempt to escape the encounter. Success rate: 60%.</div>
      </div>
    </div>
  );
}
