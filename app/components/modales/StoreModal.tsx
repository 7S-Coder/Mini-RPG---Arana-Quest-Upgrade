"use client";

import React from "react";
import Modal from "./Modal";

type Props = {
  onClose: () => void;
  buyPotion: (type: 'small' | 'medium' | 'large') => { ok: boolean; msg: string } | string;
  playerGold: number;
};

export default function StoreModal({ onClose, buyPotion, playerGold }: Props) {
  const [status, setStatus] = React.useState<{ ok: boolean; text: string } | null>(null);

  const handleBuy = (type: 'small' | 'medium' | 'large') => {
    try {
      const res = (buyPotion as any)(type);
      let msgObj: { ok: boolean; msg: string };
      if (typeof res === 'string') msgObj = { ok: true, msg: res };
      else msgObj = res ?? { ok: false, msg: 'Erreur' };
      setStatus({ ok: !!msgObj.ok, text: msgObj.msg });
      // clear after 3s
      window.setTimeout(() => setStatus(null), 3000);
    } catch (e) {
      setStatus({ ok: false, text: 'Erreur lors de l\'achat' });
      window.setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <Modal title="Magasin" onClose={onClose}>
      <div style={{ minWidth: 480, minHeight: 260 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, padding: 12, background: '#0e0e0e', borderRadius: 8 }}>
            <h3>Potions de soin</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 140 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 8, background: '#111' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Petite potion</div>
                  <div style={{ fontSize: 12, color: '#bbb' }}>Restaure 20 PV</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ color: '#ffd96b', fontWeight: 800 }}>5 g</div>
                  <button className="btn" onClick={() => handleBuy('small')}>Acheter</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 8, background: '#111' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Potion moyenne</div>
                  <div style={{ fontSize: 12, color: '#bbb' }}>Restaure 50 PV</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ color: '#ffd96b', fontWeight: 800 }}>12 g</div>
                  <button className="btn" onClick={() => handleBuy('medium')}>Acheter</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 8, background: '#111' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Grande potion</div>
                  <div style={{ fontSize: 12, color: '#bbb' }}>Restaure 100 PV</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ color: '#ffd96b', fontWeight: 800 }}>25 g</div>
                  <button className="btn" onClick={() => handleBuy('large')}>Acheter</button>
                </div>
              </div>
              </div>
              {/* reserved message area - fixed height so modal doesn't resize when showing messages */}
              <div style={{ height: 44, marginTop: 12 }}>
                {status ? (
                  <div style={{ height: '100%', padding: 8, borderRadius: 8, background: status.ok ? 'rgba(34,139,34,0.09)' : 'rgba(255,0,0,0.06)', color: status.ok ? '#9ee6a6' : '#ffb3b3', fontWeight: 700 }}>
                    {status.text}
                  </div>
                ) : (
                  <div style={{ height: '100%' }} />
                )}
              </div>
          </div>
          <div style={{ width: 220, padding: 12, background: '#0e0e0e', borderRadius: 8 }}>
            <h4 style={{ marginTop: 0 }}>Votre solde</h4>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#ffd96b' }}>{(playerGold || 0).toFixed(2)} g</div>
            <div style={{ height: 12 }} />
            <div style={{ fontSize: 12, color: '#bbb' }}>Les potions sont ajoutées à l'inventaire et peuvent être utilisées depuis l'inventaire.</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
