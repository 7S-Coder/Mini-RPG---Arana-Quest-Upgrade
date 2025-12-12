"use client";

import React from "react";
import Modal from "../Modal";

type Props = {
  inventory: any[];
  equipment: Record<string, any>;
  onEquip: (item: any) => void;
  onUnequip: (slot: string) => void;
  onClose: () => void;
};

const RARITY_COLOR: Record<string, string> = {
  common: '#ddd',
  rare: '#6fb3ff',
  epic: '#b47cff',
  legendary: '#ffd16b',
  mythic: '#ff7b7b',
};

const SLOT_POS: Record<string, React.CSSProperties> = {
  chapeau: { position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)' },
  familier: { position: 'absolute', bottom: 12, left: 12 },
  bottes: { position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)' },
  ceinture: { position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)' },
  plastron: { position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)' },
  anneau: { position: 'absolute', top: '45%', right: 12 },
  arme: { position: 'absolute', top: '45%', left: 12 },
};

export default function InventoryModal({ inventory, equipment, onEquip, onUnequip, onClose }: Props) {
  // Inline Tooltip component: shows formatted item details on hover (desktop)
  const Tooltip = ({ item, children }: { item: any; children: React.ReactNode }) => {
    const [visible, setVisible] = React.useState(false);
    // compute a price heuristic
    const priceFor = (it: any) => {
      if (!it) return '';
      const rarityMult: Record<string, number> = { common: 1, rare: 1.6, epic: 2.6, legendary: 5, mythic: 12 };
      const base = 10 + Object.values(it.stats || {}).reduce((s: number, v: any) => s + Number(v || 0), 0) * 5;
      return Math.max(1, Math.round(base * (rarityMult[it.rarity] || 1)));
    };

    return (
      <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
        {children}
        {visible && item ? (
          <div style={{
            position: 'absolute',
            zIndex: 99999,
            left: '100%',
            marginLeft: 12,
            top: 0,
            minWidth: 200,
            background: 'rgba(12,12,12,0.95)',
            color: '#fff',
            padding: 12,
            borderRadius: 8,
            boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.03)'
          }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{item.name}</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {Object.entries(item.stats || {}).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', color: '#ddd' }}>
                  <div style={{ opacity: 0.9, textTransform: 'uppercase', fontSize: 12 }}>{k}</div>
                  <div style={{ fontWeight: 700 }}>{String(v)}</div>
                </div>
              ))}
              <div style={{ height: 6 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#bbb', fontSize: 13 }}>
                <div>Prix</div>
                <div>{priceFor(item)} g</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#bbb', fontSize: 13 }}>
                <div>Rareté</div>
                <div style={{ textTransform: 'capitalize' }}>{item.rarity || ''}</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <Modal title="Inventaire" onClose={onClose}>
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Left: equipment silhouette */}
        <div style={{ width: 360, position: 'relative' }}>
          <h2 style={{ marginTop: 0 }}>Équipement</h2>
          <div style={{ position: 'relative', width: '100%', height: 420, background: 'transparent' }}>
            {Object.keys(equipment).map((slot) => {
              const it = (equipment as any)[slot];
              return (
                <div key={slot} style={{ ...(SLOT_POS as any)[slot], minWidth: 100 }}>
                  <Tooltip item={it}>
                    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.04)', padding: 8, borderRadius: 8, textAlign: 'center', minWidth: 120 }}>
                      <div style={{ fontSize: 12, color: '#bbb' }}>{slot.charAt(0).toUpperCase() + slot.slice(1)}</div>
                      <div style={{ minHeight: 36, color: it ? (RARITY_COLOR[it.rarity] || '#fff') : '#777', fontWeight: it ? 700 : 400, marginTop: 6 }}>{it ? it.name : 'vide'}</div>
                      {it ? <button type="button" style={{ marginTop: 8 }} onClick={(e) => { e.stopPropagation(); try { console.log('InventoryModal unequip click', slot); } catch(e){}; onUnequip(slot); }}>Déséquiper</button> : null}
                    </div>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: inventory list */}
        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0 }}>Inventaire</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {inventory.length === 0 ? (
              <div style={{ padding: 12, background: '#0d0d0d', borderRadius: 8 }}>Aucun objet.</div>
            ) : inventory.map((it) => (
              <Tooltip key={it.id} item={it}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#0d0d0d', borderRadius: 10 }}>
                  <div>
                    <div style={{ color: RARITY_COLOR[it.rarity] || '#fff', fontWeight: 700 }}>{it.name}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{Object.entries(it.stats || {}).map(([k,v]) => `${k}: ${v}`).join(' • ')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); try { console.log('InventoryModal equip click', it && it.id, it && it.slot); } catch(e){}; onEquip(it); }}>Équiper ({it.slot})</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); /* placeholder for sell */ }}>Vendre</button>
                  </div>
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
