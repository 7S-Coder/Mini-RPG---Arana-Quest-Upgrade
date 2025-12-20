"use client";

import React from "react";
import Modal from "./Modal";
import type { Rarity } from "@/app/game/types";

type Props = {
  onClose: () => void;
  buyPotion: (type: 'small' | 'medium' | 'large' | 'huge' | 'giant') => { ok: boolean; msg: string } | string;
  buyLootBox?: (rarity: Rarity, currency?: 'gold' | 'essence') => { ok: boolean; msg: string } | string;
  playerGold: number;
  playerEssence?: number;
  playerLevel?: number;
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

// Prix des boites par rareté (or)
const LOOT_BOX_PRICES_GOLD: Record<Rarity, number> = {
  common: 10,
  uncommon: 20,
  rare: 35,
  epic: 100,
  legendary: 250,
  mythic: 500,
};

// Prix des boites par rareté (essence)
const LOOT_BOX_PRICES_ESSENCE: Record<Rarity, number> = {
  common: 1,
  uncommon: 3,
  rare: 8,
  epic: 20,
  legendary: 50,
  mythic: 120,
};

export default function StoreModal({ onClose, buyPotion, buyLootBox, playerGold, playerEssence = 0, playerLevel = 1, unlockedRarities = [] }: Props) {
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

  const handleBuyLootBox = (rarity: Rarity, currency: 'gold' | 'essence' = 'gold') => {
    if (!buyLootBox) return;
    try {
      const res = (buyLootBox as any)(rarity, currency);
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
      <div style={{ minWidth: 800, minHeight: 300 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Potions Section */}
          <div style={{ padding: 12, background: '#0e0e0e', borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 8px 0' }}>Healing Potions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, maxHeight: 240, overflowY: 'auto', paddingRight: 8 }}>
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
          <div style={{ padding: 12, background: '#0e0e0e', borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 8px 0' }}>Loot Boxes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, maxHeight: 240, overflowY: 'auto', paddingRight: 8 }}>
              {(['uncommon', 'rare', 'epic', 'legendary', 'mythic'] as Rarity[]).map((rarity) => {
                const costGold = LOOT_BOX_PRICES_GOLD[rarity];
                const costEssence = LOOT_BOX_PRICES_ESSENCE[rarity];
                const boxLabel = rarity.charAt(0).toUpperCase() + rarity.slice(1) + ' Box';
                const canAffordGold = playerGold >= costGold;
                const canAffordEssence = playerEssence && playerEssence >= costEssence;
                const isUnlocked = unlockedRarities.includes(rarity);
                const canBuyWithGold = canAffordGold && isUnlocked;
                const canBuyWithEssence = canAffordEssence && isUnlocked;
                
                return (
                  <div key={rarity} style={{ padding: 8, borderRadius: 8, background: '#111' }}>
                    <div style={{ fontWeight: 700, color: RARITY_COLOR[rarity], marginBottom: 6 }}>{boxLabel}</div>
                    <div style={{ fontSize: 12, color: '#bbb', marginBottom: 8 }}>{isUnlocked ? `Random ${rarity} item` : 'Locked - Get an item of this rarity first'}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button 
                        className="btn" 
                        onClick={() => handleBuyLootBox(rarity, 'gold')}
                        disabled={!canBuyWithGold}
                        title={!isUnlocked ? 'Locked' : !canAffordGold ? 'Not enough gold' : ''}
                        style={{ 
                          opacity: canBuyWithGold ? 1 : 0.5, 
                          cursor: canBuyWithGold ? 'pointer' : 'not-allowed',
                          fontSize: 12
                        }}
                      >
                        {costGold}g
                      </button>
                      <button 
                        className="btn" 
                        onClick={() => handleBuyLootBox(rarity, 'essence')}
                        disabled={!canBuyWithEssence}
                        title={!isUnlocked ? 'Locked' : !canAffordEssence ? 'Not enough essence' : ''}
                        style={{ 
                          opacity: canBuyWithEssence ? 1 : 0.5, 
                          cursor: canBuyWithEssence ? 'pointer' : 'not-allowed',
                          fontSize: 12,
                          color: '#6eb3ff'
                        }}
                      >
                        {costEssence}✨
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status Message and Balance */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
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
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>Gold</h4>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#ffd96b' }}>{(playerGold || 0).toFixed(2)} g</div>
          </div>
          <div style={{ padding: 12, background: '#0e0e0e', borderRadius: 8 }}>
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>Essence</h4>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#6eb3ff' }}>{(playerEssence || 0).toFixed(0)}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
