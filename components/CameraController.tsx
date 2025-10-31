'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function CameraController() {
  const { camera, gl } = useThree();
  const cameraRig = useRef<THREE.Group | null>(null);

  // Use quaternions for smooth, unlimited rotation
  const yaw = useRef(0);
  const pitch = useRef(0);
  const isLocked = useRef(false);

  useEffect(() => {
    // Create camera rig (parent group for yaw rotation)
    if (!cameraRig.current) {
      cameraRig.current = new THREE.Group();
      const originalPosition = camera.position.clone();
      camera.position.set(0, 0, 0);
      cameraRig.current.position.copy(originalPosition);
      cameraRig.current.add(camera);
    }

    const canvas = gl.domElement;

    // Pointer lock for proper FPS controls
    const handlePointerLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas;
    };

    const handleMouseDown = () => {
      if (!isLocked.current) {
        canvas.requestPointerLock();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Press '/' to exit mouse look and focus text input
      if (e.key === '/') {
        e.preventDefault();
        if (isLocked.current) {
          document.exitPointerLock();
        }
        // Focus text input
        const textInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (textInput) {
          textInput.focus();
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isLocked.current) return;

      const sensitivity = 0.002;

      // Unlimited horizontal rotation (yaw)
      yaw.current -= e.movementX * sensitivity;

      // Vertical rotation (pitch) clamped to prevent flipping
      pitch.current -= e.movementY * sensitivity;
      pitch.current = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch.current));
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl, camera]);

  useFrame(({ scene }) => {
    if (!cameraRig.current) return;

    // Ensure rig is in scene
    if (!cameraRig.current.parent) {
      scene.add(cameraRig.current);
    }

    // Apply yaw to camera rig (unlimited horizontal rotation)
    cameraRig.current.rotation.y = yaw.current;

    // Apply pitch to camera with proper rotation order
    camera.rotation.order = 'YXZ';
    camera.rotation.x = pitch.current;
    camera.rotation.y = 0;
    camera.rotation.z = 0; // No roll
  });

  return null;
}
