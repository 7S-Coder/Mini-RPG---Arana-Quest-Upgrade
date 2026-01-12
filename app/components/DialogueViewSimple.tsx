"use client";

import React, { useState, useEffect } from 'react';

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

interface DialogueViewProps {
  npcName: string;
  npcId: string;
  onClose: () => void;
  dialogues: SimpleDialogue[];
  unlockDialogue?: (npcId: string, dialogueId: string) => void;
}

export default function DialogueView({ npcName, npcId, onClose, dialogues, unlockDialogue }: DialogueViewProps) {
  const [currentDialogue, setCurrentDialogue] = useState<SimpleDialogue | null>(null);
  const [stage, setStage] = useState<'question' | 'choice-selected' | 'response'>('question');
  const [chosenResponse, setChosenResponse] = useState<string>('');
  const [chosenResponseText, setChosenResponseText] = useState<string>('');
  const [initialized, setInitialized] = useState(false);

  // On mount, pick random dialogue (only once)
  useEffect(() => {
    if (!initialized && dialogues.length > 0) {
      const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
      setCurrentDialogue(randomDialogue);
      setInitialized(true);
    }
  }, [initialized, dialogues.length]); // Only depend on length, not the array itself

  const handleClose = () => {
    if (currentDialogue && unlockDialogue) {
      unlockDialogue(npcId, currentDialogue.id);
    }
    onClose();
  };

  if (!currentDialogue) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#aaa' }}>Starting conversation...</p>
      </div>
    );
  }

  // PLAYER ASKS
  if (currentDialogue.type === 'player') {
    if (stage === 'question') {
      return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '300px' }}>
          <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>*You ask Lya*</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <p style={{ fontSize: '16px', color: '#e0e0e0', lineHeight: '1.8' }}>
              "{currentDialogue.question}"
            </p>
          </div>
          <button
            onClick={() => setStage('response')}
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(100, 150, 200, 0.3)',
              border: '1px solid rgba(100, 150, 200, 0.5)',
              borderRadius: '6px',
              color: '#e0e0e0',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Listen to her response...
          </button>
        </div>
      );
    }

    if (stage === 'response') {
      return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '300px' }}>
          <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>*Lya responds*</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <p style={{ fontSize: '16px', color: '#e0e0e0', lineHeight: '1.8' }}>
              "{currentDialogue.response}"
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(100, 150, 200, 0.3)',
              border: '1px solid rgba(100, 150, 200, 0.5)',
              borderRadius: '6px',
              color: '#e0e0e0',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Continue...
          </button>
        </div>
      );
    }
  }

  // NPC ASKS
  if (currentDialogue.type === 'npc') {
    if (stage === 'question') {
      return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '300px' }}>
          <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>*Lya asks*</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <p style={{ fontSize: '16px', color: '#e0e0e0', lineHeight: '1.8' }}>
              "{currentDialogue.question}"
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentDialogue.choices?.map((choice) => (
              <button
                key={choice.id}
                onClick={() => {
                  setChosenResponse(choice.response);
                  setChosenResponseText(choice.text);
                  setStage('choice-selected');
                }}
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(100, 150, 200, 0.2)',
                  border: '1px solid rgba(100, 150, 200, 0.4)',
                  borderRadius: '6px',
                  color: '#e0e0e0',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {choice.text}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (stage === 'choice-selected') {
      return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '300px' }}>
          <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>*You answer*</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <p style={{ fontSize: '16px', color: '#e0e0e0', lineHeight: '1.8' }}>
              "{chosenResponseText}"
            </p>
          </div>
          <button
            onClick={() => setStage('response')}
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(100, 150, 200, 0.3)',
              border: '1px solid rgba(100, 150, 200, 0.5)',
              borderRadius: '6px',
              color: '#e0e0e0',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Listen to her response...
          </button>
        </div>
      );
    }

    if (stage === 'response') {
      return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '300px' }}>
          <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>*Lya responds*</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <p style={{ fontSize: '16px', color: '#e0e0e0', lineHeight: '1.8' }}>
              "{chosenResponse}"
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(100, 150, 200, 0.3)',
              border: '1px solid rgba(100, 150, 200, 0.5)',
              borderRadius: '6px',
              color: '#e0e0e0',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Continue...
          </button>
        </div>
      );
    }
  }

  return null;
}
