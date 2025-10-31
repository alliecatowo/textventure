'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import { Room } from './Room';
import { Entity } from './Entity';
import { Player } from './Player';
import { CameraController } from './CameraController';
import { useGameStore } from '@/lib/store';
import { getRoomTiles, TILE_SIZE } from '@/lib/roomGenerator';
import * as THREE from 'three';

export function Scene() {
  const currentRoom = useGameStore((state) => state.currentRoom);

  // Calculate spawn position based on room dimensions
  const spawnPosition = useMemo(() => {
    const tiles = getRoomTiles(currentRoom);
    const roomTiles = tiles.filter(t => t.type === 'wall' || t.type === 'door');
    const minX = Math.min(...roomTiles.map(t => t.position[0]));
    const maxX = Math.max(...roomTiles.map(t => t.position[0]));
    const minZ = Math.min(...roomTiles.map(t => t.position[1]));

    // Spawn at horizontal center of room, near the back wall (entrance at minZ)
    const centerX = (minX + maxX) / 2;
    return [centerX * TILE_SIZE, 1.6, (minZ + 2) * TILE_SIZE]; // 2 tiles into room from entrance
  }, [currentRoom]);

  return (
    <div className="w-full h-screen">
      <Canvas
        shadows
        gl={{ antialias: true }}
        dpr={[1, 2]}
        camera={{
          position: spawnPosition,  // Dynamically calculated spawn
          rotation: [0, 0, 0],  // Looking straight forward (no rotation)
          fov: 90,  // Wide FOV for first-person
          near: 0.1,
          far: 100
        }}
      >

        {/* Much brighter ambient light */}
        <ambientLight intensity={0.8} />

        {/* Bright global directional light */}
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />

        {/* Player's bright torch light */}
        <pointLight
          position={[16, 1.6, 3]}
          intensity={8}
          distance={30}
          color="#ffaa44"
          decay={1}
        />

        {/* Very bright wall torches */}
        <pointLight position={[8, 2.5, 16]} intensity={5} distance={25} color="#ffaa44" decay={1} castShadow />
        <pointLight position={[24, 2.5, 16]} intensity={5} distance={25} color="#ffaa44" decay={1} castShadow />
        <pointLight position={[16, 2.5, 28]} intensity={5} distance={25} color="#ffaa44" decay={1} />

        {/* Lighter fog */}
        <fog attach="fog" args={['#1a1a1a', 15, 50]} />

        {/* Mouse look controls */}
        <CameraController />

        {/* Scene content */}
        <Suspense fallback={null}>
          {/* Current room */}
          <Room room={currentRoom} />

          {/* Entities in room */}
          {currentRoom.entities.map((entity) => {
            console.log('Rendering entity:', entity.type, entity.id, entity.data);
            return <Entity key={entity.id} entity={entity} />;
          })}

          {/* Player hands with equipped item */}
          <Player />
        </Suspense>

        {/* Ground plane */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[16, -0.1, 16]}
          receiveShadow
        >
          <planeGeometry args={[100, 100]} />
          <shadowMaterial opacity={0.3} />
        </mesh>

      </Canvas>
    </div>
  );
}
