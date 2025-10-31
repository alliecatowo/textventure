'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Room } from './Room';
import { Entity } from './Entity';
import { Player } from './Player';
import { CameraController } from './CameraController';
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
        camera={{
          position: [16, 1.6, 2],  // Eye level (1.6m), looking INTO the room from near edge
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
