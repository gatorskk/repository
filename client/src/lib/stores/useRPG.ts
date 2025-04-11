import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { 
  Character, 
  InventoryItem, 
  Quest, 
  NPC, 
  Enemy, 
  MapLocation 
} from "@shared/schema";
import { initialCharacter, initialQuests, startingInventory } from "../game/gameData";

export type GamePhase = 'title' | 'character_creation' | 'exploration' | 'combat' | 'dialogue' | 'inventory' | 'quest_log' | 'character_sheet';

interface RPGState {
  // Core game state
  gamePhase: GamePhase;
  setGamePhase: (phase: GamePhase) => void;
  
  // Camera and view
  setCameraPosition: (position: [number, number, number]) => void;
  
  // Character 
  character: Character | null;
  createCharacter: (name: string, stats: Character['stats']) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  addExperience: (amount: number) => void;
  levelUp: () => void;
  
  // Inventory
  inventory: InventoryItem[];
  addItem: (item: InventoryItem) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  useItem: (itemId: string) => void;
  equipItem: (itemId: string, equip: boolean) => void;
  gold: number;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  
  // Quests
  quests: Quest[];
  activeQuest: Quest | null;
  startQuest: (questId: string) => void;
  updateQuestObjective: (questId: string, objectiveId: string, progress: number) => void;
  completeQuest: (questId: string) => void;
  setActiveQuest: (questId: string | null) => void;
  
  // World and locations
  currentLocation: MapLocation | null;
  discoveredLocations: string[];
  moveToLocation: (locationId: string) => void;
  
  // Combat
  inCombat: boolean;
  currentEnemy: Enemy | null;
  startCombat: (enemyId: string) => void;
  endCombat: (playerWon: boolean) => void;
  attackEnemy: (skillId?: string) => void;
  takeDamage: (amount: number) => void;
  
  // Dialogue
  currentNPC: NPC | null;
  currentDialogueId: string | null;
  startDialogue: (npcId: string) => void;
  selectDialogueOption: (optionIndex: number) => void;
  endDialogue: () => void;
  
  // Game control
  saveGame: () => void;
  loadGame: (saveData: any) => void;
  resetGame: () => void;
}

