/**
 * Tavern Hub – Structured Topic Dialogues
 *
 * Each NPC has a fixed set of topics (categories).
 * Topics can be locked behind progression conditions.
 * Each topic holds several rotating dialogues picked in order (first unseen first).
 */

export interface TavernTopicDialogue {
  id: string;
  playerPrompt: string;
  npcText: string;
}

export interface TopicUnlockCondition {
  minLevel?: number;
  /** Total number of bosses defeated across all encounters */
  minBossesDefeated?: number;
  /** Minimum number of battles won */
  minBattleWins?: number;
}

export interface TavernTopic {
  id: string;
  label: string;
  unlockCondition?: TopicUnlockCondition;
  dialogues: TavernTopicDialogue[];
}

// ─── LYA — Memory of terrain & danger ──────────────────────────────────────

const LYA_TOPICS: TavernTopic[] = [
  {
    id: 'lya_story',
    label: 'Your story',
    dialogues: [
      {
        id: 'lya_story_1',
        playerPrompt: 'Who are you really, Lya?',
        npcText:
          'A scout from the northern mountain clans before they were razed. I survived by running first and asking questions later. Eventually, I had to stop running and face what was following me.',
      },
      {
        id: 'lya_story_2',
        playerPrompt: 'What brought you to this tavern?',
        npcText:
          'I was looking for someone. Found a war instead. This place is as good as any to wait and see how it ends.',
      },
      {
        id: 'lya_story_3',
        playerPrompt: 'Do you miss the north?',
        npcText:
          'I miss the silence. Up there, danger announces itself. Here everything is noise and politics. Harder to read. Harder to trust.',
      },
    ],
  },
  {
    id: 'lya_enemies',
    label: 'Tell me about enemies',
    dialogues: [
      {
        id: 'lya_enemies_1',
        playerPrompt: 'What should I know about the enemies out there?',
        npcText:
          'Fast enemies drain you. If you can\'t end it quickly, they\'ll bleed you over ten exchanges. Pressure them hard at the start — don\'t let them set the pace.',
      },
      {
        id: 'lya_enemies_2',
        playerPrompt: 'Any type of enemy I should fear?',
        npcText:
          'Armored enemies are slow but they punish every mistake. Don\'t dodge carelessly — their strikes are heavy enough to break your rhythm. Stay patient, wait for the opening.',
      },
      {
        id: 'lya_enemies_3',
        playerPrompt: 'What are common enemy patterns?',
        npcText:
          'Most enemies telegraph aggression. When you see one hesitate, that\'s your window. Strike before they reset. Hesitation kills faster than any weapon.',
      },
      {
        id: 'lya_enemies_4',
        playerPrompt: 'How does enemy rage work?',
        npcText:
          'When an enemy rages, it\'s not just stronger — it\'s desperate. Desperate enemies make bigger mistakes. Let them burn out, then finish it.',
      },
    ],
  },
  {
    id: 'lya_bosses',
    label: 'Tell me about bosses',
    unlockCondition: { minBossesDefeated: 1 },
    dialogues: [
      {
        id: 'lya_bosses_1',
        playerPrompt: 'You\'ve faced bosses before?',
        npcText:
          'A few. They all share one trait: patience is their weakness. They want you to panic. If you don\'t, they open up eventually. Every boss has a rhythm — find it.',
      },
      {
        id: 'lya_bosses_2',
        playerPrompt: 'How do you survive a boss encounter?',
        npcText:
          'Don\'t trade damage early. Let them show you what they can do first. Boss patterns are learnable. Their opening move is never their last trick.',
      },
      {
        id: 'lya_bosses_3',
        playerPrompt: 'Any advice for the toughest fights?',
        npcText:
          'Durability beats raw offense against bosses. A consistent attack rhythm will outlast a flashy one that burns your stamina in the first minute.',
      },
    ],
  },
  {
    id: 'lya_survival',
    label: 'Survival advice',
    unlockCondition: { minLevel: 5 },
    dialogues: [
      {
        id: 'lya_survival_1',
        playerPrompt: 'What\'s the most important survival rule?',
        npcText:
          'Know when to flee. Pride kills more fighters than steel. A retreat is a repositioning — not a defeat. Come back when the odds shift.',
      },
      {
        id: 'lya_survival_2',
        playerPrompt: 'How do I avoid fatal mistakes?',
        npcText:
          'Stop attacking when you\'re winning cleanly. Overextension is the most common death out there. Finish the exchange and step back. Don\'t get greedy.',
      },
      {
        id: 'lya_survival_3',
        playerPrompt: 'How do I manage a long run?',
        npcText:
          'Don\'t spend everything on the first fight. Conserve. The arena rewards endurance more than brilliance. Brilliance fades. Endurance wins.',
      },
    ],
  },
];

