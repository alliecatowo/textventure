import { create } from 'zustand';
import { GameState, Item, Monster, Room } from '@/types/game';
import { INITIAL_PLAYER_STATS, ITEMS } from './constants';
import { generateRoom, getAdjacentRoom, initNoise } from './roomGenerator';
import { initNoise as initNoiseGen } from './noise';

interface GameStore extends GameState {
  // Actions
  addToLog: (message: string) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  equipWeapon: (item: Item) => void;
  equipArmor: (item: Item) => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  gainXP: (amount: number) => void;
  enterRoom: (room: Room) => void;
  startCombat: (enemy: Monster) => void;
  endCombat: (victory: boolean) => void;
  resetGame: () => void;
}

// Initialize noise with seed
const worldSeed = Math.floor(Math.random() * 1000000);
initNoiseGen(worldSeed);

const initialRoom = generateRoom('empty', 0, 0, 0, 1);

const initialState: GameState = {
  player: INITIAL_PLAYER_STATS,
  inventory: [ITEMS.dagger, ITEMS.potion],
  equippedWeapon: ITEMS.dagger,
  equippedArmor: null,
  currentRoom: initialRoom,
  roomHistory: [initialRoom],
  eventLog: ['Welcome to TextVenture! Type your actions to explore the dungeon.'],
  inCombat: false,
  currentEnemy: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  addToLog: (message: string) =>
    set((state) => ({
      eventLog: [...state.eventLog, message],
    })),

  takeDamage: (amount: number) =>
    set((state) => {
      const newHp = Math.max(0, state.player.hp - amount);
      get().addToLog(`You take ${amount} damage! HP: ${newHp}/${state.player.maxHp}`);
      return {
        player: { ...state.player, hp: newHp },
      };
    }),

  heal: (amount: number) =>
    set((state) => {
      const newHp = Math.min(state.player.maxHp, state.player.hp + amount);
      get().addToLog(`You heal ${amount} HP! HP: ${newHp}/${state.player.maxHp}`);
      return {
        player: { ...state.player, hp: newHp },
      };
    }),

  addItem: (item: Item) =>
    set((state) => {
      get().addToLog(`Obtained: ${item.name}`);
      return {
        inventory: [...state.inventory, item],
      };
    }),

  removeItem: (itemId: string) =>
    set((state) => ({
      inventory: state.inventory.filter((item) => item.id !== itemId),
    })),

  equipWeapon: (item: Item) =>
    set(() => {
      get().addToLog(`Equipped: ${item.name}`);
      return { equippedWeapon: item };
    }),

  equipArmor: (item: Item) =>
    set(() => {
      get().addToLog(`Equipped: ${item.name}`);
      return { equippedArmor: item };
    }),

  addGold: (amount: number) =>
    set((state) => {
      get().addToLog(`+${amount} gold`);
      return {
        player: { ...state.player, gold: state.player.gold + amount },
      };
    }),

  spendGold: (amount: number) => {
    const state = get();
    if (state.player.gold >= amount) {
      set((state) => ({
        player: { ...state.player, gold: state.player.gold - amount },
      }));
      return true;
    }
    get().addToLog("Not enough gold!");
    return false;
  },

  gainXP: (amount: number) =>
    set((state) => {
      const newXP = state.player.xp + amount;
      get().addToLog(`+${amount} XP`);

      // Check for level up
      if (newXP >= state.player.xpToNextLevel) {
        const newLevel = state.player.level + 1;
        const xpToNextLevel = Math.floor(state.player.xpToNextLevel * 1.5);
        const maxHp = state.player.maxHp + 20;
        const attack = state.player.attack + 2;
        const defense = state.player.defense + 1;

        get().addToLog(`LEVEL UP! You are now level ${newLevel}!`);

        return {
          player: {
            ...state.player,
            level: newLevel,
            xp: newXP - state.player.xpToNextLevel,
            xpToNextLevel,
            maxHp,
            hp: maxHp, // Heal to full on level up
            attack,
            defense,
          },
        };
      }

      return {
        player: { ...state.player, xp: newXP },
      };
    }),

  enterRoom: (room: Room) =>
    set((state) => {
      get().addToLog(`You enter a ${room.type} room...`);
      return {
        currentRoom: room,
        roomHistory: [...state.roomHistory, room],
      };
    }),

  startCombat: (enemy: Monster) =>
    set(() => {
      get().addToLog(`A ${enemy.name} appears! HP: ${enemy.hp}/${enemy.maxHp}`);
      return {
        inCombat: true,
        currentEnemy: enemy,
      };
    }),

  endCombat: (victory: boolean) =>
    set((state) => {
      if (victory && state.currentEnemy) {
        get().gainXP(state.currentEnemy.xpReward);
        get().addGold(state.currentEnemy.goldReward);

        // Random loot drop
        if (state.currentEnemy.lootTable.length > 0 && Math.random() > 0.5) {
          const loot = state.currentEnemy.lootTable[
            Math.floor(Math.random() * state.currentEnemy.lootTable.length)
          ];
          get().addItem(loot);
        }
      }

      return {
        inCombat: false,
        currentEnemy: null,
      };
    }),

  resetGame: () => set(initialState),
}));
