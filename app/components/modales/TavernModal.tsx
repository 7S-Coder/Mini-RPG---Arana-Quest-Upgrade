"use client";

import React, { useState } from 'react';
import Modal from './Modal';
import Image from 'next/image';

interface NPC {
  id: string;
  name: string;
  title: string;
  description: string;
  imagePath: string;
}

interface TavernModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerLevel: number;
}

const TAVERN_NPCS: NPC[] = [
  {
    id: 'lya',
    name: 'Lya',
    title: 'The Scout',
    description: 'Pragmatic and protective. Your mentor in the arena, guiding you through every lesson learned in blood and victory.',
    imagePath: '/assets/npcs/Lya.png',
  },
  {
    id: 'eldran',
    name: 'Eldran',
    title: 'The Watcher',
    description: 'Mysterious and cryptic. Knows more than he reveals, observing the patterns of fate with ancient eyes.',
    imagePath: '/assets/npcs/Eldran.png',
  },
  {
    id: 'brak',
    name: 'Brak',
    title: 'The Smith',
    description: 'Gruff but skilled. Masters the forge and crafting, transforming raw materials into legends.',
    imagePath: '/assets/npcs/Brak.png',
  },
  {
    id: 'messenger',
    name: 'The Messenger',
    title: 'Enigma',
    description: 'Unknown presence with mysterious motives. Appears and vanishes like smoke in the night.',
    imagePath: '/assets/npcs/Messenger.png',
  },
];

export default function TavernModal({ isOpen, onClose, playerLevel }: TavernModalProps) {
  const [selectedNPC, setSelectedNPC] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNPCClick = (npcId: string) => {
    setSelectedNPC(npcId);
    // TODO: Open dialogue with selected NPC
  };

  const handleBack = () => {
    setSelectedNPC(null);
  };

  if (selectedNPC) {
    const npc = TAVERN_NPCS.find((n) => n.id === selectedNPC);
    return (
      <Modal onClose={onClose} title={npc?.name || 'NPC'}>
        <div style={{ padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ 
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
            position: 'relative',
          }}>
            {npc && (
              <Image
                src={npc.imagePath}
                alt={npc.name}
                width={300}
                height={300}
                priority
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5))',
                }}
              />
            )}
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>
              {npc?.title}
            </div>
            <p style={{ fontSize: '13px', color: '#ccc', lineHeight: '1.7', margin: 0 }}>
              {npc?.description}
            </p>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
            <button
              className="btn primary"
              onClick={handleBack}
              style={{ flex: 1 }}
            >
              Back
            </button>
            <button
              className="btn primary"
              onClick={() => {
                // TODO: Start dialogue
              }}
              style={{ flex: 1 }}
            >
              Talk
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} title="The Tavern">
      <div style={{ padding: '1.5rem' }}>
        <p style={{ marginBottom: '1.5rem', color: '#aaa', fontSize: '0.8125rem', lineHeight: '1.6' }}>
          A warm refuge where adventurers gather. Connect with those who walk this path.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {TAVERN_NPCS.map((npc) => (
            <div
              key={npc.id}
              onClick={() => handleNPCClick(npc.id)}
              style={{
                position: 'relative',
                borderRadius: '0.625rem',
                backgroundColor: 'rgba(40, 50, 60, 0.5)',
                border: '2px solid rgba(150, 150, 150, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                aspectRatio: '1 / 1.4',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = '#a85638';
                el.style.boxShadow = '0 0.75rem 1.5rem rgba(0, 0, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = 'rgba(150, 150, 150, 0.2)';
                el.style.boxShadow = 'none';
              }}
            >
              {/* Background image */}
              <div style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 0,
              }}>
                <Image
                  src={npc.imagePath}
                  alt={npc.name}
                  fill
                  priority
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center top',
                  }}
                />
              </div>

              {/* Gradient overlay */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '100%',
                background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 40%, rgba(0, 0, 0, 0.8) 100%)',
                zIndex: 1,
              }} />

              {/* Text overlay */}
              <div style={{ 
                position: 'relative',
                zIndex: 2,
                width: '100%',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#fff' }}>
                  {npc.name}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--accent)', fontWeight: 600 }}>
                  {npc.title}
                </div>
                <div style={{ fontSize: '0.625rem', color: '#ddd', lineHeight: '1.3' }}>
                  {npc.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem', padding: '0.75rem', backgroundColor: 'rgba(50, 100, 150, 0.1)', borderRadius: '0.375rem', borderLeft: '3px solid rgba(100, 150, 200, 0.5)' }}>
          <p style={{ fontSize: '0.75rem', color: '#999', margin: 0 }}>
            <strong>💡 Tip:</strong> NPCs may be busy or unavailable. Return later to continue your conversations.
          </p>
        </div>
      </div>
    </Modal>
  );
}
