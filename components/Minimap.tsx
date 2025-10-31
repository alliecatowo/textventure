'use client';

import { useGameStore } from '@/lib/store';

export function Minimap() {
  const { currentRoom, roomHistory } = useGameStore();

  // Parse room coordinates
  const getRoomCoords = (roomId: string) => {
    const [x, y, z] = roomId.split(',').map(Number);
    return { x, y, z };
  };

  const currentCoords = getRoomCoords(currentRoom.id);

  // Create a small grid around current position
  const gridSize = 5;
  const offset = Math.floor(gridSize / 2);

  return (
    <div className="fixed right-4 top-4 bg-black/80 border border-green-500/30 rounded p-4 pointer-events-auto">
      <div className="text-green-400 font-mono text-sm font-bold mb-2">MINIMAP</div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const gridX = index % gridSize;
          const gridZ = Math.floor(index / gridSize);

          const roomX = currentCoords.x + (gridX - offset);
          const roomZ = currentCoords.z + (gridZ - offset);
          const roomKey = `${roomX},${currentCoords.y},${roomZ}`;

          const isCurrentRoom = roomX === currentCoords.x && roomZ === currentCoords.z;
          const isVisited = roomHistory.some((r) => r.id === roomKey);

          let bgColor = 'bg-gray-800';
          if (isCurrentRoom) bgColor = 'bg-green-500';
          else if (isVisited) bgColor = 'bg-green-700';

          return (
            <div
              key={index}
              className={`w-4 h-4 ${bgColor} border border-green-500/20 rounded-sm transition-all`}
              title={roomKey}
            />
          );
        })}
      </div>

      {/* Door indicators */}
      <div className="mt-3 text-xs text-green-300 font-mono space-y-1">
        <div className="text-gray-500">Doors:</div>
        {currentRoom.doors.left && <div>← Left</div>}
        {currentRoom.doors.right && <div>→ Right</div>}
        {currentRoom.doors.forward && <div>↑ Forward</div>}
        {currentRoom.doors.back && <div>↓ Back</div>}
      </div>
    </div>
  );
}
