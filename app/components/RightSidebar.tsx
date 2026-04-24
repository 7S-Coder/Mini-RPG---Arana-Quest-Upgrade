import React from "react";

type Badges = {
  inventory?: number;
  achievements?: number;
  narrations?: number;
  stats?: number;
};

const BadgeDot = ({ count }: { count: number }) => {
  if (!count) return null;
  return (
    <span style={{
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: '#ff8c00',
      color: '#000',
      borderRadius: '50%',
      minWidth: 18,
      height: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 10,
      fontWeight: 800,
      padding: '0 3px',
      pointerEvents: 'none',
      boxShadow: '0 0 6px rgba(255,140,0,0.7)',
      lineHeight: 1,
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default function RightSidebar({ onOpenModal, badges }: { onOpenModal?: (name: string) => void; badges?: Badges }) {
  return (
    <aside>
      <div className="right-buttons">
        <div style={{ position: 'relative' }}>
          <button className="btn" style={{ width: '100%' }} onClick={() => onOpenModal?.("inventory")}>Inventory</button>
          <BadgeDot count={(badges?.inventory ?? 0) + (badges?.stats ?? 0)} />
        </div>
        <button className="btn" onClick={() => onOpenModal?.("store")}>Store</button>
        <button className="btn" onClick={() => onOpenModal?.("catalog")}>Catalog</button>
        <button className="btn" onClick={() => onOpenModal?.("bestiary")}>Bestiary</button>
        <div style={{ position: 'relative' }}>
          <button className="btn" style={{ width: '100%' }} onClick={() => onOpenModal?.("achievements")}>Achievements</button>
          <BadgeDot count={badges?.achievements ?? 0} />
        </div>
        <div style={{ position: 'relative' }}>
          <button className="btn" style={{ width: '100%' }} onClick={() => onOpenModal?.("narrations")}>Narrations</button>
          <BadgeDot count={badges?.narrations ?? 0} />
        </div>
        <button className="btn" onClick={() => onOpenModal?.("maps")}>Maps</button>
      </div>

      <div className="tier-legend" >
        <h4>Enemy tiers</h4>
        <ul>
          <li>
            <span className="dot common"/>
            <div className="tier-text"><div className="tier-name">common</div><div className="tier-range">lvl 1-5</div></div>
          </li>
          <li>
            <span className="dot uncommon"/>
            <div className="tier-text"><div className="tier-name">uncommon</div><div className="tier-range">lvl 6-15</div></div>
          </li>
          <li>
            <span className="dot rare"/>
            <div className="tier-text"><div className="tier-name">rare</div><div className="tier-range">lvl 10-29</div></div>
          </li>
          <li>
            <span className="dot epic"/>
            <div className="tier-text"><div className="tier-name">epic</div><div className="tier-range">lvl 30-59</div></div>
          </li>
          <li>
            <span className="dot legendary"/>
            <div className="tier-text"><div className="tier-name">legendary</div><div className="tier-range">lvl 60-89</div></div>
          </li>
          <li>
            <span className="dot mythic"/>
            <div className="tier-text"><div className="tier-name">mythic</div><div className="tier-range">lvl 90-120</div></div>
          </li>
        </ul>
      </div>
    </aside>
  );
}