// ─── BRAK — Mentor mechanic, weapon authority ───────────────────────────────

const BRAK_TOPICS: TavernTopic[] = [
  {
    id: 'brak_story',
    label: 'Your story',
    dialogues: [
      {
        id: 'brak_story_1',
        playerPrompt: 'Who are you, Brak?',
        npcText:
          'Started as a soldier. Broke my sword on the wrong side of a campaign. Decided if I made better ones, I\'d never have that problem again. Worked out.',
      },
      {
        id: 'brak_story_2',
        playerPrompt: 'How did you become a smith?',
        npcText:
          'Watched an old man melt down fallen weapons after a battle. He said "metal has no allegiance." Made sense to me. I stayed and learned.',
      },
      {
        id: 'brak_story_3',
        playerPrompt: 'What do you think of the arena?',
        npcText:
          'A decent test of my work. If a weapon comes back broken, I need to know why. If it comes back covered in someone else\'s blood, it passed.',
      },
    ],
  },
  {
    id: 'brak_axes',
    label: 'Tell me about axes',
    dialogues: [
      {
        id: 'brak_axes_1',
        playerPrompt: 'What makes axes powerful?',
        npcText:
          'Axes don\'t need technique — they need commitment. One swing done right does more damage than four careful strikes. But they punish hesitation hard.',
      },
      {
        id: 'brak_axes_2',
        playerPrompt: 'When should I use an axe?',
        npcText:
          'Against heavily armored enemies. The weight cracks through even solid defense. Not ideal for speed fights, but if your target stands still long enough, it\'s over fast.',
      },
      {
        id: 'brak_axes_3',
        playerPrompt: 'Any weakness to axes?',
        npcText:
          'Slow wind-up. Fast enemies will dodge your swings and hit you in the gap. Axes reward patience and punish impatience in equal measure.',
      },
    ],
  },
  {
    id: 'brak_swords',
    label: 'Tell me about swords',
    dialogues: [
      {
        id: 'brak_swords_1',
        playerPrompt: 'What are swords good for?',
        npcText:
          'A sword is a compromise weapon — which is a compliment. Reliable damage, decent speed, holds up in most situations. When you don\'t know what you\'ll face, a sword is the right answer.',
      },
      {
        id: 'brak_swords_2',
        playerPrompt: 'Is a sword the best choice?',
        npcText:
          '"Best" depends on context. But if you ask which weapon I\'d hand someone with no information about their enemy? Sword. Every time.',
      },
      {
        id: 'brak_swords_3',
        playerPrompt: 'What makes a great sword fighter?',
        npcText:
          'Consistency. Swords have no real ceiling or floor — they amplify the fighter. Master your rhythm and a sword becomes terrifying.',
      },
    ],
  },
  {
    id: 'brak_lances',
    label: 'Tell me about lances',
    unlockCondition: { minLevel: 3 },
    dialogues: [
      {
        id: 'brak_lances_1',
        playerPrompt: 'What are lances for?',
        npcText:
          'Control. You keep the danger at range, set the rhythm, decide when the exchange happens. Good for fighters who think before they act.',
      },
      {
        id: 'brak_lances_2',
        playerPrompt: 'What\'s the downside of lances?',
        npcText:
          'Up close, you\'re in trouble. If an enemy closes the distance, a lance becomes a liability. You have to keep them at arm\'s length — or longer.',
      },
      {
        id: 'brak_lances_3',
        playerPrompt: 'Are lances good against bosses?',
        npcText:
          'Decent. Good reach means you\'re not trading hits while attacking. But boss patterns sometimes force close range — plan for when the distance breaks.',
      },
    ],
  },
  {
    id: 'brak_daggers',
    label: 'Tell me about daggers',
    unlockCondition: { minLevel: 3 },
    dialogues: [
      {
        id: 'brak_daggers_1',
        playerPrompt: 'What are daggers for?',
        npcText:
          'Speed and risk. You hit fast, often, hard if your crits land. But you\'re in the enemy\'s reach for every strike. High reward, high cost.',
      },
      {
        id: 'brak_daggers_2',
        playerPrompt: 'Who should use daggers?',
        npcText:
          'Fighters with high evasion. If you can dodge reliably, daggers become brutal. If you can\'t, you\'ll eat every counterattack at full force.',
      },
      {
        id: 'brak_daggers_3',
        playerPrompt: 'Are daggers viable against bosses?',
        npcText:
          'With the right build, yes. Multiple hits can overwhelm boss defense before it adapts. But it requires discipline — reckless dagger use is just suicide with extra steps.',
      },
    ],
  },
  {
    id: 'brak_bow',
    label: 'Tell me about bows',
    unlockCondition: { minLevel: 3 },
    dialogues: [
      {
        id: 'brak_bow_1',
        playerPrompt: 'What are bows good for?',
        npcText:
          'Distance. You hit before they reach you — if your aim holds. A bow doesn\'t forgive shaky hands or slow thinking. But a clean shot from range is the safest kill there is.',
      },
      {
        id: 'brak_bow_2',
        playerPrompt: 'What makes a good bow fighter?',
        npcText:
          'Crits and speed. A bow\'s raw damage is modest — that\'s the trade-off for range. But string a few critical hits together and the numbers stop looking modest. Stack your crit chance, never rely on base damage alone.',
      },
      {
        id: 'brak_bow_3',
        playerPrompt: 'Any weakness to the bow?',
        npcText:
          'If the enemy gets close, you\'re in trouble. A bow is not a melee weapon — and fighters who forget that end up trying to parry with a stick. Volley buys you breathing room; use it before they close the gap.',
      },
    ],
  },
  {
    id: 'brak_forge',
    label: 'Tell me about the forge',
    unlockCondition: { minLevel: 5 },
    dialogues: [
      {
        id: 'brak_forge_1',
        playerPrompt: 'What can the forge do for me?',
        npcText:
          'Turn three identical items into something better. It\'s not alchemy — it\'s math. More of the same thing, processed right, becomes something greater. Don\'t waste duplicate drops.',
      },
      {
        id: 'brak_forge_2',
        playerPrompt: 'What should I forge first?',
        npcText:
          'Weapons before armor. Your damage output determines fight length. Shorter fights mean less punishment. Start with offense.',
      },
      {
        id: 'brak_forge_3',
        playerPrompt: 'Can I forge rare items?',
        npcText:
          'Everything can be forged if you have three of it. Rare inputs give rare outputs. The rarer the material, the rarer the result. Simple.',
      },
    ],
  },
];

