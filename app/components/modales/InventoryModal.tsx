"use client";

import React from "react";
import Modal from "./Modal";
import "../styles/inventoryModal.css";

type AllocationStat = 'hp' | 'dmg' | 'def' | 'crit' | 'dodge' | 'regen';

type Props = {
  inventory: any[];
  equipment: Record<string, any>;
  player?: any;
  onEquip: (item: any) => void;
  onUnequip: (slot: string) => void;
  onSell: (itemId: string) => void;
  onUse?: (itemId: string) => boolean | Promise<boolean> | void;
  onForge?: (itemId: string) => { ok: boolean; msg: string } | Promise<{ ok: boolean; msg: string }>;
  onUpgradeStat?: (itemId: string, statKey: string) => { ok: boolean; msg: string };
  onLockStat?: (itemId: string, statKey: string) => { ok: boolean; msg: string };
  onInfuse?: (itemId: string) => { ok: boolean; msg: string };
  onMythicEvolution?: (itemId: string) => { ok: boolean; msg: string };
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

const WEAPON_TYPE_COLOR: Record<string, string> = {
  barehand: '#999',
  dagger: '#ff6b6b',
  sword: '#4ecdc4',
  axe: '#ffa500',
  spear: '#95e1d3',
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

export default function InventoryModal({ inventory, equipment, player, onEquip, onUnequip, onSell, onUse, onForge, onUpgradeStat, onLockStat, onInfuse, onMythicEvolution, onClose, progression, allocate, deallocate }: Props) {
  React.useEffect(() => { try { console.log('[InventoryModal] progression changed ->', progression); } catch (e) {} }, [progression]);
  
  const [status, setStatus] = React.useState<{ ok: boolean; text: string } | null>(null);
  const [activeTab, setActiveTab] = React.useState<'inventory' | 'equipment' | 'forge' | 'statistics' | 'artifacts'>('inventory');
  const [filterSlot, setFilterSlot] = React.useState<string>('all');
  const [selectedItemForAction, setSelectedItemForAction] = React.useState<any>(null);
  const [hoveredTooltip, setHoveredTooltip] = React.useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);

  const TOOLTIPS: Record<string, string> = {
    upgradeStat: 'Increase a random stat by 1-3. Costs 500 gold.',
    lockStat: 'Prevent a stat from being rerolled on future upgrades. Costs 300 gold + 1 Mithril Ore.',
    // infusion: 'Mark an item with essence, improving its appearance. Costs 50 essence.',
    mythicEvolution: 'Transform a Legendary item into a Mythic rarity item with +2 to all stats. Costs 150 essence.',
  };

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

  const getItemDescription = (it: any) => {
    if (it.category === 'consumable') return 'Consumable item. Use to gain temporary or permanent effects.';
    else if (it.category === 'fragment') return 'This precious fragment opens the doors to the next map for you.';
    else if (it.category === 'accessory') return it.description || 'This precious key opens the doors to the next map for you.';
    const statsList = Object.entries(it.stats || {})
      .map(([k, v]) => `${k} +${v}`)
      .join(', ');
    return statsList || 'No special effects.';
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

  const filteredInventory = React.useMemo(() => {
    // Exclude artifacts (keys/fragments) from regular inventory
    const inventoryItems = inventory.filter((it) => it.slot !== 'key' && it.category !== 'fragment');
    return inventoryItems.filter((it) => (filterSlot === 'all' ? true : (filterSlot === 'consumable' ? (it.category === 'consumable') : it.slot === filterSlot)));
  }, [inventory, filterSlot]);

  // Get artifacts (keys and fragments) separately
  const artifacts = React.useMemo(() => inventory.filter((it) => it.slot === 'key' || it.category === 'fragment'), [inventory]);

  function handleForge(ids: string[]) {
    if (!onForge) { setStatus({ ok: false, text: 'Forge not available.' }); setTimeout(() => setStatus(null), 3000); return; }
    Promise.resolve(onForge(ids[0])).then((res: any) => { setStatus({ ok: res.ok, text: res.msg }); setTimeout(() => setStatus(null), 4000); }).catch(() => { setStatus({ ok: false, text: 'Forge failed.' }); setTimeout(() => setStatus(null), 3000); });
  }

  // progression helpers for Statistics view
  const remainingPoints = (progression && (progression as any).points) || 0;
  const allocated = (progression && (progression as any).allocated) || { hp: 0, dmg: 0, def: 0, crit: 0, dodge: 0, regen: 0 };
  const COSTS: Record<string, number> = { hp: 1, dmg: 2, def: 3, crit: 3, dodge: 3, regen: 3 };

  // debug wrappers for allocate/deallocate to log events
  const _allocate = (stat: AllocationStat) => {
    try { console.log('[InventoryModal] allocate requested ->', stat, 'remainingPoints', remainingPoints); } catch (e) {}
    try { return allocate && allocate(stat); } catch (e) { try { console.error(e); } catch (e) {} }
  };
  const _deallocate = (stat: AllocationStat) => {
    try { console.log('[InventoryModal] deallocate requested ->', stat, 'allocated', (allocated as any)[stat]); } catch (e) {}
    try { return deallocate && deallocate(stat); } catch (e) { try { console.error(e); } catch (e) {} }
  };

  return (
    <>
      <Modal title="Inventory" onClose={onClose}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vw', width: '62vw', height: '70vh' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={activeTab === 'inventory' ? 'btn primary inventory-tab-btn active' : 'btn primary inventory-tab-btn'} onClick={() => setActiveTab('inventory')}>Inventory</button>
              <button className={activeTab === 'artifacts' ? 'btn primary inventory-tab-btn active' : 'btn primary inventory-tab-btn'} onClick={() => setActiveTab('artifacts')}>Artifacts</button>
              <button className={activeTab === 'forge' ? 'btn primary inventory-tab-btn active' : 'btn primary inventory-tab-btn'} onClick={() => { setActiveTab('forge'); setSelectedItemForAction(null); }}>Forge</button>
              <button className={activeTab === 'statistics' ? 'btn primary inventory-tab-btn active' : 'btn primary inventory-tab-btn'} onClick={() => setActiveTab('statistics')}>Statistics</button>
            </div>
            <div>
              {status ? (
                <div style={{ padding: 8, background: status.ok ? '#123b1a' : '#3b1212', color: '#fff', borderRadius: 6 }}>{status.text}</div>
              ) : null}
            </div>
          </div>

          {activeTab === 'inventory' || activeTab === 'equipment' || activeTab === 'forge' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 28vw', gap: '1.2vw', alignItems: 'stretch', minHeight: '40vh' }}>

              <div style={{ minWidth: '26vw', minHeight: '40vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'forge' ? (
                  <>
                    <h2 style={{ marginTop: 0, marginBottom: '0.8vw', flexShrink: 0 }}>Forge</h2>
                    {selectedItemForAction ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8vw', maxHeight: '35vh', overflow: 'auto', flex: 1 }}>
                        <div style={{ padding: '1vw', background: '#0d0d0d', borderRadius: '0.8vw', flexShrink: 0 }}>
                          <div style={{ color: RARITY_COLOR[selectedItemForAction.rarity] || '#fff', fontWeight: 700, marginBottom: '0.6vw' }}>{selectedItemForAction.name}</div>
                          <div style={{ fontSize: '0.9vw', color: '#999', marginBottom: '0.6vw' }}>
                            {selectedItemForAction.infused && <div>Infused</div>}
                            {selectedItemForAction.lockedStats && selectedItemForAction.lockedStats.length > 0 && (
                              <div>Locked: {selectedItemForAction.lockedStats.join(', ')}</div>
                            )}
                          </div>
                          <button className="btn primary" onClick={() => setSelectedItemForAction(null)} style={{ marginTop: '0.6vw' }}>← Back</button>
                        </div>
                        
                        <div style={{ display: 'grid', gap: '0.8vw' }}>
                        {/* Upgrade Stat */}
                        <div 
                          style={{ padding: '1vw', background: '#1a1a1a', borderRadius: '0.8vw', position: 'relative' }}
                          onMouseEnter={() => setHoveredTooltip('upgradeStat')}
                          onMouseLeave={() => setHoveredTooltip(null)}
                        >
                          {hoveredTooltip === 'upgradeStat' && (
                            <div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: '0.5vw', padding: '1vw 1.2vw', fontSize: '0.85vw', color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: '0.6vw', lineHeight: 1.4 }}>
                              {TOOLTIPS.upgradeStat}
                            </div>
                          )}
                          <div style={{ fontWeight: 700, marginBottom: '0.6vw' }}>⬆ Upgrade Stat (500g)</div>
                          {selectedItemForAction.stats && Object.entries(selectedItemForAction.stats).map(([stat, val]: [string, any]) => (
                            <button className="btn primary" key={stat} onClick={() => {
                              if (onUpgradeStat) {
                                const res = onUpgradeStat(selectedItemForAction.id, stat);
                                setStatus({ ok: res.ok, text: res.msg });
                                setTimeout(() => setStatus(null), 3000);
                              }
                            }} style={{ width: '100%', marginBottom: '0.3vw', fontSize: '0.85vw' }} disabled={(player?.gold ?? 0) < 500}>
                              {stat}: {val} {(player?.gold ?? 0) < 500 ? '❌' : '→'}
                            </button>
                          ))}
                        </div>

                        {/* Lock Stat */}
                        <div 
                          style={{ padding: '1vw', background: '#1a1a1a', borderRadius: '0.8vw', position: 'relative' }}
                          onMouseEnter={() => setHoveredTooltip('lockStat')}
                          onMouseLeave={() => setHoveredTooltip(null)}
                        >
                          {hoveredTooltip === 'lockStat' && (
                            <div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: '0.5vw', padding: '1vw 1.2vw', fontSize: '0.85vw', color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: '0.6vw', lineHeight: 1.4 }}>
                              {TOOLTIPS.lockStat}
                            </div>
                          )}
                          <div style={{ fontWeight: 700, marginBottom: '0.6vw' }}>Lock Stat (300g + 1 Ore)</div>
                          {selectedItemForAction.stats && Object.entries(selectedItemForAction.stats).map(([stat, val]: [string, any]) => {
                            const isLocked = selectedItemForAction.lockedStats?.includes(stat);
                            return (
                              <button className="btn primary" key={stat} onClick={() => {
                                if (onLockStat) {
                                  const res = onLockStat(selectedItemForAction.id, stat);
                                  setStatus({ ok: res.ok, text: res.msg });
                                  setTimeout(() => setStatus(null), 3000);
                                }
                              }} style={{ width: '100%', marginBottom: '0.3vw', fontSize: '0.85vw' }} disabled={isLocked || (player?.gold ?? 0) < 300 || (player?.materials?.mithril_ore ?? 0) < 1}>
                                {stat}{isLocked ? ' ✓' : ''} {(player?.gold ?? 0) < 300 || (player?.materials?.mithril_ore ?? 0) < 1 ? '❌' : '→'}
                              </button>
                            );
                          })}
                        </div>

                        {/* Infusion */}
                        {/* <div 
                          style={{ padding: 12, background: '#1a1a1a', borderRadius: 10, position: 'relative' }}
                          onMouseEnter={() => setHoveredTooltip('infusion')}
                          onMouseLeave={() => setHoveredTooltip(null)}
                        >
                          {hoveredTooltip === 'infusion' && (
                            <div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: 6, padding: '12px 16px', fontSize: 11, color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: 8, lineHeight: 1.4 }}>
                              {TOOLTIPS.infusion}
                            </div>
                          )}
                          <div style={{ fontWeight: 700, marginBottom: 8 }}>Infusion (50e)</div>
                          <button onClick={() => {
                            if (onInfuse) {
                              const res = onInfuse(selectedItemForAction.id);
                              setStatus({ ok: res.ok, text: res.msg });
                              setTimeout(() => setStatus(null), 3000);
                            }
                          }} style={{ width: '100%', fontSize: 11 }} disabled={selectedItemForAction.infused || (player?.essence ?? 0) < 50}>
                            {selectedItemForAction.infused ? 'Already infused' : (player?.essence ?? 0) < 50 ? '❌ Not enough essence' : 'Infuse'}
                          </button>
                        </div> */}

                        {/* Mythic Evolution */}
                        {selectedItemForAction.rarity === 'legendary' && (
                          <div 
                            style={{ padding: '1vw', background: '#1a1a1a', borderRadius: '0.8vw', position: 'relative' }}
                            onMouseEnter={() => setHoveredTooltip('mythicEvolution')}
                            onMouseLeave={() => setHoveredTooltip(null)}
                          >
                            {hoveredTooltip === 'mythicEvolution' && (
                              <div style={{ position: 'absolute', bottom: '105%', left: 0, right: 0, background: '#111', border: '1px solid #666', borderRadius: '0.5vw', padding: '1vw 1.2vw', fontSize: '0.85vw', color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: '0.6vw', lineHeight: 1.4 }}>
                                {TOOLTIPS.mythicEvolution}
                              </div>
                            )}
                            <div style={{ fontWeight: 700, marginBottom: '0.6vw' }}>Mythic Evolution (150e)</div>
                            <button className="btn primary" onClick={() => {
                              if (onMythicEvolution) {
                                const res = onMythicEvolution(selectedItemForAction.id);
                                setStatus({ ok: res.ok, text: res.msg });
                                setTimeout(() => setStatus(null), 3000);
                              }
                            }} style={{ width: '100%', fontSize: '0.85vw' }} disabled={(player?.essence ?? 0) < 150}>
                              {(player?.essence ?? 0) < 150 ? '❌ Not enough essence' : 'Evolve to Mythic'}
                            </button>
                          </div>
                        )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <p style={{ color: '#999', fontSize: 12 }}>Select an item to see available actions</p>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <h2 style={{ marginTop: 0, marginBottom: '0.8vw' }}>Equipment</h2>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8vw', gridAutoRows: '6vw', alignItems: 'stretch', position: 'relative', overflow: 'visible' }}>
                        {SLOT_ORDER.map((slot) => {
                          const it = (equipment as any)[slot];
                          const spanStyle: React.CSSProperties = slot === 'hat' ? { gridColumn: '1 / -1' } : {};
                          const tooltipId = `weapon-${slot}`;
                          return (
                            <div key={slot} style={{ boxSizing: 'border-box', ...spanStyle, position: 'relative' }}>
                              <div style={{ background: it && it.isForged ? 'rgba(255, 193, 7, 0.12)' : '#111', border: it && it.isForged ? '1px solid rgba(255, 193, 7, 0.5)' : '1px solid rgba(255,255,255,0.04)', padding: '0.6vw', borderRadius: '0.6vw', textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', position: 'relative' }} onClick={() => it && (setActiveTab('forge'), setSelectedItemForAction(it))} onMouseEnter={() => slot === 'weapon' && it && setHoveredTooltip(tooltipId)} onMouseLeave={() => slot === 'weapon' && setHoveredTooltip(null)}>
                                <div style={{ fontSize: '0.85vw', color: '#bbb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4vw' }}>
                                  {SLOT_LABELS[slot] ?? (slot.charAt(0).toUpperCase() + slot.slice(1))}
                                  {slot === 'weapon' && it && (
                                    <>
                                      {(it.weaponType || it.type) && (
                                        <span style={{ display: 'inline-block', background: WEAPON_TYPE_COLOR[it.weaponType || it.type || 'barehand'] || '#666', color: '#000', padding: '0.15vw 0.35vw', borderRadius: '0.3vw', fontSize: '0.7vw', fontWeight: 600, textTransform: 'capitalize' }}>
                                          {(it.weaponType || it.type || 'barehand').toLowerCase()}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                                <div style={{ color: it ? (RARITY_COLOR[it.rarity] || '#fff') : '#777', fontWeight: it ? 700 : 400, marginTop: '0.3vw', overflowWrap: 'anywhere', fontSize: '0.9vw', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4vw' }}>
                                  <span>{it ? it.name : 'empty'}</span>
                                  {it && it.isForged && <span style={{ fontSize: '0.75vw', color: '#ffc107', fontWeight: 600 }}>FORGED</span>}
                                </div>
                                {hoveredTooltip === tooltipId && it && (
                                  <div style={{ position: 'absolute', bottom: '105%', left: '50%', transform: 'translateX(-50%)', background: '#111', border: '1px solid #666', borderRadius: '0.5vw', padding: '0.8vw', fontSize: '0.8vw', color: '#ccc', zIndex: 10, whiteSpace: 'normal', marginBottom: '0.6vw', lineHeight: 1.4, minWidth: '15vw', maxWidth: '20vw' }}>
                                    <div style={{ color: '#bbb', fontSize: '0.75vw' }}>
                                      {(it.description || getItemDescription(it)).replace(/^[^\w]+ /, '')}
                                    </div>
                                  </div>
                                )}
                                {it ? (
                                  <>
                                    <div style={{ fontSize: '0.75vw', color: '#999', marginTop: '0.15vw' }}>{Object.entries(it.stats || {}).map(([k, v]) => `${k}: ${v}`).join(' • ')}</div>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                      <button type="button" style={{ marginTop: '0.3vw', padding: '0.3vw 0.6vw', fontSize: '0.8vw' }} onClick={(e) => { e.stopPropagation(); onUnequip(slot); }}>Unequip</button>
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

              <div style={{ width: '28vw', position: 'relative', minHeight: '40vh', maxHeight: '50vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxWidth: '50vw'  }}>
                {activeTab === 'inventory' ? (
                  <>
                    <h2 style={{ marginTop: 0, marginBottom: '0.8vw', flexShrink: 0}}>Inventory</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8vw', flexShrink: 0 }}>
                      <div style={{ display: 'flex', gap: '0.6vw', alignItems: 'center' }}>
                        <label style={{ color: '#bbb', fontSize: '0.9vw' }}>Filter:</label>
                        <select value={filterSlot} onChange={(e) => setFilterSlot(e.target.value)}>
                          <option value="all">All</option>
                          <option value="consumable">Consumables</option>
                          {SLOT_ORDER.map((s) => <option key={s} value={s}>{SLOT_LABELS[s] ?? s}</option>)}
                        </select>
                      </div>
                      <div style={{ color: '#ccc', fontSize: '0.9vw' }}>Weight: {currentWeight}/{MAX_CARRY_WEIGHT}</div>
                    </div>
                    <div style={{ display: 'grid', gap: '0.8vw', overflow: 'auto', flex: 1, alignContent: 'start' }}>
                      {filteredInventory.length === 0 ? (
                        <div style={{ padding: 12, background: '#0d0d0d', borderRadius: 8 }}>No items.</div>
                      ) : (
                        <div style={{ display: 'grid', gap: '0.8vw', alignContent: 'start' }}>
                          {filteredInventory.map((it, idx) => {
                            const isInFirstHalf = idx < filteredInventory.length / 2;
                            return (
                            <div key={it.id} onMouseEnter={() => setHoveredItemId(it.id)} onMouseLeave={() => setHoveredItemId(null)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1vw', background: it.isForged ? 'rgba(255, 193, 7, 0.08)' : '#0d0d0d', borderRadius: '0.8vw', position: 'relative', border: it.isForged ? '1px solid rgba(255, 193, 7, 0.5)' : '1px solid transparent' }}>
                              <div style={{ position: 'relative', flex: 1 }}>
                                <div style={{ color: RARITY_COLOR[it.rarity] || '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6vw' }}>
                                  <span>{it.name}</span>
                                  {it.isForged && <span style={{ color: '#ffc107', fontSize: '0.75vw', fontWeight: 600 }}>⚒️ FORGED</span>}
                                  {it.quantity && it.quantity > 1 && <span style={{ marginLeft: '0.6vw', color: '#999', fontSize: '0.85vw' }}>×{it.quantity}</span>}
                                </div>
                                {hoveredItemId === it.id && (it.slot === 'consumable' || it.slot === 'key') && (
                                  <div style={{ position: 'absolute', [isInFirstHalf ? 'top' : 'bottom']: 'calc(100% + 0.3vw)', left: 0, maxWidth: '12vw', background: '#111', border: '1px solid #666', borderRadius: '0.5vw', padding: '0.8vw 1vw', fontSize: '0.75vw', color: '#ccc', zIndex: 1000, whiteSpace: 'normal', lineHeight: 1.4 }}>
                                    {getItemDescription(it)}
                                  </div>
                                )}
                                <div style={{ fontSize: '0.75vw', color: '#bbb', marginTop: '0.3vw' }}>W:{it.weight ?? 1}</div>
                                <div style={{ fontSize: '0.85vw', color: '#999', marginTop: '0.4vw' }}>{(() => {
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
                              <div style={{ display: 'flex', gap: '0.6vw' }}>
                                {it.category === 'consumable' ? (
                                  <button type="button" onClick={(e) => { e.stopPropagation(); if (!onUse) return; setTimeout(() => { try { const res = onUse(it.id); Promise.resolve(res).then(() => {}); } catch {} }, 0); }}>Use</button>
                                ) : it.slot === 'key' ? null : (
                                  <button type="button" onClick={(e) => { e.stopPropagation(); if (!onEquip) return; setTimeout(() => { try { onEquip(it); } catch {} }, 0); }}>Equip ({SLOT_LABELS[it.slot] ?? it.slot})</button>
                                )}
                                <button type="button" onClick={(e) => { e.stopPropagation(); if (!onSell) return; setTimeout(() => { try { onSell(it.id); } catch {} }, 0); }}>Sell ({priceFor(it)} g)</button>
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : activeTab === 'forge' ? (
                  <>
                    <h2 style={{ marginTop: 0, marginBottom: '0.8vw', flexShrink: 0 }}>Items</h2>
                    <div style={{ display: 'grid', gap: '0.8vw', overflow: 'auto', flex: 1, alignContent: 'start' }}>
                      {[...equipment ? Object.values(equipment).filter(Boolean) : [], ...inventory].map((it) => (
                        <div key={it?.id} onClick={() => it && setSelectedItemForAction(it)} style={{ padding: '1vw', background: selectedItemForAction?.id === it?.id ? '#1a3a2e' : '#0d0d0d', borderRadius: '0.6vw', cursor: 'pointer', border: selectedItemForAction?.id === it?.id ? '1px solid #2ecc71' : '1px solid transparent' }}>
                          <div style={{ color: RARITY_COLOR[it?.rarity] || '#fff', fontWeight: 700, fontSize: '0.9vw' }}>{it?.name}</div>
                          <div style={{ fontSize: '0.75vw', color: '#999', marginTop: '0.15vw' }}>{it?.slot || 'item'}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ minWidth: '60vw', minHeight: '40vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '0.8vw' }}>
                    <div style={{ width: '100%', maxWidth: '70vw' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ marginTop: 0, marginBottom: '0.8vw' }}>Statistics</h2>
                        <div style={{ color: '#ccc', fontSize: '1vw' }}>Points: <strong style={{ color: '#fff' }}>{remainingPoints}</strong></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 10vw 10vw', gap: '0.8vw' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9vw' }}>Stat</div>
                        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.9vw' }}>Allocated</div>
                        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.9vw' }}>Action</div>

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

                        <div>Regen (+1)</div>
                        <div style={{ textAlign: 'center' }}>{(progression && progression.allocated && progression.allocated.regen) || 0}</div>
                        <div style={{ textAlign: 'center' }}>
                          <button disabled={remainingPoints < COSTS.regen} onClick={() => allocate && allocate('regen')}>+1 (cost 3)</button>
                          {deallocate ? <button disabled={(allocated.regen || 0) <= 0} onClick={() => deallocate && deallocate('regen')} style={{ marginLeft: 6 }}>-</button> : null}
                        </div>
                      </div>

                      <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                        Points sauvegardés dans la progression — s'ajoutent aux stats et à l'équipement.
                        Coûts : HP+5 (1), DMG+1 (2), DEF+1 (3), Crit/Dodge +0,5% (3), Regen +1 (3).
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          ) : null}
          {activeTab === 'artifacts' ? (
            <div style={{ minWidth: 520, minHeight: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <h2 style={{ marginTop: 0, marginBottom: 8 }}>Artifacts & Keys</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ color: '#ccc', fontSize: 12 }}>Total: {artifacts.length} item{artifacts.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 10, overflow: 'auto', flex: 1, alignContent: 'start' }}>
                {artifacts.length === 0 ? (
                  <div style={{ padding: 12, background: '#0d0d0d', borderRadius: 8 }}>No artifacts yet.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                    {artifacts.map((it) => (
                      <div key={it.id} onMouseEnter={() => setHoveredItemId(it.id)} onMouseLeave={() => setHoveredItemId(null)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#0d0d0d', borderRadius: 10, position: 'relative', transition: 'background 0.2s', border: '1px solid transparent' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <div style={{ color: RARITY_COLOR[it.rarity] || '#fff', fontWeight: 700 }}>
                            {it.name}
                            {it.quantity && it.quantity > 1 && <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>×{it.quantity}</span>}
                          </div>
                          {hoveredItemId === it.id && (
                            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{getItemDescription(it)}</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="button" onClick={(e) => { e.stopPropagation(); if (!onSell) return; setTimeout(() => { try { onSell(it.id); } catch {} }, 0); }}>Sell ({priceFor(it)} g)</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
          {activeTab === 'statistics' ? (
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

                  <div>Regen (+1)</div>
                  <div style={{ textAlign: 'center' }}>{(progression && progression.allocated && progression.allocated.regen) || 0}</div>
                  <div style={{ textAlign: 'center' }}>
                    <button disabled={remainingPoints < COSTS.regen} onClick={() => allocate && allocate('regen')}>+1 (cost 3)</button>
                    {deallocate ? <button disabled={(allocated.regen || 0) <= 0} onClick={() => deallocate && deallocate('regen')} style={{ marginLeft: 6 }}>-</button> : null}
                  </div>
                </div>

                <button className="align-end btn primary"
                  id="resetPoints"
                  style={{ marginTop: 12 }}
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
                        try { deallocate && deallocate(s as AllocationStat); } catch (e) {}
                      }
                    }
                  }}
                >Reset Points</button>

                <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                  Points sauvegardés dans la progression — s'ajoutent aux stats et à l'équipement.
                  Coûts : HP+5 (1), DMG+1 (2), DEF+1 (3), Crit/Dodge +0,5% (3), Regen +1 (3).
                </div>
              </div>
            </div>
          ) : null}

        </div>
      </Modal>


    </>
  );
}
