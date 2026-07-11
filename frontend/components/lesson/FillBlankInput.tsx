import React from 'react';
import { motion } from 'framer-motion';

export default function FillBlankInput({ value, onChange, disabled, isWrong }: {
  value: string; onChange: (v: string) => void; disabled: boolean; isWrong?: boolean;
}) {
  return (
    <div className="w-full mt-4">
      <motion.input 
        animate={isWrong ? { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } } : undefined}
        type="text" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        placeholder="Type the missing word..."
        autoFocus
        className={`w-full max-w-sm bg-duo-bg-card border-2 rounded-xl p-4 font-bold text-lg text-white placeholder-duo-text-muted focus:outline-none focus:border-duo-blue transition-colors
          ${isWrong ? 'border-duo-red bg-[#3b1010]' : 'border-duo-border'}`} />
    </div>
  );
}
