import React from "react";

export default function RightSidebar({ onOpenModal }: { onOpenModal?: (name: string) => void }) {
  return (
    <aside>
      <div className="right-buttons">
        <button className="btn">Magasin</button>
        <button className="btn">Catalogue</button>
        <button className="btn">Bestiaire</button>
        <button className="btn">Maps</button>
      </div>

      <div className="tier-legend">
        <h4>Palier ennemis</h4>
        <ul>
          <li><span className="dot common"/> common &nbsp; lvl 1-9</li>
          <li><span className="dot rare"/> rare &nbsp; lvl 10-29</li>
          <li><span className="dot epic"/> epic &nbsp; lvl 30-59</li>
          <li><span className="dot legendary"/> legendary &nbsp; lvl 60-89</li>
          <li><span className="dot mythic"/> mythic &nbsp; lvl 90-120</li>
        </ul>
      </div>
    </aside>
  );
}