// ─── ELDRAN — Guardian of lore & secrets ────────────────────────────────────

const ELDRAN_TOPICS: TavernTopic[] = [
  {
    id: 'eldran_story',
    label: 'Your story',
    dialogues: [
      {
        id: 'eldran_story_1',
        playerPrompt: 'Who are you, Eldran?',
        npcText:
          'A watcher. I have spent more years observing the patterns of this world than most people have spent living in it. What I\'ve learned is that patterns repeat. Always.',
      },
      {
        id: 'eldran_story_2',
        playerPrompt: 'Why are you here, in this tavern?',
        npcText:
          'Because what happens in that arena is not random. Something is building. I watch to understand it before it finishes building.',
      },
      {
        id: 'eldran_story_3',
        playerPrompt: 'Have you always been this cryptic?',
        npcText:
          'The more you know, the less you can say with certainty. Certainty is the privilege of the ignorant. I gave that up long ago.',
      },
    ],
  },
  {
    id: 'eldran_world',
    label: 'Tell me about this world',
    unlockCondition: { minLevel: 2 },
    dialogues: [
      {
        id: 'eldran_world_1',
        playerPrompt: 'What is happening to this world?',
        npcText:
          'It is fracturing. Not from a single catastrophe, but because something old has been feeding on it for a long time. Mélethor is the most visible wound, not the cause.',
      },
      {
        id: 'eldran_world_2',
        playerPrompt: 'Is there a way to restore balance?',
        npcText:
          'Balance is not a destination. It\'s a direction. Keep moving toward it. What matters is not arriving — it\'s refusing to stop.',
      },
      {
        id: 'eldran_world_3',
        playerPrompt: 'What do you believe in?',
        npcText:
          'Observation. The world will tell you what it is if you stop assuming. Most suffering comes from projecting what we want to see, rather than what is actually there.',
      },
    ],
  },
  {
    id: 'eldran_melethor',
    label: 'Tell me about Mélethor',
    unlockCondition: { minLevel: 5 },
    dialogues: [
      {
        id: 'eldran_melethor_1',
        playerPrompt: 'What is Mélethor really?',
        npcText:
          'An old wound given form. Something broken so long ago it forgot what wholeness felt like, and started resenting everything that remembers.',
      },
      {
        id: 'eldran_melethor_2',
        playerPrompt: 'Can Mélethor be defeated?',
        npcText:
          'Everything that exists can be ended. The question is whether you survive the ending. Mélethor has outlasted every attempt because its opponents underestimated what they were really fighting.',
      },
      {
        id: 'eldran_melethor_3',
        playerPrompt: 'What is Mélethor\'s weakness?',
        npcText:
          'It cannot understand persistence without logic. People who keep fighting without visible hope confuse it. Confusion, in something that powerful, creates openings.',
      },
    ],
  },
  {
    id: 'eldran_zones',
    label: 'Tell me about the zones',
    unlockCondition: { minLevel: 3 },
    dialogues: [
      {
        id: 'eldran_zones_1',
        playerPrompt: 'What can you tell me about the different zones?',
        npcText:
          'Each zone carries the memory of what happened there. The energy you feel fighting in those places is not ambiance — it\'s residue. History accumulates in stone and soil.',
      },
      {
        id: 'eldran_zones_2',
        playerPrompt: 'Are certain zones more dangerous?',
        npcText:
          'All zones are dangerous. But some remember more violence than others. The enemies there are shaped by that memory — older behaviors, older hatred. Treat them differently.',
      },
      {
        id: 'eldran_zones_3',
        playerPrompt: 'Are there hidden zones?',
        npcText:
          'There are places that only reveal themselves to those who have earned the right to find them. Progression is a key — sometimes literally.',
      },
    ],
  },
];

