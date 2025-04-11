import { useRPG } from "@/lib/stores/useRPG";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Simple dialogue component with no typing animation to avoid issues
export default function Dialogue() {
  const { 
    currentNPC, 
    currentDialogueId, 
    selectDialogueOption, 
    endDialogue 
  } = useRPG();
  
  const [showOptions, setShowOptions] = useState(false);
  
  // Effect to show options after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOptions(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [currentDialogueId]);
  
  // Prevent infinite loops by using local ref
  const hasTriggeredEndDialogue = useRef(false);
  
  // Check if we have NPC data 
  if (!currentNPC) {
    if (!hasTriggeredEndDialogue.current) {
      console.error("No NPC data found for dialogue!");
      hasTriggeredEndDialogue.current = true;
      setTimeout(() => {
        endDialogue(); // Return to exploration if no NPC data
      }, 10);
    }
    return null;
  }
  
  // Reset the flag when we have an NPC
  hasTriggeredEndDialogue.current = false;
  
  // Find the current dialogue
  const dialogue = currentNPC.dialogues.find(d => d.id === (currentDialogueId || "start"));
  
  // If no dialogue found, end the conversation
  if (!dialogue) {
    console.error(`No dialogue found with ID: ${currentDialogueId}`);
    setTimeout(() => {
      endDialogue();
    }, 10);
    return null;
  }
  
  // Simple dialogue UI without typing animation
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 z-50">
      <motion.div 
        className="bg-gray-900 bg-opacity-90 border border-gray-700 rounded-lg p-4 text-white max-w-3xl mx-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        <div className="flex items-start mb-3">
          {/* NPC portrait/avatar */}
          <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <span className="text-xl font-bold">{currentNPC.name[0]}</span>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-amber-400">{currentNPC.name}</h3>
            <p className="text-gray-200 mt-1">{dialogue.text}</p>
          </div>
        </div>
        
        {/* Show options immediately without animation */}
        <div className="mt-4 space-y-2">
          {dialogue.options ? (
            dialogue.options.map((option, index) => (
              <button
                key={index}
                className="block w-full text-left px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white transition-colors"
                onClick={() => selectDialogueOption(index)}
              >
                {option.text}
              </button>
            ))
          ) : (
            <button
              className="block w-full text-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white transition-colors"
              onClick={endDialogue}
            >
              Continue
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
