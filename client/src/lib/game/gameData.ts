import { 
  Character, 
  InventoryItem, 
  Quest, 
  NPC, 
  Enemy,
  MapLocation 
} from "@shared/schema";

// Initial character template
export const initialCharacter: Character = {
  name: "",
  level: 1,
  experience: 0,
  stats: {
    strength: 5,
    intelligence: 5,
    dexterity: 5,
    constitution: 5,
    charisma: 5,
  },
  health: {
    current: 100,
    max: 100,
  },
  mana: {
    current: 50,
    max: 50,
  },
  skills: [
    {
      id: "slash",
      name: "Slash",
      description: "A powerful slashing attack",
      level: 1,
      damage: 15,
      manaCost: 5,
    },
    {
      id: "fireball",
      name: "Fireball",
      description: "Hurls a ball of fire at the enemy",
      level: 1,
      damage: 20,
      manaCost: 15,
    },
    {
      id: "heal",
      name: "Heal",
      description: "Recover some health points",
      level: 1,
      healing: 25,
      manaCost: 20,
    }
  ],
  gold: 50,
};

// Starting inventory items
export const startingInventory: InventoryItem[] = [
  {
    id: "rusty-sword",
    name: "Rusty Sword",
    description: "An old sword with some rust. Better than nothing.",
    type: "weapon",
    value: 10,
    stats: {
      damage: 5,
      strength: 1
    },
    quantity: 1,
    equipped: true
  },
  {
    id: "leather-armor",
    name: "Leather Armor",
    description: "Basic protection made of tanned hide.",
    type: "armor",
    value: 15,
    stats: {
      defense: 3,
      constitution: 1
    },
    quantity: 1,
    equipped: true
  },
  {
    id: "health-potion",
    name: "Health Potion",
    description: "A red liquid that restores 30 health points when consumed.",
    type: "potion",
    value: 5,
    stats: {
      healing: 30
    },
    quantity: 3
  }
];

// Initial quests
export const initialQuests: Quest[] = [
  {
    id: "forest-cleanse",
    title: "Clear the Forest Path",
    description: "The path to the neighboring village has been overrun with monsters. Clear them out to make travel safe again.",
    status: "not_started",
    objectives: [
      {
        id: "kill-wolves",
        description: "Defeat forest wolves",
        current: 0,
        target: 3,
        completed: false
      },
      {
        id: "kill-goblin",
        description: "Defeat goblin scout",
        current: 0,
        target: 1,
        completed: false
      }
    ],
    rewards: {
      experience: 100,
      gold: 50,
      items: ["forest-map"]
    }
  },
  {
    id: "missing-supplies",
    title: "Missing Supplies",
    description: "A merchant's supplies have gone missing. Find out what happened to them.",
    status: "not_started",
    objectives: [
      {
        id: "investigate-campsite",
        description: "Investigate abandoned campsite",
        current: 0,
        target: 1,
        completed: false
      },
      {
        id: "find-supplies",
        description: "Locate missing supplies",
        current: 0,
        target: 1,
        completed: false
      },
      {
        id: "return-supplies",
        description: "Return supplies to merchant",
        current: 0,
        target: 1,
        completed: false
      }
    ],
    rewards: {
      experience: 150,
      gold: 75
    }
  }
];

// NPCs in the game
export const npcs: NPC[] = [
  {
    id: "village-elder",
    name: "Village Elder",
    type: "friendly",
    dialogues: [
      {
        id: "start",
        text: "Welcome, traveler. Our village has been troubled by strange creatures emerging from the forest. Could you help us?",
        options: [
          { text: "I'll help you", nextId: "accept" },
          { text: "What's in it for me?", nextId: "reward" },
          { text: "I need to go", nextId: null }
        ]
      },
      {
        id: "accept",
        text: "Thank you! Clear the forest of monsters and return to me for a reward.",
        options: [
          { text: "I'll start right away", nextId: null, action: "quest:forest-cleanse" },
          { text: "Tell me more first", nextId: "more-info" }
        ]
      },
      {
        id: "reward",
        text: "The village will reward you with gold and a magic item if you succeed.",
        options: [
          { text: "That sounds fair", nextId: "accept" },
          { text: "Not interested", nextId: null }
        ]
      },
      {
        id: "more-info",
        text: "The monsters appeared about a week ago. They attack at night. Several villagers have gone missing.",
        options: [
          { text: "I understand", nextId: null, action: "quest:forest-cleanse" }
        ]
      }
    ]
  },
  {
    id: "merchant",
    name: "Traveling Merchant",
    type: "friendly",
    dialogues: [
      {
        id: "start",
        text: "Greetings! Would you like to see my wares, or perhaps you can help me with something?",
        options: [
          { text: "Show me what you're selling", nextId: "shop" },
          { text: "What do you need help with?", nextId: "quest" },
          { text: "Just passing by", nextId: null }
        ]
      },
      {
        id: "shop",
        text: "I have potions, weapons, and some rare artifacts. What are you interested in?",
        options: [
          { text: "Potions", nextId: "shop-potions", action: "shop:potions" },
          { text: "Weapons", nextId: "shop-weapons", action: "shop:weapons" },
          { text: "Nevermind", nextId: "start" }
        ]
      },
      {
        id: "quest",
        text: "My supply caravan was attacked on the road. I managed to escape, but all my goods were stolen. Could you help me recover them?",
        options: [
          { text: "I'll help you find your supplies", nextId: "quest-accept", action: "quest:missing-supplies" },
          { text: "Sorry, too busy", nextId: "start" }
        ]
      },
      {
        id: "quest-accept",
        text: "Thank you! Last I saw, the bandits were heading toward the old campsite east of here. Be careful!",
        options: [
          { text: "I'll be back with your supplies", nextId: null }
        ]
      }
    ]
  }
];