// ─── MESSENGER — Rare, unpredictable, valuable ──────────────────────────────

const MESSENGER_TOPICS: TavernTopic[] = [
  {
    id: 'messenger_rumors',
    label: 'What do you know?',
    dialogues: [
      {
        id: 'messenger_rumors_1',
        playerPrompt: 'What news do you carry?',
        npcText:
          'Word travels faster than armies. There are movements in the eastern camps — coordinated, deliberate. Something is being assembled. I don\'t know what yet. I will.',
      },
      {
        id: 'messenger_rumors_2',
        playerPrompt: 'Anything useful for me right now?',
        npcText:
          'Rare items don\'t always drop from expected sources. Sometimes the most common enemy carries something exceptional. Pay attention to what they leave behind.',
      },
      {
        id: 'messenger_rumors_3',
        playerPrompt: 'What are people saying?',
        npcText:
          'That the arena fights are being watched. Not just by us — by something older. Whether that\'s superstition or signal, I haven\'t determined yet. Fight as if it matters either way.',
      },
      {
        id: 'messenger_rumors_4',
        playerPrompt: 'Any rumors about the bosses?',
        npcText:
          'Bosses in the deeper zones are coordinating. Almost as if they\'re receiving instructions. That shouldn\'t be possible. And yet here we are.',
      },
    ],
  },
  {
    id: 'messenger_secrets',
    label: 'Tell me a secret',
    unlockCondition: { minLevel: 5 },
    dialogues: [
      {
        id: 'messenger_secret_1',
        playerPrompt: 'What secrets are you holding?',
        npcText:
          'Not hiding — holding. There\'s a difference. What I know about the final zone isn\'t something to share lightly. Earn your way there and you\'ll understand why.',
      },
      {
        id: 'messenger_secret_2',
        playerPrompt: 'What do you know about the deeper dungeons?',
        npcText:
          'The deeper dungeons weren\'t built as trials. They were built as containment. What you\'re fighting in there was put there deliberately. Ask yourself: by whom, and why it\'s still active.',
      },
      {
        id: 'messenger_secret_3',
        playerPrompt: 'What is the most important thing I should know?',
        npcText:
          'That your progression is not going unnoticed. The stronger you become, the more attention you draw. Whether that attention is welcome depends entirely on who\'s paying it.',
      },
    ],
  },
];

