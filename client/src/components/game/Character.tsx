import { Text, Box } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useRPG } from "@/lib/stores/useRPG";
import { useKeyboardControls } from "@react-three/drei";

// Character component used in the 3D world
export default function Character() {
  const playerRef = useRef<THREE.Mesh>(null);
  const { character } = useRPG();
  
  // Get movement controls
  const forwardPressed = useKeyboardControls((state) => state.forward);
  const backwardPressed = useKeyboardControls((state) => state.backward);
  const leftwardPressed = useKeyboardControls((state) => state.leftward);
  const rightwardPressed = useKeyboardControls((state) => state.rightward);

  // Movement settings
  const moveSpeed = 0.08;
  
  useFrame(() => {
    if (!playerRef.current) return;
    
    // Handle movement
    if (forwardPressed) {
      playerRef.current.position.z -= moveSpeed;
    }
    if (backwardPressed) {
      playerRef.current.position.z += moveSpeed;
    }
    if (leftwardPressed) {
      playerRef.current.position.x -= moveSpeed;
    }
    if (rightwardPressed) {
      playerRef.current.position.x += moveSpeed;
    }
    
    // Keep character within bounds
    playerRef.current.position.x = Math.max(-10, Math.min(10, playerRef.current.position.x));
    playerRef.current.position.z = Math.max(-10, Math.min(10, playerRef.current.position.z));
  });

  if (!character) return null;

  return (
    <group>
      {/* Player character model - a simple box for now */}
      <Box 
        ref={playerRef} 
        position={[0, 0.5, 0]} 
        args={[1, 1, 1]} 
        castShadow 
      >
        <meshStandardMaterial color="#1E88E5" />
      </Box>
      
      {/* Character name floating above */}
      <Text
        position={[0, 1.8, 0]}
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

// Character portrait component for UI
export function CharacterPortrait() {
  const { character } = useRPG();
  
  if (!character) return null;
  
  // Generate initials for the avatar
  const initials = character.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
  
  return (
    <div className="rounded-full bg-blue-600 w-12 h-12 flex items-center justify-center text-white font-bold text-lg">
      {initials}
    </div>
  );
}
