"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  gem_reward: number;
}

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    
    if (achievement) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {achievement && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pointer-events-none pt-20">
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
            style={{ pointerEvents: 'none' }}
          />
          
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="duo-card p-4 flex items-center gap-4 bg-[#1a3545] border-2 border-duo-gold shadow-2xl max-w-sm w-full mx-4 pointer-events-auto"
          >
            <div className="w-16 h-16 shrink-0 bg-duo-bg flex items-center justify-center text-4xl rounded-full border-4 border-duo-gold">
              {achievement.icon}
            </div>
            <div className="flex-1">
              <div className="text-duo-gold font-extrabold text-sm uppercase tracking-wider mb-1">Achievement Unlocked!</div>
              <div className="font-extrabold text-white text-lg leading-tight">{achievement.title}</div>
              <div className="text-duo-text-muted text-sm mt-1">{achievement.description}</div>
            </div>
            <button
              onClick={onClose}
              className="text-duo-text-muted hover:text-white transition-colors text-xl font-bold self-start -mt-1"
            >
              ×
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
