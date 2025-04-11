import { useRPG } from "@/lib/stores/useRPG";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Box } from "@react-three/drei";
import * as THREE from "three";
import { useAudio } from "@/lib/stores/useAudio";

export default function Combat() {
  const { character, currentEnemy, attackEnemy } = useRPG();
  const enemyRef = useRef<THREE.Mesh>(null);
  const attackTimeRef = useRef(0);
  const { playHit } = useAudio();
  
  // Enemy bobbing animation
  useFrame((state) => {
    if (enemyRef.current) {
      // Bob up and down
      enemyRef.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      
      // Rotate slightly
      enemyRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
    
    // Handle attack cooldown
    if (attackTimeRef.current > 0) {
      attackTimeRef.current -= state.clock.elapsedTime;
    }
  });
  
  // Play hit sound on every enemy appearance
  useEffect(() => {
    if (currentEnemy) {
      playHit();
    }
  }, [currentEnemy, playHit]);
  
  if (!character || !currentEnemy) return null;
  
  return (
    <group position={[0, 0, -5]}>
      {/* Enemy character */}
      <Box 
        ref={enemyRef} 
        position={[0, 1, 0]} 
        args={[1.2, 1.2, 1.2]} 
        castShadow
      >
        <meshStandardMaterial color="#D32F2F" />
      </Box>
      
      {/* Enemy name */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.6}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {currentEnemy.name}
      </Text>
      
      {/* Enemy health bar background */}
      <mesh position={[0, 2, 0]}>
        <planeGeometry args={[2, 0.2]} />
        <meshBasicMaterial color="#444444" />
      </mesh>
      
      {/* Enemy health bar fill */}
      <mesh 
        position={[
          -1 + (currentEnemy.health.current / currentEnemy.health.max),
          2,
          0.01
        ]}
        scale={[
          (currentEnemy.health.current / currentEnemy.health.max),
          1,
          1
        ]}
      >
        <planeGeometry args={[2, 0.2]} />
        <meshBasicMaterial color="#D32F2F" />
      </mesh>
      
      {/* Combat effects - particle system or similar would go here */}
    </group>
  );
}

// Combat UI overlay component
export function CombatUI() {
  const { character, currentEnemy, attackEnemy, gamePhase } = useRPG();
  const { playHit } = useAudio();
  
  if (gamePhase !== 'combat' || !character || !currentEnemy) return null;
  
  const handleAttack = () => {
    playHit();
    attackEnemy();
  };
  
  const handleSkill = (skillId: string) => {
    playHit();
    attackEnemy(skillId);
  };
  
  const healthPercent = (character.health.current / character.health.max) * 100;
  const manaPercent = (character.mana.current / character.mana.max) * 100;
  const enemyHealthPercent = (currentEnemy.health.current / currentEnemy.health.max) * 100;
  
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 p-4 border-t border-gray-700">
      <div className="flex justify-between mb-3">
        <div className="w-1/2 pr-2">
          <h3 className="text-white font-bold mb-1">{character.name}</h3>
          <div className="w-full h-4 bg-gray-700 rounded-full mb-1">
            <div 
              className="h-full bg-red-600 rounded-full" 
              style={{ width: `${healthPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-white">
            <span>HP: {character.health.current}/{character.health.max}</span>
            <span>Level: {character.level}</span>
          </div>
          
          <div className="w-full h-3 bg-gray-700 rounded-full mt-2">
            <div 
              className="h-full bg-blue-600 rounded-full" 
              style={{ width: `${manaPercent}%` }}
            ></div>
          </div>
          <div className="text-xs text-white">
            <span>MP: {character.mana.current}/{character.mana.max}</span>
          </div>
        </div>
        
        <div className="w-1/2 pl-2">
          <h3 className="text-white font-bold mb-1">{currentEnemy.name}</h3>
          <div className="w-full h-4 bg-gray-700 rounded-full">
            <div 
              className="h-full bg-red-600 rounded-full" 
              style={{ width: `${enemyHealthPercent}%` }}
            ></div>
          </div>
          <div className="text-xs text-white">
            <span>HP: {currentEnemy.health.current}/{currentEnemy.health.max}</span>
          </div>
          <div className="text-sm text-gray-300 mt-1">
            <span>Level {currentEnemy.level} Enemy</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <button 
          onClick={handleAttack}
          className="flex-1 bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded"
        >
          Attack
        </button>
        
        {/* Display character skills */}
        {character.skills.map(skill => (
          <button 
            key={skill.id}
            onClick={() => handleSkill(skill.id)}
            disabled={character.mana.current < skill.manaCost}
            className={`flex-1 py-2 px-3 rounded text-white ${
              character.mana.current < skill.manaCost 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-700 hover:bg-blue-800'
            }`}
            title={`${skill.description} (${skill.manaCost} MP)`}
          >
            {skill.name}
          </button>
        ))}
      </div>
      
      <div className="mt-2 text-sm text-gray-300">
        <p>Combat log: You prepare to fight against the {currentEnemy.name}!</p>
      </div>
    </div>
  );
}
