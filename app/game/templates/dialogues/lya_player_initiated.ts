/**
 * Lya Dialogues - Player Initiated
 * Questions the player can ask Lya, she responds based on relationship
 */

import type { DialogueNode } from '../relationships/types';

export const LYA_PLAYER_INITIATED: DialogueNode[] = [
  {
    id: 'lya_ask_advice',
    npcId: 'lya',
    initiatedBy: 'player',
    variants: [
      {
        text: "I don't have much time for chitchat. Ask what you need and be quick about it.",
        contextAction: '*Lya glances at you with indifference*',
        requirements: { maxTrust: 40 },
      },
      {
        text: "Of course, friend. What's on your mind? You can always count on me.",
        contextAction: '*Lya sets down her drink and gives you her full attention*',
        requirements: { minTrust: 40, maxTrust: 70 },
      },
      {
        text: "You know you can tell me anything, right? I'm here for you, always.",
        contextAction: '*Lya leans forward with genuine concern and warmth*',
        requirements: { minTrust: 70 },
      },
    ],
    choices: [
      {
        id: 'lya_ask_combat',
        text: "How do I get stronger in combat?",
        effects: {
          trust: 2,
        },
        nextDialogueId: 'lya_answer_combat',
      },
      {
        id: 'lya_ask_past',
        text: "Tell me about your past. How did you become so skilled?",
        effects: {
          trust: 2,
          affection: 1,
        },
        requirements: { minTrust: 30 },
        nextDialogueId: 'lya_answer_past',
      },
      {
        id: 'lya_ask_feelings',
        text: "What do you really think of me?",
        effects: {
          trust: 1,
          affection: 2,
        },
        requirements: { minTrust: 50, minAffection: 40 },
        nextDialogueId: 'lya_answer_feelings',
      },
    ],
  },
  {
    id: 'lya_answer_combat',
    npcId: 'lya',
    initiatedBy: 'npc',
    variants: [
      {
        text: "Strength? It's mechanical. Strike harder, dodge faster. No philosophy needed. You survive or you don't.",
        contextAction: '*Lya stares at her drink, voice cold and distant*',
        requirements: { maxTrust: 30 },
      },
      {
        text: "Strength comes from understanding your enemy. Every scar tells a story, every victory teaches a lesson—if you're willing to learn.",
        contextAction: '*Lya leans back, eyes gleaming with the memory of old battles*',
        requirements: { minTrust: 30, maxTrust: 50 },
      },
      {
        text: "You already know the answer in your heart. It's dedication, discipline, and the fire within you. I see that fire burning brighter each day.",
        contextAction: '*She looks at you with pride and something softer in her eyes*',
        requirements: { minTrust: 50, maxTrust: 70 },
      },
      {
        text: "True strength isn't just in your arm—it's in your spirit. And I see a spirit worth protecting. Let me teach you, let me stand beside you, and together we'll show this world what we're made of.",
        contextAction: '*Lya reaches out and gently takes your hand, her voice trembling with emotion*',
        requirements: { minTrust: 70 },
      },
    ],
    choices: [
      {
        id: 'lya_combat_thanks',
        text: "Thank you. I needed that reminder.",
        effects: {
          trust: 2,
          affection: 1,
        },
      },
    ],
  },
  {
    id: 'lya_answer_past',
    npcId: 'lya',
    initiatedBy: 'npc',
    variants: [
      {
        text: "My past? None of your concern. What matters is now. Don't dig into things you can't understand.",
        contextAction: '*Lya\'s jaw tightens, a wall of ice building around her words*',
        requirements: { maxTrust: 30 },
      },
      {
        text: "My past? It's complicated. I was reckless once, fought in every arena, thinking I was invincible. Then life had other plans. But I survived, learned, and became stronger.",
        contextAction: '*She looks at you with a mix of pride and old sadness*',
        requirements: { minTrust: 30, maxTrust: 55 },
      },
      {
        text: "I wasn't always as you see me now. I've known darkness, loneliness, and regret. But meeting someone like you... it gives my past meaning. It reminds me why I survived.",
        contextAction: '*Lya\'s eyes meet yours with vulnerable honesty*',
        requirements: { minTrust: 55, maxTrust: 75 },
      },
      {
        text: "I lived in shadows for so long, fighting to forget. But you... you make me want to remember who I was before the pain. You make me believe there's a future worth fighting for, beyond just survival.",
        contextAction: '*Tears glisten in her eyes as she speaks, her voice soft but fierce with emotion*',
        requirements: { minTrust: 75 },
      },
    ],
    choices: [
      {
        id: 'lya_past_thanks',
        text: "I'm grateful you trust me with that.",
        effects: {
          trust: 3,
          affection: 2,
        },
      },
    ],
  },
  {
    id: 'lya_answer_feelings',
    npcId: 'lya',
    initiatedBy: 'npc',
    variants: [
      {
        text: "What I think of you? You're useful. Capable. That's enough.",
        contextAction: '*Lya\'s words are detached, her gaze cold and businesslike*',
        requirements: { maxTrust: 40 },
      },
      {
        text: "You want to know the truth? I see potential. You have heart, and that's rare in a world like this. It intrigues me.",
        contextAction: '*She looks you in the eye, her expression unreadable but thoughtful*',
        requirements: { minTrust: 40, maxTrust: 60 },
      },
      {
        text: "You're brave, clever, and stronger than you realize. And... I care about you more than I expected to. You matter to me.",
        contextAction: '*A slight blush colors her cheeks as vulnerability shows through*',
        requirements: { minTrust: 60, maxTrust: 75 },
      },
      {
        text: "You're everything good in this broken world. Your light, your kindness, your strength—they've become essential to me. I love the person you are, and everything you're becoming.",
        contextAction: '*Lya steps close, her voice trembling with profound tenderness and certainty*',
        requirements: { minTrust: 75, minAffection: 70 },
      },
    ],
    choices: [
      {
        id: 'lya_feelings_response',
        text: "That means everything to me.",
        effects: {
          trust: 3,
          affection: 3,
          memoryEvent: 'lya_feelings_shared',
        },
      },
    ],
  },
  {
    id: 'lya_ask_story',
    npcId: 'lya',
    initiatedBy: 'player',
    variants: [
      {
        text: "My story? It's not exactly a pleasant tale. I'm not sure you want to hear it.",
        contextAction: '*Lya\'s expression becomes guarded*',
        requirements: { maxTrust: 50 },
      },
      {
        text: "Well, there's not much to tell. I was a fighter once, made my mistakes, and here I am. Why do you ask?",
        contextAction: '*She seems to soften slightly, willing to share*',
        requirements: { minTrust: 50, maxTrust: 75 },
      },
      {
        text: "I'll tell you everything you want to know. You've earned that trust. But it's not a happy story.",
        contextAction: '*Lya takes your hand gently, her eyes carrying old pain but also affection*',
        requirements: { minTrust: 75 },
      },
    ],
    choices: [
      {
        id: 'lya_story_listen',
        text: "I'm listening. Whatever it is, I want to understand you.",
        effects: {
          trust: 3,
          affection: 2,
          memoryEvent: 'lya_shared_story',
        },
        requirements: { minTrust: 40 },
        nextDialogueId: 'lya_shares_story',
      },
      {
        id: 'lya_story_not_ready',
        text: "Maybe another time. I don't want to push you.",
        effects: {
          trust: 1,
          affection: 1,
        },
      },
    ],
  },
  {
    id: 'lya_shares_story',
    npcId: 'lya',
    initiatedBy: 'npc',
    variants: [
      {
        text: "I lost people. I made mistakes that cost lives. Those wounds don't heal—you just learn to live with the scars.",
        contextAction: '*Lya\'s voice is hollow, echoing with old pain*',
        requirements: { minTrust: 40, maxTrust: 60 },
      },
      {
        text: "I was alone for so long, fighting and surviving. But meeting you changed something inside me. You remind me that I\'m still human, not just a weapon.",
        contextAction: '*Tears glisten in Lya\'s eyes as genuine emotion breaks through her armor*',
        requirements: { minTrust: 60, maxTrust: 80 },
      },
      {
        text: "I thought I'd never let anyone close again. The cost was too high. But you slipped through my defenses like dawn breaking through darkness. You saved me, though I never asked. You believed in me when I'd forgotten how to believe in myself.",
        contextAction: '*Lya takes both your hands, her voice breaking with love and gratitude*',
        requirements: { minTrust: 80 },
      },
    ],
    choices: [
      {
        id: 'lya_story_end',
        text: "You're not alone anymore. Not if you don't want to be.",
        effects: {
          trust: 3,
          affection: 4,
          memoryEvent: 'lya_bonded',
        },
      },
    ],
  },
  {
    id: 'lya_ask_help',
    npcId: 'lya',
    initiatedBy: 'player',
    variants: [
      {
        text: "Help? Why should I? You barely know me.",
        contextAction: '*Lya crosses her arms defensively*',
        requirements: { maxTrust: 30 },
      },
      {
        text: "You know I'll help if I can. What do you need?",
        contextAction: '*Lya sighs, but her tone is willing*',
        requirements: { minTrust: 30, maxTrust: 60 },
      },
      {
        text: "Of course. You don't even need to ask. I'd do anything for you.",
        contextAction: '*Lya smiles warmly, genuine devotion in her eyes*',
        requirements: { minTrust: 60 },
      },
    ],
    choices: [
      {
        id: 'lya_help_training',
        text: "Train me. Push me harder than ever before.",
        effects: {
          trust: 2,
          affection: 1,
        },
        nextDialogueId: 'lya_offers_training',
      },
      {
        id: 'lya_help_emotional',
        text: "I just... I need someone to believe in me.",
        effects: {
          trust: 3,
          affection: 3,
        },
        requirements: { minTrust: 40 },
        nextDialogueId: 'lya_supports_you',
      },
    ],
  },
  {
    id: 'lya_offers_training',
    npcId: 'lya',
    initiatedBy: 'npc',
    variants: [
      {
        text: "Fine. If you can handle it. We start at dawn. Don't be late.",
        contextAction: '*Lya cracks her knuckles with a cold, business-like demeanor*',
        requirements: { minTrust: 30, maxTrust: 50 },
      },
      {
        text: "Good. I respect your hunger for growth. We'll train hard together, push each other to new limits. You'll become stronger than you ever imagined.",
        contextAction: '*She claps you on the back with genuine enthusiasm and a slight smile*',
        requirements: { minTrust: 50, maxTrust: 70 },
      },
      {
        text: "I'll make you the finest fighter this realm has ever seen. Not just for victory, but because I believe in you, and I want to see you shine. Together, we'll be unstoppable.",
        contextAction: '*Lya looks at you with pride and affection, her eyes blazing with determination and care*',
        requirements: { minTrust: 70 },
      },
    ],
    choices: [
      {
        id: 'lya_training_ready',
        text: "I'm ready. Let's do this.",
        effects: {
          trust: 2,
          affection: 2,
          memoryEvent: 'lya_training_began',
        },
      },
    ],
  },
  {
    id: 'lya_supports_you',
    npcId: 'lya',
    initiatedBy: 'npc',
    variants: [
      {
        text: "You're stronger than you think. Stop doubting yourself and start acting like it.",
        contextAction: '*Lya\'s words are sharp, cutting through your doubt like a blade*',
        requirements: { minTrust: 40, maxTrust: 55 },
      },
      {
        text: "Listen to me. I believe in you. Not because of your strength or victories, but because of who you are inside. Your spirit is extraordinary.",
        contextAction: '*Lya takes your hands, speaking with quiet sincerity and warmth*',
        requirements: { minTrust: 55, maxTrust: 75 },
      },
      {
        text: "You are worthy. You are brave. You are loved. I believe in you with every fiber of my being, and I'll spend the rest of my life proving that to you if I have to.",
        contextAction: '*She pulls you close, her embrace tender and absolute, her voice trembling with devotion*',
        requirements: { minTrust: 75 },
      },
    ],
    choices: [
      {
        id: 'lya_emotional_thanks',
        text: "Thank you. That means more than you know.",
        effects: {
          trust: 3,
          affection: 4,
          memoryEvent: 'lya_emotional_support',
        },
      },
    ],
  },
];

