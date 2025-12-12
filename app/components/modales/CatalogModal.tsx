"use client";

import React from "react";
import Modal from "./Modal";
import { ITEM_POOL, computeItemCost } from "../../game/items";

const RARITY_COLOR: Record<string, string> = {
  common: '#ddd',
  rare: '#6fb3ff',
  epic: '#b47cff',
  legendary: '#ffd16b',
  mythic: '#ff7b7b',
};

const RARITY_ORDER: Record<string, number> = {
  mythic: 0,
  legendary: 1,
  epic: 2,
  rare: 3,
  common: 4,
};

export default function CatalogModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Catalogue des objets" onClose={onClose}>
      <div style={{ minWidth: 720, minHeight: 360, maxHeight: '70vh', overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {[...ITEM_POOL].sort((a, b) => (RARITY_ORDER[b.rarity as string] ?? 99) - (RARITY_ORDER[a.rarity as string] ?? 99)).map((it, idx) => {
            const statsEntries = it.stats && typeof it.stats === 'object' ? Object.entries(it.stats) : [];
            return (
            <div key={`${it.name}_${idx}`} style={{ padding: 12, background: '#0d0d0d', borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, color: RARITY_COLOR[it.rarity as string] || '#fff' }}>{it.name}</div>
                <div style={{ color: '#ffd96b', fontWeight: 800 }}>{computeItemCost(it.stats, it.rarity ?? 'common')} g</div>
              </div>
              <div style={{ fontSize: 12, color: '#bbb', marginTop: 6 }}>{it.slot} • {it.category ?? ''} • <span style={{ textTransform: 'capitalize', color: RARITY_COLOR[it.rarity as string] || '#fff', fontWeight: 800 }}>{it.rarity}</span></div>
              <div style={{ marginTop: 8, fontSize: 13 }}>
                {statsEntries.map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', color: '#ddd' }}>
                    <div style={{ textTransform: 'uppercase', opacity: 0.9 }}>{k}</div>
                    <div style={{ fontWeight: 700 }}>{String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
