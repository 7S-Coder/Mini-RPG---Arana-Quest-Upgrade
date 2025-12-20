"use client";

import React from "react";
import Modal from "./Modal";

type AllocationStat = 'hp' | 'dmg' | 'def' | 'crit' | 'dodge';

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
  progression?: any;
  allocate?: (stat: AllocationStat) => void;
  deallocate?: (stat: AllocationStat) => void;
};

const RARITY_COLOR: Record<string, string> = {
  common: '#ddd',
  uncommon: '#2ecc71',
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

export default function InventoryModal({ inventory, equipment, player, onEquip, onUnequip, onSell, onUse, onForge, onClose, progression, allocate, deallocate }: Props) {
  React.useEffect(() => { try { console.log('[InventoryModal] progression changed ->', progression); } catch (e) {} }, [progression]);
  const [status, setStatus] = React.useState<{ ok: boolean; text: string } | null>(null);
  const [activeTab, setActiveTab] = React.useState<'inventory' | 'equipment' | 'forge' | 'statistics'>('inventory');
  const [filterSlot, setFilterSlot] = React.useState<string>('all');

  const MAX_CARRY_WEIGHT = 200;
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

  const forgeGroups = React.useMemo(() => {
    const groups: Record<string, { name: string; slot: string; ids: string[]; rarity: string }> = {};
    for (const it of inventory) {
      const k = `${it.name}||${it.slot}`;
      if (!groups[k]) groups[k] = { name: it.name, slot: it.slot, ids: [], rarity: it.rarity };
      groups[k].ids.push(it.id);
    }
    return Object.values(groups);
  }, [inventory]);

  const filteredInventory = React.useMemo(() => inventory.filter((it) => (filterSlot === 'all' ? true : (filterSlot === 'consumable' ? (it.category === 'consumable') : it.slot === filterSlot))), [inventory, filterSlot]);

  function handleForge(ids: string[]) {
    if (!onForge) { setStatus({ ok: false, text: 'Forge not available.' }); setTimeout(() => setStatus(null), 3000); return; }
    Promise.resolve(onForge(ids[0])).then((res: any) => { setStatus({ ok: res.ok, text: res.msg }); setTimeout(() => setStatus(null), 4000); }).catch(() => { setStatus({ ok: false, text: 'Forge failed.' }); setTimeout(() => setStatus(null), 3000); });
  }

  // progression helpers for Statistics view
  const remainingPoints = (progression && (progression as any).points) || 0;
  const allocated = (progression && (progression as any).allocated) || { hp: 0, dmg: 0, def: 0, crit: 0, dodge: 0 };
  const COSTS: Record<string, number> = { hp: 1, dmg: 2, def: 3, crit: 3, dodge: 3 };

  // debug wrappers for allocate/deallocate to log events
  const _allocate = (stat: string) => {
    try { console.log('[InventoryModal] allocate requested ->', stat, 'remainingPoints', remainingPoints); } catch (e) {}
    try { return allocate && allocate(stat); } catch (e) { try { console.error(e); } catch (e) {} }
  };
  const _deallocate = (stat: string) => {
    try { console.log('[InventoryModal] deallocate requested ->', stat, 'allocated', (allocated as any)[stat]); } catch (e) {}
    try { return deallocate && deallocate(stat); } catch (e) { try { console.error(e); } catch (e) {} }
  };

  return (
    <>
      <Modal title="Inventory" onClose={onClose}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 760, minHeight: 480 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={activeTab === 'inventory' ? 'btn primary' : 'btn'} onClick={() => setActiveTab('inventory')}>Inventory</button>
              <button className={activeTab === 'forge' ? 'btn primary' : 'btn'} onClick={() => setActiveTab('forge')}>Forge</button>
              <button className={activeTab === 'statistics' ? 'btn primary' : 'btn'} onClick={() => setActiveTab('statistics')}>Statistics</button>
            </div>
            <div>
              {status ? (
                <div style={{ padding: 8, background: status.ok ? '#123b1a' : '#3b1212', color: '#fff', borderRadius: 6 }}>{status.text}</div>
              ) : null}
            </div>
          </div>

          {activeTab !== 'statistics' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 12, alignItems: 'stretch', minHeight: 320 }}>

              <div style={{ minWidth: 340, minHeight: 320, position: 'relative' }}>
                {activeTab === 'forge' ? (
                  <>
                    <h2 style={{ marginTop: 0 }}>Forge</h2>
                    <div style={{ display: 'grid', gap: 10, maxHeight: 420, overflow: 'auto' }}>
                      {forgeGroups.length === 0 ? (
                        <div style={{ padding: 12, background: '#0d0d0d', borderRadius: 8 }}>No items to forge.</div>
                      ) : forgeGroups.map((g) => {
                        const RARITY_ORDER = ['common','rare','epic','legendary','mythic'];
                        const idx = RARITY_ORDER.indexOf(g.rarity);
                        const target = idx >= 0 && idx < RARITY_ORDER.length - 1 ? RARITY_ORDER[idx + 1] : null;
                        const unlocked = target && player && Array.isArray(player.unlockedTiers) && player.unlockedTiers.includes(target);
                        return (
                          <div key={g.name + '::' + g.slot} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#0d0d0d', borderRadius: 10 }}>
                            <div>
                              <div style={{ color: RARITY_COLOR[g.rarity] || '#fff', fontWeight: 700 }}>{g.name} <small style={{ color: '#999' }}>({g.slot})</small></div>
                              <div style={{ fontSize: 12, color: '#999' }}>{g.ids.length}x</div>
                            </div>
                            <div>
                              {idx === -1 && <button disabled style={{ opacity: 0.5 }}>Not forgeable</button>}
                              {idx >= RARITY_ORDER.length - 1 && <button disabled style={{ opacity: 0.5 }}>Max rarity</button>}
                              {idx >= 0 && idx < RARITY_ORDER.length - 1 && g.ids.length < 3 && <button disabled style={{ opacity: 0.5 }}>{`Need ${3 - g.ids.length} more`}</button>}
                              {idx >= 0 && idx < RARITY_ORDER.length - 1 && g.ids.length >= 3 && !unlocked && <button disabled style={{ opacity: 0.5 }}>{`Locked (unlock ${target})`}</button>}
                              {idx >= 0 && idx < RARITY_ORDER.length - 1 && g.ids.length >= 3 && unlocked && <button onClick={(e) => { e.stopPropagation(); handleForge(g.ids); }}>Forge → {target}</button>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 style={{ marginTop: 0, marginBottom: 8 }}>Equipment</h2>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, gridAutoRows: '80px', alignItems: 'stretch', position: 'relative' }}>
                        {SLOT_ORDER.map((slot) => {
                          const it = (equipment as any)[slot];
                          const spanStyle: React.CSSProperties = slot === 'hat' ? { gridColumn: '1 / -1' } : {};
                          return (
                            <div key={slot} style={{ boxSizing: 'border-box', ...spanStyle }}>
                              <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.04)', padding: 8, borderRadius: 8, textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                                <div style={{ fontSize: 11, color: '#bbb' }}>{SLOT_LABELS[slot] ?? (slot.charAt(0).toUpperCase() + slot.slice(1))}</div>
                                <div style={{ color: it ? (RARITY_COLOR[it.rarity] || '#fff') : '#777', fontWeight: it ? 700 : 400, marginTop: 4, overflowWrap: 'anywhere', fontSize: 12 }}>{it ? it.name : 'empty'}</div>
                                {it ? (
                                  <>
                                    <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{Object.entries(it.stats || {}).map(([k, v]) => `${k}: ${v}`).join(' • ')}</div>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                      <button type="button" style={{ marginTop: 4, padding: '4px 8px', fontSize: 11 }} onClick={(e) => { e.stopPropagation(); onUnequip(slot); }}>Unequip</button>
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

              <div style={{ width: 360, position: 'relative', minHeight: 320, maxHeight: 420, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'inventory' || activeTab === 'forge' ? (
                  <>
                    <h2 style={{ marginTop: 0, marginBottom: 8, flexShrink: 0 }}>Inventory</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexShrink: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <label style={{ color: '#bbb', fontSize: 12 }}>Filter:</label>
                        <select value={filterSlot} onChange={(e) => setFilterSlot(e.target.value)}>
                          <option value="all">All</option>
                          <option value="consumable">Consumables</option>
                          <option value="key">Fragments</option>
                          {SLOT_ORDER.map((s) => <option key={s} value={s}>{SLOT_LABELS[s] ?? s}</option>)}
                        </select>
                      </div>
                      <div style={{ color: '#ccc', fontSize: 12 }}>Weight: {currentWeight}/{MAX_CARRY_WEIGHT}</div>
                    </div>
                    <div style={{ display: 'grid', gap: 10, overflow: 'auto', flex: 1, alignContent: 'start' }}>
                      {filteredInventory.length === 0 ? (
                        <div style={{ padding: 12, background: '#0d0d0d', borderRadius: 8 }}>No items.</div>
                      ) : (
                        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                          {filteredInventory.map((it) => (
                            <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#0d0d0d', borderRadius: 10, position: 'relative' }}>
                              <div>
                                <div style={{ color: RARITY_COLOR[it.rarity] || '#fff', fontWeight: 700 }}>
                                  {it.name}
                                  {it.quantity && it.quantity > 1 && <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>×{it.quantity}</span>}
                                </div>
                                <div style={{ fontSize: 10, color: '#bbb', marginTop: 4 }}>W:{it.weight ?? 1}</div>
                                <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>{(() => {
                                  const entries = Object.entries(it.stats || {});
                                  const equipped = (equipment as any)[it.slot];
                                  return entries.map(([k, v], idx) => {
                                    const curVal = Number(v || 0);
                                    const eqVal = equipped && equipped.stats ? Number(((equipped.stats as any)[k] ?? 0)) : 0;
                                    const isBetter = curVal > eqVal;
                                    const isWorse = curVal < eqVal;
                                    const valueStyle: React.CSSProperties = isBetter ? { color: '#39ff8a', fontWeight: 700 } : isWorse ? { color: '#ff6b6b', fontWeight: 700 } : { color: '#999', fontWeight: 400 };
                                    return (
                                      <span key={k} style={{ color: '#999', fontWeight: 400 }}>
                                        {`${k}: `}
                                        <span style={valueStyle}>{curVal}</span>
                                        {idx < entries.length - 1 ? ' • ' : ''}
                                      </span>
                                    );
                                  });
                                })()}</div>
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
                ) : (
                  <div style={{ minWidth: 520, minHeight: 320, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8 }}>
                    <div style={{ width: '100%', maxWidth: 720 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Statistics</h2>
                        <div style={{ color: '#ccc', fontSize: 14 }}>Points: <strong style={{ color: '#fff' }}>{remainingPoints}</strong></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: 8 }}>
                        <div style={{ fontWeight: 700 }}>Stat</div>
                        <div style={{ textAlign: 'center', fontWeight: 700 }}>Allocated</div>
                        <div style={{ textAlign: 'center', fontWeight: 700 }}>Action</div>

                        <div>HP (+5 HP)</div>
                        <div style={{ textAlign: 'center' }}>{(progression && progression.allocated && progression.allocated.hp) || 0}</div>
                        <div style={{ textAlign: 'center' }}>
                          <button disabled={remainingPoints < COSTS.hp} onClick={() => allocate && allocate('hp')}>+1 (cost 1)</button>
                          {deallocate ? <button disabled={(allocated.hp || 0) <= 0} onClick={() => deallocate && deallocate('hp')} style={{ marginLeft: 6 }}>-</button> : null}
                        </div>

                        <div>DMG (+1 DMG)</div>
                        <div style={{ textAlign: 'center' }}>{(progression && progression.allocated && progression.allocated.dmg) || 0}</div>
                        <div style={{ textAlign: 'center' }}>
                          <button disabled={remainingPoints < COSTS.dmg} onClick={() => allocate && allocate('dmg')}>+1 (cost 2)</button>
                          {deallocate ? <button disabled={(allocated.dmg || 0) <= 0} onClick={() => deallocate && deallocate('dmg')} style={{ marginLeft: 6 }}>-</button> : null}
                        </div>

                        <div>DEF (+1 DEF)</div>
                        <div style={{ textAlign: 'center' }}>{(progression && progression.allocated && progression.allocated.def) || 0}</div>
                        <div style={{ textAlign: 'center' }}>
                          <button disabled={remainingPoints < COSTS.def} onClick={() => allocate && allocate('def')}>+1 (cost 3)</button>
                          {deallocate ? <button disabled={(allocated.def || 0) <= 0} onClick={() => deallocate && deallocate('def')} style={{ marginLeft: 6 }}>-</button> : null}
                        </div>

                        <div>Crit (+0.5%)</div>
                        <div style={{ textAlign: 'center' }}>{(progression && progression.allocated && progression.allocated.crit) || 0}</div>
                        <div style={{ textAlign: 'center' }}>
                          <button disabled={remainingPoints < COSTS.crit} onClick={() => allocate && allocate('crit')}>+1 (cost 3)</button>
                          {deallocate ? <button disabled={(allocated.crit || 0) <= 0} onClick={() => deallocate && deallocate('crit')} style={{ marginLeft: 6 }}>-</button> : null}
                        </div>

                        <div>Dodge (+0.5%)</div>
                        <div style={{ textAlign: 'center' }}>{(progression && progression.allocated && progression.allocated.dodge) || 0}</div>
                        <div style={{ textAlign: 'center' }}>
                          <button disabled={remainingPoints < COSTS.dodge} onClick={() => allocate && allocate('dodge')}>+1 (cost 3)</button>
                          {deallocate ? <button disabled={(allocated.dodge || 0) <= 0} onClick={() => deallocate && deallocate('dodge')} style={{ marginLeft: 6 }}>-</button> : null}
                        </div>
                      </div>

                      <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                        Points sauvegardés dans la progression — s'ajoutent aux stats et à l'équipement.
                        Coûts : HP+5 (1), DMG+1 (2), DEF+1 (3), Crit/Dodge +0,5% (3).
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div style={{ minWidth: 520, minHeight: 320, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8 }}>
              <div style={{ width: '100%', maxWidth: 720 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ marginTop: 0, marginBottom: 8 }}>Statistics</h2>
                  <div style={{ color: '#ccc', fontSize: 14 }}>Points: <strong style={{ color: '#fff' }}>{remainingPoints}</strong></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: 8 }}>
                  <div style={{ fontWeight: 700 }}>Stat</div>
                  <div style={{ textAlign: 'center', fontWeight: 700 }}>Allocated</div>
                  <div style={{ textAlign: 'center', fontWeight: 700 }}>Action</div>

                  <div>HP (+5 HP)</div>
                  <div style={{ textAlign: 'center' }}>{(progression && progression.allocated && progression.allocated.hp) || 0}</div>
                  <div style={{ textAlign: 'center' }}>
                    <button disabled={remainingPoints < COSTS.hp} onClick={() => allocate && allocate('hp')}>+1 (cost 1)</button>
                    {deallocate ? <button disabled={(allocated.hp || 0) <= 0} onClick={() => deallocate && deallocate('hp')} style={{ marginLeft: 6 }}>-</button> : null}
                  </div>

                  <div>DMG (+1 DMG)</div>
                  <div style={{ textAlign: 'center' }}>{(progression && progression.allocated && progression.allocated.dmg) || 0}</div>
                  <div style={{ textAlign: 'center' }}>
                    <button disabled={remainingPoints < COSTS.dmg} onClick={() => allocate && allocate('dmg')}>+1 (cost 2)</button>
                    {deallocate ? <button disabled={(allocated.dmg || 0) <= 0} onClick={() => deallocate && deallocate('dmg')} style={{ marginLeft: 6 }}>-</button> : null}
                  </div>

                  <div>DEF (+1 DEF)</div>
                  <div style={{ textAlign: 'center' }}>{(progression && progression.allocated && progression.allocated.def) || 0}</div>
                  <div style={{ textAlign: 'center' }}>
                    <button disabled={remainingPoints < COSTS.def} onClick={() => allocate && allocate('def')}>+1 (cost 3)</button>
                    {deallocate ? <button disabled={(allocated.def || 0) <= 0} onClick={() => deallocate && deallocate('def')} style={{ marginLeft: 6 }}>-</button> : null}
                  </div>

                  <div>Crit (+0.5%)</div>
                  <div style={{ textAlign: 'center' }}>{(progression && progression.allocated && progression.allocated.crit) || 0}</div>
                  <div style={{ textAlign: 'center' }}>
                    <button disabled={remainingPoints < COSTS.crit} onClick={() => allocate && allocate('crit')}>+1 (cost 3)</button>
                    {deallocate ? <button disabled={(allocated.crit || 0) <= 0} onClick={() => deallocate && deallocate('crit')} style={{ marginLeft: 6 }}>-</button> : null}
                  </div>

                  <div>Dodge (+0.5%)</div>
                  <div style={{ textAlign: 'center' }}>{(progression && progression.allocated && progression.allocated.dodge) || 0}</div>
                  <div style={{ textAlign: 'center' }}>
                    <button disabled={remainingPoints < COSTS.dodge} onClick={() => allocate && allocate('dodge')}>+1 (cost 3)</button>
                    {deallocate ? <button disabled={(allocated.dodge || 0) <= 0} onClick={() => deallocate && deallocate('dodge')} style={{ marginLeft: 6 }}>-</button> : null}
                  
                  <button
                    id="resetPoints"
                    disabled={!deallocate || Object.values(allocated).reduce((s: number, v: any) => s + (Number(v || 0)), 0) <= 0}
                    onClick={() => {
                      if (!deallocate) return;
                      try {
                        if (!confirm('Reset all allocated points?')) return;
                      } catch (e) {}
                      const stats = ['hp', 'dmg', 'def', 'crit', 'dodge'];
                      for (const s of stats) {
                        const count = (allocated as any)[s] || 0;
                        for (let i = 0; i < count; i++) {
                          try { deallocate && deallocate(s); } catch (e) {}
                        }
                      }
                    }}
                  >Reset Points</button>
                  </div>

                  
                </div>


                <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                  Points sauvegardés dans la progression — s'ajoutent aux stats et à l'équipement.
                  Coûts : HP+5 (1), DMG+1 (2), DEF+1 (3), Crit/Dodge +0,5% (3).
                </div>
              </div>
            </div>
          )}

        </div>
      </Modal>
    </>
  );
}
