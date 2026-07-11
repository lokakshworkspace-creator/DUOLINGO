import React from 'react';
import { ExerciseOption } from '@/lib/types';
import { motion } from 'framer-motion';

interface Props {
  options: ExerciseOption[];
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  wrongAnswer?: string;
}

export default function MultipleChoiceOptions({ options, value, onChange, disabled, wrongAnswer }: Props) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3 w-full"
    >
      {options.map((opt, i) => {
        const isSelected = value === opt.content;
        const isWrong = wrongAnswer === opt.content;
        
        return (
          <motion.button
            variants={itemVariants}
            animate={isWrong ? { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } } : undefined}
            whileHover={disabled ? {} : { scale: 1.01 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            key={opt.id}
            disabled={disabled}
            onClick={() => onChange(opt.content)}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors duration-150 text-left w-full outline-none
              ${isWrong
                ? 'bg-[#3b1010] border-duo-red text-white'
                : isSelected
                  ? 'bg-duo-blue/10 border-duo-blue text-white'
                  : 'bg-duo-bg-card border-duo-border text-white hover:bg-duo-bg-card2 hover:border-duo-border'
              }
              ${disabled && !isSelected && !isWrong ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{ 
              borderBottomWidth: (isSelected || isWrong) ? '2px' : '4px',
              transform: (isSelected || isWrong) ? 'translateY(2px)' : 'translateY(0px)',
              boxShadow: (isSelected || isWrong) ? 'none' : '0 2px 0 rgba(0,0,0,0.1)'
            }}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold border-2 shrink-0 text-sm transition-colors
              ${isWrong ? 'border-duo-red text-duo-red bg-transparent' : isSelected ? 'border-duo-blue text-duo-blue bg-transparent' : 'border-duo-border text-duo-text-muted bg-transparent'}`}>
              {i + 1}
            </div>
            <span className="font-bold text-lg">{opt.content}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
