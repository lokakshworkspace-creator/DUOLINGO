import React, { useEffect, useState } from 'react';

interface Props {
  timeLimitMs: number;
  isPaused: boolean;
  onExpire: () => void;
}

export default function LegendaryTimer({ timeLimitMs, isPaused, onExpire }: Props) {
  const [timeLeft, setTimeLeft] = useState(timeLimitMs);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1000;
        if (next <= 0) {
          clearInterval(intervalId);
          onExpire();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isPaused, timeLeft, onExpire]);

  const percentage = Math.max(0, (timeLeft / timeLimitMs) * 100);
  
  // Format MM:SS
  const totalSeconds = Math.floor(timeLeft / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const timeString = `${m}:${s < 10 ? '0' : ''}${s}`;

  const isLow = percentage < 20;

  return (
    <div className="flex-1 flex flex-col gap-1 items-center">
      <span className={`font-extrabold text-sm tracking-widest ${isLow ? 'text-duo-red animate-pulse' : 'text-yellow-500'}`}>
        {timeString}
      </span>
      <div className="w-full bg-[#2a4255] rounded-full h-4 overflow-hidden relative shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear relative ${isLow ? 'bg-duo-red' : 'bg-yellow-400'}`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute top-1 left-2 right-2 h-[4px] bg-white/30 rounded-full" />
        </div>
      </div>
    </div>
  );
}
