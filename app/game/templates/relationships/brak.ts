/**
 * Brak - The Smith
 * Master craftsman and engineer
 * Personality: Gruff, direct, values action over words
 */

import type { NPCRelation } from './types';

export const BRAK_INITIAL: NPCRelation = {
  npcId: 'brak',
  trust: 15,          // Professionnel, pas personnel
  affection: 0,
  anger: 0,
  intimacy: 0,        // Zero romance
  respect: 30,        // Tu dois le respecter pour son métier
  lastInteraction: 0,
  conversationsHad: [],
  choicesMade: {},
  memoryEvents: [],
};

/**
 * Brak's arc:
 * 
 * Levels 1-20: DISTANT (Trust 15-25)
 *   → Vend ses services
 *   → Peu intéressé par ta vie
 *   → Respecte ceux qui payent
 *
 * Levels 25-50: OBSERVER (Trust 25-40)
 *   → Remarque tes choix d'équipement
 *   → Commence à donner des conseils gratuits
 *   → Respect augmente avec la qualité de tes forges
 *
 * Levels 55-75: COLLABORATEUR (Trust 40-60)
 *   → Prépare activement des équipements spéciaux
 *   → Parle du craft comme art
 *   → Révèle l'importance des armes
 *
 * Levels 80+: ALLY (Trust 60-75)
 *   → L'arme ultime se forge ensemble
 *   → Brak devient critique pour vaincre Mélethor
 *   → Respect mutuel atteint
 */

export const BRAK_PERSONALITY = {
  // Core traits
  direct: true,         // Dit ce qu'il pense
  pragmatic: true,      // Valeur = ce que ça produit
  passionate: true,     // Aime son métier profondément
  gruff: true,          // Rude mais pas méchant
  honorable: true,      // Respecte le code du craft

  // Speech patterns
  speaks_clearly: true, // Pas de détours
  uses_examples: true,  // "Regarde cette épée..."
  teaches_craft: true,  // Explique le métier
  dislikes_waste: true, // Hait le gâchis
};

/**
 * Memory events
 */
export const BRAK_MEMORY_EVENTS = {
  'brak_first_forge': 'Première forge avec Brak',
  'brak_quality_craft': 'Tu as montré du goût en équipement',
  'brak_rare_material': 'Brak t\'a donné un matériau rare',
  'brak_taught_secret': 'Brak a partagé un secret de craft',
  'brak_legendary_weapon': 'Forging d\'une arme légendaire',
  'brak_ultimate_craft': 'L\'ultime arme contre Mélethor',
};
