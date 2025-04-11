import { useEffect } from "react";
import { useAudio } from "@/lib/stores/useAudio";
import { useRPG } from "@/lib/stores/useRPG";

export default function SoundManager() {
  const { 
    backgroundMusic, 
    isMuted,
    playHit,
    playSuccess
  } = useAudio();
  
  const { 
    gamePhase,
    character
  } = useRPG();
  
  // Background music management
  useEffect(() => {
    if (!backgroundMusic) return;
    
    // Attempt to play background music when game starts
    const handleUserInteraction = () => {
      if (backgroundMusic && !isMuted) {
        backgroundMusic.play().catch(error => {
          console.log("Background music autoplay prevented:", error);
        });
      }
      
      // Remove the listeners once played
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
    
    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [backgroundMusic, isMuted]);
  
  // Toggle music based on mute state
  useEffect(() => {
    if (!backgroundMusic) return;
    
    if (isMuted) {
      backgroundMusic.pause();
    } else {
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    }
  }, [isMuted, backgroundMusic]);
  
  // Sound effects for game events
  useEffect(() => {
    // Play success sound when character levels up
    if (gamePhase === 'exploration' && character?.level > 1) {
      playSuccess();
    }
  }, [character?.level, gamePhase, playSuccess]);
  
  return null; // This component doesn't render anything
}
