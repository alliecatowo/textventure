import { Item, Monster } from '@/types/game';

// Available item models from the bundle
export const ITEMS: Record<string, Item> = {
  // Weapons
  sword: {
    id: 'sword',
    name: 'Iron Sword',
    type: 'weapon',
    value: 50,
    attackBonus: 5,
    modelPath: '/models/Ultimate RPG Items Bundle-glb/Claymore.glb'
  },
  dagger: {
    id: 'dagger',
    name: 'Steel Dagger',
    type: 'weapon',
    value: 30,
    attackBonus: 3,
    modelPath: '/models/Ultimate RPG Items Bundle-glb/Dagger.glb'
  },
  axe: {
    id: 'axe',
    name: 'Battle Axe',
    type: 'weapon',
    value: 75,
    attackBonus: 7,
    modelPath: '/models/Ultimate RPG Items Bundle-glb/Axe Double.glb'
  },

  // Armor
  leatherArmor: {
    id: 'leatherArmor',
    name: 'Leather Armor',
    type: 'armor',
    value: 40,
    defenseBonus: 3,
    modelPath: '/models/Ultimate RPG Items Bundle-glb/Armor Leather.glb'
  },
  metalArmor: {
    id: 'metalArmor',
    name: 'Metal Armor',
    type: 'armor',
    value: 80,
    defenseBonus: 6,
    modelPath: '/models/Ultimate RPG Items Bundle-glb/Armor Metal.glb'
  },
  goldenArmor: {
    id: 'goldenArmor',
    name: 'Golden Armor',
    type: 'armor',
    value: 150,
    defenseBonus: 10,
    modelPath: '/models/Ultimate RPG Items Bundle-glb/Armor Golden.glb'
  },

  // Consumables
  potion: {
    id: 'potion',
    name: 'Health Potion',
    type: 'consumable',
    value: 25,
    hpRestore: 30,
    modelPath: '/models/Ultimate RPG Items Bundle-glb/Potion.glb'
  },

  // Treasure
  coin: {
    id: 'coin',
    name: 'Gold Coin',
    type: 'treasure',
    value: 1,
    modelPath: '/models/Ultimate RPG Items Bundle-glb/Coin.glb'
  },
  coinPouch: {
    id: 'coinPouch',
    name: 'Coin Pouch',
    type: 'treasure',
    value: 25,
    modelPath: '/models/Ultimate RPG Items Bundle-glb/Coin Pouch.glb'
  },
  goldIngots: {
    id: 'goldIngots',
    name: 'Gold Ingots',
    type: 'treasure',
    value: 100,
    modelPath: '/models/Ultimate RPG Items Bundle-glb/Gold Ingots.glb'
  },
  crown: {
    id: 'crown',
    name: 'Ancient Crown',
    type: 'treasure',
    value: 500,
    modelPath: '/models/Ultimate RPG Items Bundle-glb/Crown.glb'
  }
};

// Available monster models from the bundle
export const MONSTERS: Record<string, Omit<Monster, 'id' | 'hp' | 'maxHp'>> = {
  goblin: {
    name: 'Goblin',
    attack: 3,
    defense: 2,
    xpReward: 10,
    goldReward: 5,
    lootTable: [ITEMS.coin, ITEMS.dagger],
    modelPath: '/models/Ultimate Monsters Bundle-glb/Green Blob.glb'
  },
  ghost: {
    name: 'Ghost',
    attack: 5,
    defense: 1,
    xpReward: 15,
    goldReward: 10,
    lootTable: [ITEMS.coinPouch, ITEMS.potion],
    modelPath: '/models/Ultimate Monsters Bundle-glb/Ghost.glb'
  },
  demon: {
    name: 'Demon',
    attack: 8,
    defense: 5,
    xpReward: 30,
    goldReward: 25,
    lootTable: [ITEMS.sword, ITEMS.leatherArmor, ITEMS.goldIngots],
    modelPath: '/models/Ultimate Monsters Bundle-glb/Demon.glb'
  },
  dragon: {
    name: 'Dragon',
    attack: 12,
    defense: 8,
    xpReward: 100,
    goldReward: 100,
    lootTable: [ITEMS.axe, ITEMS.goldenArmor, ITEMS.crown],
    modelPath: '/models/Ultimate Monsters Bundle-glb/Dragon.glb'
  },
  skeleton: {
    name: 'Skeleton',
    attack: 4,
    defense: 3,
    xpReward: 12,
    goldReward: 8,
    lootTable: [ITEMS.coin, ITEMS.sword],
    modelPath: '/models/Ultimate Monsters Bundle-glb/Ghost Skull.glb'
  }
};

// Dungeon piece models
export const DUNGEON_PIECES = {
  floor: '/models/Modular Dungeons Pack-glb/Floor Tile.glb',
  wall: '/models/Modular Dungeons Pack-glb/Wall.glb',
  door: '/models/Modular Dungeons Pack-glb/Arch Door.glb',
  arch: '/models/Modular Dungeons Pack-glb/Arch.glb',
  column: '/models/Modular Dungeons Pack-glb/Column.glb',
  chest: '/models/Modular Dungeons Pack-glb/Chest.glb',
  chestWithGold: '/models/Modular Dungeons Pack-glb/Chest with Gold.glb',
  torch: '/models/Modular Dungeons Pack-glb/Torch.glb',
  banner: '/models/Modular Dungeons Pack-glb/Banner.glb',
  barrel: '/models/Modular Dungeons Pack-glb/Barrel.glb',
  crate: '/models/Modular Dungeons Pack-glb/Crate.glb',
};

// Character model
export const PLAYER_MODEL = '/models/Hooded Adventurer.glb';

// Initial player stats
export const INITIAL_PLAYER_STATS = {
  hp: 100,
  maxHp: 100,
  attack: 10,
  defense: 5,
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  gold: 50
};
