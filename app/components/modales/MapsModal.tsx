"use client";

import React from "react";
import Modal from "./Modal";
import { getMaps } from "../../game/maps";

export default function MapsModal({ onClose, onSelect, selectedId }: { onClose: () => void; onSelect: (id?: string | null) => void; selectedId?: string | null }) {
  const maps = getMaps();

  return (
    <Modal title="Choisir une carte" onClose={onClose}>
      <div style={{ display: 'grid', gap: 10, minWidth: 320 }}>
        {maps.map((m) => (
          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 6, background: selectedId === m.id ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
            <div>
              <div style={{ fontWeight: 800 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.theme ?? 'Thème générique'}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: m.logColor ?? '#fff', border: '1px solid rgba(0,0,0,0.2)' }} />
              <button className="btn" onClick={() => { onSelect(m.id); onClose(); }}>{selectedId === m.id ? 'Active' : 'Choisir'}</button>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => { onSelect(null); onClose(); }}>Désactiver la carte</button>
          <button className="btn" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </Modal>
  );
}
