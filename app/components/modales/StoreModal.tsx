"use client";

import React from "react";
import Modal from "./Modal";
import type { Rarity } from "@/app/game/types";

type Props = {
  onClose: () => void;
  buyPotion: (type: 'small' | 'medium' | 'large' | 'huge' | 'giant') => { ok: boolean; msg: string } | string;
  buyLootBox?: (rarity: Rarity) => { ok: boolean; msg: string } | string;
  playerGold: number;
  unlockedRarities?: Rarity[];
};

const RARITY_COLOR: Record<Rarity, string> = {
  common: '#ddd',
  uncommon: '#2ecc71',
  rare: '#6fb3ff',
  epic: '#b47cff',
  legendary: '#ffd16b',
  mythic: '#ff7b7b',
};

// Prix des boites par rareté
const LOOT_BOX_PRICES: Record<Rarity, number> = {
  common: 10,
  uncommon: 20,
  rare: 35,
  epic: 100,
  legendary: 250,
  mythic: 500,
};

export default function StoreModal({ onClose, buyPotion, buyLootBox, playerGold, unlockedRarities = [] }: Props) {
  const [status, setStatus] = React.useState<{ ok: boolean; text: string } | null>(null);

  const handleBuy = (type: 'small' | 'medium' | 'large' | 'huge' | 'giant') => {
    try {
      const res = (buyPotion as any)(type);
      let msgObj: { ok: boolean; msg: string };
      if (typeof res === 'string') msgObj = { ok: true, msg: res };
      else msgObj = res ?? { ok: false, msg: 'Error' };
      setStatus({ ok: !!msgObj.ok, text: msgObj.msg });
      window.setTimeout(() => setStatus(null), 3000);
    } catch (e) {
      setStatus({ ok: false, text: 'Error during purchase' });
      window.setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleBuyLootBox = (rarity: Rarity) => {
    if (!buyLootBox) return;
    try {
      const res = (buyLootBox as any)(rarity);
      let msgObj: { ok: boolean; msg: string };
      if (typeof res === 'string') msgObj = { ok: true, msg: res };
      else msgObj = res ?? { ok: false, msg: 'Error' };
      setStatus({ ok: !!msgObj.ok, text: msgObj.msg });
      window.setTimeout(() => setStatus(null), 3000);
    } catch (e) {
      setStatus({ ok: false, text: 'Error during purchase' });
      window.setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <Modal title="Store" onClose={onClose}>
      <div style={{ minWidth: 800, minHeight: 400 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Potions Section */}
          <div style={{ padding: 12, background: '#0e0e0e', borderRadius: 8 }}>
            <h3>Healing Potions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 320 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 8, background: '#111' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Small potion</div>
                  <div style={{ fontSize: 12, color: '#bbb' }}>Restores 20 HP</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ color: '#ffd96b', fontWeight: 800 }}>5 g</div>
                  <button className="btn" onClick={() => handleBuy('small')}>Buy</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 8, background: '#111' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Medium potion</div>
                  <div style={{ fontSize: 12, color: '#bbb' }}>Restores 50 HP</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ color: '#ffd96b', fontWeight: 800 }}>12 g</div>
                  <button className="btn" onClick={() => handleBuy('medium')}>Buy</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 8, background: '#111' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Large potion</div>
                  <div style={{ fontSize: 12, color: '#bbb' }}>Restores 100 HP</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ color: '#ffd96b', fontWeight: 800 }}>25 g</div>
                  <button className="btn" onClick={() => handleBuy('large')}>Buy</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 8, background: '#111' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Huge potion</div>
                  <div style={{ fontSize: 12, color: '#bbb' }}>Restores 200 HP</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ color: '#ffd96b', fontWeight: 800 }}>45 g</div>
                  <button className="btn" onClick={() => handleBuy('huge')}>Buy</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 8, background: '#111' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Giant potion</div>
                  <div style={{ fontSize: 12, color: '#bbb' }}>Restores 400 HP</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ color: '#ffd96b', fontWeight: 800 }}>80 g</div>
                  <button className="btn" onClick={() => handleBuy('giant')}>Buy</button>
                </div>
              </div>
            </div>
          </div>

          {/* Loot Boxes Section */}
          <div style={{ padding: 12, background: '#0e0e0e', borderRadius: 8 }}>
            <h3>Loot Boxes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 320 }}>
              {(['uncommon', 'rare', 'epic', 'legendary', 'mythic'] as Rarity[]).map((rarity) => {
                const cost = LOOT_BOX_PRICES[rarity];
                const boxLabel = rarity.charAt(0).toUpperCase() + rarity.slice(1) + ' Box';
                const canAfford = playerGold >= cost;
                const isUnlocked = unlockedRarities.includes(rarity);
                const canBuy = canAfford && isUnlocked;
                const disabledReason = !isUnlocked ? 'Locked' : !canAfford ? 'Poor' : '';
                return (
                  <div key={rarity} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 8, background: '#111' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: RARITY_COLOR[rarity] }}>{boxLabel}</div>
                      <div style={{ fontSize: 12, color: '#bbb' }}>{isUnlocked ? `Random ${rarity} item` : 'Locked - Get an item of this rarity first'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ color: '#ffd96b', fontWeight: 800 }}>{cost} g</div>
                      <button 
                        className="btn" 
                        onClick={() => handleBuyLootBox(rarity)}
                        disabled={!canBuy}
                        title={disabledReason}
                        style={{ opacity: canBuy ? 1 : 0.5, cursor: canBuy ? 'pointer' : 'not-allowed' }}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status Message and Balance */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 16, marginTop: 16 }}>
          <div style={{ height: 44 }}>
            {status ? (
              <div style={{ height: '100%', padding: 8, borderRadius: 8, background: status.ok ? 'rgba(34,139,34,0.09)' : 'rgba(255,0,0,0.06)', color: status.ok ? '#9ee6a6' : '#ffb3b3', fontWeight: 700 }}>
                {status.text}
              </div>
            ) : (
              <div style={{ height: '100%' }} />
            )}
          </div>
          <div style={{ padding: 12, background: '#0e0e0e', borderRadius: 8 }}>
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>Your balance</h4>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#ffd96b' }}>{(playerGold || 0).toFixed(2)} g</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
