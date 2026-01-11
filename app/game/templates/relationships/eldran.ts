/**
 * Eldran - The Watcher
 * Mysterious guardian of knowledge
 * Personality: Distant, cryptic, protective but cold
 */

import type { NPCRelation } from './types';

export const ELDRAN_INITIAL: NPCRelation = {
  npcId: 'eldran',
  trust: 5,           // Il est très fermé
  affection: 0,       // Aucune affection
  anger: 0,
  intimacy: 0,        // Jamais de romance
  respect: 20,        // Il commande le respect par sa présence
  lastInteraction: 0,
  conversationsHad: [],
  choicesMade: {},
  memoryEvents: [],
};

/**
 * Eldran's arc:
 * 
 * Levels 1-15: MYSTÈRE (Trust 5-15)
 *   → Présent mais invisible
 *   → Parle en énigmes
 *   → Teste le joueur sans le dire
 *
 * Levels 20-40: RÉVÉLATIONS (Trust 15-35)
 *   → Commence à partager le lore
 *   → Parle des anciens temps
 *   → Respect augmente si tu comprends les enjeux
 *
 * Levels 50-70: GUIDANCE (Trust 35-50)
 *   → Il prépare explicitement pour Mélethor
 *   → Révèle des armes/stratégies
 *   → Montre une forme de bienveillance rare
 *
 * Levels 75+: ALLIANCE (Trust 50-70)
 *   → Il se range vraiment de ton côté
 *   → Mais reste distant (affection ne monte jamais)
 *   → Fin: sacrifice possible ou victoire ensemble
 */

export const ELDRAN_PERSONALITY = {
  // Core traits
  cryptic: true,        // Parle en énigmes
  protective: true,     // Protège sans le montrer
  mysterious: true,     // On ne sait jamais ce qu'il pense vraiment
  loyal: true,          // Loyal à la victoire du joueur
  cold: true,           // Jamais affectueux

  // Speech patterns
  speaks_rarely: true,  // Peu de paroles
  uses_metaphors: true, // La nature, le cosmos
  hints_truth: true,    // Dit des choses vraies mais cryptiques
  never_lies: true,     // Mais peut omettre
};

/**
 * Memory events (lore milestones)
 */
export const ELDRAN_MEMORY_EVENTS = {
  'eldran_first_message': 'Premier contact avec Eldran',
  'eldran_revealed_lore': 'Eldran a parlé du passé',
  'eldran_warned_danger': 'Eldran t\'a averti du danger',
  'eldran_showed_weapon': 'Eldran a révélé une arme d\'importance',
  'eldran_revealed_melethor': 'Eldran a prononcé le nom: Mélethor',
  'eldran_final_test': 'Eldran te teste mentalement',
  'eldran_alliance': 'Alliance explicite contre Mélethor',
};
