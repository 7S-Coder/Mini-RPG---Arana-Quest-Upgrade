import React from "react";

export default function RightSidebar({ onOpenModal }: { onOpenModal?: (name: string) => void }) {
  return (
    <aside>
      <div className="right-buttons">
        <button className="btn" onClick={() => onOpenModal?.("store")}>Store</button>
        <button className="btn" onClick={() => onOpenModal?.("catalogue")}>Catalog</button>
        <button className="btn" onClick={() => onOpenModal?.("bestiary")}>Bestiary</button>
        <button className="btn" onClick={() => onOpenModal?.("maps")}>Maps</button>
      </div>

      <div className="tier-legend" >
        <h4>Enemy tiers</h4>
        <ul>
          <li>
            <span className="dot common"/>
            <div className="tier-text"><div className="tier-name">common</div><div className="tier-range">lvl 1-9</div></div>
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
