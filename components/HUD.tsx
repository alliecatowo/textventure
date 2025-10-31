'use client';

import { useGameStore } from '@/lib/store';
import { RARITIES } from '@/lib/lootGenerator';

export function HUD() {
  const { player, equippedWeapon, equippedArmor, currentEnemy, inCombat } = useGameStore();

  const hpPercentage = (player.hp / player.maxHp) * 100;
  const xpPercentage = (player.xp / player.xpToNextLevel) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto flex justify-between items-start">
        {/* Player Stats */}
        <div className="bg-black/80 border border-green-500/30 rounded p-4 space-y-2 pointer-events-auto">
          <div className="text-green-400 font-mono text-sm font-bold">
            LEVEL {player.level}
          </div>

          {/* HP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-green-300 font-mono">
              <span>HP</span>
              <span>
                {player.hp}/{player.maxHp}
              </span>
            </div>
            <div className="w-48 h-3 bg-gray-800 border border-green-500/30 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                style={{ width: `${hpPercentage}%` }}
              />
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-green-300 font-mono">
              <span>XP</span>
              <span>
                {player.xp}/{player.xpToNextLevel}
              </span>
            </div>
            <div className="w-48 h-2 bg-gray-800 border border-green-500/30 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs text-green-300 font-mono pt-2 border-t border-green-500/20">
            <div>
              <div className="text-gray-500">ATK</div>
              <div className="text-green-400 font-bold">{player.attack}</div>
            </div>
            <div>
              <div className="text-gray-500">DEF</div>
              <div className="text-green-400 font-bold">{player.defense}</div>
            </div>
            <div>
              <div className="text-gray-500">GOLD</div>
              <div className="text-yellow-400 font-bold">{player.gold}</div>
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div className="bg-black/80 border border-green-500/30 rounded p-4 space-y-2 pointer-events-auto">
          <div className="text-green-400 font-mono text-sm font-bold">EQUIPMENT</div>

          <div className="text-xs text-green-300 font-mono space-y-1">
            <div>
              <span className="text-gray-500">Weapon:</span>
              <div className="text-green-400">{equippedWeapon?.name || 'None'}</div>
              {equippedWeapon?.attackBonus && (
                <span className="text-red-400"> +{equippedWeapon.attackBonus} ATK</span>
              )}
            </div>

            <div>
              <span className="text-gray-500">Armor:</span>
              <div className="text-green-400">{equippedArmor?.name || 'None'}</div>
              {equippedArmor?.defenseBonus && (
                <span className="text-blue-400"> +{equippedArmor.defenseBonus} DEF</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enemy HP (when in combat) */}
      {inCombat && currentEnemy && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-black/90 border border-red-500/50 rounded p-3 pointer-events-auto">
          <div className="text-red-400 font-mono text-sm font-bold mb-2">
            {currentEnemy.name}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-red-300 font-mono">
              <span>HP</span>
              <span>
                {currentEnemy.hp}/{currentEnemy.maxHp}
              </span>
            </div>
            <div className="w-48 h-3 bg-gray-800 border border-red-500/30 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                style={{ width: `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
