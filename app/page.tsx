'use client';

import dynamic from 'next/dynamic';
import { HUD } from '@/components/HUD';
import { EventLog } from '@/components/EventLog';
import { Minimap } from '@/components/Minimap';
import { Inventory } from '@/components/Inventory';
import { TextInput } from '@/components/TextInput';
import { useEffect } from 'react';

// Dynamically import Scene to avoid SSR issues with Three.js
const Scene = dynamic(() => import('@/components/Scene').then((mod) => mod.Scene), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      <div className="text-green-400 font-mono">Loading dungeon...</div>
    </div>
  ),
});

export default function Home() {
  useEffect(() => {
    // Preload models
    import('@/components/Model').then(({ preloadModels }) => {
      preloadModels();
    });
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Scene */}
      <Scene />

      {/* UI Overlays */}
      <HUD />
      <EventLog />
      <Minimap />
      <Inventory />

      {/* Command Input */}
      <TextInput />

      {/* Title/Instructions - less obtrusive */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-30 hover:opacity-0 transition-opacity duration-500">
        <h1 className="text-6xl font-bold text-green-400/10 font-mono tracking-wider">
          TEXTVENTURE
        </h1>
        <p className="text-green-400/10 font-mono text-xs mt-2">
          Type commands below
        </p>
      </div>
    </main>
  );
}
