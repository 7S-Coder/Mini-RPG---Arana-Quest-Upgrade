"use client";

import React from "react";
import Modal from "./Modal";
import { ENEMY_TEMPLATES } from "../../game/enemies";
import { getMapById } from "../../game/maps";
import type { Enemy } from "../../game/types";

export default function BestiaryModal({ onClose, enemies = [], selectedMapId }: { onClose: () => void; enemies?: Enemy[]; selectedMapId?: string | null }) {
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
              {enemies.filter((a) => {
                // if a map is selected, only show active enemies whose template is in the map's enemyPool
                if (!selectedMapId) return true;
                if (!a.templateId) return false;
                const map = getMapById(selectedMapId);
                const pool = map?.enemyPool ?? [];
                return pool.includes(a.templateId);
              }).map((a) => (
                <div key={a.id} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.015)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{a.name} <span style={{ color: 'var(--muted)', fontSize: 12 }}>({a.id})</span></div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>HP {a.hp} • DMG {a.dmg} • DEF {a.def}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, textTransform: 'capitalize' }} className={a.rarity ? `enemy-name ${a.rarity}` : ''}>{a.rarity ?? '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>lvl {a.level ?? '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates from the map's enemyPool only (strict) */}
        {(() => {
          if (!selectedMapId) return null;
          const map = getMapById(selectedMapId);
          const pool = map?.enemyPool ?? [];
          const templates = pool.map((id) => ENEMY_TEMPLATES.find((t) => t.templateId === id)).filter(Boolean) as typeof ENEMY_TEMPLATES;
          if (templates.length === 0) return (
            <div style={{ color: 'var(--muted)' }}>Aucun ennemi défini pour cette carte.</div>
          );
          return templates.map((e) => (
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
          ));
        })()}
      </div>
    </Modal>
  );
}


