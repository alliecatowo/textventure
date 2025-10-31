'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { RARITIES, type Rarity } from '@/lib/lootGenerator';

export function Inventory() {
  const [isOpen, setIsOpen] = useState(false);
  const { inventory, equipWeapon, equipArmor, removeItem } = useGameStore();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-24 bg-black/80 border border-green-500/30 rounded px-4 py-2 text-green-400 font-mono text-sm hover:bg-green-500/10 transition-colors"
      >
        [I] INVENTORY ({inventory.length})
      </button>
    );
  }

  return (
    <div className="fixed right-4 bottom-24 w-96 max-h-96 bg-black/90 border border-green-500/30 rounded overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-green-500/30">
        <div className="text-green-400 font-mono text-sm font-bold">
          INVENTORY ({inventory.length})
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-green-400 hover:text-red-400 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-2 overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-green-500/30 scrollbar-track-transparent">
        {inventory.length === 0 ? (
          <div className="text-green-700 font-mono text-xs text-center py-8">
            Empty inventory
          </div>
        ) : (
          inventory.map((item, index) => {
            // Determine rarity color based on item properties
            let rarityColor = '#FFFFFF';
            if (item.attackBonus || item.defenseBonus) {
              const totalBonus = (item.attackBonus || 0) + (item.defenseBonus || 0);
              if (totalBonus > 15) rarityColor = RARITIES.legendary.color;
              else if (totalBonus > 10) rarityColor = RARITIES.epic.color;
              else if (totalBonus > 6) rarityColor = RARITIES.rare.color;
              else if (totalBonus > 3) rarityColor = RARITIES.uncommon.color;
            }

            return (
              <div
                key={`${item.id}-${index}`}
                className="bg-gray-900/50 border border-green-500/20 rounded p-3 hover:border-green-500/40 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div
                      className="font-mono text-sm font-bold"
                      style={{ color: rarityColor }}
                    >
                      {item.name}
                    </div>
                    <div className="text-gray-500 text-xs font-mono uppercase">
                      {item.type}
                    </div>
                  </div>
                  <div className="text-yellow-400 font-mono text-xs">
                    {item.value}g
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-2 space-y-1 text-xs font-mono">
                  {item.attackBonus && (
                    <div className="text-red-400">+{item.attackBonus} Attack</div>
                  )}
                  {item.defenseBonus && (
                    <div className="text-blue-400">+{item.defenseBonus} Defense</div>
                  )}
                  {item.hpRestore && (
                    <div className="text-green-400">Restores {item.hpRestore} HP</div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-2 flex gap-2">
                  {item.type === 'weapon' && (
                    <button
                      onClick={() => equipWeapon(item)}
                      className="text-xs bg-red-900/30 border border-red-500/30 rounded px-2 py-1 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Equip
                    </button>
                  )}
                  {item.type === 'armor' && (
                    <button
                      onClick={() => equipArmor(item)}
                      className="text-xs bg-blue-900/30 border border-blue-500/30 rounded px-2 py-1 text-blue-400 hover:bg-blue-500/20 transition-colors"
                    >
                      Equip
                    </button>
                  )}
                  {item.type === 'consumable' && (
                    <button
                      onClick={() => {
                        if (item.hpRestore) {
                          useGameStore.getState().heal(item.hpRestore);
                          removeItem(item.id);
                        }
                      }}
                      className="text-xs bg-green-900/30 border border-green-500/30 rounded px-2 py-1 text-green-400 hover:bg-green-500/20 transition-colors"
                    >
                      Use
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
