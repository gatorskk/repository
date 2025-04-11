import { useState, useEffect } from "react";
import { useRPG } from "@/lib/stores/useRPG";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/lib/stores/useAudio";

export default function CharacterCreation() {
  const { createCharacter } = useRPG();
  const { playSuccess } = useAudio();
  
  const [name, setName] = useState("");
  const [statPoints, setStatPoints] = useState(15);
  const [stats, setStats] = useState({
    strength: 5,
    intelligence: 5,
    dexterity: 5,
    constitution: 5,
    charisma: 5,
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setError("");
  };
  
  const handleStatChange = (statName: keyof typeof stats, value: number[]) => {
    const newValue = value[0];
    const oldValue = stats[statName];
    const pointDiff = newValue - oldValue;
    
    // Check if we have enough stat points
    if (statPoints - pointDiff < 0) {
      return;
    }
    
    // Update the stat and remaining points
    setStats({ ...stats, [statName]: newValue });
    setStatPoints(statPoints - pointDiff);
  };
  
  const handleNextStep = () => {
    if (currentStep === 0) {
      if (name.trim().length < 2) {
        setError("Please enter a name with at least 2 characters");
        return;
      }
      
      playSuccess();
      setCurrentStep(1);
    } else {
      playSuccess();
      createCharacter(name, stats);
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 bg-opacity-95">
      <motion.div 
        className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full text-white"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-amber-400">Create Your Character</h2>
        
        {currentStep === 0 ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Character Name</label>
              <Input
                type="text"
                value={name}
                onChange={handleNameChange}
                className="w-full bg-gray-700 border-gray-600 text-white"
                placeholder="Enter a name"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">
                Choose your character's name carefully, as it will represent you throughout your journey.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="font-medium">Remaining Points: <span className="text-amber-400">{statPoints}</span></h3>
              <p className="text-sm text-gray-400 mt-1">
                Distribute your stat points to define your character's strengths and weaknesses
              </p>
            </div>
            
            {Object.entries(stats).map(([stat, value]) => (
              <div key={stat} className="space-y-2">
                <div className="flex justify-between">
                  <label className="block text-sm font-medium capitalize">{stat}</label>
                  <span className="text-amber-400">{value}</span>
                </div>
                <Slider
                  value={[value]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(val) => handleStatChange(stat as keyof typeof stats, val)}
                  className="w-full"
                />
                <p className="text-xs text-gray-400">
                  {getStatDescription(stat as keyof typeof stats)}
                </p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 flex justify-between">
          {currentStep > 0 && (
            <Button 
              onClick={() => setCurrentStep(0)}
              variant="outline"
              className="bg-transparent border-gray-600 text-white hover:bg-gray-700"
            >
              Back
            </Button>
          )}
          
          <Button 
            onClick={handleNextStep}
            className="ml-auto bg-amber-600 hover:bg-amber-700"
          >
            {currentStep === 0 ? "Next" : "Create Character"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function getStatDescription(stat: string): string {
  switch (stat) {
    case 'strength':
      return "Affects physical damage, carrying capacity, and some dialogue options";
    case 'intelligence':
      return "Improves magic damage, mana pool, and unlocks special dialogue options";
    case 'dexterity':
      return "Determines attack speed, dodge chance, and ranged weapon proficiency";
    case 'constitution':
      return "Increases health points, stamina, and resistance to poison/disease";
    case 'charisma':
      return "Enhances NPC interactions, shop prices, and quest rewards";
    default:
      return "";
  }
}
