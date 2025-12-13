"use client";

import React from "react";
import Modal from "./Modal";

type Props = {
  inventory: any[];
  equipment: Record<string, any>;
  onEquip: (item: any) => void;
  onUnequip: (slot: string) => void;
  onSell: (itemId: string) => void;
  onUse?: (itemId: string) => boolean | Promise<boolean> | void;
  onForge?: (itemId: string) => { ok: boolean; msg: string } | Promise<{ ok: boolean; msg: string }>;
  onClose: () => void;
};

const RARITY_COLOR: Record<string, string> = {
  common: '#ddd',
  rare: '#6fb3ff',
  epic: '#b47cff',
  legendary: '#ffd16b',
  mythic: '#ff7b7b',
};

// Fixed square style for each equipment slot; layout now handled by a 2-column grid
const SLOT_POS: Record<string, React.CSSProperties> = {
  // let the grid control width; tiles should fill available cell
  hat: { width: '100%', height: '100%' },
  boots: { width: '100%', height: '100%' },
  chestplate: { width: '100%', height: '100%' },
  belt: { width: '100%', height: '100%' },
  familiar: { width: '100%', height: '100%' },
  ring: { width: '100%', height: '100%' },
  weapon: { width: '100%', height: '100%' },
};

const SLOT_LABELS: Record<string, string> = {
  hat: 'Hat',
  familiar: 'Familiar',
  boots: 'Boots',
  belt: 'Belt',
  chestplate: 'Chest',
  ring: 'Ring',
  weapon: 'Weapon',
};

// Define explicit visual order for the equipment grid. Put `hat` first (top)
// and boots/familiar last (bottom). This keeps layout deterministic.
const SLOT_ORDER = ['hat', 'chestplate', 'belt', 'weapon', 'ring', 'familiar','boots' ];

