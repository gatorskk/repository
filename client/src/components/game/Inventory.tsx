import { useRPG } from "@/lib/stores/useRPG";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip } from "@/components/ui/tooltip";
import { useAudio } from "@/lib/stores/useAudio";
import { Sword, Shield, PillBottle, Scroll, Package } from "lucide-react";

export default function Inventory() {
  const { inventory, gold, useItem, equipItem, gamePhase, setGamePhase } = useRPG();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { playSuccess } = useAudio();
  
  const [open, setOpen] = useState(false);
  
  // Listen for keyboard shortcut (I key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyI' && gamePhase === 'exploration') {
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
  
  const filteredItems = (type: string) => {
    return inventory.filter(item => item.type === type);
  };
  
  const handleUseItem = (itemId: string) => {
    useItem(itemId);
    playSuccess();
  };
  
  const handleEquipItem = (itemId: string, currentlyEquipped: boolean) => {
    equipItem(itemId, !currentlyEquipped);
    playSuccess();
  };
  
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'weapon':
        return <Sword className="w-5 h-5" />;
      case 'armor':
        return <Shield className="w-5 h-5" />;
      case 'potion':
        return <PillBottle className="w-5 h-5" />;
      case 'quest':
        return <Scroll className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-amber-400">Inventory</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-amber-300 font-semibold">Gold: {gold}</span>
          <div className="text-sm text-gray-400">Press I to close</div>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="weapons">Weapons</TabsTrigger>
            <TabsTrigger value="armor">Armor</TabsTrigger>
            <TabsTrigger value="potions">Potions</TabsTrigger>
            <TabsTrigger value="quest">Quest</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[300px] pr-4">
            <TabsContent value="all" className="mt-0">
              <ItemGrid 
                items={inventory} 
                onUseItem={handleUseItem} 
                onEquipItem={handleEquipItem}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
              />
            </TabsContent>
            
            <TabsContent value="weapons" className="mt-0">
              <ItemGrid 
                items={filteredItems('weapon')} 
                onUseItem={handleUseItem} 
                onEquipItem={handleEquipItem}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
              />
            </TabsContent>
            
            <TabsContent value="armor" className="mt-0">
              <ItemGrid 
                items={filteredItems('armor')} 
                onUseItem={handleUseItem} 
                onEquipItem={handleEquipItem}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
              />
            </TabsContent>
            
            <TabsContent value="potions" className="mt-0">
              <ItemGrid 
                items={filteredItems('potion')} 
                onUseItem={handleUseItem} 
                onEquipItem={handleEquipItem}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
              />
            </TabsContent>
            
            <TabsContent value="quest" className="mt-0">
              <ItemGrid 
                items={filteredItems('quest')} 
                onUseItem={handleUseItem} 
                onEquipItem={handleEquipItem}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        {selectedItem && (
          <div className="mt-4 border-t border-gray-700 pt-3">
            <ItemDetails 
              item={inventory.find(i => i.id === selectedItem)!}
              onUse={handleUseItem}
              onEquip={handleEquipItem}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ItemGrid({ 
  items, 
  onUseItem, 
  onEquipItem, 
  selectedItem,
  setSelectedItem 
}: any) {
  if (items.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No items in this category
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item: any) => (
        <div 
          key={item.id}
          className={`relative p-2 border rounded cursor-pointer transition-colors ${
            selectedItem === item.id 
              ? 'bg-gray-700 border-amber-400' 
              : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
          }`}
          onClick={() => setSelectedItem(item.id)}
        >
          {item.equipped && (
            <div className="absolute top-0 right-0 bg-green-600 text-xs text-white px-1 rounded-bl">
              E
            </div>
          )}
          <div className="w-full h-12 flex items-center justify-center bg-gray-900 rounded mb-1">
            {getItemIcon(item.type)}
          </div>
          <div className="text-xs font-medium text-center text-white truncate">
            {item.name}
          </div>
          {item.quantity > 1 && (
            <div className="text-xs text-gray-400 text-center">
              x{item.quantity}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ItemDetails({ item, onUse, onEquip }: any) {
  return (
    <div>
      <h3 className="text-lg font-bold">{item.name}</h3>
      <p className="text-sm text-gray-400 mb-2">
        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        {item.value > 0 && ` • Worth ${item.value} gold`}
      </p>
      <p className="text-sm mb-3">{item.description}</p>
      
      {item.stats && Object.keys(item.stats).length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold mb-1 text-blue-300">Stats:</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(item.stats).map(([stat, value]: [string, any]) => (
              <div key={stat} className="text-xs flex justify-between">
                <span className="capitalize">{stat}:</span>
                <span className={value > 0 ? 'text-green-400' : 'text-red-400'}>
                  {value > 0 ? `+${value}` : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex gap-2 mt-2">
        {(item.type === 'weapon' || item.type === 'armor') && (
          <button
            className={`px-3 py-1 rounded text-sm ${
              item.equipped 
                ? 'bg-red-900 hover:bg-red-800' 
                : 'bg-green-900 hover:bg-green-800'
            }`}
            onClick={() => onEquip(item.id, item.equipped)}
          >
            {item.equipped ? 'Unequip' : 'Equip'}
          </button>
        )}
        
        {item.type === 'potion' && (
          <button
            className="px-3 py-1 rounded text-sm bg-blue-900 hover:bg-blue-800"
            onClick={() => onUse(item.id)}
          >
            Use
          </button>
        )}
      </div>
    </div>
  );
}

function getItemIcon(type: string) {
  switch (type) {
    case 'weapon':
      return <Sword className="w-5 h-5" />;
    case 'armor':
      return <Shield className="w-5 h-5" />;
    case 'potion':
      return <PillBottle className="w-5 h-5" />;
    case 'quest':
      return <Scroll className="w-5 h-5" />;
    default:
      return <Package className="w-5 h-5" />;
  }
}
