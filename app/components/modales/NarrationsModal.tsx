"use client";

import { useMemo } from "react";
import Modal from "./Modal";
import type { NarrativeMessage } from "@/app/game/templates/narration";
import { LEVEL_MILESTONES, NPC_DATA } from "@/app/game/templates/narration";
import "../styles/narrationsModal.css";

interface NarrationsModalProps {
  unlockedLevels: number[];
  onClose: () => void;
}

/**
 * Narrations Modal Component
 * 
 * Displays all unlocked narrations organized by level milestone
 * Shows NPC name and narration text
 */

export default function NarrationsModal({ unlockedLevels, onClose }: NarrationsModalProps) {
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

  const getNPCName = (npcId: string): string => {
    return NPC_DATA[npcId as keyof typeof NPC_DATA]?.name || npcId;
  };

  const getNPCTitle = (npcId: string): string => {
    return NPC_DATA[npcId as keyof typeof NPC_DATA]?.title || '';
  };

  const unlockedCount = unlockedNarrations.length;
  const totalCount = Object.keys(LEVEL_MILESTONES).length;

  return (
    <Modal title="Narrations" onClose={onClose}>
      <div className="narrations-modal">
        {/* Header stats */}
        <div className="narrations-header">
          <div className="narrations-stats">
            <div className="stat-box">
              <div className="stat-number">{unlockedCount}</div>
              <div className="stat-label">Unlocked</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{totalCount}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-box">
              <div className="stat-percentage">
                {totalCount > 0 
                  ? Math.round((unlockedCount / totalCount) * 100)
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
      </div>
    </Modal>
  );
}
