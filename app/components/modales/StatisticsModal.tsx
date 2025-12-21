"use client";

import React from "react";
import Modal from "./Modal";

type AllocationStat = 'hp' | 'dmg' | 'def' | 'crit' | 'dodge' | 'regen';

type Props = {
  progression: any;
  allocate: (stat: AllocationStat) => void;
  deallocate?: (stat: AllocationStat) => void;
  onClose: () => void;
};

const COSTS: Record<string, number> = { hp: 1, dmg: 2, def: 3, crit: 3, dodge: 3, regen: 7 };

export default function StatisticsModal({ progression, allocate, deallocate, onClose }: Props) {
  const p = progression || { points: 0, allocated: { hp: 0, dmg: 0, def: 0, crit: 0, dodge: 0, regen: 0 } };

  return (
    <Modal title="Statistics" onClose={onClose}>
      <div style={{ minWidth: 420, minHeight: 500, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14 }}>Stat Points: <strong style={{ fontSize: 16 }}>{p.points}</strong></div>
          <div style={{ fontSize: 12, color: '#aaa' }}>Each level grants 5 points</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: 8, overflowY: 'auto', maxHeight: '400px' }}>
          <div style={{ fontWeight: 700 }}>Stat</div>
          <div style={{ textAlign: 'center', fontWeight: 700 }}>Allocated</div>
          <div style={{ textAlign: 'center', fontWeight: 700 }}>Action</div>

          <div>HP (+5 HP)</div>
          <div style={{ textAlign: 'center' }}>{p.allocated.hp}</div>
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => allocate('hp')}>+1 (cost {COSTS.hp})</button>
            {deallocate ? <button onClick={() => deallocate('hp')} style={{ marginLeft: 6 }}>-</button> : null}
          </div>

          <div>DMG (+1 DMG)</div>
          <div style={{ textAlign: 'center' }}>{p.allocated.dmg}</div>
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => allocate('dmg')}>+1 (cost {COSTS.dmg})</button>
            {deallocate ? <button onClick={() => deallocate('dmg')} style={{ marginLeft: 6 }}>-</button> : null}
          </div>

          <div>DEF (+1 DEF)</div>
          <div style={{ textAlign: 'center' }}>{p.allocated.def}</div>
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => allocate('def')}>+1 (cost {COSTS.def})</button>
            {deallocate ? <button onClick={() => deallocate('def')} style={{ marginLeft: 6 }}>-</button> : null}
          </div>

          <div>Crit (+0.5%)</div>
          <div style={{ textAlign: 'center' }}>{p.allocated.crit}</div>
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => allocate('crit')}>+1 (cost {COSTS.crit})</button>
            {deallocate ? <button onClick={() => deallocate('crit')} style={{ marginLeft: 6 }}>-</button> : null}
          </div>

          <div>Dodge (+0.5%)</div>
          <div style={{ textAlign: 'center' }}>{p.allocated.dodge}</div>
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => allocate('dodge')}>+1 (cost {COSTS.dodge})</button>
            {deallocate ? <button onClick={() => deallocate('dodge')} style={{ marginLeft: 6 }}>-</button> : null}
          </div>

          <div>Regen (+1)</div>
          <div style={{ textAlign: 'center' }}>{p.allocated.regen}</div>
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => allocate('regen')}>+1 (cost {COSTS.regen})</button>
            {deallocate ? <button onClick={() => deallocate('regen')} style={{ marginLeft: 6 }}>-</button> : null}
          </div>
        </div>

        <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
          Allocations are persisted separately and applied on top of base stats and equipment.
        </div>
      </div>
    </Modal>
  );
}
