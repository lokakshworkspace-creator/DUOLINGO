"use client";
import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;
const MotionButton = motion.button;

interface Props {
  result: { xp_earned: number; streak_updated?: boolean; new_streak?: number; hearts_remaining?: number; is_legendary?: boolean };
  onClose: () => void;
  isLegendary?: boolean;
}

export default function LessonCompleteModal({ result, onClose, isLegendary }: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => { setSize({ w: window.innerWidth, h: window.innerHeight }); }, []);

  return (
    <MotionDiv 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-duo-bg/95 flex flex-col items-center justify-center p-6 backdrop-blur-sm"
    >
      {size.w > 0 && (
        <ReactConfetti width={size.w} height={size.h} recycle={false} numberOfPieces={350}
          colors={isLegendary ? ['#FFD900', '#FFC800', '#FFFFFF', '#E5B800'] : ['#58CC02', '#1CB0F6', '#FFD900', '#CE82FF', '#FF4B4B']} />
      )}

      <MotionDiv 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="flex flex-col items-center max-w-md w-full"
      >
        <div className="text-7xl mb-4">{isLegendary ? '🏆' : '🎉'}</div>
        <h1 className="text-4xl font-extrabold text-duo-gold mb-2 text-center">
          {isLegendary ? 'Legendary!' : 'Lesson Complete!'}
        </h1>
        <p className="text-duo-text-muted font-bold mb-10 text-center">
          {isLegendary ? 'You proved your mastery!' : 'You\'re on a roll! Keep going!'}
        </p>

        {/* Stats */}
        <div className="flex gap-4 w-full mb-10 justify-center">
          <div className="flex-1 duo-card p-5 flex flex-col items-center gap-2 border-duo-gold border-2 bg-yellow-500/10">
            <span className="text-duo-gold text-xs font-extrabold uppercase tracking-widest">TOTAL XP</span>
            <div className="flex items-center gap-2 text-duo-gold font-extrabold text-3xl">
              <span>⚡</span>
              <span>{result.xp_earned}</span>
            </div>
          </div>
          {!isLegendary && (
            <>
              <div className="flex-1 duo-card p-5 flex flex-col items-center gap-2">
                <span className="text-duo-text-muted text-xs font-extrabold uppercase tracking-widest">STREAK</span>
                <div className="flex items-center gap-2 text-duo-orange font-extrabold text-3xl">
                  <span>🔥</span>
                  <span>{result.new_streak}</span>
                </div>
              </div>
              <div className="flex-1 duo-card p-5 flex flex-col items-center gap-2">
                <span className="text-duo-text-muted text-xs font-extrabold uppercase tracking-widest">HEARTS</span>
                <div className="flex items-center gap-2 text-duo-red font-extrabold text-3xl">
                  <span>❤️</span>
                  <span>{result.hearts_remaining}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <MotionButton onClick={onClose}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-duo-green text-white font-extrabold uppercase tracking-wider rounded-2xl text-xl outline-none hover:brightness-110 transition-colors"
          style={{ boxShadow: '0 4px 0 #46A302' }}
        >
          CONTINUE
        </MotionButton>
      </MotionDiv>
    </MotionDiv>
  );
}
