import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

interface Props {
  skillId: number;
  onClose: () => void;
}

export default function LegendaryStartModal({ skillId, onClose }: Props) {
  const router = useRouter();
  const { user } = useUser();

  const handleStart = () => {
    if ((user?.gems || 0) < 100) {
      alert("Not enough gems!");
      return;
    }
    router.push(`/lesson/${skillId}?mode=legendary`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl"
      >
        <div className="bg-yellow-400 p-8 text-center border-b-4 border-yellow-500 relative overflow-hidden">
          {/* Sparkles background effect could go here */}
          <div className="text-7xl mb-2 relative z-10">🏆</div>
          <h2 className="text-3xl font-extrabold text-white drop-shadow-md relative z-10">
            Legendary Challenge
          </h2>
        </div>
        
        <div className="p-6 flex flex-col gap-6 text-center">
          <p className="text-lg font-bold text-gray-700">
            Prove your mastery! Complete this hard challenge with less than 3 mistakes to turn this skill Gold.
          </p>
          
          <div className="flex justify-center gap-4 text-gray-600 font-bold">
            <div className="flex items-center gap-2">
              <span>❤️</span> 3 Mistakes Max
            </div>
            <div className="flex items-center gap-2">
              <span>🚫</span> No Hints
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={handleStart}
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-white font-extrabold uppercase tracking-wider rounded-2xl text-lg transition-colors shadow-[0_4px_0_#d97706] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
            >
              Start Challenge <span className="flex items-center gap-1 text-sm bg-yellow-500/50 px-2 py-1 rounded-lg">💎 100</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 text-gray-400 font-extrabold uppercase tracking-wider hover:text-gray-600 transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
