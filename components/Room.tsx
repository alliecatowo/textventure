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

  return (
    <group>
      {tiles.map((tile, index) => {
        const [tileX, tileZ] = tile.position;
        const worldX = tileX * TILE_SIZE;
        const worldZ = tileZ * TILE_SIZE;

        return (
          <group key={`tile-${index}`} position={[worldX, 0, worldZ]}>
            {/* Floor tile */}
            {tile.type === 'floor' && (
              <Model
                path="/models/Modular Dungeons Pack-glb/Floor Tile.glb"
                scale={TILE_SIZE}
              />
            )}

            {/* Wall */}
            {tile.type === 'wall' && (
              <>
                <Model
                  path="/models/Modular Dungeons Pack-glb/Wall Modular.glb"
                  scale={TILE_SIZE}
                />
                {/* Add torch decoration */}
                {tile.decoration === 'torch' && (
                  <Model
                    path="/models/Modular Dungeons Pack-glb/Torch.glb"
                    position={[0, 1, 0]}
                    scale={0.8}
                  />
                )}
                {tile.decoration === 'banner' && (
                  <Model
                    path="/models/Modular Dungeons Pack-glb/Banner.glb"
                    position={[0, 2, 0]}
                    scale={0.8}
                  />
                )}
              </>
            )}

            {/* Door */}
            {tile.type === 'door' && (
              <Model
                path="/models/Modular Dungeons Pack-glb/Arch Door.glb"
                scale={TILE_SIZE}
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
