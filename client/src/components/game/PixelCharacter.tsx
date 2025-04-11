import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useRPG } from "@/lib/stores/useRPG";

// Configuration for pixel-style voxel characters
interface VoxelConfig {
  color: string;
  size: [number, number, number];
  position: [number, number, number];
}

// Player character made of voxels to create a pixel-art 3D look
export default function PixelCharacter() {
  const playerRef = useRef<THREE.Group>(null);
  const { character, setCameraPosition } = useRPG();
  
  // Get movement controls
  const forwardPressed = useKeyboardControls((state: any) => state.forward);
  const backwardPressed = useKeyboardControls((state: any) => state.backward);
  const leftwardPressed = useKeyboardControls((state: any) => state.leftward);
  const rightwardPressed = useKeyboardControls((state: any) => state.rightward);

  // Movement settings
  const moveSpeed = 0.08;
  
  // Character last direction for animation
  const directionRef = useRef<string>("down");
  const animationTimeRef = useRef<number>(0);
  
  // Voxel-based character definition (pixel-art style)
  const characterVoxels: VoxelConfig[] = useMemo(() => [
    // Body (blue)
    { color: "#1E88E5", size: [0.8, 1, 0.5], position: [0, 0.5, 0] },
    
    // Head (skin tone)
    { color: "#FFD0B0", size: [0.6, 0.6, 0.5], position: [0, 1.3, 0] },
    
    // Eyes (white)
    { color: "#FFFFFF", size: [0.15, 0.15, 0.1], position: [-0.15, 1.4, 0.3] },
    { color: "#FFFFFF", size: [0.15, 0.15, 0.1], position: [0.15, 1.4, 0.3] },
    
    // Pupils (black)
    { color: "#000000", size: [0.07, 0.07, 0.05], position: [-0.15, 1.4, 0.35] },
    { color: "#000000", size: [0.07, 0.07, 0.05], position: [0.15, 1.4, 0.35] },
    
    // Arms (slightly darker blue)
    { color: "#1565C0", size: [0.3, 0.7, 0.3], position: [-0.55, 0.5, 0] },
    { color: "#1565C0", size: [0.3, 0.7, 0.3], position: [0.55, 0.5, 0] },
    
    // Legs (darker blue)
    { color: "#0D47A1", size: [0.35, 0.5, 0.4], position: [-0.25, -0.25, 0] },
    { color: "#0D47A1", size: [0.35, 0.5, 0.4], position: [0.25, -0.25, 0] },
  ], []);

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    
    let isMoving = false;
    
    // Handle movement
    if (forwardPressed) {
      playerRef.current.position.z -= moveSpeed;
      directionRef.current = "up";
      isMoving = true;
    }
    if (backwardPressed) {
      playerRef.current.position.z += moveSpeed;
      directionRef.current = "down";
      isMoving = true;
    }
    if (leftwardPressed) {
      playerRef.current.position.x -= moveSpeed;
      directionRef.current = "left";
      isMoving = true;
    }
    if (rightwardPressed) {
      playerRef.current.position.x += moveSpeed;
      directionRef.current = "right";
      isMoving = true;
    }
    
    // Keep character within bounds
    playerRef.current.position.x = Math.max(-10, Math.min(10, playerRef.current.position.x));
    playerRef.current.position.z = Math.max(-10, Math.min(10, playerRef.current.position.z));
    
    // Update camera to follow the player
    if (isMoving) {
      // Update camera position to follow player with some offset based on facing direction
      const cameraOffsetX = directionRef.current === "right" ? -3 : (directionRef.current === "left" ? 3 : 0);
      const cameraOffsetZ = directionRef.current === "up" ? 5 : (directionRef.current === "down" ? -5 : 3);
      
      // Update the camera position through the camera control in the scene
      state.camera.position.x = playerRef.current.position.x + cameraOffsetX;
      state.camera.position.z = playerRef.current.position.z + cameraOffsetZ;
      state.camera.lookAt(playerRef.current.position.x, playerRef.current.position.y + 1, playerRef.current.position.z);
      
      // Also update store state if needed
      setCameraPosition([state.camera.position.x, state.camera.position.y, state.camera.position.z]);
      
      // Simple bobbing animation when moving
      animationTimeRef.current += delta * 5;
      playerRef.current.position.y = Math.sin(animationTimeRef.current) * 0.05;
      
      // Face the right direction
      if (directionRef.current === "left") {
        playerRef.current.rotation.y = Math.PI / 2;
      } else if (directionRef.current === "right") {
        playerRef.current.rotation.y = -Math.PI / 2;
      } else if (directionRef.current === "up") {
        playerRef.current.rotation.y = 0;
      } else if (directionRef.current === "down") {
        playerRef.current.rotation.y = Math.PI;
      }
    }
  });

  if (!character) return null;

  return (
    <group>
      {/* Pixel character made of voxels */}
      <group ref={playerRef} position={[0, 0.5, 0]}>
        {characterVoxels.map((voxel, index) => (
          <mesh 
            key={`player-voxel-${index}`} 
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
      
      {/* Character name floating above */}
      <Text
        position={[0, 2.8, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {character.name}
      </Text>
    </group>
  );
}

// Pixel NPC component
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
  
  return (
    <group>
      {/* Pixel NPC made of voxels */}
      <group 
        ref={npcRef} 
        position={position}
        onClick={onInteract}
      >
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

// Pixel Enemy component
export function PixelEnemy({
  position = [0, 0, 0],
  enemyType = 'wolf'
}: {
  position?: [number, number, number],
  enemyType?: 'wolf' | 'goblin' | 'bandit'
}) {
  const enemyRef = useRef<THREE.Group>(null);
  const animationTimeRef = useRef<number>(0);

  // Enemy color themes based on type
  const enemyColors = {
    wolf: { body: "#78909C", head: "#455A64" },
    goblin: { body: "#7CB342", head: "#33691E" },
    bandit: { body: "#5D4037", head: "#D7CCC8" }
  };

  const colors = enemyColors[enemyType];

  // Voxel-based enemy definition
  const enemyVoxels: VoxelConfig[] = useMemo(() => {
    if (enemyType === 'wolf') {
      return [
        // Wolf body
        { color: colors.body, size: [1, 0.6, 1.2], position: [0, 0.3, 0] },
        // Wolf head
        { color: colors.head, size: [0.8, 0.7, 0.8], position: [0, 0.6, 0.5] },
        // Wolf ears
        { color: colors.head, size: [0.2, 0.3, 0.2], position: [-0.3, 1, 0.5] },
        { color: colors.head, size: [0.2, 0.3, 0.2], position: [0.3, 1, 0.5] },
        // Wolf eyes
        { color: "#F44336", size: [0.1, 0.1, 0.1], position: [-0.2, 0.7, 0.9] },
        { color: "#F44336", size: [0.1, 0.1, 0.1], position: [0.2, 0.7, 0.9] },
        // Wolf legs
        { color: colors.body, size: [0.2, 0.5, 0.2], position: [-0.3, 0, -0.4] },
        { color: colors.body, size: [0.2, 0.5, 0.2], position: [0.3, 0, -0.4] },
        { color: colors.body, size: [0.2, 0.5, 0.2], position: [-0.3, 0, 0.4] },
        { color: colors.body, size: [0.2, 0.5, 0.2], position: [0.3, 0, 0.4] },
        // Wolf tail
        { color: colors.body, size: [0.2, 0.2, 0.6], position: [0, 0.4, -0.8] },
      ];
    } else if (enemyType === 'goblin') {
      return [
        // Goblin body
        { color: colors.body, size: [0.7, 0.8, 0.5], position: [0, 0.4, 0] },
        // Goblin head
        { color: colors.head, size: [0.5, 0.5, 0.5], position: [0, 1, 0] },
        // Goblin ears
        { color: colors.head, size: [0.2, 0.4, 0.1], position: [-0.3, 1.1, 0] },
        { color: colors.head, size: [0.2, 0.4, 0.1], position: [0.3, 1.1, 0] },
        // Goblin eyes
        { color: "#FFEB3B", size: [0.15, 0.1, 0.1], position: [-0.15, 1.1, 0.3] },
        { color: "#FFEB3B", size: [0.15, 0.1, 0.1], position: [0.15, 1.1, 0.3] },
        // Goblin arms
        { color: colors.body, size: [0.25, 0.6, 0.25], position: [-0.5, 0.4, 0] },
        { color: colors.body, size: [0.25, 0.6, 0.25], position: [0.5, 0.4, 0] },
        // Goblin legs
        { color: "#33691E", size: [0.3, 0.4, 0.3], position: [-0.2, -0.2, 0] },
        { color: "#33691E", size: [0.3, 0.4, 0.3], position: [0.2, -0.2, 0] },
        // Goblin weapon
        { color: "#795548", size: [0.1, 0.6, 0.1], position: [0.6, 0.5, 0.3] },
      ];
    } else {
      // Bandit
      return [
        // Bandit body
        { color: colors.body, size: [0.8, 1, 0.5], position: [0, 0.5, 0] },
        // Bandit head
        { color: colors.head, size: [0.6, 0.6, 0.5], position: [0, 1.3, 0] },
        // Bandit eyes
        { color: "#000000", size: [0.15, 0.08, 0.1], position: [-0.15, 1.35, 0.3] },
        { color: "#000000", size: [0.15, 0.08, 0.1], position: [0.15, 1.35, 0.3] },
        // Bandit arms
        { color: "#4E342E", size: [0.3, 0.7, 0.3], position: [-0.55, 0.5, 0] },
        { color: "#4E342E", size: [0.3, 0.7, 0.3], position: [0.55, 0.5, 0] },
        // Bandit legs
        { color: "#3E2723", size: [0.35, 0.5, 0.4], position: [-0.25, -0.25, 0] },
        { color: "#3E2723", size: [0.35, 0.5, 0.4], position: [0.25, -0.25, 0] },
        // Bandit mask
        { color: "#000000", size: [0.7, 0.2, 0.1], position: [0, 1.3, 0.3] },
        // Bandit weapon
        { color: "#9E9E9E", size: [0.1, 0.8, 0.1], position: [0.7, 0.6, 0] },
      ];
    }
  }, [enemyType, colors]);

  useFrame((state, delta) => {
    if (!enemyRef.current) return;
    
    // Aggressive idle animation
    animationTimeRef.current += delta;
    enemyRef.current.position.y = position[1] + Math.sin(animationTimeRef.current * 3) * 0.1;
    enemyRef.current.rotation.y = Math.sin(animationTimeRef.current) * 0.3;
  });

  return (
    <group ref={enemyRef} position={position}>
      {enemyVoxels.map((voxel, index) => (
        <mesh 
          key={`enemy-voxel-${index}`} 
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
  );
}