"use client";
import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

function AnimatedCounter({ value, className }: { value: number, className?: string }) {
  const [prevValue, setPrevValue] = useState(value);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (value !== prevValue) {
      setDirection(value > prevValue ? 1 : -1);
      setPrevValue(value);
    }
  }, [value, prevValue]);

  return (
    <div className="relative overflow-hidden h-6 flex items-center justify-center">
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.span
          key={value}
          custom={direction}
          initial={{ y: direction > 0 ? 20 : -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: direction > 0 ? -20 : 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`inline-block min-w-[20px] text-center ${className || ''}`}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function TopStatsBar() {
  const { user } = useUser();
  const pathname = usePathname();
  if (pathname.startsWith('/lesson') || pathname === '/login' || pathname === '/signup') return null;
  if (!user) return (
    <div className="hidden md:flex h-14 border-b border-duo-border items-center justify-end px-8 gap-6" />
  );

  return (
    <header className="hidden md:flex h-14 border-b border-duo-border items-center justify-end px-8 gap-6 shrink-0">
      {/* Flag / Language */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🇩🇪</span>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-2">
        <motion.span 
          className="text-2xl"
          animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          🔥
        </motion.span>
        <AnimatedCounter value={user.streak_current} className="font-extrabold text-white" />
      </div>

      {/* Gems */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">💎</span>
        <AnimatedCounter value={user.gems} className="font-extrabold text-white" />
      </div>

      {/* Hearts */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">❤️</span>
        <AnimatedCounter value={user.hearts_current} className="font-extrabold text-duo-red" />
      </div>
    </header>
  );
}
