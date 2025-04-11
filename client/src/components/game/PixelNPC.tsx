import { useRef, useMemo } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

// Configuration for pixel-style voxel characters
interface VoxelConfig {
  color: string;
  size: [number, number, number];
  position: [number, number, number];
}

// Pixel NPC component with improved interaction
export function PixelNPC({ 
  position, 
  npcType = 'villager', 
  npcName = 'NPC',
  onInteract
}: { 
  position: [number, number, number],
  npcType?: 'villager' | 'merchant' | 'quest',
  npcName?: string,
  onInteract?: () => void
}) {
  const npcRef = useRef<THREE.Group>(null);
  const animationTimeRef = useRef<number>(0);
  
  // NPC color themes based on type
  const npcColors = {
    villager: { body: "#4CAF50", head: "#FFECB3" },
    merchant: { body: "#FFD700", head: "#FFECB3" },
    quest: { body: "#9C27B0", head: "#FFECB3" }
  };
  
  const colors = npcColors[npcType];
  
  // Voxel-based NPC definition
  const baseNpcVoxels: VoxelConfig[] = [
    // Body
    { color: colors.body, size: [0.8, 1, 0.5], position: [0, 0.5, 0] },
    
    // Head
    { color: colors.head, size: [0.6, 0.6, 0.5], position: [0, 1.3, 0] },
    
    // Eyes
    { color: "#FFFFFF", size: [0.15, 0.15, 0.1], position: [-0.15, 1.4, 0.3] },
    { color: "#FFFFFF", size: [0.15, 0.15, 0.1], position: [0.15, 1.4, 0.3] },
    
    // Pupils
    { color: "#000000", size: [0.07, 0.07, 0.05], position: [-0.15, 1.4, 0.35] },
    { color: "#000000", size: [0.07, 0.07, 0.05], position: [0.15, 1.4, 0.35] },
    
    // Arms
    { color: npcType === 'merchant' ? "#FFA000" : (npcType === 'quest' ? "#7B1FA2" : "#388E3C"), 
      size: [0.3, 0.7, 0.3], 
      position: [-0.55, 0.5, 0] },
    { color: npcType === 'merchant' ? "#FFA000" : (npcType === 'quest' ? "#7B1FA2" : "#388E3C"), 
      size: [0.3, 0.7, 0.3], 
      position: [0.55, 0.5, 0] },
    
    // Legs
    { color: npcType === 'merchant' ? "#FFC107" : (npcType === 'quest' ? "#6A1B9A" : "#2E7D32"), 
      size: [0.35, 0.5, 0.4], 
      position: [-0.25, -0.25, 0] },
    { color: npcType === 'merchant' ? "#FFC107" : (npcType === 'quest' ? "#6A1B9A" : "#2E7D32"), 
      size: [0.35, 0.5, 0.4], 
      position: [0.25, -0.25, 0] },
  ];
  
  // Add special accessories based on NPC type
  const accessoryVoxels: VoxelConfig[] = useMemo(() => {
    if (npcType === 'merchant') {
      return [
        // Merchant hat
        { color: "#E65100", size: [0.7, 0.2, 0.7], position: [0, 1.7, 0] }
      ];
    } else if (npcType === 'quest') {
      return [
        // Quest giver scroll
        { color: "#F5F5F5", size: [0.2, 0.5, 0.1], position: [0.6, 0.7, 0.2] }
      ];
    }
    return [];
  }, [npcType]);
  
  // Combine base voxels with accessories
  const npcVoxels: VoxelConfig[] = useMemo(() => {
    return [...baseNpcVoxels, ...accessoryVoxels];
  }, [npcType, colors, baseNpcVoxels, accessoryVoxels]);
  
  useFrame((state, delta) => {
    if (!npcRef.current) return;
    
    // Gentle idle animation
    animationTimeRef.current += delta;
    npcRef.current.position.y = position[1] + Math.sin(animationTimeRef.current) * 0.05;
    npcRef.current.rotation.y = Math.sin(animationTimeRef.current * 0.5) * 0.2;
  });
  
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    // Properly handle Three.js events
    e.stopPropagation();
    console.log(`Clicked on NPC: ${npcName}`);
    
    // Visual feedback on click - bounce the NPC slightly
    if (npcRef.current) {
      npcRef.current.position.y += 0.3;
      setTimeout(() => {
        if (npcRef.current) {
          npcRef.current.position.y -= 0.3;
        }
      }, 200);
    }
    
    // Execute the callback
    if (onInteract) {
      console.log("Calling onInteract callback");
      onInteract();
    } else {
      console.warn("No onInteract callback provided for NPC:", npcName);
    }
  };
  
  return (
    <group>
      {/* Pixel NPC made of voxels */}
      <group 
        ref={npcRef} 
        position={position}
      >
        {/* Clickable hitbox for the NPC - slightly larger than the character */}
        <mesh 
          onClick={handleClick} 
          position={[0, 1, 0]} 
          visible={false}
        >
          <boxGeometry args={[1.5, 3, 1.5]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        
        {npcVoxels.map((voxel, index) => (
          <mesh 
            key={`npc-voxel-${index}`} 
            position={voxel.position} 
            castShadow
          >
            <boxGeometry args={voxel.size} />
            <meshStandardMaterial 
              color={voxel.color} 
              roughness={0.8}
            />
          </mesh>
        ))}
      </group>
      
      {/* Interaction prompt */}
      <Text
        position={[position[0], position[1] + 2.8, position[2]]}
        fontSize={0.3}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000000"
      >
        [Click to talk]
      </Text>
      
      {/* NPC name floating above */}
      <Text
        position={[position[0], position[1] + 2.3, position[2]]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {npcName}
      </Text>
    </group>
  );
}

export default PixelNPC;