import { useRPG } from "@/lib/stores/useRPG";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTexture } from "@react-three/drei";
import { useKeyboardControls } from "@react-three/drei";
import { useAudio } from "@/lib/stores/useAudio";

export default function WorldMap() {
  const { currentLocation, discoveredLocations } = useRPG();
  
  // Just a placeholder for the 3D world
  return null;
}

// World map UI component that can be opened
export function WorldMapUI() {
  const { 
    gamePhase,
    setGamePhase,
    discoveredLocations,
    moveToLocation,
    currentLocation
  } = useRPG();
  
  const [open, setOpen] = useState(false);
  const { playSuccess } = useAudio();
  
  // Listen for keyboard shortcut (M key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM' && gamePhase === 'exploration') {
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
  
  const handleLocationSelect = (locationId: string) => {
    moveToLocation(locationId);
    playSuccess();
    setOpen(false);
  };
  
  // Mock location data - in a real game this would come from the game data
  const locations = [
    {
      id: "town",
      name: "Oakvale Town",
      description: "A peaceful town with shops and friendly NPCs",
      x: 50,
      y: 50,
      discovered: true
    },
    {
      id: "forest",
      name: "Whispering Forest",
      description: "A mysterious forest filled with creatures",
      x: 75,
      y: 35,
      discovered: discoveredLocations.includes("forest")
    },
    {
      id: "cave",
      name: "Dragon's Cave",
      description: "A dangerous cave rumored to contain treasure",
      x: 25,
      y: 65,
      discovered: discoveredLocations.includes("cave")
    },
    {
      id: "mountain",
      name: "Frost Peak",
      description: "A snow-covered mountain with tough enemies",
      x: 30,
      y: 20,
      discovered: discoveredLocations.includes("mountain")
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[700px] bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-amber-400">World Map</DialogTitle>
        </DialogHeader>
        
        <div className="text-sm text-gray-400 mb-4">Press M to close</div>
        
        <div className="relative w-full h-[400px] bg-gray-800 rounded-lg overflow-hidden">
          {/* Map background */}
          <div className="absolute inset-0 bg-[url('/textures/grass.png')] opacity-30" />
          
          {/* Map locations */}
          {locations.map(location => (
            <div 
              key={location.id}
              className={`absolute w-6 h-6 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                !location.discovered 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : currentLocation?.id === location.id
                    ? 'bg-amber-500 border-2 border-white' 
                    : 'bg-blue-600 hover:bg-blue-500'
              }`}
              style={{ 
                left: `${location.x}%`, 
                top: `${location.y}%`,
              }}
              onClick={() => location.discovered && handleLocationSelect(location.id)}
              title={location.discovered ? location.name : "Undiscovered Location"}
            />
          ))}
          
          {/* Selected location info */}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 p-4">
            {locations.find(l => l.id === currentLocation?.id) ? (
              <>
                <h3 className="font-bold text-amber-400">
                  {locations.find(l => l.id === currentLocation?.id)?.name}
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  {locations.find(l => l.id === currentLocation?.id)?.description}
                </p>
              </>
            ) : (
              <p className="text-gray-400">Select a location on the map</p>
            )}
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-3">
          {locations.filter(l => l.discovered).map(location => (
            <button
              key={location.id}
              className={`p-3 text-left rounded ${
                currentLocation?.id === location.id 
                  ? 'bg-amber-900 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
              onClick={() => handleLocationSelect(location.id)}
            >
              <h4 className="font-medium">{location.name}</h4>
              <p className="text-xs text-gray-400 mt-1">{location.description}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
