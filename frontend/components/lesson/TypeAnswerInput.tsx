import React from 'react';
import { motion } from 'framer-motion';

export default function TypeAnswerInput({ value, onChange, disabled, isWrong }: {
  value: string; onChange: (v: string) => void; disabled: boolean; isWrong?: boolean;
}) {
  return (
    <div className="w-full mt-4">
      <motion.textarea 
        animate={isWrong ? { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } } : undefined}
        value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        placeholder="Type your answer..."
        autoFocus
        className={`w-full bg-duo-bg-card border-2 rounded-xl p-4 font-bold text-lg text-white placeholder-duo-text-muted focus:outline-none focus:border-duo-blue transition-colors min-h-[120px] resize-none
          ${isWrong ? 'border-duo-red bg-[#3b1010]' : 'border-duo-border'}`} />
    </div>
  );
}
