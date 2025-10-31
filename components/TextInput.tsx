'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { useGameStore } from '@/lib/store';
import { parseCommand, resolveCombat, generateEventText } from '@/lib/ai';
import { getAdjacentRoom } from '@/lib/roomGenerator';
import * as SFX from '@/lib/soundEffects';

export function TextInput() {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const gameState = useGameStore();
  const {
    addToLog,
    takeDamage,
    heal,
    addItem,
    addGold,
    equipWeapon,
    equipArmor,
    enterRoom,
    startCombat,
    endCombat,
    removeItem,
  } = gameState;

  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat({
    api: '/api/ai',
    body: { gameState },
    onFinish: (message) => {
      addToLog(`> ${message.content}`);
    },
  });

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add to history
    setCommandHistory((prev) => [input, ...prev]);
    setHistoryIndex(-1);

    addToLog(`You: ${input}`);

    // Parse the command locally for immediate game actions
    const intent = parseCommand(input, gameState);

    switch (intent.action) {
      case 'attack':
        if (gameState.inCombat && gameState.currentEnemy) {
          const result = resolveCombat(
            gameState.player.attack + (gameState.equippedWeapon?.attackBonus || 0),
            gameState.player.defense + (gameState.equippedArmor?.defenseBonus || 0),
            gameState.currentEnemy
          );

          SFX.playSwordSwing();

          if (result.playerHit) {
            setTimeout(() => SFX.playHitSound(), 100);
            const newEnemy = { ...gameState.currentEnemy, hp: gameState.currentEnemy.hp - result.playerDamage };
            if (newEnemy.hp <= 0) {
              addToLog(`You defeated the ${gameState.currentEnemy.name}!`);
              setTimeout(() => SFX.playMonsterDeath(), 200);
              endCombat(true);
            } else {
              addToLog(`You deal ${result.playerDamage} damage to the ${gameState.currentEnemy.name}!`);
            }
          } else {
            addToLog('Your attack misses!');
          }

          if (result.enemyHit && gameState.currentEnemy.hp > 0) {
            setTimeout(() => SFX.playPlayerDamage(), 300);
            takeDamage(result.enemyDamage);
          }
        } else {
          // Check for monsters in room
          const monster = gameState.currentRoom.entities.find((e) => e.type === 'monster');
          if (monster && typeof monster.data === 'object' && 'name' in monster.data) {
            startCombat(monster.data as any);
          } else {
            addToLog('There is nothing to attack here.');
          }
        }
        break;

      case 'move':
        if (intent.direction && gameState.currentRoom.doors[intent.direction]) {
          const newRoom = getAdjacentRoom(gameState.currentRoom, intent.direction, gameState.player.level);
          if (newRoom) {
            SFX.playDoorOpen();
            enterRoom(newRoom);
            addToLog(generateEventText(newRoom.type));
          }
        } else {
          addToLog('You cannot go that way.');
        }
        break;

      case 'interact':
        if (intent.target === 'chest') {
          const chest = gameState.currentRoom.entities.find((e) => e.type === 'chest');
          if (chest && Array.isArray(chest.data)) {
            SFX.playChestOpen();
            chest.data.forEach((item) => {
              addItem(item);
              setTimeout(() => SFX.playItemCollect(), 200);
              if (item.type === 'treasure') {
                addGold(item.value);
              }
            });
            addToLog('You opened the chest!');
          } else {
            addToLog('There is no chest here.');
          }
        }
        break;

      case 'inventory':
        if (intent.item === 'potion') {
          const potion = gameState.inventory.find((i) => i.type === 'consumable');
          if (potion && potion.hpRestore) {
            heal(potion.hpRestore);
            removeItem(potion.id);
          } else {
            addToLog('You have no potions.');
          }
        } else if (intent.item) {
          const item = gameState.inventory.find((i) => i.name.toLowerCase().includes(intent.item!));
          if (item) {
            if (item.type === 'weapon') equipWeapon(item);
            if (item.type === 'armor') equipArmor(item);
          }
        }
        break;

      case 'help':
        addToLog(`
Commands:
- attack/fight: Engage in combat
- go left/right/forward: Move through doors
- open chest: Loot treasure
- use potion: Heal yourself
- equip [item]: Equip weapon or armor
- look/examine: Examine your surroundings
        `);
        break;
    }

    // Also send to AI for narrative response
    handleSubmit(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/90 border-t border-green-500/30">
      <form onSubmit={handleCommand} className="max-w-4xl mx-auto">
        <div className="flex gap-2">
          <span className="text-green-400 font-mono text-lg">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your command..."
            className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono text-lg placeholder-green-700"
            autoFocus
          />
        </div>
      </form>
    </div>
  );
}
