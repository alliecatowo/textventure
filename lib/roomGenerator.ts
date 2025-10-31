import { Room, RoomEntity, Monster } from '@/types/game';
import { getOctaveNoise, getNoise } from './noise';
import { MONSTERS } from './constants';
import { generateLoot } from './lootGenerator';

// Grid-based room layout (like Minecraft chunks)
export const TILE_SIZE = 2; // meters per tile

// Room dimensions vary based on room type
export function getRoomDimensions(roomType: string, seed: number): { width: number; depth: number } {
  const noise = Math.abs(getNoise(seed, seed * 2, seed * 3));

  switch (roomType) {
    case 'combat':
      // Combat rooms: medium to large, more square-ish
      return {
        width: Math.floor(12 + noise * 8), // 12-20 tiles
        depth: Math.floor(10 + noise * 6), // 10-16 tiles
      };
    case 'treasure':
      // Treasure rooms: smaller, intimate
      return {
        width: Math.floor(8 + noise * 4), // 8-12 tiles
        depth: Math.floor(6 + noise * 4), // 6-10 tiles
      };
    case 'merchant':
      // Merchant rooms: wide and shallow
      return {
        width: Math.floor(14 + noise * 6), // 14-20 tiles
        depth: Math.floor(8 + noise * 4), // 8-12 tiles
      };
    case 'event':
      // Event rooms: unique shapes
      return {
        width: Math.floor(10 + noise * 10), // 10-20 tiles
        depth: Math.floor(8 + noise * 8), // 8-16 tiles
      };
    default: // empty
      // Empty rooms: varied
      return {
        width: Math.floor(10 + noise * 8), // 10-18 tiles
        depth: Math.floor(8 + noise * 6), // 8-14 tiles
      };
  }
}

export interface TileData {
  type: 'floor' | 'wall' | 'door' | 'empty';
  position: [number, number];
  decoration?: 'torch' | 'barrel' | 'crate' | 'column' | 'banner';
}

// World map to track generated rooms
interface WorldMap {
  [key: string]: Room; // key is "x,y,z"
}

const worldMap: WorldMap = {};
let worldSeed = Math.floor(Math.random() * 1000000);

export function setWorldSeed(seed: number): void {
  worldSeed = seed;
}

export function getWorldSeed(): number {
  return worldSeed;
}

// Convert room coordinates to key
function roomKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

// Generate room type based on position and noise
function getRoomType(x: number, y: number, z: number): Room['type'] {
  const noise = getOctaveNoise(x * 0.1, y * 0.1, z * 0.1, 3);

  if (noise < -0.3) return 'combat';
  if (noise < 0) return 'treasure';
  if (noise < 0.3) return 'empty';
  if (noise < 0.5) return 'merchant';
  return 'event';
}

// Generate tile grid for a room
function generateTiles(roomX: number, roomY: number, roomZ: number, width: number, depth: number): TileData[] {
  const tiles: TileData[] = [];

  for (let x = 0; x < width; x++) {
    for (let z = 0; z < depth; z++) {
      const worldX = roomX * width + x;
      const worldZ = roomZ * depth + z;

      // Use noise to determine if it's a wall or floor
      const noise = getNoise(worldX * 0.3, roomY * 0.3, worldZ * 0.3);

      // Walls on edges, except for doors
      const isEdge = x === 0 || x === width - 1 || z === 0 || z === depth - 1;

      let type: TileData['type'] = 'floor';
      let decoration: TileData['decoration'] | undefined;

      if (isEdge) {
        // Check if this edge tile should be a door
        const isDoorSpot =
          (x === Math.floor(width / 2) && z === 0) || // back door (entrance)
          (x === Math.floor(width / 2) && z === depth - 1) || // forward door
          (x === 0 && z === Math.floor(depth / 2)) || // left door
          (x === width - 1 && z === Math.floor(depth / 2)); // right door

        type = isDoorSpot ? 'door' : 'wall';

        // Add decorations to walls
        if (type === 'wall' && noise > 0.3) {
          const decorRoll = Math.abs(noise);
          if (decorRoll > 0.8) decoration = 'torch';
          else if (decorRoll > 0.6) decoration = 'banner';
        }
      } else {
        // Floor tiles can have decorations
        if (noise > 0.4 && Math.abs(noise) < 0.6) {
          const decorRoll = Math.abs(noise);
          if (decorRoll > 0.55) decoration = 'barrel';
          else if (decorRoll > 0.5) decoration = 'crate';
          else if (decorRoll > 0.45) decoration = 'column';
        }
      }

      tiles.push({
        type,
        position: [x, z],
        decoration,
      });
    }
  }

  return tiles;
}

