'use client';

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ModelProps {
  path: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

const loader = new GLTFLoader();
const modelCache = new Map();

export function Model({ path, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: ModelProps) {
  const [scene, setScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    // Check cache first
    if (modelCache.has(path)) {
      const cached = modelCache.get(path).clone();
      cached.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      setScene(cached);
      return;
    }

    // Load model
    loader.load(path, (gltf) => {
      modelCache.set(path, gltf.scene);
      const cloned = gltf.scene.clone();
      cloned.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      setScene(cloned);
    });
  }, [path]);

  if (!scene) return null;

  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

// Preload commonly used models
export function preloadModels() {
  const models = [
    '/models/Modular Dungeons Pack-glb/Floor Tile.glb',
    '/models/Modular Dungeons Pack-glb/Wall.glb',
    '/models/Modular Dungeons Pack-glb/Arch Door.glb',
    '/models/Modular Dungeons Pack-glb/Torch.glb',
    '/models/Modular Dungeons Pack-glb/Chest.glb',
    '/models/Hooded Adventurer.glb',
  ];

  models.forEach(path => {
    if (!modelCache.has(path)) {
      loader.load(path, (gltf) => {
        modelCache.set(path, gltf.scene);
      });
    }
  });
}
