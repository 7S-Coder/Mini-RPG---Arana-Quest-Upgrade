"use client";

import { useMemo } from "react";
import Modal from "./Modal";
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

interface DialoguesModalProps {
  unlockedDialogues: Record<string, Record<string, string[]>>;
  allDialogues: Record<string, SimpleDialogue[]>;
  onClose: () => void;
}

const NPC_NAMES: Record<string, string> = {
  lya: "Lya",
  eldran: "Eldran",
  brak: "Brak",
  messenger: "The Masked Messenger",
};

export default function DialoguesModal({ unlockedDialogues, allDialogues, onClose }: DialoguesModalProps) {
  // Organize unlocked dialogues by NPC
  const organizedDialogues = useMemo(() => {
    const result: Record<string, SimpleDialogue[]> = {};
    
    for (const [npcId, dialoguesData] of Object.entries(unlockedDialogues)) {
      const npcAllDialogues = allDialogues[npcId] || [];
      result[npcId] = npcAllDialogues.filter((d) => dialoguesData && d.id in dialoguesData);
    }
    
    return result;
  }, [unlockedDialogues, allDialogues]);

  const totalUnlocked = Object.values(unlockedDialogues || {}).reduce((sum, npcData) => sum + Object.keys(npcData || {}).length, 0);
  const totalPossible = Object.values(allDialogues).reduce((sum, dialogues) => sum + dialogues.length, 0);

  return (
    <Modal title="Dialogues" onClose={onClose}>
      <div className="narrations-modal">
        {/* Header stats */}
        <div className="narrations-header">
          <div className="narrations-stats">
            <div className="stat-box">
              <div className="stat-number">{totalUnlocked}</div>
              <div className="stat-label">Unlocked</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{totalPossible}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-box">
              <div className="stat-percentage">
                {totalPossible > 0 ? Math.round((totalUnlocked / totalPossible) * 100) : 0}%
              </div>
              <div className="stat-label">Completion</div>
            </div>
          </div>
        </div>

        {/* Dialogues organized by NPC */}
        <div className="narrations-list">
          {Object.entries(organizedDialogues).length === 0 ? (
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
                      const unlockedChoices = (unlockedDialogues[npcId]?.[dialogue.id] || []);
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
      </div>
    </Modal>
  );
}
