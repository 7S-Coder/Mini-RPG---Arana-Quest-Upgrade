"use client";

import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Image from 'next/image';
import {
  TAVERN_TOPICS,
  MAX_TOPICS_PER_VISIT,
  MESSENGER_APPEARANCE_CHANCE,
  isTopicUnlocked,
  pickDialogueForTopic,
  type TavernTopic,
  type TavernTopicDialogue,
  type ProgressionStats,
} from '../../game/templates/dialogues/tavernTopics';
import type { Achievement } from '../../game/types';

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
  lyaStats?: { trust: number; affection: number };
  unlockDialogue?: (npcId: string, dialogueId: string, choiceId?: string) => void;
  unlockedDialogues?: Record<string, Record<string, string[]>>;
  progressionStats?: ProgressionStats;
  achievements?: Record<string, Achievement>;
}

/** Achievement lore entries displayed as NPC memories in the topic list */
interface MemoryEntry {
  achievementId: string;
  title: string;
  context?: string;
  lore: string;
}

const TAVERN_NPCS: NPC[] = [
  {
    id: 'lya',
    name: 'Lya',
    title: 'The Scout',
    description: 'Memory of the terrain and the danger. She has bled for her knowledge.',
    imagePath: '/assets/npcs/Lya.png',
  },
  {
    id: 'brak',
    name: 'Brak',
    title: 'The Smith',
    description: 'Understands weapons like most people understand words. Direct and precise.',
    imagePath: '/assets/npcs/Brak.png',
  },
  {
    id: 'eldran',
    name: 'Eldran',
    title: 'The Watcher',
    description: 'Guardian of lore and secrets. Knows more than he reveals.',
    imagePath: '/assets/npcs/Eldran.png',
  },
  {
    id: 'messenger',
    name: 'The Messenger',
    title: 'Enigma',
    description: 'Rare presence. Appears and vanishes like smoke. Always worth listening to.',
    imagePath: '/assets/npcs/Messenger.png',
  },
];

const EMPTY_STATS: ProgressionStats = { bossesDefeated: {}, totalBattlesWon: 0 };

