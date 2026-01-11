/**
 * The Masked Messenger
 * Enigmatic agent of unknown origin
 * Personality: Unknown motives, possibly hostile, cryptic
 */

import type { NPCRelation } from './types';

export const MESSENGER_INITIAL: NPCRelation = {
  npcId: 'messenger',
  trust: 0,           // Aucune confiance
  affection: 0,       // Aucune connexion
  anger: 0,
  intimacy: 0,        // Zero romance
  respect: 0,         // À découvrir
  lastInteraction: 0,
  conversationsHad: [],
  choicesMade: {},
  memoryEvents: [],
};

/**
 * Messenger's arc:
 * 
 * Levels 1-40: MYSTERIOUS (Trust 0-10)
 *   → Apparaît sans raison
 *   → Parle de choses cryptiques
 *   → Motifs inconnus
 *   → Est-ce un ennemi? Un allié?
 *
 * Levels 50-65: RÉVÉLATION (Trust 10-30)
 *   → Messenger augmente ses contacts
 *   → Révèle connaître Mélethor
 *   → Offering: aide vs. Mélethor (ou piège?)
 *   → Trust dépend si tu acceptes son aide
 *
 * Levels 70-90: ALLIANCE OU TRAHISON (Trust 30-70)
 *   → CHEMIN 1: Tu lui fais confiance → Allié puissant
 *   → CHEMIN 2: Tu le rejettes → Devient obstacle
 *   → CHEMIN 3: Tu le manipules → Imprévisible
 */

export const MESSENGER_PERSONALITY = {
  // Core traits
  enigmatic: true,      // On ne le comprend pas
  serving_unknown: true, // Qui maître-t-il?
  knowledgeable: true,  // Sait beaucoup
  potentially_hostile: true, // Danger?
  agent: true,          // Agit pour quelqu'un/quelque chose

  // Speech patterns
  cryptic: true,        // Parle en énigmes
  never_direct: true,   // Toujours ambigu
  hides_motives: true,  // Ne montre pas ce qu'il veut
  offers_deals: true,   // "Accepte mon aide..."
};

/**
 * Memory events
 */
export const MESSENGER_MEMORY_EVENTS = {
  'messenger_first_contact': 'Le Messager t\'a trouvé',
  'messenger_revealed_melethor': 'Messenger a parlé de Mélethor',
  'messenger_offered_alliance': 'Messenger t\'a offert une alliance',
  'messenger_betrayed': 'Tu as rejeté le Messager',
  'messenger_became_ally': 'Tu as accepté l\'aide du Messager',
  'messenger_true_goal': 'Le vrai but du Messager est révélé',
  'messenger_final_choice': 'Choix final concernant le Messager',
};
