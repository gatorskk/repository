import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useRPG } from "./lib/stores/useRPG";
import CharacterCreation from "./components/game/CharacterCreation";
import World from "./components/game/World";
import GameHUD from "./components/game/GameHUD";
import Combat from "./components/game/Combat";
import Dialogue from "./components/game/Dialogue";
import SoundManager from "./components/game/SoundManager";
import TutorialSystem from "./components/game/TutorialSystem";
import { Toaster } from "sonner";
import "@fontsource/inter";

// Define control keys for the game
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
  { name: "interact", keys: ["KeyE"] },
  { name: "attack", keys: ["KeyF"] },
  { name: "inventory", keys: ["KeyI"] },
  { name: "character", keys: ["KeyC"] },
  { name: "quest", keys: ["KeyQ"] },
];

// Main App component
function App() {
  const { gamePhase, setGamePhase } = useRPG();
  const [showCanvas, setShowCanvas] = useState(false);
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  // Load audio files
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.5;
    setBackgroundMusic(bgMusic);

    const hit = new Audio("/sounds/hit.mp3");
    setHitSound(hit);

    const success = new Audio("/sounds/success.mp3");
    setSuccessSound(success);

    setShowCanvas(true);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {showCanvas && (
          <KeyboardControls map={controls}>
            {gamePhase === 'title' && (
              <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-slate-900 to-slate-700 text-white">
                <h1 className="text-6xl font-bold mb-8">Dragon's Quest</h1>
                <p className="text-xl mb-8">A Fantasy Role-Playing Adventure</p>
                <button 
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-md font-bold text-lg transition-colors"
                  onClick={() => setGamePhase('character_creation')}
                >
                  Begin Your Journey
                </button>
              </div>
            )}

            {gamePhase === 'character_creation' && <CharacterCreation />}

            {(gamePhase === 'exploration' || gamePhase === 'combat' || gamePhase === 'dialogue') && (
              <>
                <Canvas
                  shadows
                  camera={{
                    position: [0, 5, 10],
                    fov: 45,
                    near: 0.1,
                    far: 1000
                  }}
                  gl={{
                    antialias: true,
                    powerPreference: "default"
                  }}
                >
                  <color attach="background" args={["#87CEEB"]} />
                  <ambientLight intensity={0.5} />
                  <directionalLight 
                    position={[10, 10, 5]} 
                    intensity={1} 
                    castShadow 
                    shadow-mapSize-width={2048} 
                    shadow-mapSize-height={2048} 
                  />

                  <Suspense fallback={null}>
                    <World />
                    {gamePhase === 'combat' && <Combat />}
                  </Suspense>
                </Canvas>
                
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: gamePhase === 'dialogue' ? 'auto' : 'none' }}>
                  <GameHUD />
                  
                  {gamePhase === 'dialogue' && <Dialogue />}
                  
                  {gamePhase === 'exploration' && <TutorialSystem />}
                </div>
              </>
            )}

            <SoundManager />
            <Toaster 
              position="top-right" 
              toastOptions={{
                style: { 
                  background: 'rgba(0, 0, 0, 0.8)', 
                  color: 'white',
                  border: '1px solid #6b7280'
                }
              }} 
            />
          </KeyboardControls>
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
