'use client';

import { useGameStore } from '@/lib/store';
import { useEffect, useRef } from 'react';

export function EventLog() {
  const eventLog = useGameStore((state) => state.eventLog);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [eventLog]);

  return (
    <div className="fixed left-4 top-1/2 bottom-24 w-96 bg-black/90 border border-green-500/50 rounded-lg p-4 overflow-hidden pointer-events-auto backdrop-blur-sm">
      <div className="text-green-400 font-mono text-sm font-bold mb-2 border-b border-green-500/30 pb-2">
        EVENT LOG
      </div>
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto space-y-1 text-xs text-green-300 font-mono pr-2 scrollbar-thin scrollbar-thumb-green-500/30 scrollbar-track-transparent"
      >
        {eventLog.map((event, index) => (
          <div key={index} className="py-1 border-b border-green-500/10 last:border-0">
            {event}
          </div>
        ))}
      </div>
    </div>
  );
}
