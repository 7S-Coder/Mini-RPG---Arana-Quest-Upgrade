/**
 * Comprehensive Dialogue Loader
 * Loads all NPC dialogues for the Dialogues modal
 */

import { loadLyaTavernDialogues } from './tavernDialogueLoaderSimple';

interface SimpleDialogue {
  id: string;
  question: string;
  response: string;
  type: 'player' | 'npc';
  choices?: Array<{
    id: string;
    text: string;
    response: string;
  }>;
}

export function loadAllDialoguesByNPC(): Record<string, SimpleDialogue[]> {
  return {
    lya: loadLyaTavernDialogues(),
    eldran: [],
    brak: [],
    messenger: [],
  };
}
