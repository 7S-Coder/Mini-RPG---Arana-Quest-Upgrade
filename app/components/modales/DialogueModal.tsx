'use client';

import React from 'react';
import { NarrativeMessage, NPC_DATA } from '../../game/templates/narration';

interface DialogueModalProps {
  message: NarrativeMessage | null;
  onClose: () => void;
}

export default function DialogueModal({ message, onClose }: DialogueModalProps) {
  if (!message) return null;

  const npcInfo = NPC_DATA[message.npc];

  return (
    <div
      className="app-modal-backdrop"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000000,
      }}
      onClick={onClose}
    >
      <div
        className="app-modal-panel"
        style={{
          position: 'relative',
          pointerEvents: 'auto',
          zIndex: 1000001,
          background: '#111',
          color: '#fff',
          padding: '24px',
          borderRadius: '12px',
          minWidth: '480px',
          maxWidth: '90%',
          maxHeight: '80%',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec NPC */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>{message.emoji}</span>
            <div>
              <h3 style={{ margin: '0', color: '#d8d8d8', fontSize: '18px' }}>
                {npcInfo.name}
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#9aa0a6', fontSize: '12px' }}>
                {npcInfo.title}
              </p>
            </div>
          </div>
          <button 
            className="close" 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9aa0a6',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Message */}
        <p
          style={{
            color: '#d8d8d8',
            fontSize: '14px',
            lineHeight: '1.6',
            margin: '0 0 20px 0',
            fontStyle: 'italic',
            borderLeft: '3px solid #ffffff',
            paddingLeft: '12px',
          }}
        >
          « {message.text} »
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#121214',
            color: '#ddd',
            border: '0',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1a1a1c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#121214';
          }}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