// Enemies in the game
export const enemies: Enemy[] = [
  {
    id: "forest-wolf",
    name: "Forest Wolf",
    level: 2,
    health: {
      current: 50,
      max: 50
    },
    stats: {
      strength: 3,
      intelligence: 1,
      dexterity: 4
    },
    attacks: [
      {
        name: "Bite",
        damage: [5, 8],
        description: "A vicious bite with sharp teeth"
      },
      {
        name: "Claw",
        damage: [3, 6],
        description: "A swift swipe with sharp claws"
      }
    ],
    experience: 30,
    gold: [5, 10],
    loot: [
      {
        itemId: "wolf-pelt",
        chance: 0.7
      },
      {
        itemId: "wolf-fang",
        chance: 0.3
      }
    ]
  },
  {
    id: "goblin-scout",
    name: "Goblin Scout",
    level: 3,
    health: {
      current: 60,
      max: 60
    },
    stats: {
      strength: 2,
      intelligence: 2,
      dexterity: 5
    },
    attacks: [
      {
        name: "Dagger Slash",
        damage: [6, 9],
        description: "A quick slash with a rusty dagger"
      },
      {
        name: "Throw Rock",
        damage: [4, 7],
        description: "Throws a sharp rock with surprising accuracy"
      }
    ],
    experience: 40,
    gold: [10, 15],
    loot: [
      {
        itemId: "goblin-dagger",
        chance: 0.5
      },
      {
        itemId: "goblin-ear",
        chance: 0.8
      }
    ]
  },
  {
    id: "bandit",
    name: "Forest Bandit",
    level: 4,
    health: {
      current: 75,
      max: 75
    },
    stats: {
      strength: 4,
      intelligence: 3,
      dexterity: 4
    },
    attacks: [
      {
        name: "Sword Swing",
        damage: [8, 12],
        description: "A powerful swing with a short sword"
      },
      {
        name: "Quick Stab",
        damage: [5, 9],
        description: "A fast, precise stab"
      }
    ],
    experience: 50,
    gold: [15, 25],
    loot: [
      {
        itemId: "bandit-sword",
        chance: 0.4
      },
      {
        itemId: "leather-gloves",
        chance: 0.6
      }
    ]
  }
];

// Game locations
export const locations: MapLocation[] = [
  {
    id: "town",
    name: "Oakvale Village",
    description: "A peaceful village nestled between rolling hills and dense forests.",
    npcs: ["village-elder", "merchant"],
    enemies: [],
    quests: ["forest-cleanse", "missing-supplies"],
    connectedLocations: ["forest", "cave"],
    background: "grass",
    discovered: true
  },
  {
    id: "forest",
    name: "Whispering Woods",
    description: "An ancient forest where the trees seem to whisper secrets to one another.",
    npcs: [],
    enemies: ["forest-wolf", "goblin-scout"],
    quests: [],
    connectedLocations: ["town", "mountain"],
    background: "grass",
    discovered: false
  },
  {
    id: "cave",
    name: "Shadow Cave",
    description: "A dark cave system rumored to be home to dangerous creatures and hidden treasures.",
    npcs: [],
    enemies: ["goblin-scout", "bandit"],
    quests: [],
    connectedLocations: ["town"],
    background: "sand",
    discovered: false
  },
  {
    id: "mountain",
    name: "Frost Peak",
    description: "A towering mountain with snow-capped peaks and treacherous paths.",
    npcs: [],
    enemies: ["bandit"],
    quests: [],
    connectedLocations: ["forest"],
    background: "asphalt",
    discovered: false
  }
];

