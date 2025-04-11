import { useRPG } from "@/lib/stores/useRPG";
import { useState } from "react";
import WorldMap from "./WorldMap";
import EnhancedTerrain from "./EnhancedTerrain";
import PixelCharacter, { PixelEnemy } from "./PixelCharacter";
import PixelNPC from "./PixelNPC";
import TutorialSystem from "./TutorialSystem";
import { useAudio } from "@/lib/stores/useAudio";
import { PerspectiveCamera, Sky, Stars } from "@react-three/drei";

export default function World() {
  const { gamePhase, currentLocation, startDialogue } = useRPG();
  const { playSuccess } = useAudio();
  
  // Track day/night cycle
  const [isNightTime, setIsNightTime] = useState(false);
  
  // Handle NPC interaction
  const handleNPCInteract = (npcId: string, npcName: string) => {
    if (gamePhase !== 'exploration') return;
    
    console.log(`Starting interaction with ${npcName} (ID: ${npcId})`);
    
    // Start dialogue with the NPC
    playSuccess();
    startDialogue(npcId);
    
    // Debug log to confirm dialogue started
    setTimeout(() => {
      console.log("Current game phase after NPC interaction:", gamePhase);
    }, 100);
  };
  
  return (
    <group>
      {/* Enhanced camera with slightly elevated position */}
      <PerspectiveCamera 
        makeDefault 
        position={[0, 7, 10]} 
        fov={45} 
        near={0.1} 
        far={1000}
      />
      
      {/* Environment lighting */}
      <ambientLight intensity={isNightTime ? 0.2 : 0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={isNightTime ? 0.3 : 1.0} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Sky with day/night cycle */}
      {isNightTime ? (
        <>
          <color attach="background" args={['#030508']} />
          <Stars radius={100} depth={50} count={5000} factor={4} />
          <fog attach="fog" args={['#030508', 10, 50]} />
        </>
      ) : (
        <>
          <Sky sunPosition={[100, 10, 100]} turbidity={0.3} />
          <fog attach="fog" args={['#a1d8fc', 20, 60]} />
        </>
      )}
      
      {/* Enhanced terrain */}
      <EnhancedTerrain />
      
      {/* World elements */}
      <WorldMap />
      
      {/* Player character */}
      {gamePhase === 'exploration' && <PixelCharacter />}
      
      {/* Environment props - improved trees */}
      <group>
        {/* Trees - now using "voxel" style for consistency with characters */}
        {Array.from({ length: 20 }).map((_, i) => {
          // Pre-calculate positions using specific seeds to avoid randomness in render
          const treeX = -20 + (i * 2) % 40;
          const treeZ = -20 + Math.floor(i / 10) * 5;
          const treeHeight = 3 + (i % 3);
          return (
            <group key={`tree-${i}`} position={[treeX, 0, treeZ]}>
              {/* Tree trunk - voxel style */}
              <mesh position={[0, treeHeight/2, 0]} castShadow>
                <boxGeometry args={[0.8, treeHeight, 0.8]} />
                <meshStandardMaterial color="#8B4513" roughness={0.9} />
              </mesh>
              
              {/* Tree foliage - voxel style with multiple blocks */}
              <group position={[0, treeHeight, 0]}>
                <mesh position={[0, 0, 0]} castShadow>
                  <boxGeometry args={[2, 1, 2]} />
                  <meshStandardMaterial color="#2E8B57" roughness={0.8} />
                </mesh>
                <mesh position={[0, 1, 0]} castShadow>
                  <boxGeometry args={[1.5, 1, 1.5]} />
                  <meshStandardMaterial color="#2E7D32" roughness={0.8} />
                </mesh>
                <mesh position={[0, 2, 0]} castShadow>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color="#1B5E20" roughness={0.8} />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>
      
      {/* NPC characters - using pixel-style representations */}
      <group>
        {/* Merchant NPC */}
        <PixelNPC
          position={[5, 0, 5]}
          npcType="merchant"
          npcName="Traveling Merchant"
          onInteract={() => handleNPCInteract("merchant", "Traveling Merchant")}
        />
        
        {/* Quest giver */}
        <PixelNPC
          position={[-5, 0, -5]}
          npcType="quest"
          npcName="Village Elder"
          onInteract={() => handleNPCInteract("village-elder", "Village Elder")}
        />
        
        {/* Villager */}
        <PixelNPC
          position={[8, 0, -3]}
          npcType="villager"
          npcName="Village Farmer"
          onInteract={() => handleNPCInteract("villager", "Village Farmer")}
        />
      </group>
      
      {/* Enemy character visible in the distance */}
      <PixelEnemy 
        position={[-10, 0, -10]} 
        enemyType="wolf"
      />
    </group>
  );
}
