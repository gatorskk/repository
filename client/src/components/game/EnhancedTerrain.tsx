import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

// Configurable terrain that supports height maps and multiple textures
export default function EnhancedTerrain() {
  // Load ground textures
  const grassTexture = useTexture("/textures/grass.png");
  const sandTexture = useTexture("/textures/sand.jpg");
  const stoneTexture = useTexture("/textures/asphalt.png");
  
  // Configure texture wrapping and repeat
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(20, 20);
  
  sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
  sandTexture.repeat.set(10, 10);
  
  stoneTexture.wrapS = stoneTexture.wrapT = THREE.RepeatWrapping;
  stoneTexture.repeat.set(5, 5);
  
  // Create terrain features - make it more interesting than a flat plane
  const { terrainGeometry, waterGeometry } = useMemo(() => {
    // Create a simple height map for the terrain
    const size = 50;
    const resolution = 64;
    const heights = [];
    
    // Generate terrain heights
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        // Create rolling hills and some flat areas
        const x = (i / resolution) * 2 - 1;
        const y = (j / resolution) * 2 - 1;
        
        // Distance from center, used for some terrain features
        const distFromCenter = Math.sqrt(x * x + y * y);
        
        // Generate varied terrain using sine waves and noise patterns
        let height = 0;
        
        // Base rolling hills
        height += Math.sin(x * 3) * 0.2;
        height += Math.sin(y * 2) * 0.3;
        
        // More intricate detail
        height += Math.sin(x * 10 + y * 10) * 0.1;
        
        // Make edges slightly higher (like mountains in the distance)
        if (distFromCenter > 0.8) {
          height += (distFromCenter - 0.8) * 3;
        }
        
        // Create a central valley/plains area
        if (distFromCenter < 0.3) {
          height = Math.min(height, 0.2);
        }
        
        // Apply height limits
        height = Math.max(-0.5, Math.min(2, height));
        
        heights.push(height);
      }
    }
    
    // Create a detailed terrain geometry
    const terrainGeometry = new THREE.PlaneGeometry(size, size, resolution - 1, resolution - 1);
    
    // Apply height map to vertices
    for (let i = 0; i < terrainGeometry.attributes.position.count; i++) {
      terrainGeometry.attributes.position.setZ(i, heights[i]);
    }
    
    // Update normals after changing positions
    terrainGeometry.computeVertexNormals();
    
    // Create water plane that sits at a fixed height
    const waterGeometry = new THREE.PlaneGeometry(size * 1.2, size * 1.2);
    
    return { terrainGeometry, waterGeometry };
  }, []);
  
  return (
    <group>
      {/* Terrain mesh with the height map */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]} 
        receiveShadow
        castShadow
      >
        <primitive object={terrainGeometry} />
        <meshStandardMaterial 
          map={grassTexture} 
          color="#88AA66"
          roughness={0.8}
          metalness={0.1}
          displacementScale={0}
        />
      </mesh>
      
      {/* Water area */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.8, 0]}
        receiveShadow
      >
        <primitive object={waterGeometry} />
        <meshStandardMaterial
          color="#1E88E5"
          transparent
          opacity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Stone path areas */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.45, 5]}
        receiveShadow
      >
        <planeGeometry args={[3, 20]} />
        <meshStandardMaterial
          map={stoneTexture}
          color="#999999"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Sandy area */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-10, -0.47, -10]}
        receiveShadow
      >
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial
          map={sandTexture}
          color="#D2B48C"
          roughness={1}
          metalness={0}
        />
      </mesh>
      
      {/* Decorative elements */}
      {/* Rocks */}
      <group position={[-8, 0, -8]}>
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial color="#777777" roughness={0.9} />
        </mesh>
        <mesh position={[0.7, 0.15, 0.3]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial color="#888888" roughness={0.9} />
        </mesh>
        <mesh position={[-0.5, 0.2, 0.2]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#666666" roughness={0.9} />
        </mesh>
      </group>
      
      {/* Bushes */}
      <group position={[7, 0, 7]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.8, 8, 8]} />
          <meshStandardMaterial color="#2E7D32" roughness={0.8} />
        </mesh>
        <mesh position={[0.7, 0.4, 0.3]} castShadow>
          <sphereGeometry args={[0.6, 8, 8]} />
          <meshStandardMaterial color="#388E3C" roughness={0.8} />
        </mesh>
        <mesh position={[-0.6, 0.3, -0.2]} castShadow>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial color="#1B5E20" roughness={0.8} />
        </mesh>
      </group>
      
      {/* Flowers */}
      {Array.from({ length: 30 }).map((_, i) => {
        // Pre-calculate positions using seeded patterns
        const x = Math.sin(i * 0.5) * 15;
        const z = Math.cos(i * 0.5) * 15;
        // Alternate colors for visual variety
        const colors = ["#E91E63", "#9C27B0", "#FFC107", "#CDDC39"];
        const color = colors[i % colors.length];
        
        return (
          <group key={`flower-${i}`} position={[x, 0, z]}>
            {/* Stem */}
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
              <meshStandardMaterial color="#388E3C" />
            </mesh>
            {/* Flower head */}
            <mesh position={[0, 0.3, 0]} castShadow>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}