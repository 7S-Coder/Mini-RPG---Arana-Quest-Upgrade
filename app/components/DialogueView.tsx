"use client";

import React, { useState, useEffect } from 'react';
import { useRelationships } from '@/app/game/uses/useRelationships';
import { LYA_DIALOGUES } from '@/app/game/templates/dialogues/lya';
import type { DialogueNode } from '@/app/game/templates/relationships/types';

interface DialogueViewProps {
  npcId: 'lya' | 'eldran' | 'brak' | 'messenger';
  npcName: string;
  onClose: () => void;
  dialogueNodes: DialogueNode[];
}

export default function DialogueView({ npcId, npcName, onClose, dialogueNodes }: DialogueViewProps) {
  const { getNPC, applyChoice, markConversationSeen, meetsRequirements, getRelationshipLevel } = useRelationships();
  const [currentDialogueId, setCurrentDialogueId] = useState<string | null>(null);
  const [conversationStarted, setConversationStarted] = useState(false);

  const npc = getNPC(npcId);

  // Separate NPC-initiated and player-initiated dialogues
  const npcInitiated = dialogueNodes.filter((d) => !d.initiatedBy || d.initiatedBy === 'npc');
  const playerInitiated = dialogueNodes.filter((d) => d.initiatedBy === 'player');

  // Start with random dialogue (either NPC-initiated or player-initiated)
  useEffect(() => {
    if (!conversationStarted && dialogueNodes.length > 0) {
      // Choose randomly between NPC or player initiated
      const availableCategories = [
        npcInitiated.length > 0 ? 'npc' : null,
        playerInitiated.length > 0 ? 'player' : null,
      ].filter(Boolean) as string[];

      if (availableCategories.length > 0) {
        const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        const selectedArray = randomCategory === 'npc' ? npcInitiated : playerInitiated;
        const randomDialogue = selectedArray[Math.floor(Math.random() * selectedArray.length)];
        setCurrentDialogueId(randomDialogue.id);
      }
      setConversationStarted(true);
    }
  }, [conversationStarted, dialogueNodes, npcInitiated, playerInitiated]);

  const currentDialogue = dialogueNodes.find((d) => d.id === currentDialogueId);

  // Get the appropriate variant based on current relationship
  const getCurrentVariant = () => {
    if (!currentDialogue || !npc) return null;

    // Find variant matching requirements
    for (const variant of currentDialogue.variants) {
      if (!variant.requirements) {
        return variant; // Default variant without requirements
      }

      if (meetsRequirements(npcId, variant.requirements)) {
        return variant;
      }
    }

    // Fallback to first variant
    return currentDialogue.variants[0];
  };

  const currentVariant = getCurrentVariant();

  // Get available choices (filter by requirements)
  const getAvailableChoices = () => {
    if (!currentDialogue?.choices) return [];

    return currentDialogue.choices.filter((choice) => {
      if (!choice.requirements) return true;
      return meetsRequirements(npcId, choice.requirements);
    });
  };

  const availableChoices = getAvailableChoices();

  // Handle choice selection
  const handleChoice = (choiceId: string) => {
    const choice = currentDialogue?.choices?.find((c) => c.id === choiceId);
    if (!choice) return;

    // Apply relationship changes with dialogue ID for stat lookup
    applyChoice(npcId, choice, currentDialogueId || undefined);

    // Mark conversation as seen
    if (currentDialogueId) {
      markConversationSeen(npcId, currentDialogueId);
    }

    // Move to next dialogue
    if (choice.nextDialogueId) {
      // Follow the linked dialogue
      setCurrentDialogueId(choice.nextDialogueId);
    } else {
      // Fallback: try to find next in sequence
      const currentIndex = dialogueNodes.findIndex((d) => d.id === currentDialogueId);
      if (currentIndex < dialogueNodes.length - 1) {
        setCurrentDialogueId(dialogueNodes[currentIndex + 1].id);
      } else {
        // No more dialogues - end conversation
        onClose();
      }
    }
  };

  if (!currentDialogue || !currentVariant || !npc) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#aaa' }}>Error loading dialogue...</p>
        <button className="btn primary" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  // Get relationship level for display
  const trustLevel = getRelationshipLevel(npcId, 'trust');
  const affectionLevel = getRelationshipLevel(npcId, 'affection');

  return (
    <div style={{ padding: '24px', minHeight: '500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Relationship Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          padding: '12px',
          backgroundColor: 'rgba(50, 100, 150, 0.1)',
          borderRadius: '8px',
          borderLeft: '3px solid rgba(100, 150, 200, 0.5)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>TRUST</div>
          <div style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700 }}>{npc.trust}</div>
          <div style={{ fontSize: '10px', color: '#999' }}>{trustLevel}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>AFFECTION</div>
          <div style={{ fontSize: '13px', color: '#ff6b9d', fontWeight: 700 }}>{npc.affection}</div>
          <div style={{ fontSize: '10px', color: '#999' }}>{affectionLevel}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>ANGER</div>
          <div style={{ fontSize: '13px', color: '#ff6b6b', fontWeight: 700 }}>{npc.anger}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>INTIMACY</div>
          <div style={{ fontSize: '13px', color: '#ff9f5a', fontWeight: 700 }}>{npc.intimacy}</div>
        </div>
      </div>

      {/* Dialogue Text */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'rgba(30, 40, 50, 0.6)',
          borderRadius: '8px',
          borderLeft: '4px solid var(--accent)',
          flex: 1,
        }}
      >
        {currentVariant.contextAction && (
          <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic', marginBottom: '12px' }}>
            {currentVariant.contextAction}
          </div>
        )}
        <p style={{ fontSize: '14px', color: '#e0e0e0', lineHeight: '1.8', margin: 0 }}>
          "{currentVariant.text}"
        </p>
      </div>

      {/* Choices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {availableChoices.length > 0 ? (
          availableChoices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleChoice(choice.id)}
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(100, 150, 200, 0.2)',
                border: '1px solid rgba(100, 150, 200, 0.4)',
                borderRadius: '6px',
                color: '#e0e0e0',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(100, 150, 200, 0.4)';
                e.currentTarget.style.borderColor = 'rgba(100, 150, 200, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(100, 150, 200, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(100, 150, 200, 0.4)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{choice.text}</span>
                <span style={{ fontSize: '11px', color: '#999' }}>
                  {choice.effects.trust ? `+${choice.effects.trust} Trust` : ''}
                  {choice.effects.affection && choice.effects.trust ? ' • ' : ''}
                  {choice.effects.affection ? `+${choice.effects.affection} Affection` : ''}
                </span>
              </div>
            </button>
          ))
        ) : (
          <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>No available responses...</p>
        )}
      </div>

      {/* Bottom Actions */}
      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
        <button className="btn primary" onClick={onClose} style={{ flex: 1 }}>
          Close Conversation
        </button>
      </div>
    </div>
  );
}
