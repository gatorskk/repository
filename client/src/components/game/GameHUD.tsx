import { useRPG } from "@/lib/stores/useRPG";
import { useState, useEffect } from "react";
import { CharacterPortrait } from "./Character";
import { CombatUI } from "./Combat";
import Inventory from "./Inventory";
import Quest from "./Quest";
import Skills from "./Skills";
import { useAudio } from "@/lib/stores/useAudio";
import { toast } from "sonner";

export default function GameHUD() {
  const { 
    character, 
    gamePhase, 
    setGamePhase,
    saveGame,
    gold
  } = useRPG();
  
  const { toggleMute, isMuted } = useAudio();
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  
  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gamePhase !== 'exploration') return;
      
      if (e.code === 'KeyC') {
        setShowCharacterSheet(prev => !prev);
      }
      
      if (e.code === 'KeyM') {
        toggleMute();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, toggleMute]);
  
  const handleSaveGame = () => {
    saveGame();
    toast.success("Game saved successfully!");
  };
  
  if (!character) return null;
  
  // Calculate health and mana percentages
  const healthPercent = (character.health.current / character.health.max) * 100;
  const manaPercent = (character.mana.current / character.mana.max) * 100;
  
  return (
    <>
      {/* Top HUD - Mini-map and game controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between">
        <div className="flex items-center">
          <CharacterPortrait />
          <div className="ml-3">
            <div className="flex items-baseline">
              <h3 className="text-white font-bold">{character.name}</h3>
              <span className="text-amber-400 text-sm ml-2">Lvl {character.level}</span>
            </div>
            
            {/* Health bar */}
            <div className="w-40 h-3 bg-gray-800 rounded-full mt-1">
              <div 
                className="h-full bg-red-600 rounded-full" 
                style={{ width: `${healthPercent}%` }}
              ></div>
            </div>
            
            {/* Mana bar */}
            <div className="w-40 h-2 bg-gray-800 rounded-full mt-1">
              <div 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${manaPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="bg-gray-900 bg-opacity-80 p-2 rounded text-amber-400 font-medium">
            Gold: {gold}
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={toggleMute}
              className="bg-gray-900 bg-opacity-80 p-2 rounded text-white hover:bg-opacity-100 transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12L9 9z"></path>
                  <path d="M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                  <path d="M17.67 7.95A6 6 0 0 1 18 10v1a6 6 0 0 1-2 4.5"></path>
                  <path d="M20.87 11.29A10 10 0 0 1 21 12v1a10 10 0 0 1-3.15 7.33"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              )}
            </button>
            
            <button 
              onClick={handleSaveGame}
              className="bg-gray-900 bg-opacity-80 p-2 rounded text-white hover:bg-opacity-100 transition-colors"
              title="Save Game"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Quest tracker */}
      <div className="absolute top-20 right-4 w-64 bg-gray-900 bg-opacity-75 p-3 rounded-lg border border-gray-700">
        <h4 className="text-white font-medium mb-2">Active Quest</h4>
        <QuestTracker />
      </div>
      
      {/* Bottom HUD - Action bar */}
      {gamePhase === 'exploration' && (
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex justify-center">
            <div className="bg-gray-900 bg-opacity-80 p-2 rounded-md flex space-x-2">
              <ActionButton label="Inventory" shortcut="I" onClick={() => setGamePhase('inventory')} />
              <ActionButton label="Character" shortcut="C" onClick={() => setShowCharacterSheet(!showCharacterSheet)} />
              <ActionButton label="Quests" shortcut="Q" onClick={() => setGamePhase('quest_log')} />
              <ActionButton label="Skills" shortcut="K" onClick={() => setGamePhase('character_sheet')} />
            </div>
          </div>
        </div>
      )}
      
      {/* Combat UI */}
      {gamePhase === 'combat' && <CombatUI />}
      
      {/* Character Sheet */}
      {showCharacterSheet && <CharacterSheet onClose={() => setShowCharacterSheet(false)} />}
      
      {/* Game menus */}
      <Inventory />
      <Quest />
      <Skills />
    </>
  );
}

function ActionButton({ label, shortcut, onClick }: { label: string, shortcut: string, onClick: () => void }) {
  return (
    <button 
      className="px-4 py-2 rounded hover:bg-gray-800 text-white transition-colors flex flex-col items-center"
      onClick={onClick}
    >
      <span>{label}</span>
      <span className="text-xs text-gray-400 mt-1">[{shortcut}]</span>
    </button>
  );
}

function QuestTracker() {
  const { activeQuest } = useRPG();
  
  if (!activeQuest) {
    return (
      <div className="text-gray-400 text-sm">
        No active quest. Visit the quest log to activate one.
      </div>
    );
  }
  
  return (
    <div>
      <h5 className="text-amber-400 text-sm font-medium">{activeQuest.title}</h5>
      <div className="mt-2 space-y-1">
        {activeQuest.objectives.map(objective => (
          <div key={objective.id} className="text-xs text-gray-300">
            <div className="flex justify-between">
              <span>{objective.description}</span>
              <span className={objective.completed ? 'text-green-400' : 'text-gray-400'}>
                {objective.current}/{objective.target}
              </span>
            </div>
            <div className="w-full h-1 bg-gray-700 rounded-full mt-1">
              <div 
                className={`h-full rounded-full ${objective.completed ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: `${(objective.current / objective.target) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CharacterSheet({ onClose }: { onClose: () => void }) {
  const { character } = useRPG();
  
  if (!character) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
      <div className="bg-gray-900 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 border border-gray-700 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-amber-400">Character Sheet</h2>
          <button 
            className="text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-blue-800 w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {character.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{character.name}</h3>
            <div className="flex items-center text-sm">
              <span className="text-amber-400">Level {character.level}</span>
              <div className="w-24 h-2 bg-gray-700 rounded-full ml-2">
                <div 
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(character.experience / (character.level * 100)) * 100}%` }}
                ></div>
              </div>
              <span className="text-gray-400 ml-2">
                {character.experience}/{character.level * 100} XP
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 p-3 rounded">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Health</h4>
            <div className="text-lg font-semibold flex justify-between">
              <span>{character.health.current}</span>
              <span className="text-gray-400">/</span>
              <span>{character.health.max}</span>
            </div>
          </div>
          
          <div className="bg-gray-800 p-3 rounded">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Mana</h4>
            <div className="text-lg font-semibold flex justify-between">
              <span>{character.mana.current}</span>
              <span className="text-gray-400">/</span>
              <span>{character.mana.max}</span>
            </div>
          </div>
        </div>
        
        <h4 className="text-md font-semibold mb-3 text-amber-400">Stats</h4>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {Object.entries(character.stats).map(([stat, value]) => (
            <div key={stat} className="flex justify-between">
              <span className="capitalize">{stat}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
        
        <h4 className="text-md font-semibold mb-3 text-amber-400">Skills</h4>
        <div className="space-y-3">
          {character.skills.map(skill => (
            <div key={skill.id} className="bg-gray-800 p-3 rounded">
              <div className="flex justify-between">
                <h5 className="font-medium">{skill.name}</h5>
                <span className="text-sm text-blue-400">Level {skill.level}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{skill.description}</p>
              <div className="flex justify-between mt-2 text-sm">
                {skill.damage && (
                  <span className="text-red-400">Damage: {skill.damage}</span>
                )}
                {skill.healing && (
                  <span className="text-green-400">Healing: {skill.healing}</span>
                )}
                <span className="text-blue-400">Mana Cost: {skill.manaCost}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
