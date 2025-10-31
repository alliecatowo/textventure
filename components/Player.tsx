'use client';

import { useGameStore } from '@/lib/store';
import { useRef } from 'react';
import * as THREE from 'three';
import { Model } from './Model';

export function Player() {
  const equippedWeapon = useGameStore((state) => state.equippedWeapon);
  const armRef = useRef<THREE.Group>(null);

  return (
    <group position={[0, -1.5, -2]}>
      {/* Character arms in first person view */}
      <group ref={armRef} position={[0.3, 0, 0]} rotation={[-0.2, 0, 0]}>
        {/* This would ideally be just the arms from the character model */}
        {/* For now, we'll position the full character model close and low */}
        <Model
          path="/models/Hooded Adventurer.glb"
          scale={0.4}
          position={[0, 0, 0]}
        />
      </group>

      {/* Equipped weapon in hand */}
      {equippedWeapon && equippedWeapon.modelPath && (
        <group position={[0.5, -0.3, -0.5]} rotation={[0, Math.PI / 4, -Math.PI / 6]}>
          <Model
            path={equippedWeapon.modelPath}
            scale={0.5}
          />
        </group>
      )}
    </group>
  );
}
