import { useRPG } from "@/lib/stores/useRPG";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAudio } from "@/lib/stores/useAudio";

export default function Skills() {
  const { character, gamePhase, setGamePhase } = useRPG();
  const [open, setOpen] = useState(false);
  const { playSuccess } = useAudio();
  
  // Listen for keyboard shortcut (K key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyK' && gamePhase === 'exploration') {
        setOpen(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase]);
  
  // Close dialog when leaving exploration mode
  useEffect(() => {
    if (gamePhase !== 'exploration') {
      setOpen(false);
    }
  }, [gamePhase]);
  
  if (!character) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-amber-400">Skills & Abilities</DialogTitle>
        </DialogHeader>
        
        <div className="text-sm text-gray-400 mb-4">Press K to close</div>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {character.skills.map(skill => (
              <div key={skill.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-blue-400">{skill.name}</h3>
                  <span className="bg-blue-900 text-white text-xs px-2 py-1 rounded">
                    Level {skill.level}
                  </span>
                </div>
                
                <p className="text-sm mt-2 text-gray-300">{skill.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  {skill.damage && (
                    <div className="bg-gray-700 p-2 rounded">
                      <span className="text-red-400">Damage:</span> {skill.damage}
                    </div>
                  )}
                  
                  {skill.healing && (
                    <div className="bg-gray-700 p-2 rounded">
                      <span className="text-green-400">Healing:</span> {skill.healing}
                    </div>
                  )}
                  
                  <div className="bg-gray-700 p-2 rounded">
                    <span className="text-blue-400">Mana Cost:</span> {skill.manaCost}
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Combat skill</span>
                  
                  <button 
                    className="px-3 py-1 bg-blue-800 hover:bg-blue-700 text-white text-sm rounded"
                    onClick={() => playSuccess()}
                  >
                    Use in Combat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
