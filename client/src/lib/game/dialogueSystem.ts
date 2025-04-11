import { NPC } from "@shared/schema";
import { npcs, getNpcById } from "./gameData";

// Stores the current state of a dialogue interaction
export interface DialogueState {
  npcId: string;
  currentDialogueId: string;
  dialogueHistory: {
    npcText: string;
    playerChoice?: {
      text: string;
      index: number;
    };
  }[];
  availableOptions: {
    text: string;
    nextId: string | null;
    action?: string;
  }[];
  isComplete: boolean;
}

// Initialize a new dialogue interaction with an NPC
export function startDialogue(npcId: string): DialogueState | null {
  const npc = getNpcById(npcId);
  
  if (!npc) {
    console.error(`NPC with ID ${npcId} not found`);
    return null;
  }
  
  // Get the starting dialogue (usually with ID "start")
  const startingDialogue = npc.dialogues.find(d => d.id === "start");
  
  if (!startingDialogue) {
    console.error(`No starting dialogue found for NPC ${npc.name}`);
    return null;
  }
  
  return {
    npcId,
    currentDialogueId: startingDialogue.id,
    dialogueHistory: [
      {
        npcText: startingDialogue.text
      }
    ],
    availableOptions: startingDialogue.options || [],
    isComplete: false
  };
}

// Process player's dialogue choice
export function selectDialogueOption(
  state: DialogueState,
  optionIndex: number
): {
  updatedState: DialogueState;
  triggerAction: string | null;
} {
  // Copy the current state
  const updatedState = { ...state };
  
  // Ensure the option index is valid
  if (optionIndex < 0 || optionIndex >= updatedState.availableOptions.length) {
    console.error(`Invalid dialogue option index: ${optionIndex}`);
    return { updatedState, triggerAction: null };
  }
  
  // Get the selected option
  const selectedOption = updatedState.availableOptions[optionIndex];
  
  // Update dialogue history with player's choice
  updatedState.dialogueHistory[updatedState.dialogueHistory.length - 1].playerChoice = {
    text: selectedOption.text,
    index: optionIndex
  };
  
  // Store any action that needs to be triggered
  const triggerAction = selectedOption.action || null;
  
  // If there's no next dialogue, the conversation is over
  if (selectedOption.nextId === null) {
    updatedState.isComplete = true;
    updatedState.availableOptions = [];
    return { updatedState, triggerAction };
  }
  
  // Otherwise, move to the next dialogue
  updatedState.currentDialogueId = selectedOption.nextId;
  
  // Get the NPC to retrieve the next dialogue
  const npc = getNpcById(state.npcId);
  
  if (!npc) {
    console.error(`NPC with ID ${state.npcId} not found`);
    updatedState.isComplete = true;
    updatedState.availableOptions = [];
    return { updatedState, triggerAction };
  }
  
  // Find the next dialogue
  const nextDialogue = npc.dialogues.find(d => d.id === selectedOption.nextId);
  
  if (!nextDialogue) {
    console.error(`Dialogue with ID ${selectedOption.nextId} not found`);
    updatedState.isComplete = true;
    updatedState.availableOptions = [];
    return { updatedState, triggerAction };
  }
  
  // Add the next NPC response to history
  updatedState.dialogueHistory.push({
    npcText: nextDialogue.text
  });
  
  // Update available options
  updatedState.availableOptions = nextDialogue.options || [];
  
  return { updatedState, triggerAction };
}

// Parse and handle dialogue actions
export function handleDialogueAction(action: string): {
  type: string;
  value: string;
} {
  // Parse action string (format: "type:value")
  const [type, value] = action.split(':');
  
  return { type, value };
}

// Get a specific dialogue from an NPC by ID
export function getDialogueById(npc: NPC, dialogueId: string) {
  return npc.dialogues.find(d => d.id === dialogueId);
}

// Get all dialogues for a specific NPC
export function getAllDialogues(npcId: string): { id: string; text: string }[] | null {
  const npc = getNpcById(npcId);
  
  if (!npc) {
    return null;
  }
  
  return npc.dialogues.map(d => ({ id: d.id, text: d.text }));
}

// Check if an NPC has specific dialogue content
export function hasDialogueWithText(npcId: string, textToFind: string): boolean {
  const npc = getNpcById(npcId);
  
  if (!npc) {
    return false;
  }
  
  return npc.dialogues.some(d => d.text.includes(textToFind));
}

// Return the correct response string for an NPC based on player stats or state
export function getNpcResponseBasedOnStats(
  npcId: string, 
  baseDialogueId: string,
  stats: {
    strength?: number;
    intelligence?: number;
    charisma?: number;
  }
): string {
  const npc = getNpcById(npcId);
  
  if (!npc) {
    return "I have nothing to say.";
  }
  
  const baseDialogue = npc.dialogues.find(d => d.id === baseDialogueId);
  
  if (!baseDialogue) {
    return "I have nothing to say.";
  }
  
  // Example logic for different responses based on stats
  // In a real game, you'd have specialized dialogues for different stat combinations
  if (stats.strength && stats.strength > 7) {
    return `${baseDialogue.text} I see you're quite strong!`;
  }
  
  if (stats.intelligence && stats.intelligence > 7) {
    return `${baseDialogue.text} You seem very knowledgeable.`;
  }
  
  if (stats.charisma && stats.charisma > 7) {
    return `${baseDialogue.text} You're quite charming!`;
  }
  
  return baseDialogue.text;
}

// Find dialogues that match a specific keyword or topic
export function findDialoguesByTopic(keyword: string): {
  npcId: string;
  npcName: string;
  dialogueId: string;
  text: string;
}[] {
  const matches: {
    npcId: string;
    npcName: string;
    dialogueId: string;
    text: string;
  }[] = [];
  
  // Search all NPCs' dialogues for matching text
  npcs.forEach(npc => {
    npc.dialogues.forEach(dialogue => {
      if (dialogue.text.toLowerCase().includes(keyword.toLowerCase())) {
        matches.push({
          npcId: npc.id,
          npcName: npc.name,
          dialogueId: dialogue.id,
          text: dialogue.text
        });
      }
    });
  });
  
  return matches;
}
