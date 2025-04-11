import { Character, Enemy, InventoryItem } from "@shared/schema";
import { calculateDamage, getEquippedItems, generateLootFromEnemy } from "./gameData";

// Combat status tracker
export interface CombatStatus {
  isPlayerTurn: boolean;
  combatLog: string[];
  turnCount: number;
  lastAttack: string | null;
  enemyIntent: string | null;
  isOver: boolean;
  playerWon: boolean;
}

// Initialize a new combat encounter
export function initializeCombat(enemy: Enemy): CombatStatus {
  return {
    isPlayerTurn: true, // Player always goes first
    combatLog: [`Combat with ${enemy.name} has begun!`],
    turnCount: 1,
    lastAttack: null,
    enemyIntent: getRandomEnemyAttack(enemy),
    isOver: false,
    playerWon: false
  };
}

// Function to get a random attack from an enemy
function getRandomEnemyAttack(enemy: Enemy): string {
  if (!enemy.attacks || enemy.attacks.length === 0) {
    return "Attack";
  }
  
  const randomAttack = enemy.attacks[Math.floor(Math.random() * enemy.attacks.length)];
  return randomAttack.name;
}

// Process player's attack on enemy
export function playerAttack(
  character: Character,
  enemy: Enemy,
  inventory: InventoryItem[],
  skillId: string | undefined,
  combatStatus: CombatStatus
): {
  updatedEnemy: Enemy;
  updatedCharacter: Character;
  updatedCombatStatus: CombatStatus;
} {
  // Check if combat is already over
  if (combatStatus.isOver) {
    return { 
      updatedEnemy: enemy, 
      updatedCharacter: character, 
      updatedCombatStatus: combatStatus 
    };
  }
  
  let damage = 0;
  let manaCost = 0;
  let attackName = "Basic Attack";
  const updatedCombatStatus = { ...combatStatus };
  
  // Calculate damage based on skill or basic attack
  if (skillId) {
    const skill = character.skills.find(s => s.id === skillId);
    if (!skill) {
      updatedCombatStatus.combatLog.push("Skill not found. Using basic attack instead.");
    } else if (character.mana.current < skill.manaCost) {
      updatedCombatStatus.combatLog.push(`Not enough mana to use ${skill.name}!`);
      return { 
        updatedEnemy: enemy, 
        updatedCharacter: character, 
        updatedCombatStatus 
      };
    } else {
      attackName = skill.name;
      
      // Apply damage if the skill has damage
      if (skill.damage) {
        damage = skill.damage;
      }
      
      // Apply healing if the skill has healing
      if (skill.healing) {
        const updatedCharacter = { ...character };
        const newHealth = Math.min(
          character.health.max,
          character.health.current + skill.healing
        );
        
        updatedCharacter.mana.current -= skill.manaCost;
        updatedCharacter.health.current = newHealth;
        
        updatedCombatStatus.combatLog.push(
          `You used ${skill.name} and healed for ${skill.healing} health!`
        );
        
        // Switch to enemy turn
        updatedCombatStatus.isPlayerTurn = false;
        
        return {
          updatedEnemy: enemy,
          updatedCharacter,
          updatedCombatStatus
        };
      }
      
      manaCost = skill.manaCost;
    }
  }
  
  // If no skill was used or skill had no damage, use basic attack damage
  if (damage === 0) {
    // Calculate damage based on strength and equipped weapon
    const equippedWeapon = getEquippedItems(inventory).find(item => item.type === 'weapon');
    const weaponDamage = equippedWeapon?.stats?.damage || 0;
    
    // Basic attack formula: 5 base + strength modifier + weapon damage
    damage = calculateDamage(5, character.stats, weaponDamage);
  }
  
  // Apply damage to enemy
  const updatedEnemy = { ...enemy };
  updatedEnemy.health.current = Math.max(0, enemy.health.current - damage);
  
  // Reduce character's mana if a skill was used
  const updatedCharacter = { ...character };
  if (manaCost > 0) {
    updatedCharacter.mana.current = Math.max(0, character.mana.current - manaCost);
  }
  
  // Update combat log
  updatedCombatStatus.combatLog.push(
    `You used ${attackName} and dealt ${damage} damage to ${enemy.name}!`
  );
  
  // Check if enemy is defeated
  if (updatedEnemy.health.current <= 0) {
    updatedCombatStatus.isOver = true;
    updatedCombatStatus.playerWon = true;
    updatedCombatStatus.combatLog.push(`You defeated the ${enemy.name}!`);
    return { 
      updatedEnemy, 
      updatedCharacter, 
      updatedCombatStatus 
    };
  }
  
  // Switch to enemy turn
  updatedCombatStatus.isPlayerTurn = false;
  updatedCombatStatus.lastAttack = attackName;
  
  return { 
    updatedEnemy, 
    updatedCharacter, 
    updatedCombatStatus 
  };
}