export const useRPG = create<RPGState>()(
  subscribeWithSelector((set, get) => ({
    // Core game state
    gamePhase: 'title',
    setGamePhase: (phase) => set({ gamePhase: phase }),
    
    // Camera and view
    setCameraPosition: (position) => {
      // Update camera position for following player or focusing on points of interest
      // This will be used by components like World.tsx to adjust the camera
      console.log("Camera position updated:", position);
      // In a real implementation this would update a camera position state or use a ref
    },
    
    // Character
    character: null,
    createCharacter: (name, stats) => {
      const newCharacter: Character = {
        ...initialCharacter,
        name,
        stats
      };
      set({ 
        character: newCharacter,
        inventory: startingInventory,
        gamePhase: 'exploration'
      });
    },
    updateCharacter: (updates) => {
      const current = get().character;
      if (!current) return;
      
      set({ character: { ...current, ...updates } });
    },
    addExperience: (amount) => {
      const character = get().character;
      if (!character) return;
      
      const newExp = character.experience + amount;
      const expToNextLevel = character.level * 100;
      
      if (newExp >= expToNextLevel) {
        set({ 
          character: { 
            ...character, 
            experience: newExp - expToNextLevel 
          }
        });
        get().levelUp();
      } else {
        set({ 
          character: { 
            ...character, 
            experience: newExp 
          }
        });
      }
    },
    levelUp: () => {
      const character = get().character;
      if (!character) return;
      
      // Increase stats and heal character
      const newLevel = character.level + 1;
      const healthIncrease = 10;
      const manaIncrease = 5;
      
      set({
        character: {
          ...character,
          level: newLevel,
          health: {
            current: character.health.max + healthIncrease,
            max: character.health.max + healthIncrease
          },
          mana: {
            current: character.mana.max + manaIncrease,
            max: character.mana.max + manaIncrease
          }
        }
      });
    },
    
    // Inventory
    inventory: [],
    gold: 0,
    addItem: (item) => {
      const inventory = get().inventory;
      const existingItem = inventory.find(i => i.id === item.id);
      
      if (existingItem && item.type !== 'weapon' && item.type !== 'armor') {
        // Stackable item, increase quantity
        set({
          inventory: inventory.map(i => 
            i.id === item.id 
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        });
      } else {
        // New item or non-stackable
        set({ inventory: [...inventory, item] });
      }
    },
    removeItem: (itemId, quantity = 1) => {
      const inventory = get().inventory;
      const item = inventory.find(i => i.id === itemId);
      
      if (!item) return;
      
      if (item.quantity > quantity) {
        // Reduce quantity
        set({
          inventory: inventory.map(i => 
            i.id === itemId 
              ? { ...i, quantity: i.quantity - quantity }
              : i
          )
        });
      } else {
        // Remove item completely
        set({
          inventory: inventory.filter(i => i.id !== itemId)
        });
      }
    },
    useItem: (itemId) => {
      const { inventory, character } = get();
      const item = inventory.find(i => i.id === itemId);
      
      if (!item || !character) return;
      
      // Handle different item types
      if (item.type === 'potion') {
        // Heal character if it's a potion
        if (item.stats && item.stats.healing) {
          const newHealth = Math.min(
            character.health.max,
            character.health.current + item.stats.healing
          );
          
          set({
            character: {
              ...character,
              health: {
                ...character.health,
                current: newHealth
              }
            }
          });
          
          // Remove one potion from inventory
          get().removeItem(itemId, 1);
        }
      }
      
      // Other item types can be handled similarly
    },
    equipItem: (itemId, equip) => {
      const { inventory, character } = get();
      if (!character) return;
      
      // Find the item
      const item = inventory.find(i => i.id === itemId);
      if (!item || (item.type !== 'weapon' && item.type !== 'armor')) return;
      
      // If equipping, unequip any other items of same type
      let newInventory = [...inventory];
      if (equip) {
        newInventory = newInventory.map(i => 
          i.type === item.type 
            ? { ...i, equipped: i.id === itemId }
            : i
        );
      } else {
        // Just unequip this item
        newInventory = newInventory.map(i => 
          i.id === itemId 
            ? { ...i, equipped: false }
            : i
        );
      }
      
      set({ inventory: newInventory });
    },
    addGold: (amount) => {
      set({ gold: get().gold + amount });
    },
    spendGold: (amount) => {
      const currentGold = get().gold;
      if (currentGold < amount) return false;
      
      set({ gold: currentGold - amount });
      return true;
    },
    
    // Quests
    quests: initialQuests,
    activeQuest: null,
    startQuest: (questId) => {
      const quests = get().quests;
      const questIndex = quests.findIndex(q => q.id === questId);
      
      if (questIndex === -1 || quests[questIndex].status !== 'not_started') return;
      
      const updatedQuests = [...quests];
      updatedQuests[questIndex] = {
        ...updatedQuests[questIndex],
        status: 'in_progress'
      };
      
      set({ 
        quests: updatedQuests,
        activeQuest: updatedQuests[questIndex]
      });
    },
    updateQuestObjective: (questId, objectiveId, progress) => {
      const quests = get().quests;
      const questIndex = quests.findIndex(q => q.id === questId);
      
      if (questIndex === -1 || quests[questIndex].status !== 'in_progress') return;
      
      const quest = quests[questIndex];
      const objectiveIndex = quest.objectives.findIndex(o => o.id === objectiveId);
      
      if (objectiveIndex === -1) return;
      
      const objective = quest.objectives[objectiveIndex];
      const newCurrent = Math.min(objective.current + progress, objective.target);
      const completed = newCurrent >= objective.target;
      
      const updatedObjectives = [...quest.objectives];
      updatedObjectives[objectiveIndex] = {
        ...objective,
        current: newCurrent,
        completed
      };
      
      // Check if all objectives are completed
      const allCompleted = updatedObjectives.every(o => o.completed);
      
      const updatedQuests = [...quests];
      updatedQuests[questIndex] = {
        ...quest,
        objectives: updatedObjectives,
        status: allCompleted ? 'completed' : 'in_progress'
      };
      
      set({ 
        quests: updatedQuests,
        activeQuest: updatedQuests[questIndex]
      });
      
      if (allCompleted) {
        get().completeQuest(questId);
      }
    },
    completeQuest: (questId) => {
      const quests = get().quests;
      const questIndex = quests.findIndex(q => q.id === questId);
      
      if (questIndex === -1) return;
      
      const quest = quests[questIndex];
      if (quest.status !== 'in_progress' || !quest.objectives.every(o => o.completed)) return;
      
      // Update quest status
      const updatedQuests = [...quests];
      updatedQuests[questIndex] = {
        ...quest,
        status: 'completed'
      };
      
      // Apply rewards
      const { addExperience, addGold, addItem } = get();
      addExperience(quest.rewards.experience);
      addGold(quest.rewards.gold);
      
      // Handle item rewards if any
      // This would need to look up the actual item data elsewhere
      
      set({ 
        quests: updatedQuests,
        activeQuest: null 
      });
    },
    setActiveQuest: (questId) => {
      console.log("useRPG - setActiveQuest called with:", questId);
      
      if (!questId) {
        console.log("Clearing active quest");
        set({ activeQuest: null });
        return;
      }
      
      const quest = get().quests.find(q => q.id === questId);
      if (quest) {
        console.log("Found quest to activate:", quest.title);
        set({ activeQuest: quest });
      } else {
        console.log("Could not find quest with ID:", questId);
      }
    },
    
    // World and locations
    currentLocation: null,
    discoveredLocations: [],
    moveToLocation: (locationId) => {
      // This would typically fetch location data from gameData
      // For now we'll just set the ID and update discovered locations
      
      // Simplified example:
      const discoveredLocations = get().discoveredLocations;
      if (!discoveredLocations.includes(locationId)) {
        set({ 
          discoveredLocations: [...discoveredLocations, locationId],
          gamePhase: 'exploration'
        });
      } else {
        set({ gamePhase: 'exploration' });
      }
      
      // In a real implementation, you'd set currentLocation to the actual location object
    },
    
    // Combat
    inCombat: false,
    currentEnemy: null,
    startCombat: (enemyId) => {
      // This would fetch enemy data from gameData
      // For now we'll set a placeholder:
      set({ 
        inCombat: true,
        gamePhase: 'combat',
        // currentEnemy would be set to the actual enemy data
      });
    },
    endCombat: (playerWon) => {
      if (playerWon && get().currentEnemy) {
        // Handle rewards from combat
        const enemy = get().currentEnemy!;
        get().addExperience(enemy.experience);
        
        // Random gold amount between min and max
        const goldReward = Math.floor(
          Math.random() * (enemy.gold[1] - enemy.gold[0] + 1) + enemy.gold[0]
        );
        get().addGold(goldReward);
        
        // Handle loot drops if any
        // Would need to check probability and add items
      }
      
      set({ 
        inCombat: false,
        currentEnemy: null,
        gamePhase: 'exploration'
      });
    },
    attackEnemy: (skillId) => {
      const { character, currentEnemy } = get();
      if (!character || !currentEnemy || !get().inCombat) return;
      
      let damage = 0;
      let manaCost = 0;
      
      // Calculate damage based on skill or basic attack
      if (skillId) {
        const skill = character.skills.find(s => s.id === skillId);
        if (!skill) return;
        
        if (skill.damage) {
          damage = skill.damage;
        }
        manaCost = skill.manaCost;
        
        // Check if character has enough mana
        if (character.mana.current < manaCost) {
          return; // Not enough mana
        }
      } else {
        // Basic attack damage based on strength
        damage = 5 + Math.floor(character.stats.strength * 0.5);
      }
      
      // Apply damage to enemy
      const newEnemyHealth = Math.max(0, currentEnemy.health.current - damage);
      
      // Update enemy health
      set({
        currentEnemy: {
          ...currentEnemy,
          health: {
            ...currentEnemy.health,
            current: newEnemyHealth
          }
        }
      });
      
      // Use mana if skill was used
      if (skillId && manaCost > 0) {
        set({
          character: {
            ...character,
            mana: {
              ...character.mana,
              current: character.mana.current - manaCost
            }
          }
        });
      }
      
      // Check if enemy is defeated
      if (newEnemyHealth <= 0) {
        get().endCombat(true);
        return;
      }
      
      // Enemy counterattack
      // Select random attack from enemy attacks
      const enemyAttack = currentEnemy.attacks[
        Math.floor(Math.random() * currentEnemy.attacks.length)
      ];
      
      // Calculate random damage within range
      const enemyDamage = Math.floor(
        Math.random() * (enemyAttack.damage[1] - enemyAttack.damage[0] + 1) + 
        enemyAttack.damage[0]
      );
      
      get().takeDamage(enemyDamage);
    },
    takeDamage: (amount) => {
      const character = get().character;
      if (!character) return;
      
      const newHealth = Math.max(0, character.health.current - amount);
      
      set({
        character: {
          ...character,
          health: {
            ...character.health,
            current: newHealth
          }
        }
      });
      
      // Check if player is defeated
      if (newHealth <= 0) {
        get().endCombat(false);
        // Handle player death - could reset health, return to town, etc.
        set({
          character: {
            ...character,
            health: {
              ...character.health,
              current: Math.floor(character.health.max * 0.5) // Restore some health
            }
          }
        });
      }
    },
    
    // Dialogue
    currentNPC: null,
    currentDialogueId: null,
    startDialogue: (npcId) => {
      console.log(`Starting dialogue with NPC: ${npcId}`);
      // This would fetch NPC data from gameData in a real implementation
      // For now, create a simple placeholder NPC for testing dialogue interactions
      const placeholderNPC: NPC = {
        id: npcId,
        name: npcId.charAt(0).toUpperCase() + npcId.slice(1).replace(/-/g, ' '),
        type: 'friendly',
        dialogues: [
          {
            id: "start",
            text: `Hello there, traveler! I'm ${npcId.charAt(0).toUpperCase() + npcId.slice(1).replace(/-/g, ' ')}. How can I help you today?`,
            options: [
              { text: "Tell me about this place", nextId: "about_place" },
              { text: "Do you have any quests for me?", nextId: "quest_intro" },
              { text: "Goodbye", nextId: undefined }
            ]
          },
          {
            id: "about_place",
            text: "This is a peaceful village surrounded by dangerous wilderness. Be careful when you venture outside!",
            options: [
              { text: "Back", nextId: "start" }
            ]
          },
          {
            id: "quest_intro",
            text: "I might have something you can help with. There are wolves threatening our livestock.",
            options: [
              { text: "I'll help", nextId: "quest_accept", action: "quest:wolf_hunt" },
              { text: "Not interested", nextId: "start" }
            ]
          }
        ]
      };
      
      set({ 
        gamePhase: 'dialogue',
        currentNPC: placeholderNPC,
        currentDialogueId: "start"
      });
    },
    selectDialogueOption: (optionIndex) => {
      const { currentNPC, currentDialogueId } = get();
      if (!currentNPC || !currentDialogueId) {
        console.log("No current NPC or dialogue ID when selecting option");
        get().endDialogue();
        return;
      }
      
      const currentDialogue = currentNPC.dialogues.find(d => d.id === currentDialogueId);
      if (!currentDialogue || !currentDialogue.options || optionIndex >= currentDialogue.options.length) {
        console.log("Invalid dialogue or options when selecting:", optionIndex);
        get().endDialogue();
        return;
      }
      
      const selectedOption = currentDialogue.options[optionIndex];
      console.log("Selected dialogue option:", selectedOption);
      
      // Handle any action from the dialogue option
      if (selectedOption.action) {
        console.log("Executing dialogue action:", selectedOption.action);
        // Handle different actions like starting quests, trading, etc.
        if (selectedOption.action.startsWith('quest:')) {
          const questId = selectedOption.action.split(':')[1];
          get().startQuest(questId);
        }
      }
      
      // Move to next dialogue or end conversation
      if (selectedOption.nextId) {
        console.log("Moving to next dialogue:", selectedOption.nextId);
        set({ currentDialogueId: selectedOption.nextId });
      } else {
        console.log("No next dialogue, ending conversation");
        get().endDialogue();
      }
    },
    endDialogue: () => {
      console.log("Ending dialogue and returning to exploration");
      // Make sure to clear the NPC and dialogue state
      setTimeout(() => {
        set({
          currentNPC: null,
          currentDialogueId: null,
          gamePhase: 'exploration'
        });
      }, 0);
    },
    
    // Game control
    saveGame: () => {
      // Simplified save logic
      const { 
        character, 
        inventory, 
        quests, 
        gold, 
        discoveredLocations 
      } = get();
      
      const saveData = {
        character,
        inventory,
        quests,
        gold,
        discoveredLocations
      };
      
      // In a real game, you'd either send this to a server API
      // or save to local storage
      localStorage.setItem('rpg_save', JSON.stringify(saveData));
    },
    loadGame: (saveData) => {
      // Simplified load logic
      set({
        character: saveData.character,
        inventory: saveData.inventory,
        quests: saveData.quests,
        gold: saveData.gold,
        discoveredLocations: saveData.discoveredLocations,
        gamePhase: 'exploration'
      });
    },
    resetGame: () => {
      // Reset the game state
      set({ 
        gamePhase: 'title',
        character: null,
        inventory: [],
        quests: initialQuests,
        activeQuest: null,
        gold: 0,
        currentLocation: null,
        discoveredLocations: [],
        inCombat: false,
        currentEnemy: null,
        currentNPC: null,
        currentDialogueId: null
      });
    }
  }))
);
