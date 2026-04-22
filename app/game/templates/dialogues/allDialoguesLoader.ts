/**
 * Comprehensive Dialogue Loader
 * Loads all NPC dialogues from tavernTopics (single source of truth).
 * Converts TavernTopicDialogue → SimpleDialogue for the Narrations modal.
 */

import { TAVERN_TOPICS } from './tavernTopics';

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
  const result: Record<string, SimpleDialogue[]> = {};

  for (const [npcId, topics] of Object.entries(TAVERN_TOPICS)) {
    const dialogues: SimpleDialogue[] = [];
    for (const topic of topics) {
      for (const d of topic.dialogues) {
        dialogues.push({
          id: d.id,
          question: d.playerPrompt,
          response: d.npcText,
          type: 'player',
        });
      }
    }
    result[npcId] = dialogues;
  }

  return result;
}
