import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({ progress }: { progress: number }) {
    return (
        <div className="w-full bg-duo-gray rounded-full h-4 overflow-hidden relative">
            <motion.div 
                className="bg-duo-green h-full rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                {progress > 0 && (
                    <div className="absolute top-1 left-3 right-3 h-[4px] bg-white/20 rounded-full"></div>
                )}
            </motion.div>
        </div>
    );
}
