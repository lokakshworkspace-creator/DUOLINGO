import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackBarProps {
    status: 'playing' | 'feedback_correct' | 'feedback_wrong';
    correctAnswer: string;
    onNext: () => void;
    isCompleting?: boolean;
    isLastExercise?: boolean;
}

export default function FeedbackBar({ status, correctAnswer, onNext, isCompleting, isLastExercise }: FeedbackBarProps) {

    const isCorrect = status === 'feedback_correct';
    const bgColor = isCorrect ? 'bg-[#d7ffb8]' : 'bg-[#ffdfe0]';
    const textColor = isCorrect ? 'text-duo-green-dark' : 'text-duo-red-dark';
    const btnColor = isCorrect ? 'btn-primary' : 'btn-red';
    const Icon = isCorrect ? CheckCircle : XCircle;

    const buttonText = isCompleting ? 'SUBMITTING...' : (isLastExercise ? 'SUBMIT' : 'CONTINUE');

    return (
        <AnimatePresence>
            {status !== 'playing' && (
                <motion.div 
                    initial={{ y: 200 }}
                    animate={{ y: 0 }}
                    exit={{ y: 200 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className={`fixed bottom-0 left-0 right-0 ${bgColor} p-6 pb-8 md:p-10 flex flex-col md:flex-row justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]`}
                >
                    <div className="flex flex-col mb-4 md:mb-0 max-w-xl w-full">
                        <motion.div 
                            initial={isCorrect ? { scale: 0.8, opacity: 0 } : { x: -10, opacity: 0 }}
                            animate={isCorrect ? { scale: 1, opacity: 1 } : { x: [0, -10, 10, -10, 10, 0], opacity: 1 }}
                            transition={isCorrect ? { type: "spring", bounce: 0.5 } : { duration: 0.4 }}
                            className={`flex items-center gap-3 font-bold text-2xl ${textColor} mb-2`}
                        >
                            <motion.div
                                animate={isCorrect ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                <Icon className="w-8 h-8 fill-current text-white" />
                            </motion.div>
                            {isCorrect ? "Excellent!" : "Correct solution:"}
                        </motion.div>
                        {!isCorrect && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                                className={`${textColor} font-bold text-lg opacity-90`}
                            >
                                {correctAnswer}
                            </motion.div>
                        )}
                    </div>
                    
                    {!(isLastExercise && isCorrect) && (
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onNext}
                            className={`w-full md:w-48 py-3 ${btnColor} text-lg font-extrabold text-white rounded-2xl border-b-4 ${isCorrect ? 'bg-[#58CC02] border-[#46A302] hover:brightness-110' : 'bg-[#FF4B4B] border-[#EA2B2B] hover:brightness-110'}`}
                            style={{ boxShadow: 'none' }}
                        >
                            {buttonText}
                        </motion.button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
