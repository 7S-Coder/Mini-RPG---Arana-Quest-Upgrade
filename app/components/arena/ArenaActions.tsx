import React from "react";

type Props = {
  onAttack?: (type: 'quick' | 'safe' | 'risky') => void;
  onRun?: () => void;
  disableRun?: boolean;
  safeCooldown?: number;
  riskyCooldown?: number;
};

export default function ArenaActions({ onAttack, onRun, disableRun, safeCooldown = 0, riskyCooldown = 0 }: Props) {
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
