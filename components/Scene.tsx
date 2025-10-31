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
        camera={{ position: [16, 12, -5], fov: 60, near: 0.1, far: 1000 }}
      >

        {/* Enhanced lighting for better visibility */}
        <ambientLight intensity={0.6} />

        {/* Main directional light from above */}
        <directionalLight
          position={[20, 20, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          color="#ffffff"
        />

        {/* Warm torch-like point lights around the room */}
        <pointLight position={[8, 8, 8]} intensity={2} distance={30} color="#ffaa44" />
        <pointLight position={[24, 8, 8]} intensity={2} distance={30} color="#ffaa44" />
        <pointLight position={[16, 8, 24]} intensity={2} distance={30} color="#ffaa44" />

        {/* Subtle rim light for depth */}
        <directionalLight
          position={[-10, 5, -10]}
          intensity={0.3}
          color="#4488ff"
        />

        {/* Fog for atmosphere - lighter and further */}
        <fog attach="fog" args={['#1a1a1a', 30, 80]} />

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