// ─── Main export ─────────────────────────────────────────────────────────────

export const TAVERN_TOPICS: Record<string, TavernTopic[]> = {
  lya: LYA_TOPICS,
  brak: BRAK_TOPICS,
  eldran: ELDRAN_TOPICS,
  messenger: MESSENGER_TOPICS,
};

/** Maximum topics a player can consult per NPC per tavern visit */
export const MAX_TOPICS_PER_VISIT = 2;

/** Probability that The Messenger is present on any given tavern visit */
export const MESSENGER_APPEARANCE_CHANCE = 0.45;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export interface ProgressionStats {
  bossesDefeated: Record<string, number>;
  totalBattlesWon: number;
}

/** Returns true if the topic's unlock condition is satisfied */
export function isTopicUnlocked(
  topic: TavernTopic,
  playerLevel: number,
  stats: ProgressionStats,
): boolean {
  const cond = topic.unlockCondition;
  if (!cond) return true;
  if (cond.minLevel !== undefined && playerLevel < cond.minLevel) return false;
  if (cond.minBossesDefeated !== undefined) {
    const totalBosses = Object.values(stats.bossesDefeated).reduce((a, b) => a + b, 0);
    if (totalBosses < cond.minBossesDefeated) return false;
  }
  if (cond.minBattleWins !== undefined && stats.totalBattlesWon < cond.minBattleWins) return false;
  return true;
}

/** Picks the next dialogue for a topic: first unseen, then random */
export function pickDialogueForTopic(
  topic: TavernTopic,
  npcId: string,
  unlockedDialogues: Record<string, Record<string, string[]>>,
): TavernTopicDialogue {
  const seenByNpc = unlockedDialogues[npcId] ?? {};
  const unseen = topic.dialogues.filter((d) => !(d.id in seenByNpc));
  if (unseen.length > 0) return unseen[0];
  // All seen — cycle randomly
  return topic.dialogues[Math.floor(Math.random() * topic.dialogues.length)];
}
