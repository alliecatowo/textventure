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

        // Calculate wall rotation based on position
        let wallRotation = 0;
        if (tile.type === 'wall' || tile.type === 'door') {
          if (tileZ === roomBounds.minZ) wallRotation = Math.PI; // Back wall
          else if (tileZ === roomBounds.maxZ) wallRotation = 0; // Front wall
          else if (tileX === roomBounds.minX) wallRotation = Math.PI / 2; // Left wall
          else if (tileX === roomBounds.maxX) wallRotation = -Math.PI / 2; // Right wall
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

            {/* Stairs tile */}
            {tile.type === 'floor' && tile.hasStairs && (
              <>
                <Model
                  path="/models/Modular Dungeons Pack-glb/Floor Tile.glb"
                  scale={TILE_SIZE}
                />
                <Model
                  path="/models/Modular Dungeons Pack-glb/Stairs.glb"
                  scale={TILE_SIZE}
                  rotation={[0, Math.random() * Math.PI * 2, 0]}
                />
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
