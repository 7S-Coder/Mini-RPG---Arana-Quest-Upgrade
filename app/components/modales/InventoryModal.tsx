"use client";

import React from "react";
import Modal from "./Modal";

type Props = {
  inventory: any[];
  equipment: Record<string, any>;
  player?: any;
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

const SLOT_LABELS: Record<string, string> = {
  hat: 'Hat',
  familiar: 'Familiar',
  boots: 'Boots',
  belt: 'Belt',
  chestplate: 'Chest',
  ring: 'Ring',
  weapon: 'Weapon',
};

const SLOT_ORDER = ['hat', 'chestplate', 'belt', 'weapon', 'ring', 'familiar','boots' ];

export default function InventoryModal({ inventory, equipment, player, onEquip, onUnequip, onSell, onUse, onForge, onClose }: Props) {
  const [status, setStatus] = React.useState<{ ok: boolean; text: string } | null>(null);
  const [activeTab, setActiveTab] = React.useState<'inventory' | 'equipment' | 'forge'>('inventory');
  const [filterSlot, setFilterSlot] = React.useState<string>('all');

  const MAX_CARRY_WEIGHT = 100;
  const currentWeight = React.useMemo(() => {
    let w = 0;
    for (const it of inventory) w += Number((it && (it.weight ?? 1)) || 1);
    for (const k of Object.keys(equipment || {})) {
      const it = (equipment as any)[k];
      if (it) w += Number((it && (it.weight ?? 1)) || 1);
    }
    return w;
  }, [inventory, equipment]);

  const priceFor = (it: any) => {
    if (!it) return '';
    if (typeof it.cost === 'number') return it.cost;
    const rarityMult: Record<string, number> = { common: 1, rare: 1.6, epic: 2.6, legendary: 5, mythic: 12 };
    const base = 10 + Object.values(it.stats || {}).reduce((s: number, v: any) => s + Number(v || 0), 0) * 5;
    return Math.max(1, Math.round(base * (rarityMult[it.rarity] || 1)));
  };

  function handleForge(ids: string[]) {
    if (!onForge) { setStatus({ ok: false, text: 'Forge not available.' }); setTimeout(() => setStatus(null), 3000); return; }
    Promise.resolve(onForge(ids[0])).then((res: any) => { setStatus({ ok: res.ok, text: res.msg }); setTimeout(() => setStatus(null), 4000); }).catch(() => { setStatus({ ok: false, text: 'Forge failed.' }); setTimeout(() => setStatus(null), 3000); });
  }

  return (
    <Modal title="Inventory" onClose={onClose}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 12, alignItems: 'stretch', minHeight: 320 }}>

          {/* Left: Equipment grid */}
          <div style={{ minWidth: 340, minHeight: 320, position: 'relative' }}>
            {activeTab === 'forge' ? (
              <>
                <h2 style={{ marginTop: 0 }}>Forge</h2>
                <div style={{ display: 'grid', gap: 10, maxHeight: 420, overflow: 'auto' }}>
                  {(() => {
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
                          {
                            (() => {
                              const RARITY_ORDER = ['common','rare','epic','legendary','mythic'];
                              const idx = RARITY_ORDER.indexOf(g.rarity);
                              if (idx === -1) return <button disabled style={{ opacity: 0.5 }}>Not forgeable</button>;
                              if (idx >= RARITY_ORDER.length - 1) return <button disabled style={{ opacity: 0.5 }}>Max rarity</button>;
                              const target = RARITY_ORDER[idx + 1];
                              const unlocked = player && Array.isArray(player.unlockedTiers) && player.unlockedTiers.includes(target);
                              if (g.ids.length < 3) return <button disabled style={{ opacity: 0.5 }}>{`Need ${3 - g.ids.length} more`}</button>;
                              // have 3 or more
                              if (!unlocked) return <button disabled style={{ opacity: 0.5 }}>{`Locked (unlock ${target})`}</button>;
                              return <button onClick={(e) => { e.stopPropagation(); handleForge(g.ids); }}>Forge → {target}</button>;
                            })()
                          }
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, gridAutoRows: '140px', alignItems: 'stretch', position: 'relative' }}>
                    {SLOT_ORDER.map((slot) => {
                      const it = (equipment as any)[slot];
                      const spanStyle: React.CSSProperties = slot === 'hat' ? { gridColumn: '1 / -1' } : {};
                      return (
                        <div key={slot} style={{ boxSizing: 'border-box', ...spanStyle }}>
                          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.04)', padding: 12, borderRadius: 8, textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                            <div style={{ fontSize: 12, color: '#bbb' }}>{SLOT_LABELS[slot] ?? (slot.charAt(0).toUpperCase() + slot.slice(1))}</div>
                            <div style={{ color: it ? (RARITY_COLOR[it.rarity] || '#fff') : '#777', fontWeight: it ? 700 : 400, marginTop: 8, overflowWrap: 'anywhere' }}>{it ? it.name : 'empty'}</div>
                            {it ? (
                              <>
                                <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>{Object.entries(it.stats || {}).map(([k, v]) => `${k}: ${v}`).join(' • ')}</div>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                  <button type="button" style={{ marginTop: 8 }} onClick={(e) => { e.stopPropagation(); onUnequip(slot); }}>Unequip</button>
                                </div>
                              </>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Inventory / list */}
          <div style={{ width: 360, position: 'relative', minHeight: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ color: '#bbb', fontSize: 12 }}>Filter:</label>
                <select value={filterSlot} onChange={(e) => setFilterSlot(e.target.value)}>
                  <option value="all">All</option>
                  <option value="consumable">Consumables</option>
                  {SLOT_ORDER.map((s) => <option key={s} value={s}>{SLOT_LABELS[s] ?? s}</option>)}
                </select>
              </div>
              <div style={{ color: '#ccc', fontSize: 12 }}>Weight: {currentWeight}/{MAX_CARRY_WEIGHT}</div>
            </div>
            {(activeTab === 'inventory' || activeTab === 'forge') && (
              <>
                <h2 style={{ marginTop: 0 }}>Inventory</h2>
                <div style={{ display: 'grid', gap: 10 }}>
                  {inventory.length === 0 ? (
                    <div style={{ padding: 12, background: '#0d0d0d', borderRadius: 8 }}>No items.</div>
                  ) : (
                    <div style={{ maxHeight: 380, overflow: 'auto', display: 'grid', gap: 10 }}>
                      {inventory
                        .filter((it) => (filterSlot === 'all' ? true : (filterSlot === 'consumable' ? (it.category === 'consumable') : it.slot === filterSlot)))
                        .map((it) => (
                          <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#0d0d0d', borderRadius: 10 }}>
                            <div>
                              <div style={{ color: RARITY_COLOR[it.rarity] || '#fff', fontWeight: 700 }}>{it.name}</div>
                                <div style={{ fontSize: 10, color: '#bbb', marginTop: 4 }}>W:{it.weight ?? 1}</div>
                                <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
                                {(() => {
                                  const entries = Object.entries(it.stats || {});
                                  const equipped: any = (equipment as any)[it.slot];
                                  return entries.map(([k, v], idx) => {
                                    const ev = equipped && equipped.stats ? Number((equipped.stats || {})[k] || 0) : 0;
                                    const nv = Number(v || 0);
                                    const color = nv > ev ? '#66ff66' : (nv < ev ? '#ff6666' : '#999');
                                    return (
                                      <span key={k} style={{ color, fontWeight: nv === ev ? 400 : 700, textShadow: '0 1px 0 rgba(0,0,0,0.6)' }}>
                                        {`${k}: ${v}`}{idx < entries.length - 1 ? ' • ' : ''}
                                      </span>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              {it.category === 'consumable' ? (
                                <button type="button" onClick={(e) => { e.stopPropagation(); if (!onUse) return; setTimeout(() => { try { const res = onUse(it.id); Promise.resolve(res).then(() => {}); } catch {} }, 0); }}>Use</button>
                              ) : (
                                <button type="button" onClick={(e) => { e.stopPropagation(); if (!onEquip) return; setTimeout(() => { try { onEquip(it); } catch {} }, 0); }}>Equip ({SLOT_LABELS[it.slot] ?? it.slot})</button>
                              )}
                              <button type="button" onClick={(e) => { e.stopPropagation(); if (!onSell) return; setTimeout(() => { try { onSell(it.id); } catch {} }, 0); }}>Sell ({priceFor(it)} g)</button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
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