// Generate monsters for a combat room
function generateMonsters(seed: number, roomType: string, playerLevel: number): RoomEntity[] {
  if (roomType !== 'combat') return [];

  const entities: RoomEntity[] = [];
  const monsterTypes = Object.keys(MONSTERS);

  // Number of monsters based on noise
  const numMonsters = Math.floor(getNoise(seed, seed * 2, seed * 3) * 3) + 1;

  for (let i = 0; i < numMonsters; i++) {
    const monsterSeed = seed + i * 100;
    const monsterType = monsterTypes[Math.floor(Math.abs(getNoise(monsterSeed, 0, 0)) * monsterTypes.length)];
    const baseMonster = MONSTERS[monsterType];

    // Scale monster stats with player level
    const levelMultiplier = 1 + (playerLevel - 1) * 0.15;
    const hp = Math.floor(30 * levelMultiplier);

    const monster: Monster = {
      id: `monster_${monsterSeed}`,
      name: baseMonster.name,
      hp,
      maxHp: hp,
      attack: Math.floor(baseMonster.attack * levelMultiplier),
      defense: Math.floor(baseMonster.defense * levelMultiplier),
      xpReward: Math.floor(baseMonster.xpReward * levelMultiplier),
      goldReward: Math.floor(baseMonster.goldReward * levelMultiplier),
      lootTable: generateLoot(monsterSeed, playerLevel, 1),
      modelPath: baseMonster.modelPath,
    };

    // Position in back half of room (visible from entrance)
    const roomWidth = 16; // Approximate
    const roomDepth = 12;
    const x = (Math.abs(getNoise(monsterSeed, 1, 0)) * (roomWidth - 8) + 4) * TILE_SIZE;
    const z = (Math.abs(getNoise(monsterSeed, 2, 0)) * (roomDepth / 2) + roomDepth / 2) * TILE_SIZE;

    entities.push({
      id: monster.id,
      type: 'monster',
      position: [x, 0, z],
      data: monster,
    });
  }

  return entities;
}

// Generate treasure chests
function generateChests(seed: number, roomType: string, playerLevel: number): RoomEntity[] {
  if (roomType !== 'treasure' && roomType !== 'combat') return [];

  const entities: RoomEntity[] = [];
  const numChests = roomType === 'treasure' ? Math.floor(Math.abs(getNoise(seed, seed, seed)) * 2) + 1 : 1;

  for (let i = 0; i < numChests; i++) {
    const chestSeed = seed + i * 200;

    // Generate loot for chest
    const lootCount = Math.floor(Math.abs(getNoise(chestSeed, 0, 0)) * 3) + 1;
    const loot = generateLoot(chestSeed, playerLevel, lootCount);

    // Position in back portion (visible from entrance)
    const roomWidth = 16;
    const roomDepth = 12;
    const x = (Math.abs(getNoise(chestSeed, 3, 0)) * (roomWidth - 8) + 4) * TILE_SIZE;
    const z = (Math.abs(getNoise(chestSeed, 4, 0)) * (roomDepth / 2) + roomDepth / 2) * TILE_SIZE;

    entities.push({
      id: `chest_${chestSeed}`,
      type: 'chest',
      position: [x, 0, z],
      data: loot,
    });
  }

  return entities;
}

// Generate a room at specific coordinates
export function generateRoom(
  type: Room['type'] | 'auto' = 'auto',
  x: number = 0,
  y: number = 0,
  z: number = 0,
  playerLevel: number = 1
): Room {
  const key = roomKey(x, y, z);

  // Return cached room if it exists
  if (worldMap[key]) {
    return worldMap[key];
  }

  // Determine room type
  const roomType = type === 'auto' ? getRoomType(x, y, z) : type;

  // Generate seed for this room
  const seed = worldSeed + x * 1000 + y * 100000 + z * 10;

  // Get room dimensions
  const { width, depth } = getRoomDimensions(roomType, seed);

  // Generate tiles
  const tiles = generateTiles(x, y, z, width, depth);

  // Determine door positions based on neighboring rooms
  const doors = {
    left: getNoise(x - 1, y, z) > -0.5,
    right: getNoise(x + 1, y, z) > -0.5,
    forward: getNoise(x, y, z + 1) > -0.5,
    back: true, // Always allow going back
  };

  // Generate entities based on room type
  const entities: RoomEntity[] = [
    ...generateMonsters(seed, roomType, playerLevel),
    ...generateChests(seed, roomType, playerLevel),
  ];

  // Add merchants for merchant rooms (centered, visible from entrance)
  if (roomType === 'merchant') {
    entities.push({
      id: `merchant_${seed}`,
      type: 'merchant',
      position: [width * TILE_SIZE / 2, 0, depth * TILE_SIZE * 0.7],
      data: 'merchant',
    });
  }

  const room: Room = {
    id: key,
    type: roomType,
    doors,
    entities,
    discovered: false,
    cleared: roomType !== 'combat',
  };

  // Cache the room
  worldMap[key] = room;

  return room;
}

// Get neighboring room
export function getAdjacentRoom(
  currentRoom: Room,
  direction: 'left' | 'right' | 'forward' | 'back',
  playerLevel: number = 1
): Room | null {
  // Parse current room coordinates from ID
  const [x, y, z] = currentRoom.id.split(',').map(Number);

  let newX = x;
  let newY = y;
  let newZ = z;

  switch (direction) {
    case 'left':
      newX -= 1;
      break;
    case 'right':
      newX += 1;
      break;
    case 'forward':
      newZ += 1;
      break;
    case 'back':
      newZ -= 1;
      break;
  }

  // Check if door exists in that direction
  if (!currentRoom.doors[direction]) {
    return null;
  }

  return generateRoom('auto', newX, newY, newZ, playerLevel);
}

// Get current room tiles for rendering
export function getRoomTiles(room: Room): TileData[] {
  const [x, y, z] = room.id.split(',').map(Number);
  const seed = worldSeed + x * 1000 + y * 100000 + z * 10;
  const { width, depth } = getRoomDimensions(room.type, seed);
  return generateTiles(x, y, z, width, depth);
}
