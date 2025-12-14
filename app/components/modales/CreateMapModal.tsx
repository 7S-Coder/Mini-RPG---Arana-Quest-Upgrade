"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import { ENEMY_TEMPLATES } from "../../game/templates/enemies";
import { createMap } from "../../game/templates/maps";

export default function CreateMapModal({ onClose, onCreated }: { onClose: () => void; onCreated?: (m: any) => void }) {
  const [name, setName] = useState("");
  const [logColor, setLogColor] = useState("#ffffff");
  const [dungeon, setDungeon] = useState(false);
  const [floors, setFloors] = useState(3);
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const t of ENEMY_TEMPLATES) map[t.templateId] = true;
    return map;
  });

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const submit = () => {
    const pool = Object.keys(selected).filter((k) => selected[k]);
    const map = createMap({
      name: name || `Map ${Date.now()}`,
      theme: undefined,
      logColor,
      enemyPool: pool,
      dungeons: dungeon ? [{ id: `dungeon_${Date.now()}`, floors: Math.max(1, floors), bossTemplateId: undefined }] : undefined,
    });
    onCreated && onCreated(map);
    onClose();
  };

  return (
    <Modal title="Create Map" onClose={onClose}>
      <div style={{ display: 'grid', gap: 10, minWidth: 420 }}>
        <label>Map name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <label>Log color</label>
        <input type="color" value={logColor} onChange={(e) => setLogColor(e.target.value)} />

        <label>Allowed enemies</label>
        <div style={{ maxHeight: 220, overflowY: 'auto', display: 'grid', gap: 6 }}>
          {ENEMY_TEMPLATES.map((t) => (
            <label key={t.templateId} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={!!selected[t.templateId]} onChange={() => toggle(t.templateId)} />
              <span style={{ fontWeight: 700 }}>{t.name}</span>
              <span style={{ color: 'var(--muted)', marginLeft: 8 }}>{t.rarity}</span>
            </label>
          ))}
        </div>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={dungeon} onChange={() => setDungeon(!dungeon)} /> Dungeon (boss at the end)
        </label>
        {dungeon && (
          <label>Number of floors
            <input type="number" value={floors} onChange={(e) => setFloors(Number(e.target.value || 1))} style={{ width: 80, marginLeft: 8 }} />
          </label>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn primary" onClick={submit}>Create</button>
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}
