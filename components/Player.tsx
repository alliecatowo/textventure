'use client';

import { useGameStore } from '@/lib/store';
import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Model } from './Model';

export function Player() {
  const equippedWeapon = useGameStore((state) => state.equippedWeapon);
  const { camera } = useThree();
  const handsGroupRef = useRef<THREE.Group>(null);

  // Make hands follow camera
  useFrame(() => {
    if (handsGroupRef.current) {
      // Position hands relative to camera
      handsGroupRef.current.position.copy(camera.position);
      handsGroupRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group ref={handsGroupRef}>
      {/* Hands/arms positioned in front of camera view */}
      <group position={[0.4, -0.4, -1.2]} rotation={[-0.3, 0.1, 0]}>
        {/* Character arms - scaled down and positioned to show just hands */}
        <Model
          path="/models/Hooded Adventurer.glb"
          scale={0.15}
          position={[0, -0.8, 0]}
        />
      </group>

      {/* Equipped weapon in right hand */}
      {equippedWeapon && equippedWeapon.modelPath && (
        <group position={[0.3, -0.5, -0.8]} rotation={[-0.4, 0.2, -0.1]}>
          <Model
            path={equippedWeapon.modelPath}
            scale={0.3}
          />
        </group>
      )}
    </group>
  );
}
