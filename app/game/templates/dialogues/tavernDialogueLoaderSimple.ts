import lyaDialoguesData from './lyaDialoguesSimple.json';

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

export function loadLyaTavernDialogues(): SimpleDialogue[] {
  const dialogues: SimpleDialogue[] = [];

  // Load player-initiated dialogues
  const playerAsks = lyaDialoguesData.lya.playerAsks || [];
  playerAsks.forEach((dialogue) => {
    dialogues.push({
      id: dialogue.id,
      question: dialogue.question,
      response: dialogue.response,
      type: 'player',
    });
  });

  // Load NPC-initiated dialogues
  const npcAsks = lyaDialoguesData.lya.npcAsks || [];
  npcAsks.forEach((dialogue) => {
    dialogues.push({
      id: dialogue.id,
      question: dialogue.question,
      response: '', // NPC asks don't have a single response, but multiple choices
      type: 'npc',
      choices: dialogue.choices as any,
    });
  });

  return dialogues;
}

export default { loadLyaTavernDialogues };
