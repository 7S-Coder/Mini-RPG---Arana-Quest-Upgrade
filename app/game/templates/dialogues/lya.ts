/**
 * Lya Dialogues
 * The Scout - Mentor figure, protective and pragmatic
 * Branching dialogue with relationship-based variants
 */

import type { DialogueNode } from '../relationships/types';

export const LYA_DIALOGUES: DialogueNode[] = [
  {
    id: 'lya_greeting_first',
    npcId: 'lya',
    variants: [
      {
        text: "Well, well... you've finally found time to visit the tavern. I was starting to think you'd forgotten about old Lya.",
        contextAction: '*Lya looks up from her drink, a knowing smile crossing her face*',
        requirements: { minTrust: 0, maxTrust: 40 },
      },
      {
        text: "Good to see you, friend. Come, sit with me for a while. The least you can do is hear what I've got to say.",
        contextAction: '*Lya gestures to the chair across from her, her posture relaxed and welcoming*',
        requirements: { minTrust: 40, maxTrust: 70 },
      },
      {
        text: "Finally! I've been waiting for you. You know I always make time for the people I care about.",
        contextAction: '*Lya stands and embraces you warmly, genuine affection in her eyes*',
        requirements: { minTrust: 70 },
      },
    ],
    choices: [
      {
        id: 'lya_greeting_resp_1',
        text: "Just passing through. What did you want to tell me?",
        effects: {
          trust: 2,
          affection: 0,
        },
      },
      {
        id: 'lya_greeting_resp_2',
        text: "I missed you too. You mean a lot to me.",
        effects: {
          trust: 3,
          affection: 3,
        },
        requirements: { minTrust: 40 },
      },
      {
        id: 'lya_greeting_resp_3',
        text: "I've been thinking about us... about what you taught me.",
        effects: {
          trust: 3,
          affection: 3,
          memoryEvent: 'lya_reflection',
        },
      },
    ],
  },
  {
    id: 'lya_combat_lessons',
    npcId: 'lya',
    variants: [
      {
        text: "You know, every fight you win teaches you something new. But the real lessons? Those come from understanding *why* you won.",
        contextAction: '*Lya leans back, eyes distant with memory*',
        requirements: { minTrust: 40 },
      },
      {
        text: "I've seen you fight. You're getting better, but don't let victory go to your head. Pride is what gets you killed in the arena.",
        contextAction: '*Her voice carries a tone of genuine concern*',
        requirements: { minTrust: 30, maxTrust: 60 },
      },
      {
        text: "You've come so far since we met. I'm proud of you. Never forget that strength isn't just in your arm—it's in your spirit.",
        contextAction: '*Lya places a hand on your shoulder, her touch warm and reassuring*',
        requirements: { minTrust: 70, minAffection: 50 },
      },
    ],
    choices: [
      {
        id: 'lya_combat_resp_1',
        text: "What's the most important lesson you learned in the arena?",
        effects: {
          trust: 3,
          affection: 2,
        },
      },
      {
        id: 'lya_combat_resp_2',
        text: "I'll never forget what you taught me. You were always there for me.",
        effects: {
          trust: 3,
          affection: 3,
          memoryEvent: 'lya_gratitude',
        },
        requirements: { minTrust: 50 },
      },
      {
        id: 'lya_combat_resp_3',
        text: "Show me more. I want to be worthy of your mentorship.",
        effects: {
          trust: 3,
          affection: 2,
        },
      },
    ],
  },
  {
    id: 'lya_vulnerability',
    npcId: 'lya',
    variants: [
      {
        text: "You know, I'm not always the strong one. There were nights I wondered if I'd made the right choices... if my path was worth the cost.",
        contextAction: '*Lya\'s voice softens, vulnerability showing through her usual confidence*',
        requirements: { minTrust: 60, minAffection: 40 },
      },
      {
        text: "I've lost people I cared about in the arena. That's why I protect you so fiercely. I couldn't bear to lose you too.",
        contextAction: '*She meets your eyes, sincerity burning in her gaze*',
        requirements: { minTrust: 70, minAffection: 60 },
      },
    ],
    choices: [
      {
        id: 'lya_vulnerability_resp_1',
        text: "I had no idea you carried so much pain.",
        effects: {
          trust: 3,
          affection: 3,
          memoryEvent: 'lya_loss',
        },
      },
      {
        id: 'lya_vulnerability_resp_2',
        text: "You don't have to protect me. But I'm grateful that you do.",
        effects: {
          trust: 3,
          affection: 3,
          intimacy: 2,
        },
        requirements: { minTrust: 60 },
      },
      {
        id: 'lya_vulnerability_resp_3',
        text: "Your strength isn't about never falling. It's about standing back up.",
        effects: {
          trust: 3,
          affection: 3,
          memoryEvent: 'lya_acceptance',
        },
      },
    ],
  },
];
