"use client";

import React from "react";
import Modal from "./Modal";
import { getMaps } from "../../game/maps";

export default function MapsModal({ onClose, onSelect, selectedId, dungeonProgress }: { onClose: () => void; onSelect: (id?: string | null) => void; selectedId?: string | null; dungeonProgress?: { activeMapId?: string | null; activeDungeonIndex?: number | null; activeDungeonId?: string | null; remaining?: number; fightsRemainingBeforeDungeon?: number } }) {
  const maps = getMaps();

  const hexToRgba = (hex?: string, alpha = 1) => {
    if (!hex) return undefined;
    try {
      const h = hex.replace('#', '');
      const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
      const bigint = parseInt(full, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
      return hex;
    }
  };

  const contrastColor = (hex?: string) => {
    if (!hex) return '#fff';
    try {
      const h = hex.replace('#', '');
      const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
      const bigint = parseInt(full, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      // relative luminance
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      return lum > 0.6 ? '#111' : '#fff';
    } catch (e) { return '#fff'; }
  };

  return (
    <Modal title="Choose a map" onClose={onClose}>
      <div style={{ display: 'grid', gap: 10, minWidth: 320 }}>
        {maps.map((m) => {
          const accent = m.logColor ?? '#9aa0a6';
          const selected = selectedId === m.id;
          const cardStyle: React.CSSProperties = {
            padding: 8,
            borderRadius: 6,
            background: selected ? hexToRgba(accent, 0.06) : 'transparent',
            border: selected ? `1px solid ${hexToRgba(accent, 0.18)}` : '1px solid transparent'
          };
          const titleStyle: React.CSSProperties = { fontWeight: 800, color: accent };
          const btnStyle: React.CSSProperties = { background: accent, color: contrastColor(accent), border: 'none', boxShadow: selected ? `0 6px 18px ${hexToRgba(accent, 0.16)}` : undefined };

          return (
            <div key={m.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={titleStyle}>{m.name}</div>
                  <div style={{ fontSize: 12, color: accent }}>{m.theme ?? 'Generic theme'}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: accent, border: '1px solid rgba(0,0,0,0.2)' }} />
                  <button className="btn" style={btnStyle} onClick={() => { onSelect(m.id); onClose(); }}>{selected ? 'Active' : 'Choose'}</button>
                </div>
              </div>

              {m.dungeons && m.dungeons.length > 0 && (
                <div style={{ marginTop: 8, paddingLeft: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: accent }}>Dungeons</div>
                  {/* dungeon farm countdown removed from modal */}
                  <ul style={{ paddingLeft: 14 }}>
                    {m.dungeons.map((d, idx) => {
                      const isActive = dungeonProgress?.activeMapId === m.id && dungeonProgress?.activeDungeonIndex === idx;
                      return (
                        <li key={d.id} style={{ marginBottom: 6 }}>
                          <div style={{ fontWeight: 600, color: accent }}>{d.name ?? d.id} {isActive ? '(Active)' : ''}</div>
                          <div style={{ fontSize: 12, color: accent }}>Floors: {d.floors} — Boss: {d.bossTemplateId ?? '—'}</div>
                          {isActive && (
                            <div style={{ fontSize: 12, marginTop: 4, color: accent }}>Floors remaining: {dungeonProgress?.remaining ?? 0}</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          );
        })}

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => { onSelect(null); onClose(); }}>Disable map</button>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </Modal>
  );
}
