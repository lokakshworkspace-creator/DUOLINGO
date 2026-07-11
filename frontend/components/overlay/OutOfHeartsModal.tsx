"use client";
import React from 'react';
import { useUser } from '@/context/UserContext';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;
const MotionButton = motion.button;

export default function OutOfHeartsModal({ onClose }: { onClose: () => void }) {
  const { refillHearts } = useUser();

  const handleRefill = async () => {
    await refillHearts();
    onClose();
  };

  return (
    <MotionDiv 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <MotionDiv 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-duo-bg-card border border-duo-border rounded-3xl p-8 flex flex-col items-center max-w-sm w-full"
      >
        <div className="text-8xl mb-4">💔</div>
        <h2 className="text-2xl font-extrabold text-white mb-2 text-center">Out of Hearts!</h2>
        <p className="text-duo-text-muted font-bold mb-8 text-center">
          You need hearts to continue practicing. Refill and try again!
        </p>
        <div className="flex flex-col gap-3 w-full mt-4">
          <MotionButton onClick={handleRefill}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-duo-blue text-white font-extrabold uppercase tracking-wider rounded-2xl text-base hover:brightness-110 transition-colors outline-none"
            style={{ boxShadow: '0 4px 0 #1899D6' }}
          >
            REFILL HEARTS (FREE)
          </MotionButton>
          <MotionButton onClick={onClose}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-transparent text-duo-text-muted font-extrabold uppercase tracking-wider rounded-2xl border-2 border-duo-border hover:bg-duo-bg-card2 transition-colors text-base outline-none"
          >
            QUIT
          </MotionButton>
        </div>
      </MotionDiv>
    </MotionDiv>
  );
}
