"use client";

import React from "react";
import Modal from "./Modal";
import { ENEMY_TEMPLATES } from "../../game/enemies";
import type { Enemy } from "../../game/types";

export default function BestiaryModal({ onClose, enemies = [] }: { onClose: () => void; enemies?: Enemy[] }) {
  const rarityToRange: Record<string, string> = {
    common: 'lvl 1-9',
    rare: 'lvl 10-29',
    epic: 'lvl 30-59',
    legendary: 'lvl 60-89',
    mythic: 'lvl 90-120',
  };

  return (
    <Modal title="Bestiaire" onClose={onClose}>
      <div style={{ display: 'grid', gap: 12, maxHeight: '60vh', overflowY: 'auto', minWidth: 480 }}>

        {/* Active enemies (show real levels if present) */}
        {enemies && enemies.length > 0 && (
          <div>
            <h4 style={{ margin: '6px 0' }}>Ennemis actifs</h4>
            <div style={{ display: 'grid', gap: 8 }}>
              {enemies.map((a) => (
                <div key={a.id} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.015)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{a.name} <span style={{ color: 'var(--muted)', fontSize: 12 }}>({a.id})</span></div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>HP {a.hp} • DMG {a.dmg} • DEF {a.def}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700 }}>{a.level ?? '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.rarity ? rarityToRange[a.rarity] ?? '—' : '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All templates */}
        {ENEMY_TEMPLATES.map((e) => (
          <div key={e.templateId} style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>
                <span className={`enemy-name ${e.rarity ?? ''}`}>{e.name}</span>
                <span style={{ fontWeight: 600, color: 'var(--muted)', fontSize: 12, marginLeft: 8 }}>({e.templateId})</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                HP {e.hp} • DMG {e.dmg} • DEF {e.def} • ESQ {e.dodge} • CRIT {e.crit} • SPD {e.speed}
              </div>
            </div>
            <div style={{ textAlign: 'right', color: 'var(--muted)', fontSize: 13 }}>
              <div style={{ textTransform: 'capitalize', fontWeight: 700 }} className={e.rarity ? `enemy-name ${e.rarity}` : ''}>{e.rarity ?? '—'}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{e.rarity ? rarityToRange[e.rarity] : '—'}</div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}


