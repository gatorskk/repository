import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRPG } from "@/lib/stores/useRPG";

// Tutorial step interface
interface TutorialStep {
  id: string;
  title: string;
  content: string;
  highlightElement?: string;
  requiredAction?: {
    type: 'key_press' | 'button_click' | 'movement';
    value: string;
  };
}

export default function TutorialSystem() {
  const { character, gamePhase, setGamePhase } = useRPG();
  
  // Tutorial visibility state
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  // Track whether this is the player's first time in the game
  const [isFirstGame, setIsFirstGame] = useState(true);
  
  // Define tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      id: "welcome",
      title: "Welcome to the RPG Adventure!",
      content: "This tutorial will guide you through the basics of gameplay. You can press ESC at any time to skip the tutorial."
    },
    {
      id: "movement",
      title: "Character Movement",
      content: "Use W, A, S, D or the arrow keys to move your character around the world. Try moving now!",
      requiredAction: {
        type: "movement",
        value: "any"
      }
    },
    {
      id: "inventory",
      title: "Inventory System",
      content: "Press I to open your inventory, where you can view and manage your items. Try it now!",
      requiredAction: {
        type: "key_press",
        value: "KeyI"
      }
    },
    {
      id: "character",
      title: "Character Stats",
      content: "Press C to view your character's statistics, skills, and equipment. Try opening the character sheet!",
      requiredAction: {
        type: "key_press",
        value: "KeyC"
      }
    },
    {
      id: "quests",
      title: "Quest Log",
      content: "Press Q to open your quest log, where you can track and manage active quests.",
      requiredAction: {
        type: "key_press",
        value: "KeyQ"
      }
    },
    {
      id: "interact",
      title: "NPC Interaction",
      content: "Approach NPC characters (colored boxes) and click on them to start conversations. NPCs can give you quests and information."
    },
    {
      id: "combat",
      title: "Combat Basics",
      content: "When encountering enemies, you'll enter combat mode. Use your skills and attacks to defeat them. Combat is turn-based, so take your time to plan your moves."
    },
    {
      id: "complete",
      title: "Tutorial Complete!",
      content: "You've completed the tutorial! Explore the world, talk to NPCs, complete quests, and become a hero. Good luck on your adventure!"
    }
  ];
  
  // Current tutorial step
  const currentStep = tutorialSteps[currentStepIndex];
  
  // Check localStorage to see if the player has completed the tutorial before
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('rpg_tutorial_completed');
    if (tutorialCompleted === 'true') {
      setShowTutorial(false);
      setIsFirstGame(false);
    }
  }, []);
  
  // Save tutorial completion to localStorage
  useEffect(() => {
    if (completedSteps.includes("complete")) {
      localStorage.setItem('rpg_tutorial_completed', 'true');
    }
  }, [completedSteps]);
  
  // Detect required actions to progress the tutorial
  useEffect(() => {
    if (!showTutorial || !currentStep.requiredAction) return;
    
    // Handle key press actions
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentStep.requiredAction?.type === 'key_press' &&
          e.code === currentStep.requiredAction.value) {
        handleStepComplete();
      }
      
      // Skip tutorial with ESC
      if (e.code === 'Escape') {
        handleSkipTutorial();
      }
    };
    
    // Handle movement detection
    let lastPosition = { x: 0, z: 0 };
    let hasMoved = false;
    
    const checkMovement = () => {
      const playerElement = document.querySelector('canvas');
      if (playerElement && currentStep.requiredAction?.type === 'movement') {
        // In a real implementation, we would access the actual player position
        // For this demo, we'll simply track keyboard events instead
        
        if (hasMoved) {
          handleStepComplete();
        }
      }
    };
    
    // Track WASD/arrow keys for movement detection
    const handleMovementKey = (e: KeyboardEvent) => {
      if (currentStep.requiredAction?.type === 'movement' &&
          (e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyS' || 
           e.code === 'KeyD' || e.code.includes('Arrow'))) {
        hasMoved = true;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleMovementKey);
    
    const movementCheck = setInterval(checkMovement, 500);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleMovementKey);
      clearInterval(movementCheck);
    };
  }, [currentStep, showTutorial]);
  
  // Progress to the next tutorial step
  const handleNextStep = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleSkipTutorial();
    }
  };
  
  // Mark the current step as complete
  const handleStepComplete = () => {
    setCompletedSteps([...completedSteps, currentStep.id]);
    handleNextStep();
  };
  
  // Skip the tutorial
  const handleSkipTutorial = () => {
    setShowTutorial(false);
    setCompletedSteps([...completedSteps, "complete"]);
    localStorage.setItem('rpg_tutorial_completed', 'true');
  };
  
  // Allow replaying the tutorial from the start
  const handleRestartTutorial = () => {
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setShowTutorial(true);
  };
  
  if (!showTutorial) {
    return (
      <div className="absolute top-4 right-4 z-10">
        {!isFirstGame && (
          <button
            onClick={handleRestartTutorial}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            Show Tutorial
          </button>
        )}
      </div>
    );
  }
  
  return (
    <AnimatePresence>
      {showTutorial && (
        <motion.div
          className="absolute bottom-24 left-0 right-0 z-10 px-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <div className="bg-gray-900 bg-opacity-90 border border-amber-500 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-amber-400">
                {currentStep.title}
              </h3>
              <button
                onClick={handleSkipTutorial}
                className="text-gray-400 hover:text-white"
              >
                Skip Tutorial
              </button>
            </div>
            
            <p className="text-white mb-4">{currentStep.content}</p>
            
            <div className="flex justify-between">
              <div>
                <span className="text-gray-400 text-sm">
                  Step {currentStepIndex + 1} of {tutorialSteps.length}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleNextStep}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded"
                >
                  {currentStepIndex < tutorialSteps.length - 1 ? "Next" : "Finish"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}