// All inventory items in the game (including those not initially owned)
export const allItems: InventoryItem[] = [
  ...startingInventory,
  {
    id: "steel-sword",
    name: "Steel Sword",
    description: "A well-crafted sword made of quality steel.",
    type: "weapon",
    value: 50,
    stats: {
      damage: 12,
      strength: 2
    },
    quantity: 1
  },
  {
    id: "chainmail",
    name: "Chainmail Armor",
    description: "Protective armor made of interlocking metal rings.",
    type: "armor",
    value: 75,
    stats: {
      defense: 8,
      constitution: 2
    },
    quantity: 1
  },
  {
    id: "mana-potion",
    name: "Mana Potion",
    description: "A blue liquid that restores 25 mana points when consumed.",
    type: "potion",
    value: 10,
    stats: {
      mana: 25
    },
    quantity: 1
  },
  {
    id: "forest-map",
    name: "Forest Map",
    description: "A detailed map of the Whispering Woods. Reveals hidden paths and locations.",
    type: "quest",
    value: 20,
    quantity: 1
  },
  {
    id: "wolf-pelt",
    name: "Wolf Pelt",
    description: "The fur of a forest wolf. Can be sold or used for crafting.",
    type: "misc",
    value: 8,
    quantity: 1
  },
  {
    id: "wolf-fang",
    name: "Wolf Fang",
    description: "A sharp fang from a forest wolf. Prized by some collectors.",
    type: "misc",
    value: 5,
    quantity: 1
  },
  {
    id: "goblin-dagger",
    name: "Goblin Dagger",
    description: "A crude but effective small dagger used by goblins.",
    type: "weapon",
    value: 15,
    stats: {
      damage: 8,
      dexterity: 1
    },
    quantity: 1
  },
  {
    id: "goblin-ear",
    name: "Goblin Ear",
    description: "A gruesome trophy. Proof of defeating a goblin.",
    type: "misc",
    value: 3,
    quantity: 1
  },
  {
    id: "bandit-sword",
    name: "Bandit's Sword",
    description: "A well-used but decent quality sword taken from a bandit.",
    type: "weapon",
    value: 25,
    stats: {
      damage: 10,
      strength: 1
    },
    quantity: 1
  },
  {
    id: "leather-gloves",
    name: "Leather Gloves",
    description: "Protective gloves made of tough leather.",
    type: "armor",
    value: 12,
    stats: {
      defense: 2,
      dexterity: 1
    },
    quantity: 1
  }
];

// Function to retrieve enemy information by ID
export function getEnemyById(enemyId: string): Enemy | undefined {
  return enemies.find(enemy => enemy.id === enemyId);
}

// Function to retrieve NPC information by ID
export function getNpcById(npcId: string): NPC | undefined {
  return npcs.find(npc => npc.id === npcId);
}

// Function to retrieve item information by ID
export function getItemById(itemId: string): InventoryItem | undefined {
  return allItems.find(item => item.id === itemId);
}

// Function to retrieve location information by ID
export function getLocationById(locationId: string): MapLocation | undefined {
  return locations.find(location => location.id === locationId);
}

// Function to get a random enemy for an encounter at a specific location
export function getRandomEnemyForLocation(locationId: string): Enemy | undefined {
  const location = getLocationById(locationId);
  
  if (!location || location.enemies.length === 0) {
    return undefined;
  }
  
  const enemyId = location.enemies[Math.floor(Math.random() * location.enemies.length)];
  return getEnemyById(enemyId);
}

// Function to get a random loot drop from an enemy
export function generateLootFromEnemy(enemy: Enemy): InventoryItem[] {
  const loot: InventoryItem[] = [];
  
  if (!enemy.loot || enemy.loot.length === 0) {
    return loot;
  }
  
  enemy.loot.forEach(lootItem => {
    // Check if the item should drop based on chance
    if (Math.random() <= lootItem.chance) {
      const item = getItemById(lootItem.itemId);
      if (item) {
        // Clone the item and set quantity to 1
        loot.push({
          ...item,
          quantity: 1
        });
      }
    }
  });
  
  return loot;
}

// Calculate the experience required for the next level
export function getExperienceForNextLevel(currentLevel: number): number {
  return currentLevel * 100;
}

// Calculate combat damage based on stats and equipment
export function calculateDamage(
  baseDamage: number, 
  attackerStats: Character['stats'] | Enemy['stats'], 
  equipmentBonus: number = 0
): number {
  // Formula: base damage + (strength * 0.5) + equipment bonus
  const strengthBonus = 'strength' in attackerStats ? attackerStats.strength * 0.5 : 0;
  return Math.floor(baseDamage + strengthBonus + equipmentBonus);
}

// Get all equipped items from inventory
export function getEquippedItems(inventory: InventoryItem[]): InventoryItem[] {
  return inventory.filter(item => item.equipped);
}

// Apply stat bonuses from all equipped items to character
export function applyEquipmentBonuses(
  character: Character, 
  inventory: InventoryItem[]
): Character {
  const equippedItems = getEquippedItems(inventory);
  
  // Start with a copy of the base character
  const enhancedCharacter = { ...character };
  
  // Apply stat bonuses from equipped items
  equippedItems.forEach(item => {
    if (item.stats) {
      // Add weapon damage, armor defense, etc.
      Object.entries(item.stats).forEach(([stat, value]) => {
        if (stat === 'strength' || stat === 'intelligence' || 
            stat === 'dexterity' || stat === 'constitution' || 
            stat === 'charisma') {
          enhancedCharacter.stats[stat] += value;
        }
      });
    }
  });
  
  return enhancedCharacter;
}