// Process enemy's attack on player
export function enemyAttack(
  character: Character,
  enemy: Enemy,
  combatStatus: CombatStatus
): {
  updatedCharacter: Character;
  updatedCombatStatus: CombatStatus;
} {
  // Check if combat is already over
  if (combatStatus.isOver) {
    return { 
      updatedCharacter: character, 
      updatedCombatStatus: combatStatus 
    };
  }
  
  const updatedCombatStatus = { ...combatStatus };
  
  // Determine which attack the enemy is using
  const attackName = updatedCombatStatus.enemyIntent || "Attack";
  const attackData = enemy.attacks.find(a => a.name === attackName);
  
  // Calculate damage
  let damage = 0;
  
  if (attackData) {
    // Random damage between min and max
    damage = Math.floor(
      Math.random() * (attackData.damage[1] - attackData.damage[0] + 1) + 
      attackData.damage[0]
    );
  } else {
    // Fallback damage if attack not found
    damage = Math.floor(3 + enemy.level * 1.5);
  }
  
  // Apply damage to character
  const updatedCharacter = { ...character };
  updatedCharacter.health.current = Math.max(0, character.health.current - damage);
  
  // Update combat log
  updatedCombatStatus.combatLog.push(
    `${enemy.name} used ${attackName} and dealt ${damage} damage to you!`
  );
  
  // Check if player is defeated
  if (updatedCharacter.health.current <= 0) {
    updatedCombatStatus.isOver = true;
    updatedCombatStatus.playerWon = false;
    updatedCombatStatus.combatLog.push("You have been defeated!");
  } else {
    // Prepare for next turn
    updatedCombatStatus.isPlayerTurn = true;
    updatedCombatStatus.turnCount += 1;
    updatedCombatStatus.enemyIntent = getRandomEnemyAttack(enemy);
  }
  
  return { 
    updatedCharacter, 
    updatedCombatStatus 
  };
}

// Process combat rewards when player wins
export function processCombatRewards(
  enemy: Enemy,
  character: Character,
  inventory: InventoryItem[]
): {
  experience: number;
  gold: number;
  loot: InventoryItem[];
  updatedCharacter: Character;
} {
  // Calculate experience gained
  const experience = enemy.experience;
  
  // Calculate gold gained (random between min and max)
  const gold = Math.floor(
    Math.random() * (enemy.gold[1] - enemy.gold[0] + 1) + 
    enemy.gold[0]
  );
  
  // Generate loot drops
  const loot = generateLootFromEnemy(enemy);
  
  // Apply experience to character
  const updatedCharacter = { ...character };
  updatedCharacter.experience += experience;
  
  // Check if character leveled up
  const expForNextLevel = character.level * 100;
  if (updatedCharacter.experience >= expForNextLevel) {
    updatedCharacter.level += 1;
    updatedCharacter.experience -= expForNextLevel;
    
    // Increase stats on level up
    updatedCharacter.health.max += 10;
    updatedCharacter.health.current = updatedCharacter.health.max; // Fully heal on level up
    updatedCharacter.mana.max += 5;
    updatedCharacter.mana.current = updatedCharacter.mana.max; // Fully restore mana on level up
    
    // Increase one random stat
    const stats = ['strength', 'intelligence', 'dexterity', 'constitution', 'charisma'] as const;
    const randomStat = stats[Math.floor(Math.random() * stats.length)];
    updatedCharacter.stats[randomStat] += 1;
  }
  
  return {
    experience,
    gold,
    loot,
    updatedCharacter
  };
}

// Check if character can escape from combat
export function attemptEscape(
  character: Character,
  enemy: Enemy,
  combatStatus: CombatStatus
): {
  escaped: boolean;
  updatedCombatStatus: CombatStatus;
} {
  const updatedCombatStatus = { ...combatStatus };
  
  // Escape chance based on character's dexterity vs enemy level
  const escapeChance = 0.3 + (character.stats.dexterity * 0.05) - (enemy.level * 0.05);
  const escaped = Math.random() < escapeChance;
  
  if (escaped) {
    updatedCombatStatus.isOver = true;
    updatedCombatStatus.combatLog.push("You successfully escaped from combat!");
  } else {
    updatedCombatStatus.combatLog.push("You failed to escape!");
    // Player loses their turn when escape fails
    updatedCombatStatus.isPlayerTurn = false;
  }
  
  return {
    escaped,
    updatedCombatStatus
  };
}

// Calculate defense value from character stats and equipment
export function calculateDefense(
  character: Character,
  inventory: InventoryItem[]
): number {
  // Base defense from constitution
  let defense = Math.floor(character.stats.constitution * 0.5);
  
  // Add defense from equipped armor
  const equippedArmor = getEquippedItems(inventory).filter(item => item.type === 'armor');
  
  equippedArmor.forEach(armor => {
    if (armor.stats && armor.stats.defense) {
      defense += armor.stats.defense;
    }
  });
  
  return defense;
}

// Utility function for displaying combat status messages
export function getCombatStatusMessage(combatStatus: CombatStatus): string {
  if (combatStatus.isOver) {
    return combatStatus.playerWon 
      ? "Victory! You defeated the enemy." 
      : "Defeat! You have been beaten.";
  }
  
  return combatStatus.isPlayerTurn 
    ? "Your turn - choose an action!" 
    : "Enemy is preparing to attack...";
}
