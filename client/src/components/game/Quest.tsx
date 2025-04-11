import { useRPG } from "@/lib/stores/useRPG";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAudio } from "@/lib/stores/useAudio";

export default function Quest() {
  const { quests, activeQuest, setActiveQuest, gamePhase, setGamePhase } = useRPG();
  const [open, setOpen] = useState(false);
  const { playSuccess } = useAudio();
  
  // Listen for keyboard shortcut (Q key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyQ' && gamePhase === 'exploration') {
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
  
  const handleClose = () => {
    setOpen(false);
    setGamePhase('exploration');
  };
  
  const handleSetActiveQuest = (questId: string | null) => {
    console.log("Setting active quest:", questId);
    setActiveQuest(questId);
    playSuccess();
  };
  
  // Filter quests by status
  const availableQuests = quests.filter(q => q.status === 'not_started');
  const activeQuests = quests.filter(q => q.status === 'in_progress');
  const completedQuests = quests.filter(q => q.status === 'completed');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 text-white border-gray-700 max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-amber-400">Quest Log</DialogTitle>
        </DialogHeader>
        
        <div className="text-sm text-gray-400 mb-2">Press Q to close</div>
        
        <Tabs defaultValue="active">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="active">Active ({activeQuests.length})</TabsTrigger>
            <TabsTrigger value="available">Available ({availableQuests.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedQuests.length})</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="pr-4 h-[400px]">
            <TabsContent value="active" className="mt-0">
              {activeQuests.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No active quests at the moment.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeQuests.map(quest => (
                    <QuestItem 
                      key={quest.id} 
                      quest={quest} 
                      isActive={activeQuest?.id === quest.id}
                      onSetActive={handleSetActiveQuest}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="available" className="mt-0">
              {availableQuests.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No available quests at the moment.
                </div>
              ) : (
                <div className="space-y-4">
                  {availableQuests.map(quest => (
                    <QuestItem 
                      key={quest.id} 
                      quest={quest} 
                      isActive={false}
                      onSetActive={null}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              {completedQuests.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  You haven't completed any quests yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {completedQuests.map(quest => (
                    <QuestItem 
                      key={quest.id} 
                      quest={quest} 
                      isActive={false}
                      onSetActive={null}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function QuestItem({ 
  quest, 
  isActive, 
  onSetActive 
}: { 
  quest: any, 
  isActive: boolean, 
  onSetActive: ((questId: string | null) => void) | null
}) {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  // Calculate quest progress percentage
  const progress = quest.objectives.reduce(
    (sum: number, obj: any) => sum + (obj.current / obj.target), 
    0
  ) / quest.objectives.length * 100;
  
  return (
    <div 
      className={`p-3 rounded-lg ${
        quest.status === 'completed' 
          ? 'bg-green-900 bg-opacity-20 border border-green-800' 
          : isActive 
            ? 'bg-amber-900 bg-opacity-20 border border-amber-800' 
            : 'bg-gray-800 border border-gray-700'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{quest.title}</h3>
          <p className="text-sm text-gray-400 mt-1">{quest.description}</p>
        </div>
        
        <div className="flex space-x-2">
          {onSetActive && quest.status === 'in_progress' && (
            <button
              className={`text-xs px-2 py-1 rounded cursor-pointer ${
                isActive 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-amber-800 text-white hover:bg-amber-700'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                console.log("Track button clicked for quest:", quest.id);
                onSetActive(isActive ? null : quest.id);
              }}
            >
              {isActive ? 'Untrack' : 'Track'}
            </button>
          )}
          
          <button
            className="text-gray-400 hover:text-white cursor-pointer"
            onClick={toggleExpand}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      {quest.status !== 'not_started' && (
        <div className="w-full h-1 bg-gray-700 rounded-full mt-2">
          <div 
            className={`h-full rounded-full ${
              quest.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      
      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 space-y-3">
          {quest.objectives.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Objectives:</h4>
              <ul className="space-y-2">
                {quest.objectives.map((objective: any) => (
                  <li key={objective.id} className="text-sm flex justify-between">
                    <span>{objective.description}</span>
                    <span className={objective.completed ? 'text-green-400' : ''}>
                      {objective.current}/{objective.target}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium mb-1">Rewards:</h4>
            <ul className="text-sm space-y-1">
              <li className="text-amber-400">
                {quest.rewards.gold} Gold
              </li>
              <li className="text-blue-400">
                {quest.rewards.experience} Experience
              </li>
              {quest.rewards.items && quest.rewards.items.length > 0 && (
                <li className="text-green-400">
                  {quest.rewards.items.join(', ')}
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
