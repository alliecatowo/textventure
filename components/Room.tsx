'use client';

import { useMemo } from 'react';
import { Room as RoomType } from '@/types/game';
import { getRoomTiles, TILE_SIZE } from '@/lib/roomGenerator';
import { Model } from './Model';

interface RoomProps {
  room: RoomType;
}

export function Room({ room }: RoomProps) {
  const tiles = useMemo(() => getRoomTiles(room), [room]);

  // Calculate room bounds once
  const roomBounds = useMemo(() => {
    const roomTiles = tiles.filter(t => t.type === 'wall' || t.type === 'door');
    return {
      minX: Math.min(...roomTiles.map(t => t.position[0])),
      maxX: Math.max(...roomTiles.map(t => t.position[0])),
      minZ: Math.min(...roomTiles.map(t => t.position[1])),
      maxZ: Math.max(...roomTiles.map(t => t.position[1])),
    };
  }, [tiles]);

  return (
    <group>
      {tiles.map((tile, index) => {
        const [tileX, tileZ] = tile.position;
        const worldX = tileX * TILE_SIZE;
        const worldZ = tileZ * TILE_SIZE;

        // Calculate wall rotation based on neighboring tiles
        let wallRotation = 0;
        if (tile.type === 'wall' || tile.type === 'door') {
          // Check neighbors to determine wall orientation
          const leftTile = tiles.find(t => t.position[0] === tileX - 1 && t.position[1] === tileZ);
          const rightTile = tiles.find(t => t.position[0] === tileX + 1 && t.position[1] === tileZ);
          const backTile = tiles.find(t => t.position[0] === tileX && t.position[1] === tileZ - 1);
          const forwardTile = tiles.find(t => t.position[0] === tileX && t.position[1] === tileZ + 1);

          const hasFloorLeft = leftTile && leftTile.type === 'floor';
          const hasFloorRight = rightTile && rightTile.type === 'floor';
          const hasFloorBack = backTile && backTile.type === 'floor';
          const hasFloorForward = forwardTile && forwardTile.type === 'floor';

          // Wall faces toward the floor
          if (hasFloorBack) wallRotation = Math.PI; // Face back (into room)
          else if (hasFloorForward) wallRotation = 0; // Face forward (into room)
          else if (hasFloorLeft) wallRotation = Math.PI / 2; // Face left (into room)
          else if (hasFloorRight) wallRotation = -Math.PI / 2; // Face right (into room)
        }

        // Skip empty tiles
        if (tile.type === 'empty') return null;

        return (
          <group key={`tile-${index}`} position={[worldX, 0, worldZ]}>
            {/* Floor tile */}
            {tile.type === 'floor' && !tile.hasStairs && (
              <Model
                path="/models/Modular Dungeons Pack-glb/Floor Tile.glb"
                scale={TILE_SIZE}
              />
            )}

            {/* Stairs tile - use stacked floor tiles for now (no Stairs model available) */}
            {tile.type === 'floor' && tile.hasStairs && (
              <>
                <Model
                  path="/models/Modular Dungeons Pack-glb/Floor Tile.glb"
                  scale={TILE_SIZE}
                />
                {/* Stack floor tiles to create stairs effect */}
                {[0.3, 0.6, 0.9].map((height, i) => (
                  <Model
                    key={`stair-${i}`}
                    path="/models/Modular Dungeons Pack-glb/Floor Tile.glb"
                    scale={TILE_SIZE * 0.8}
                    position={[0, height, i * 0.4 - 0.4]}
                  />
                ))}
              </>
            )}

            {/* Wall - varied heights */}
            {tile.type === 'wall' && (
              <>
                {/* Stack wall segments based on wallHeight */}
                {Array.from({ length: tile.wallHeight || 2 }).map((_, i) => (
                  <Model
                    key={`wall-${i}`}
                    path="/models/Modular Dungeons Pack-glb/Wall Modular.glb"
                    scale={TILE_SIZE}
                    rotation={[0, wallRotation, 0]}
                    position={[0, i * 2, 0]}
                  />
                ))}
                {/* Add torch decoration */}
                {tile.decoration === 'torch' && (
                  <Model
                    path="/models/Modular Dungeons Pack-glb/Torch.glb"
                    position={[0, (tile.wallHeight || 2) * 1.5, 0]}
                    scale={0.8}
                  />
                )}
                {tile.decoration === 'banner' && (
                  <Model
                    path="/models/Modular Dungeons Pack-glb/Banner.glb"
                    position={[0, (tile.wallHeight || 2) * 1.8, 0]}
                    scale={0.8}
                  />
                )}
              </>
            )}

            {/* Door - varied types */}
            {tile.type === 'door' && (
              <Model
                path="/models/Modular Dungeons Pack-glb/Arch Door.glb"
                scale={TILE_SIZE}
                rotation={[0, wallRotation, 0]}
              />
            )}

            {/* Floor decorations */}
            {tile.type === 'floor' && tile.decoration === 'barrel' && (
              <Model
                path="/models/Modular Dungeons Pack-glb/Barrel.glb"
                position={[0, 0.5, 0]}
                scale={0.8}
              />
            )}
            {tile.type === 'floor' && tile.decoration === 'crate' && (
              <Model
                path="/models/Modular Dungeons Pack-glb/Crate.glb"
                position={[0, 0.5, 0]}
                scale={0.8}
              />
            )}
            {tile.type === 'floor' && tile.decoration === 'column' && (
              <Model
                path="/models/Modular Dungeons Pack-glb/Column.glb"
                position={[0, 0, 0]}
                scale={1.2}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}