export default function TavernModal({
  isOpen,
  onClose,
  playerLevel,
  unlockDialogue,
  unlockedDialogues = {},
  progressionStats = EMPTY_STATS,
  achievements = {},
}: TavernModalProps) {

  /** Get unlocked achievement lore entries narrated by this NPC */
  const getMemories = (npcId: string): MemoryEntry[] => {
    return Object.values(achievements)
      .filter((a) => a.narrator === npcId && a.unlocked && a.lore)
      .map((a) => ({ achievementId: a.id, title: a.title, context: a.context, lore: a.lore }));
  };
  const [selectedNPC, setSelectedNPC] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<TavernTopic | null>(null);
  const [currentDialogue, setCurrentDialogue] = useState<TavernTopicDialogue | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<MemoryEntry | null>(null);
  const [visitInteractions, setVisitInteractions] = useState<Record<string, number>>({});

  const messengerPresentRef = useRef<boolean>(false);
  const initialisedRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen && !initialisedRef.current) {
      messengerPresentRef.current = Math.random() < MESSENGER_APPEARANCE_CHANCE;
      initialisedRef.current = true;
    }
    if (!isOpen) {
      setSelectedNPC(null);
      setSelectedTopic(null);
      setCurrentDialogue(null);
      setSelectedMemory(null);
      setVisitInteractions({});
      initialisedRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const messengerPresent = messengerPresentRef.current;
  const interactionsLeft = (npcId: string) => MAX_TOPICS_PER_VISIT - (visitInteractions[npcId] ?? 0);

  const handleSelectNPC = (npcId: string) => {
    if (npcId === 'messenger' && !messengerPresent) return;
    setSelectedNPC(npcId);
    setSelectedTopic(null);
    setCurrentDialogue(null);
    setSelectedMemory(null);
  };

  const handleSelectMemory = (memory: MemoryEntry) => {
    setSelectedMemory(memory);
  };

  const handleSelectTopic = (topic: TavernTopic) => {
    if (!selectedNPC) return;
    const dialogue = pickDialogueForTopic(topic, selectedNPC, unlockedDialogues);
    setSelectedTopic(topic);
    setCurrentDialogue(dialogue);
  };

  const handleFinishDialogue = () => {
    if (!selectedNPC || !currentDialogue) return;
    if (unlockDialogue) unlockDialogue(selectedNPC, currentDialogue.id);
    setVisitInteractions((prev) => ({ ...prev, [selectedNPC]: (prev[selectedNPC] ?? 0) + 1 }));
    setSelectedTopic(null);
    setCurrentDialogue(null);
  };

  const handleBack = () => {
    if (selectedMemory) {
      setSelectedMemory(null);
    } else if (currentDialogue) {
      setSelectedTopic(null);
      setCurrentDialogue(null);
    } else {
      setSelectedNPC(null);
    }
  };

  // ── VIEW: Memory (achievement lore) ──────────────────────────────────────
  if (selectedNPC && selectedMemory) {
    const npc = TAVERN_NPCS.find((n) => n.id === selectedNPC)!;
    return (
      <Modal onClose={onClose} title={npc.name}>
        <div style={styles.dialogueContainer}>
          <div style={styles.memoryBadge}>
            Memory — {selectedMemory.title}
          </div>
          {selectedMemory.context && (
            <div style={styles.memoryContext}>{selectedMemory.context}</div>
          )}
          <div style={styles.npcResponseBox}>
            <span style={styles.npcLabel}>{npc.name}:</span>
            <p style={styles.npcText}>"{selectedMemory.lore}"</p>
          </div>
          <div style={styles.dialogueActions}>
            <button className="btn" onClick={handleBack} style={styles.btnSecondary}>← Back</button>
          </div>
        </div>
      </Modal>
    );
  }

  // ── VIEW: Dialogue ────────────────────────────────────────────────────────
  if (selectedNPC && selectedTopic && currentDialogue) {
    const npc = TAVERN_NPCS.find((n) => n.id === selectedNPC)!;
    return (
      <Modal onClose={onClose} title={npc.name}>
        <div style={styles.dialogueContainer}>
          <div style={styles.promptBox}>
            <span style={styles.promptLabel}>You ask:</span>
            <p style={styles.promptText}>"{currentDialogue.playerPrompt}"</p>
          </div>
          <div style={styles.npcResponseBox}>
            <span style={styles.npcLabel}>{npc.name} responds:</span>
            <p style={styles.npcText}>"{currentDialogue.npcText}"</p>
          </div>
          <div style={styles.dialogueActions}>
            <button className="btn" onClick={handleBack} style={styles.btnSecondary}>← Back</button>
            <button className="btn primary" onClick={handleFinishDialogue} style={styles.btnPrimary}>Understood</button>
          </div>
        </div>
      </Modal>
    );
  }

  // ── VIEW: Topic list ──────────────────────────────────────────────────────
  if (selectedNPC) {
    const npc = TAVERN_NPCS.find((n) => n.id === selectedNPC)!;
    const topics = TAVERN_TOPICS[selectedNPC] ?? [];
    const left = interactionsLeft(selectedNPC);
    const exhausted = left <= 0;
    const memories = getMemories(selectedNPC);

    return (
      <Modal onClose={onClose} title={npc.name}>
        <div style={styles.topicContainer}>
          <div style={styles.npcStrip}>
            <div style={styles.npcPortraitWrap}>
              <Image src={npc.imagePath} alt={npc.name} width={80} height={80} style={styles.npcPortrait} priority />
            </div>
            <div>
              <div style={styles.npcStripName}>{npc.name}</div>
              <div style={styles.npcStripTitle}>{npc.title}</div>
              <div style={styles.npcStripDesc}>{npc.description}</div>
            </div>
          </div>

          <div style={{ ...styles.interactionBadge, ...(exhausted ? styles.interactionBadgeExhausted : {}) }}>
            {exhausted
              ? `${npc.name} has nothing more to add for now.`
              : `${left} topic${left > 1 ? 's' : ''} remaining this visit`}
          </div>

          <div style={styles.topicList}>
            {topics.map((topic) => {
              const unlocked = isTopicUnlocked(topic, playerLevel, progressionStats);
              const disabled = !unlocked || exhausted;
              const lockHint = !unlocked ? buildLockHint(topic, playerLevel, progressionStats) : null;
              return (
                <button
                  key={topic.id}
                  onClick={() => !disabled && handleSelectTopic(topic)}
                  disabled={disabled}
                  style={{ ...styles.topicButton, ...(disabled ? styles.topicButtonLocked : styles.topicButtonAvailable) }}
                >
                  <span style={styles.topicLabel}>{topic.label}</span>
                  {lockHint && <span style={styles.lockHint}>{lockHint}</span>}
                </button>
              );
            })}
          </div>

          {memories.length > 0 && (
            <>
              <div style={styles.memoriesDivider}>Memories</div>
              <div style={styles.topicList}>
                {memories.map((memory) => (
                  <button
                    key={memory.achievementId}
                    onClick={() => handleSelectMemory(memory)}
                    style={{ ...styles.topicButton, ...styles.topicButtonMemory }}
                  >
                    <span style={styles.topicLabel}>✦ {memory.title}</span>
                    <span style={styles.memoryHint}>Achievement</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <button className="btn" onClick={handleBack} style={{ ...styles.btnSecondary, marginTop: 8 }}>← Back</button>
        </div>
      </Modal>
    );
  }

  // ── VIEW: NPC grid ────────────────────────────────────────────────────────
  return (
    <Modal onClose={onClose} title="The Tavern">
      <div style={{ padding: '1.5rem' }}>
        <p style={styles.tavernIntro}>A warm refuge between battles. Speak with those who know this world.</p>

        <div style={styles.npcGrid}>
          {TAVERN_NPCS.map((npc) => {
            const isAbsent = npc.id === 'messenger' && !messengerPresent;
            return (
              <div
                key={npc.id}
                onClick={() => handleSelectNPC(npc.id)}
                style={{ ...styles.npcCard, ...(isAbsent ? styles.npcCardAbsent : styles.npcCardPresent) }}
                onMouseEnter={(e) => {
                  if (!isAbsent) {
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#a85638';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0.75rem 1.5rem rgba(0,0,0,0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = isAbsent ? 'rgba(100,100,100,0.15)' : 'rgba(150,150,150,0.2)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                <div style={styles.npcCardImageWrap}>
                  <Image
                    src={npc.imagePath}
                    alt={npc.name}
                    fill
                    sizes="160px"
                    priority
                    style={{ objectFit: 'cover', objectPosition: 'center top', opacity: isAbsent ? 0.35 : 1, filter: isAbsent ? 'grayscale(80%)' : 'none' }}
                  />
                </div>
                <div style={styles.npcCardGradient} />
                <div style={styles.npcCardText}>
                  <div style={styles.npcCardName}>{npc.name}</div>
                  <div style={styles.npcCardTitle}>{npc.title}</div>
                  {isAbsent && <div style={styles.npcCardAbsentLabel}>Not here tonight</div>}
                </div>
              </div>
            );
          })}
        </div>

        {messengerPresent && (
          <div style={styles.messengerHint}>
            A stranger lingers in the corner tonight. Speak to them while you can.
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── Lock hint ─────────────────────────────────────────────────────────────────

function buildLockHint(topic: TavernTopic, playerLevel: number, stats: ProgressionStats): string {
  const cond = topic.unlockCondition;
  if (!cond) return '';
  if (cond.minLevel && playerLevel < cond.minLevel) return `Requires level ${cond.minLevel}`;
  if (cond.minBossesDefeated) {
    const total = Object.values(stats.bossesDefeated).reduce((a, b) => a + b, 0);
    if (total < cond.minBossesDefeated) return `Defeat ${cond.minBossesDefeated} boss${cond.minBossesDefeated > 1 ? 'es' : ''} first`;
  }
  if (cond.minBattleWins && stats.totalBattlesWon < cond.minBattleWins) return `Win ${cond.minBattleWins} battles first`;
  return 'Locked';
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  tavernIntro: { marginBottom: '1.25rem', color: '#aaa', fontSize: '0.8125rem', lineHeight: '1.6' },
  npcGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  npcCard: { position: 'relative', borderRadius: '0.625rem', border: '2px solid rgba(150,150,150,0.2)', overflow: 'hidden', aspectRatio: '1 / 1.4', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', transition: 'all 0.25s ease' },
  npcCardPresent: { backgroundColor: 'rgba(40,50,60,0.5)', cursor: 'pointer' },
  npcCardAbsent: { backgroundColor: 'rgba(25,25,25,0.5)', cursor: 'default', border: '2px solid rgba(100,100,100,0.15)' },
  npcCardImageWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 },
  npcCardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.82) 100%)', zIndex: 1 },
  npcCardText: { position: 'relative', zIndex: 2, width: '100%', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  npcCardName: { fontWeight: 700, fontSize: '0.8125rem', color: '#fff' },
  npcCardTitle: { fontSize: '0.6875rem', color: 'var(--accent)', fontWeight: 600 },
  npcCardAbsentLabel: { fontSize: '0.625rem', color: '#777', fontStyle: 'italic', marginTop: 2 },
  messengerHint: { marginTop: '1rem', padding: '0.6rem 0.875rem', backgroundColor: 'rgba(168,86,56,0.1)', borderLeft: '3px solid rgba(168,86,56,0.5)', borderRadius: '0.375rem', fontSize: '0.75rem', color: '#c98', fontStyle: 'italic' },
  topicContainer: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  npcStrip: { display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  npcPortraitWrap: { flexShrink: 0, width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(168,86,56,0.5)' },
  npcPortrait: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' } as React.CSSProperties,
  npcStripName: { fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: 2 },
  npcStripTitle: { fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 },
  npcStripDesc: { fontSize: '0.75rem', color: '#aaa', lineHeight: 1.5 },
  interactionBadge: { padding: '0.4rem 0.75rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(100,150,200,0.12)', color: '#8ab', border: '1px solid rgba(100,150,200,0.25)' },
  interactionBadgeExhausted: { backgroundColor: 'rgba(100,100,100,0.12)', color: '#777', border: '1px solid rgba(100,100,100,0.2)', fontStyle: 'italic', fontWeight: 400 },
  topicList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  topicButton: { width: '100%', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, transition: 'background 0.2s ease', fontFamily: 'inherit' },
  topicButtonAvailable: { backgroundColor: 'rgba(50,70,90,0.5)', borderColor: 'rgba(100,150,200,0.3)', color: '#e0e0e0' },
  topicButtonLocked: { backgroundColor: 'rgba(30,30,30,0.4)', borderColor: 'rgba(100,100,100,0.2)', color: '#555', cursor: 'not-allowed' },
  topicLabel: { fontSize: '0.875rem', fontWeight: 600 },
  lockHint: { fontSize: '0.6875rem', color: '#666', fontStyle: 'italic', flexShrink: 0 },
  dialogueContainer: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: '320px' },
  promptBox: { padding: '0.75rem 1rem', backgroundColor: 'rgba(100,150,200,0.08)', borderRadius: 8, border: '1px solid rgba(100,150,200,0.2)' },
  promptLabel: { display: 'block', fontSize: '0.6875rem', color: '#8ab', marginBottom: 6, fontStyle: 'italic' },
  promptText: { margin: 0, fontSize: '0.9375rem', color: '#c8d8e8', lineHeight: 1.7, fontStyle: 'italic' },
  npcResponseBox: { flex: 1, padding: '0.875rem 1rem', backgroundColor: 'rgba(168,86,56,0.07)', borderRadius: 8, border: '1px solid rgba(168,86,56,0.2)' },
  npcLabel: { display: 'block', fontSize: '0.6875rem', color: 'var(--accent)', marginBottom: 8, fontWeight: 600 },
  npcText: { margin: 0, fontSize: '0.9375rem', color: '#e8e0d0', lineHeight: 1.8 },
  dialogueActions: { display: 'flex', gap: '0.75rem', marginTop: 'auto' },
  btnPrimary: { flex: 1 },
  btnSecondary: { flex: '0 0 auto' },
  memoryBadge: { display: 'inline-flex', alignSelf: 'flex-start', padding: '0.25rem 0.625rem', borderRadius: 20, backgroundColor: 'rgba(168,86,56,0.15)', border: '1px solid rgba(168,86,56,0.3)', fontSize: '0.6875rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' as const },
  memoryContext: { fontSize: '0.8125rem', color: '#999', fontStyle: 'italic', paddingLeft: '0.25rem', borderLeft: '2px solid rgba(255,255,255,0.1)' },
  memoriesDivider: { fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'rgba(168,86,56,0.7)', borderBottom: '1px solid rgba(168,86,56,0.2)', paddingBottom: '0.375rem', marginTop: '0.25rem' },
  topicButtonMemory: { backgroundColor: 'rgba(168,86,56,0.07)', borderColor: 'rgba(168,86,56,0.25)', color: '#c8a882', cursor: 'pointer' },
  memoryHint: { fontSize: '0.6875rem', color: 'rgba(168,86,56,0.6)', fontStyle: 'italic', flexShrink: 0 },
};
