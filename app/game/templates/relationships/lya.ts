/**
 * Lya - The Scout
 * Merchant observer of the arena
 * Personality: Pragmatic, protective, guarded but capable of affection
 */

import type { NPCRelation } from './types';

export const LYA_INITIAL: NPCRelation = {
  npcId: 'lya',
  trust: 10,          // Elle te connaît pas, elle observe
  affection: 0,       // Neutre au départ
  anger: 0,
  intimacy: 0,        // Romance commence plus tard (niveau 15+)
  respect: 5,         // Elle voit si tu es compétent
  lastInteraction: 0,
  conversationsHad: [],
  choicesMade: {},
  memoryEvents: [],
};

/**
 * Lya's emotional arc:
 * 
 * Levels 1-10: MÉFIANCE (Trust 10-20)
 *   → Elle te teste avec tutoriels
 *   → Distant, pragmatique
 *   → Veut voir si tu peux survivre
 *
 * Levels 15-30: CURIOSITÉ (Trust 20-40)
 *   → Elle remarque tes choix et stratégies
 *   → Commence à partager des histoires
 *   → Affection augmente si tu montres du respect
 *
 * Levels 35-55: CONNEXION (Trust 40-70)
 *   → Elle devient mentore active
 *   → Romance peut commencer (choix au niveau 50)
 *   → Vulnérabilité augmente
 *
 * Levels 60-75: ENGAGEMENT (Trust 70-90, Affection 60+)
 *   → Elle révèle ses peurs (volcan, Mélethor)
 *   → Intimité augmente
 *   → Elle montre son coeur blessé
 *
 * Levels 80-90: UNION (Trust 90-100, Affection 80+)
 *   → Elle s'engage pleinement
 *   → Elle devient ta plus grande force contre Mélethor
 *   → Fin du jeu: fin romance + closure
 */

export const LYA_PERSONALITY = {
  // Core traits
  pragmatic: true,      // Elle valorise l'action et les résultats
  protective: true,     // Elle cache son affection derrière du sarcasme
  observant: true,      // Elle voit TOUT
  mysterious: false,    // Pas secrète, juste discrète
  loyal: true,          // Une fois attachée, elle ne lâche pas

  // Speech patterns
  avoidsDirect: true,   // Ne dit pas "Je t'aime", montre plutôt
  sarcastic: true,      // Humour noir comme protection
  metaphorical: true,   // Parle de survie, d'adaptation
  listens: true,        // Plus souvent en silence qu'en paroles
};

/**
 * Memory events (relation milestones)
 */
export const LYA_MEMORY_EVENTS = {
  'lya_first_tutorial': 'Première leçon ensemble',
  'lya_watched_victory': 'Lya a vu ta première vraie victoire',
  'lya_confided': 'Lya t\'a confié quelque chose d\'elle-même',
  'lya_defended': 'Lya t\'a défendu face à quelqu\'un',
  'lya_betrayed': 'Tu as trahi la confiance de Lya',
  'lya_romance_choice': 'Proposition romance acceptée',
  'lya_fear_volcan': 'Lya a partagé sa peur du volcan',
  'lya_melethor_alliance': 'Lya s\'allie contre Mélethor',
  'lya_final_confession': 'Confession finale de Lya',
};
