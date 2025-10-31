'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Model } from './Model';

interface TorchProps {
  position: [number, number, number];
}

export function Torch({ position }: TorchProps) {
  const lightRef = useRef<THREE.PointLight>(null);

  // Flicker effect
  useFrame((state) => {
    if (lightRef.current) {
      const flicker = Math.sin(state.clock.elapsedTime * 10) * 0.2 + Math.random() * 0.1;
      lightRef.current.intensity = 5 + flicker;
    }
  });

  return (
    <group position={position}>
      {/* Torch model */}
      <Model
        path="/models/Modular Dungeons Pack-glb/Torch.glb"
        position={[0, 0, 0]}
        scale={0.8}
      />

      {/* Flickering light */}
      <pointLight
        ref={lightRef}
        position={[0, 0.5, 0]}
        color="#ffaa44"
        intensity={5}
        distance={20}
        decay={1}
        castShadow
      />

      {/* Warm glow */}
      <pointLight
        position={[0, 0.3, 0]}
        color="#ff8833"
        intensity={2}
        distance={12}
        decay={1}
      />
    </group>
  );
}
