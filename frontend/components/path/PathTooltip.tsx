import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PathTooltipProps {
  label: string;
  accentColor: string;
  visible: boolean;
}

export default function PathTooltip({ label, accentColor, visible }: PathTooltipProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute z-20 flex flex-col items-center pointer-events-none"
          style={{ bottom: 'calc(100% + 8px)' }}
        >
          {/* Bubble */}
          <div 
            className="px-4 py-2 rounded-xl bg-duo-bg shadow-[0_4px_10px_rgba(0,0,0,0.5)] whitespace-nowrap"
            style={{ 
              border: `2px solid ${accentColor}`,
            }}
          >
            <span 
              className="font-extrabold text-sm tracking-widest uppercase"
              style={{ color: accentColor }}
            >
              {label}
            </span>
          </div>

          {/* Triangle Pointer */}
          <div 
            className="w-0 h-0 -mt-[2px]"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: `8px solid ${accentColor}`,
            }}
          >
            {/* Inner fill to match background */}
            <div 
              className="absolute w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #131F24', // match duo-bg
                marginLeft: '-6px',
                marginTop: '-10px',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
