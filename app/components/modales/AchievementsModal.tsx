"use client";

import { useMemo, useState } from "react";
import Modal from "./Modal";
import type { Achievement } from "@/app/game/types";
import "../styles/achievementsModal.css";
import EssenceSVG from "@/app/assets/essence.svg";
import GoldSVG from "@/app/assets/gold.svg";

interface AchievementsModalProps {
  achievements: Record<string, Achievement>;
  onClose: () => void;
}

/**
 * Achievements Modal Component
 * 
 * Displays all achievements with:
 * - Category filters (Combat, Exploration, Boss, Dungeon, Special, Narrative)
 * - Locked/Unlocked state
 * - Lore visible only after unlock
 * - Reward information
 */

export default function AchievementsModal({ achievements, onClose }: AchievementsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const ach of Object.values(achievements)) {
      if ((ach as any).category && !(ach as any).hidden) {
        cats.add((ach as any).category as string);
      }
    }
    return Array.from(cats).sort();
  }, [achievements]);

  // Filter achievements by category and visibility
  const filteredAchievements = useMemo(() => {
    const filtered = Object.values(achievements)
      .filter((ach: any) => {
        // Hide hidden achievements that aren't unlocked
        if (ach.hidden && !ach.unlocked) {
          return false;
        }
        // Filter by category
        if (selectedCategory && ach.category !== selectedCategory) {
          return false;
        }
        return true;
      })
      .sort((a: any, b: any) => {
        // Unlocked first, then by title
        if (a.unlocked !== b.unlocked) {
          return a.unlocked ? -1 : 1;
        }
        return (a.title || "").localeCompare(b.title || "");
      });

    return filtered;
  }, [achievements, selectedCategory]);

  const unlockedCount = useMemo(() => {
    return Object.values(achievements).filter((a: any) => a.unlocked).length;
  }, [achievements]);

  const totalCount = useMemo(() => {
    return Object.values(achievements).filter((a: any) => !a.hidden).length;
  }, [achievements]);

  return (
    <Modal title="🏆 Achievements" onClose={onClose}>
      <div className="achievements-modal">
        {/* Header stats */}
        <div className="achievements-header">
          <div className="achievement-stats">
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
                {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
              </div>
              <div className="stat-label">Completion</div>
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div className="achievements-filters">
          <button
            className={`filter-btn ${selectedCategory === null ? "active" : ""}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {categories.map((cat: string) => (
            <button
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Achievements list */}
        <div className="achievements-list">
          {filteredAchievements.length === 0 ? (
            <div className="no-achievements">
              <p>No achievements in this category yet.</p>
            </div>
          ) : (
            filteredAchievements.map((ach: any) => (
              <div
                key={ach.id}
                className={`achievement-item ${ach.unlocked ? "unlocked" : "locked"}`}
              >
                {/* Icon and basic info */}
                <div className="achievement-icon">
                  {ach.unlocked ? (
                    <span className="icon-emoji">{ach.icon || "🎯"}</span>
                  ) : (
                    <span className="icon-locked">🔒</span>
                  )}
                </div>

                <div className="achievement-content">
                  <div className="achievement-title-row">
                    <h3 className="achievement-title">{ach.title}</h3>
                    {ach.unlocked && ach.unlockedAt && (
                      <span className="unlocked-date">
                        {new Date(ach.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <p className="achievement-description">{ach.description}</p>

                  {/* Lore visible only after unlock */}
                  {ach.unlocked && (
                    <>
                      {ach.narrator && (
                        <div className="achievement-narrator">
                          <span className="narrator-label">
                            {ach.narrator === 'eldran' && '👴 Eldran (The Watcher)'}
                            {ach.narrator === 'lya' && '🗺️ Lya (The Scout)'}
                            {ach.narrator === 'brak' && '🔨 Brak (The Smith)'}
                            {ach.narrator === 'messenger' && '🎭 The Masked Messenger (Enigmatic)'}
                          </span>
                        </div>
                      )}
                      <p className="achievement-lore">💭 "{ach.lore}"</p>
                    </>
                  )}

                  {/* Reward info */}
                  <div className="achievement-reward">
                    {ach.reward.gold && (
                      <span className="reward-item reward-gold">
                        <img src={GoldSVG.src} alt="gold" style={{ width: 16, height: 16 }} />
                        +{ach.reward.gold}
                      </span>
                    )}
                    {ach.reward.essence && (
                      <span className="reward-item reward-essence">
                        <img src={EssenceSVG.src} alt="essence" style={{ width: 16, height: 16 }} />
                        +{ach.reward.essence}
                      </span>
                    )}
                    {ach.reward.passiveBonus && (
                      <span className="reward-item reward-bonus">
                        Passive Bonus
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
