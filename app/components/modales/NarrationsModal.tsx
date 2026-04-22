"use client";

import { useMemo, useState } from "react";
import Modal from "./Modal";
import type { NarrativeMessage } from "@/app/game/templates/narration";
import { LEVEL_MILESTONES, NPC_DATA } from "@/app/game/templates/narration";
import "../styles/narrationsModal.css";

interface SimpleDialogue {
  id: string;
  question: string;
  response: string;
  type: 'player' | 'npc';
  choices?: Array<{
    id: string;
    text: string;
    response: string;
  }>;
}

interface NarrationsModalProps {
  unlockedLevels: number[];
  unlockedDialogues?: Record<string, Record<string, string[]>>;
  allDialogues?: Record<string, SimpleDialogue[]>;
  onClose: () => void;
}

const NPC_NAMES: Record<string, string> = {
  lya: "Lya",
  eldran: "Eldran",
  brak: "Brak",
  messenger: "The Masked Messenger",
};

/**
 * Narrations Modal Component
 * 
 * Displays all unlocked narrations organized by level milestone
 * Shows NPC name and narration text
 */

export default function NarrationsModal({ unlockedLevels, unlockedDialogues = {}, allDialogues = {}, onClose }: NarrationsModalProps) {
  const [activeTab, setActiveTab] = useState<'narrations' | 'dialogues'>('narrations');
  // Get all unlocked narrations sorted by level
  const unlockedNarrations = useMemo(() => {
    const narrations: { level: number; narration: NarrativeMessage }[] = [];
    
    // Get sorted levels and their narrations
    const sortedLevels = [...unlockedLevels].sort((a, b) => a - b);
    
    for (const level of sortedLevels) {
      const narration = LEVEL_MILESTONES[level];
      if (narration) {
        narrations.push({ level, narration });
      }
    }
    
    return narrations;
  }, [unlockedLevels]);

  // Organize unlocked dialogues by NPC
  // unlockedDialogues is now: { npcId: { dialogueId: [unlockedChoiceIds] } }
  const organizedDialogues = useMemo(() => {
    const result: Record<string, SimpleDialogue[]> = {};
    
    for (const [npcId, dialoguesData] of Object.entries(unlockedDialogues || {})) {
      const npcAllDialogues = allDialogues?.[npcId] || [];
      // Filter to only dialogues that are unlocked (exist in dialoguesData)
      result[npcId] = npcAllDialogues.filter((d) => dialoguesData && d.id in dialoguesData);
    }
    
    return result;
  }, [unlockedDialogues, allDialogues]);

  const getNPCName = (npcId: string): string => {
    return NPC_DATA[npcId as keyof typeof NPC_DATA]?.name || npcId;
  };

  const getNPCTitle = (npcId: string): string => {
    return NPC_DATA[npcId as keyof typeof NPC_DATA]?.title || '';
  };

  const unlockedNarrationCount = unlockedNarrations.length;
  const totalNarrationCount = Object.keys(LEVEL_MILESTONES).length;

  // Count total unlocked dialogues (sum of all dialogue IDs that are unlocked for each NPC)
  const totalUnlockedDialogues = Object.values(unlockedDialogues || {}).reduce((sum, npcData) => sum + Object.keys(npcData || {}).length, 0);
  const totalPossibleDialogues = Object.values(allDialogues || {}).reduce((sum, dialogues) => sum + dialogues.length, 0);

  return (
    <Modal title="Narrations & Dialogues" onClose={onClose}>
      <div className="narrations-modal">
        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid rgba(100, 150, 200, 0.2)', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('narrations')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'narrations' ? 'rgba(100, 150, 200, 0.3)' : 'transparent',
              border: activeTab === 'narrations' ? '1px solid rgba(100, 150, 200, 0.5)' : '1px solid rgba(100, 150, 200, 0.2)',
              borderRadius: '6px',
              color: activeTab === 'narrations' ? '#e0e0e0' : '#999',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: activeTab === 'narrations' ? 700 : 400,
            }}
          >
            Narrations
          </button>
          <button
            onClick={() => setActiveTab('dialogues')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'dialogues' ? 'rgba(100, 150, 200, 0.3)' : 'transparent',
              border: activeTab === 'dialogues' ? '1px solid rgba(100, 150, 200, 0.5)' : '1px solid rgba(100, 150, 200, 0.2)',
              borderRadius: '6px',
              color: activeTab === 'dialogues' ? '#e0e0e0' : '#999',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: activeTab === 'dialogues' ? 700 : 400,
            }}
          >
            Dialogues
          </button>
        </div>

        {/* Narrations Tab */}
        {activeTab === 'narrations' && (
          <>
            {/* Header stats */}
            <div className="narrations-header">
              <div className="narrations-stats">
                <div className="stat-box">
                  <div className="stat-number">{unlockedNarrationCount}</div>
                  <div className="stat-label">Unlocked</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">{totalNarrationCount}</div>
                  <div className="stat-label">Total</div>
                </div>
                <div className="stat-box">
                  <div className="stat-percentage">
                    {totalNarrationCount > 0 
                      ? Math.round((unlockedNarrationCount / totalNarrationCount) * 100)
                      : 0}%
                  </div>
                  <div className="stat-label">Completion</div>
                </div>
              </div>
            </div>

            {/* Narrations list */}
            <div className="narrations-list">
              {unlockedNarrations.length === 0 ? (
                <div className="no-narrations">
                  <p>No narrations unlocked yet. Reach level milestones to unlock narrations!</p>
                </div>
              ) : (
                unlockedNarrations.map(({ level, narration }) => (
                  <div key={level} className="narration-item">
                    {/* Icon and basic info */}
                    <div className="narration-icon">
                      <span className="icon-emoji">📖</span>
                    </div>

                    <div className="narration-content">
                      <div className="narration-title-row">
                        <h3 className="narration-title">Level {level}</h3>
                      </div>

                      {narration.context && (
                        <div className="narration-context">
                          {narration.context}
                        </div>
                      )}

                      <div className="narration-narrator">
                        <span className="narrator-label">
                          {narration.npc === 'eldran' && '👴 Eldran (The Watcher)'}
                          {narration.npc === 'lya' && '🗺️ Lya (The Scout)'}
                          {narration.npc === 'brak' && '🔨 Brak (The Smith)'}
                          {narration.npc === 'messenger' && '🎭 The Masked Messenger (Enigmatic)'}
                        </span>
                      </div>

                      <p className="narration-text">💭 "{narration.text}"</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Dialogues Tab */}
        {activeTab === 'dialogues' && (
          <>
            {/* Header stats */}
            <div className="narrations-header">
              <div className="narrations-stats">
                <div className="stat-box">
                  <div className="stat-number">{totalUnlockedDialogues}</div>
                  <div className="stat-label">Unlocked</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">{totalPossibleDialogues}</div>
                  <div className="stat-label">Total</div>
                </div>
                <div className="stat-box">
                  <div className="stat-percentage">
                    {totalPossibleDialogues > 0 ? Math.round((totalUnlockedDialogues / totalPossibleDialogues) * 100) : 0}%
                  </div>
                  <div className="stat-label">Completion</div>
                </div>
              </div>
            </div>

            {/* Dialogues list */}
            <div className="narrations-list">
              {totalUnlockedDialogues === 0 ? (
                <div className="no-narrations">
                  <p>No dialogues unlocked yet. Talk to NPCs at the Taverne to unlock dialogues!</p>
                </div>
              ) : (
                Object.entries(organizedDialogues).map(([npcId, dialogues]) => (
                  dialogues.length > 0 && (
                    <div key={npcId} style={{ marginBottom: '24px' }}>
                      <h3 style={{ color: '#9db3cc', fontSize: '14px', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
                        {NPC_NAMES[npcId] || npcId}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {dialogues.map((dialogue) => {
                          const unlockedChoices = (unlockedDialogues?.[npcId]?.[dialogue.id] || []);
                          const displayChoices = dialogue.choices?.filter(c => unlockedChoices.includes(c.id)) || [];
                          
                          return (
                            <div
                              key={dialogue.id}
                              style={{
                                padding: '12px',
                                backgroundColor: 'rgba(30, 40, 50, 0.6)',
                                border: '1px solid rgba(100, 150, 200, 0.2)',
                                borderRadius: '6px',
                              }}
                            >
                              <div style={{ fontSize: '11px', color: '#999', marginBottom: '6px', fontStyle: 'italic' }}>
                                {dialogue.type === 'player' ? 'You asked' : 'They asked'}
                              </div>
                              <div style={{ fontSize: '13px', color: '#e0e0e0', marginBottom: '8px', lineHeight: '1.6' }}>
                                <strong>Q:</strong> "{dialogue.question}"
                              </div>
                              <div style={{ fontSize: '13px', color: '#d0d0d0', lineHeight: '1.6' }}>
                                <strong>A:</strong> "{dialogue.response || (displayChoices.length > 0 ? '[Responses]' : '')}"
                              </div>
                              {displayChoices.length > 0 && (
                                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(100, 150, 200, 0.15)' }}>
                                  <div style={{ fontSize: '11px', color: '#999', marginBottom: '6px' }}>
                                    Your choices & her responses: ({displayChoices.length}/{dialogue.choices?.length || 0})
                                  </div>
                                  {displayChoices.map((choice) => (
                                    <div key={choice.id} style={{ fontSize: '12px', color: '#c0c0c0', marginBottom: '8px' }}>
                                      <div style={{ color: '#b0b0b0', marginBottom: '2px' }}>• {choice.text}</div>
                                      <div style={{ fontSize: '11px', color: '#a0a0a0', marginLeft: '16px', fontStyle: 'italic' }}>
                                        → "{choice.response}"
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