export default function InventoryModal({ inventory, equipment, onEquip, onUnequip, onSell, onUse, onForge, onClose }: Props) {
  const [status, setStatus] = React.useState<{ ok: boolean; text: string } | null>(null);
  const [activeTab, setActiveTab] = React.useState<'inventory' | 'equipment' | 'forge'>('inventory');
  // Inline Tooltip component: shows formatted item details on hover (desktop)
  // compute a price heuristic (shared)
  const priceFor = (it: any) => {
    if (!it) return '';
    if (typeof it.cost === 'number') return it.cost;
    const rarityMult: Record<string, number> = { common: 1, rare: 1.6, epic: 2.6, legendary: 5, mythic: 12 };
    const base = 10 + Object.values(it.stats || {}).reduce((s: number, v: any) => s + Number(v || 0), 0) * 5;
    return Math.max(1, Math.round(base * (rarityMult[it.rarity] || 1)));
  };

  const Tooltip = ({ item, children }: { item: any; children: React.ReactNode }) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
        {children}
        {visible && item ? (
          <div style={{
            position: 'absolute',
            zIndex: 50,
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
                <div>Price</div>
                <div>{priceFor(item)} g</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#bbb', fontSize: 13 }}>
                <div>Rarity</div>
                <div style={{ textTransform: 'capitalize' }}>{item.rarity || ''}</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 760, minHeight: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={activeTab === 'inventory' ? 'btn primary' : 'btn'} onClick={() => setActiveTab('inventory')}>Inventory</button>
            <button className={activeTab === 'forge' ? 'btn primary' : 'btn'} onClick={() => setActiveTab('forge')}>Forge</button>
          </div>
          <div>
            {status ? (
              <div style={{ padding: 8, background: status.ok ? '#123b1a' : '#3b1212', color: '#fff', borderRadius: 6 }}>{status.text}</div>
            ) : null}
          </div>
        </div>
        {/* Panels: left and right columns side-by-side using CSS grid so columns match height */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 12, alignItems: 'stretch', minHeight: 320 }}>
          {/* Right column (now left): main content area that used to be on the right */}
          <div style={{ minWidth: 340, height: '100%' }}>
          {activeTab === 'forge' ? (
            <>
              <h2 style={{ marginTop: 0 }}>Forge</h2>
              <div style={{ display: 'grid', gap: 10, maxHeight: 420, overflow: 'auto' }}>
                {(() => {
                  // group identical common items by name+slot
                  const groups: Record<string, { name: string; slot: string; ids: string[]; rarity: string }> = {};
                  for (const it of inventory) {
                    const k = `${it.name}||${it.slot}`;
                    if (!groups[k]) groups[k] = { name: it.name, slot: it.slot, ids: [], rarity: it.rarity };
                    groups[k].ids.push(it.id);
                  }
                  const entries = Object.values(groups);
                  if (entries.length === 0) return <div style={{ padding: 12, background: '#0d0d0d', borderRadius: 8 }}>No items to forge.</div>;
                  return entries.map((g) => (
                    <div key={g.name + '::' + g.slot} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#0d0d0d', borderRadius: 10 }}>
                      <div>
                        <div style={{ color: RARITY_COLOR[g.rarity] || '#fff', fontWeight: 700 }}>{g.name} <small style={{ color: '#999' }}>({g.slot})</small></div>
                        <div style={{ fontSize: 12, color: '#999' }}>{g.ids.length}x</div>
                      </div>
                      <div>
                        {g.rarity === 'common' && g.ids.length >= 3 ? (
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            if (!onForge) { setStatus({ ok: false, text: 'Forge not available.' }); window.setTimeout(() => setStatus(null), 3000); return; }
                            try {
                              const res = await Promise.resolve(onForge(g.ids[0]));
                              setStatus({ ok: res.ok, text: res.msg });
                              window.setTimeout(() => setStatus(null), 4000);
                            } catch (err) { console.error('onForge error', err); setStatus({ ok: false, text: 'Forge failed.' }); window.setTimeout(() => setStatus(null), 3000); }
                          }}>Forge</button>
                        ) : (
                          <button disabled style={{ opacity: 0.5 }}>Need 3 common</button>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </>
          ) : (
            <>
              <h2 style={{ marginTop: 0 }}>Equipment</h2>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, gridAutoRows: '140px', alignItems: 'stretch' }}>
                  {SLOT_ORDER.map((slot) => {
                    const it = (equipment as any)[slot];
                    const extra: React.CSSProperties = slot === 'hat' ? { gridColumn: '1 / -1' } : {};
                    return (
                      <div key={slot} style={{ ...(SLOT_POS as any)[slot], boxSizing: 'border-box', ...extra }}>
                        <Tooltip item={it}>
                          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.04)', padding: 8, borderRadius: 8, textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                            <div style={{ fontSize: 12, color: '#bbb' }}>{SLOT_LABELS[slot] ?? (slot.charAt(0).toUpperCase() + slot.slice(1))}</div>
                            <div style={{ color: it ? (RARITY_COLOR[it.rarity] || '#fff') : '#777', fontWeight: it ? 700 : 400, marginTop: 8, overflowWrap: 'anywhere' }}>{it ? it.name : 'empty'}</div>
                            {it ? <button type="button" style={{ marginTop: 8, alignSelf: 'center' }} onClick={(e) => { e.stopPropagation(); try { console.log('InventoryModal unequip click', slot); } catch(e){}; onUnequip(slot); }}>Unequip</button> : null}
                          </div>
                        </Tooltip>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          </div>

          {/* Left column (now right): equipment silhouette on Inventory tab, inventory list on Forge tab */}
          <div style={{ width: 360, position: 'relative', height: '100%' }}>
          {(activeTab === 'inventory' || activeTab === 'forge') && (
            <>
              <h2 style={{ marginTop: 0 }}>Inventory</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                {inventory.length === 0 ? (
                  <div style={{ padding: 12, background: '#0d0d0d', borderRadius: 8 }}>No items.</div>
                ) : inventory.map((it) => (
                  <Tooltip key={it.id} item={it}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#0d0d0d', borderRadius: 10 }}>
                      <div>
                        <div style={{ color: RARITY_COLOR[it.rarity] || '#fff', fontWeight: 700 }}>{it.name}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>{Object.entries(it.stats || {}).map(([k,v]) => `${k}: ${v}`).join(' • ')}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {it.category === 'consumable' ? (
                          <button type="button" onClick={(e) => {
                              e.stopPropagation();
                              try {
                                if (!onUse) { return; }
                                setTimeout(() => {
                                  try {
                                    const res = onUse(it.id);
                                    Promise.resolve(res).then((ok) => {
                                      if (ok) setStatus({ ok: true, text: 'Potion used. HP restored.' });
                                      else setStatus({ ok: false, text: "Unable to use this item." });
                                      window.setTimeout(() => setStatus(null), 3000);
                                    }).catch((err) => {
                                      console.error('onUse promise error', err);
                                    });
                                  } catch (err) { console.error('onUse error', err); }
                                }, 0);
                              } catch (err) { console.error(err); }
                            }}>Use</button>
                        ) : (
                        <button type="button" onClick={(e) => {
                          e.stopPropagation();
                          try { console.log('InventoryModal equip click', it && it.id, it && it.slot); } catch (e) {}
                          try {
                            if (!onEquip) { console.warn('onEquip not provided'); return; }
                            // dispatch async to avoid any propagation edge-cases
                            setTimeout(() => { try { onEquip(it); } catch (err) { console.error('onEquip error', err); } }, 0);
                          } catch (err) { console.error(err); }
                        }}>Equip ({SLOT_LABELS[it.slot] ?? it.slot})</button>
                        )}
                        <button type="button" onClick={(e) => {
                          e.stopPropagation();
                          try { console.log('InventoryModal sell click', it && it.id); } catch (e) {}
                          try {
                            if (!onSell) { console.warn('onSell not provided'); return; }
                            setTimeout(() => { try { onSell(it.id); } catch (err) { console.error('onSell error', err); } }, 0);
                          } catch (err) { console.error(err); }
                        }}>Sell ({priceFor(it)} g)</button>
                      </div>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </>
          )}

          

          {activeTab === 'equipment' && (
            <>
              <h2 style={{ marginTop: 0 }}>Equipment</h2>
              <div style={{ padding: 12, background: '#0d0d0d', borderRadius: 8 }}>Use the left panel to manage equipment.</div>
            </>
          )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
