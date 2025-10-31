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
  wallHeight?: number; // 1-3 for varied wall heights
  doorType?: 'arch' | 'double' | 'gate'; // Different door types
  hasStairs?: boolean; // Special floor tile with stairs
}

// Room shape templates
type RoomShape = 'rectangle' | 'L-shape' | 'T-shape' | 'cross' | 'circular' | 'hexagon';

function getRoomShape(seed: number): RoomShape {
  const noise = Math.abs(getNoise(seed, seed * 1.5, seed * 2));
  // More balanced distribution
  if (noise < 0.5) return 'rectangle';
  if (noise < 0.65) return 'L-shape';
  if (noise < 0.75) return 'T-shape';
  if (noise < 0.85) return 'circular';
  if (noise < 0.95) return 'cross';
  return 'hexagon';
}

// Check if a tile should be floor based on room shape
function isFloorTile(x: number, z: number, width: number, depth: number, shape: RoomShape, seed: number): boolean {
  const centerX = width / 2;
  const centerZ = depth / 2;
  const dx = x - centerX;
  const dz = z - centerZ;
  const distFromCenter = Math.sqrt(dx * dx + dz * dz);

  switch (shape) {
    case 'rectangle':
      return true; // All tiles within bounds are floor

    case 'L-shape':
      // Cut out top-right or bottom-left corner (deterministic)
      const cutCorner = getNoise(seed * 1.1, seed * 1.2, seed * 1.3) > 0;
      if (cutCorner) {
        return !(x > width * 0.6 && z < depth * 0.4);
      } else {
        return !(x < width * 0.4 && z > depth * 0.6);
      }

    case 'T-shape':
      // Cut out two bottom corners
      return !(
        (x < width * 0.3 && z > depth * 0.6) ||
        (x > width * 0.7 && z > depth * 0.6)
      );

    case 'cross':
      // Four corridors meeting in center
      const isHorizontalCorridor = Math.abs(dz) < depth * 0.25;
      const isVerticalCorridor = Math.abs(dx) < width * 0.25;
      return isHorizontalCorridor || isVerticalCorridor;

    case 'circular':
      // Circular room
      const radius = Math.min(width, depth) * 0.45;
      return distFromCenter < radius;

    case 'hexagon':
      // Approximate hexagon
      const hexRadius = Math.min(width, depth) * 0.45;
      const angle = Math.atan2(dz, dx);
      const hexDist = hexRadius / Math.cos((angle % (Math.PI / 3)) - Math.PI / 6);
      return distFromCenter < hexDist * 0.9;

    default:
      return true;
  }
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

  // More balanced distribution: combat most common, treasure rare
  if (noise < -0.2) return 'combat';
  if (noise < 0.2) return 'empty';
  if (noise < 0.4) return 'combat'; // More combat rooms
  if (noise < 0.55) return 'event';
  if (noise < 0.65) return 'treasure'; // Treasure is rare
  if (noise < 0.8) return 'empty';
  if (noise < 0.9) return 'merchant';
  return 'combat'; // Default to combat
}

// Generate tile grid for a room
function generateTiles(
  roomX: number,
  roomY: number,
  roomZ: number,
  width: number,
  depth: number,
  doors: { left: boolean; right: boolean; forward: boolean; back: boolean }
): TileData[] {
  const tiles: TileData[] = [];

  // Determine room shape based on seed
  const shapeSeed = worldSeed + roomX * 777 + roomY * 888 + roomZ * 999;
  const roomShape = getRoomShape(shapeSeed);

  for (let x = 0; x < width; x++) {
    for (let z = 0; z < depth; z++) {
      const worldX = roomX * width + x;
      const worldZ = roomZ * depth + z;

      // Check if this tile is part of the room shape
      const isInRoomShape = isFloorTile(x, z, width, depth, roomShape, shapeSeed);

      // Use noise to determine if it's a wall or floor
      const noise = getNoise(worldX * 0.3, roomY * 0.3, worldZ * 0.3);

      // Walls on edges, except for doors
      const isEdge = x === 0 || x === width - 1 || z === 0 || z === depth - 1;

      let type: TileData['type'] = 'floor';
      let decoration: TileData['decoration'] | undefined;
      let wallHeight: number | undefined;
      let doorType: TileData['doorType'] | undefined;
      let hasStairs = false;

      // Check if adjacent to empty space (for interior walls in shaped rooms)
      const hasEmptyNeighbor =
        !isFloorTile(x - 1, z, width, depth, roomShape, shapeSeed) ||
        !isFloorTile(x + 1, z, width, depth, roomShape, shapeSeed) ||
        !isFloorTile(x, z - 1, width, depth, roomShape, shapeSeed) ||
        !isFloorTile(x, z + 1, width, depth, roomShape, shapeSeed);

      // If tile is outside room shape, mark as empty
      if (!isInRoomShape) {
        type = 'empty';
      } else if (isEdge || (hasEmptyNeighbor && isInRoomShape)) {
        // Check if this edge tile should be a door (AND if that door is enabled)
        const isBackDoor = x === Math.floor(width / 2) && z === 0 && doors.back;
        const isForwardDoor = x === Math.floor(width / 2) && z === depth - 1 && doors.forward;
        const isLeftDoor = x === 0 && z === Math.floor(depth / 2) && doors.left;
        const isRightDoor = x === width - 1 && z === Math.floor(depth / 2) && doors.right;

        const isDoorSpot = isBackDoor || isForwardDoor || isLeftDoor || isRightDoor;

        type = isDoorSpot ? 'door' : 'wall';

        if (type === 'door') {
          // All doors use arch for now (only model available)
          doorType = 'arch';
        } else {
          // Varied wall heights (2-4 segments)
          const heightNoise = Math.abs(getNoise(worldX * 0.5, roomY * 0.5, worldZ * 0.5));
          wallHeight = Math.floor(heightNoise * 2) + 2; // 2-3 segments

          // Add decorations to walls
          if (noise > 0.3) {
            const decorRoll = Math.abs(noise);
            if (decorRoll > 0.8) decoration = 'torch';
            else if (decorRoll > 0.6) decoration = 'banner';
          }
        }
      } else {
        // Floor tiles can have decorations or stairs
        const floorNoise = Math.abs(getNoise(worldX * 0.6, roomY * 0.6, worldZ * 0.6));

        // Occasionally add stairs (rare)
        if (floorNoise > 0.85 && z > depth / 3 && z < depth * 2 / 3) {
          hasStairs = true;
        } else if (noise > 0.4 && Math.abs(noise) < 0.6) {
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
        wallHeight,
        doorType,
        hasStairs,
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

  // Determine door positions based on neighboring rooms
  // Use different thresholds for more variety
  const doors = {
    left: getNoise(x - 1, y, z) > -0.2,
    right: getNoise(x + 1, y, z) > -0.2,
    forward: getNoise(x, y, z + 1) > 0.1, // Forward is less common - creates dead ends
    back: true, // Always allow going back
  };

  // Generate tiles with door configuration
  const tiles = generateTiles(x, y, z, width, depth, doors);

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
  return generateTiles(x, y, z, width, depth, room.doors);
}
