export interface PlayerStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'treasure';
  value: number;
  attackBonus?: number;
  defenseBonus?: number;
  hpRestore?: number;
  modelPath?: string;
}

export interface Monster {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  xpReward: number;
  goldReward: number;
  lootTable: Item[];
  modelPath: string;
}

export interface RoomEntity {
  id: string;
  type: 'monster' | 'chest' | 'merchant' | 'npc';
  position: [number, number, number];
  data: Monster | Item[] | string; // string for NPC dialogue
}

export interface Room {
  id: string;
  type: 'empty' | 'combat' | 'treasure' | 'merchant' | 'event';
  doors: {
    left?: boolean;
    right?: boolean;
    forward?: boolean;
    back?: boolean;
  };
  entities: RoomEntity[];
  discovered: boolean;
  cleared: boolean;
}

export interface GameState {
  player: PlayerStats;
  inventory: Item[];
  equippedWeapon: Item | null;
  equippedArmor: Item | null;
  currentRoom: Room;
  roomHistory: Room[];
  eventLog: string[];
  inCombat: boolean;
  currentEnemy: Monster | null;
}
