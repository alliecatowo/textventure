'use client';

import { RoomEntity } from '@/types/game';
import { Model } from './Model';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EntityProps {
  entity: RoomEntity;
}

export function Entity({ entity }: EntityProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Gentle bobbing animation for entities
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + entity.position[0]) * 0.1 + 0.5;
    }
  });

  const renderEntity = () => {
    switch (entity.type) {
      case 'chest':
        return (
          <Model
            path="/models/Modular Dungeons Pack-glb/Chest.glb"
            scale={1.2}
          />
        );

      case 'monster':
        if (typeof entity.data === 'object' && 'modelPath' in entity.data) {
          return (
            <Model
              path={entity.data.modelPath}
              scale={1.5}
            />
          );
        }
        return null;

      case 'merchant':
        // Use King model for merchants
        return (
          <Model
            path="/models/King.glb"
            scale={1}
          />
        );

      case 'npc':
        // Use Witch model for NPCs
        return (
          <Model
            path="/models/Witch.glb"
            scale={1}
          />
        );

      default:
        return null;
    }
  };

  return (
    <group ref={groupRef} position={entity.position}>
      {renderEntity()}
    </group>
  );
}
