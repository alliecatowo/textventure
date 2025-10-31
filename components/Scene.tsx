'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Room } from './Room';
import { Entity } from './Entity';
import { Player } from './Player';
import { useGameStore } from '@/lib/store';
import * as THREE from 'three';

export function Scene() {
  const currentRoom = useGameStore((state) => state.currentRoom);

  return (
    <div className="w-full h-screen">
      <Canvas
        shadows
        gl={{ antialias: true }}
        dpr={[1, 2]}
        camera={{ position: [16, 5, 5], fov: 75 }}
      >

        {/* Lighting for dungeon atmosphere */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.7}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[16, 10, 16]} intensity={0.5} color="#ff9944" />

        {/* Fog for atmosphere */}
        <fog attach="fog" args={['#0a0a0a', 10, 50]} />

        {/* Scene content */}
        <Suspense fallback={null}>
          {/* Current room */}
          <Room room={currentRoom} />

          {/* Entities in room */}
          {currentRoom.entities.map((entity) => (
            <Entity key={entity.id} entity={entity} />
          ))}

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
