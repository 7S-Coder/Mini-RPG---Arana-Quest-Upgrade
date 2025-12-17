"use client";

import React from "react";
import Modal from "./Modal";
import { getMaps, getRoomsForMap } from "../../game/templates/maps";
import { ENEMY_TEMPLATES } from "../../game/templates/enemies";

export default function MapsModal({ onClose, onSelect, selectedId, dungeonProgress, playerLevel, inventory }: { onClose: () => void; onSelect: (id?: string | null) => void; selectedId?: string | null; dungeonProgress?: { activeMapId?: string | null; activeDungeonIndex?: number | null; activeDungeonId?: string | null; remaining?: number; fightsRemainingBeforeDungeon?: number }; playerLevel?: number, inventory?: any[] }) {
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
                  {m.minLevel ? (
                    <div style={{ fontSize: 12, color: accent, marginTop: 6 }}>Levels: {m.minLevel}+</div>
                  ) : null}
                        {Array.isArray(m.requiredKeyFragments) && m.requiredKeyFragments.length > 0 ? (
                          <div style={{ fontSize: 12, color: accent, marginTop: 6 }}>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>Fragments</div>
                            <ul style={{ margin: 0, paddingLeft: 14 }}>
                              {m.requiredKeyFragments.map((f) => {
                                const owned = Array.isArray(inventory) && inventory.some((it: any) => it && it.name === f);
                                return (
                                  <li key={f} style={{ listStyle: 'none', marginBottom: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <div style={{ width: 12, textAlign: 'center', color: owned ? '#2ecc71' : '#888' }}>{owned ? '✓' : '○'}</div>
                                    <div style={{ color: owned ? '#e6ffe6' : accent, fontSize: 12 }}>{f}</div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ) : null}
                  {(() => {
                    if (m.loot && m.loot.length > 0) return <div style={{ fontSize: 12, color: accent, marginTop: 6 }}>{m.loot}</div>;
                    if (m.allowedTiers && m.allowedTiers.length > 0) return <div style={{ fontSize: 12, color: accent, marginTop: 6 }}>{`loot: ${m.allowedTiers.join(' - ')}`}</div>;
                    return null;
                  })()}
                </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: accent, border: '1px solid rgba(0,0,0,0.2)' }} />
                  {(() => {
                    const levelLocked = (typeof m.minLevel === 'number' && typeof playerLevel === 'number' && playerLevel < m.minLevel);
                    const missingFragments = (Array.isArray(m.requiredKeyFragments) ? m.requiredKeyFragments.filter(f => !(Array.isArray(inventory) && inventory.some((it: any) => it && it.name === f))) : []);
                    const keyLocked = (missingFragments.length > 0);
                    const locked = levelLocked || keyLocked;
                    const label = locked ? (levelLocked ? `Locked (lvl ${m.minLevel}+)` : (keyLocked ? `Locked (missing key fragments)` : 'Locked')) : (selected ? 'Active' : 'Choose');
                    return (
                      <button
                        className="btn"
                        style={{ ...btnStyle, opacity: locked ? 0.6 : 1 }}
                        onClick={() => { if (!locked) { onSelect(m.id); onClose(); } }}
                        disabled={locked}
                        title={keyLocked ? `Missing fragments: ${missingFragments.join(', ')}` : undefined}
                      >
                        {label}
                      </button>
                    );
                  })()}
                </div>
              </div>

              {m.dungeons && m.dungeons.length > 0 && (
                <div style={{ marginTop: 8, paddingLeft: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: accent }}>Dungeons</div>
                  {/* dungeon farm countdown removed from modal */}
                  <ul style={{ paddingLeft: 0, margin: 0 }}>
                    {m.dungeons.map((d, idx) => {
                      const isActive = dungeonProgress?.activeMapId === m.id && dungeonProgress?.activeDungeonIndex === idx;
                      return (
                        <li key={d.id} style={{ marginBottom: 6, listStyle: 'none', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{ width: 10, height: 10, borderRadius: 10, background: accent, marginTop: 6, border: '1px solid rgba(0,0,0,0.2)' }} />
                          <div>
                            <div style={{ fontWeight: 600, color: accent }}>{d.name ?? d.id} {isActive ? '(Active)' : ''}</div>
                            <div style={{ fontSize: 12, color: accent }}>
                              Floors: {d.floors} — Boss: {(() => {
                                let bossId: string | undefined = undefined;
                                try {
                                  if (Array.isArray(m.rooms)) {
                                    // find a boss room for this dungeon by id match or inclusion
                                    const room = getRoomsForMap(m.id).find(r => r.isBossRoom && r.id && (r.id.startsWith((d.id ?? '') + '_floor_') || r.id.includes(d.id ?? '')));
                                    if (room && Array.isArray(room.enemyPool) && room.enemyPool.length > 0) {
                                      // prefer an enemyPool entry that exists in ENEMY_TEMPLATES
                                      const candidate = room.enemyPool.find(ep => ENEMY_TEMPLATES.some(t => t.templateId === ep)) || room.enemyPool[0];
                                      bossId = candidate;
                                    }
                                  }
                                } catch (e) {}
                                if (!bossId && d.bossTemplateId) bossId = d.bossTemplateId;
                                if (!bossId) return '—';
                                const tpl = ENEMY_TEMPLATES.find(t => t.templateId === bossId);
                                return tpl ? tpl.name : bossId;
                              })()}</div>
                            {isActive && (
                              <div style={{ fontSize: 12, marginTop: 4, color: accent }}>Floors remaining: {dungeonProgress?.remaining ?? 0}</div>
                            )}
                          </div>
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
          {(() => {
            const label = selectedId ? 'Back to Spawn' : 'Spawn';
            return <button className="btn" onClick={() => { onSelect(null); onClose(); }}>{label}</button>;
          })()}
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </Modal>
  );
}
