'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function CameraController() {
  const { camera, gl } = useThree();
  const rotationX = useRef(0);
  const rotationY = useRef(0);
  const targetRotationX = useRef(0);
  const targetRotationY = useRef(0);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleMouseMove = (e: MouseEvent) => {
      // Only rotate when mouse is in the middle 80% of screen
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Limited look around: ±45 degrees horizontal, ±30 degrees vertical
      targetRotationY.current = x * Math.PI / 4; // ±45 degrees
      targetRotationX.current = y * Math.PI / 6; // ±30 degrees
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [gl]);

  useFrame(() => {
    // Smooth camera rotation
    rotationX.current += (targetRotationX.current - rotationX.current) * 0.1;
    rotationY.current += (targetRotationY.current - rotationY.current) * 0.1;

    // Apply rotation to camera
    camera.rotation.order = 'YXZ';
    camera.rotation.y = rotationY.current;
    camera.rotation.x = rotationX.current;
  });

  return null;
}
