"use client";
import React, { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useLessonSession } from '@/hooks/useLessonSession';
import { useUser } from '@/context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import ExerciseRenderer from '@/components/lesson/ExerciseRenderer';
import OutOfHeartsModal from '@/components/overlay/OutOfHeartsModal';
import LessonCompleteModal from '@/components/overlay/LessonCompleteModal';
import TTSSpeaker from '@/components/lesson/TTSSpeaker';
import LegendaryTimer from '@/components/lesson/LegendaryTimer';
import AchievementToast from '@/components/overlay/AchievementToast';

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="flex-1 bg-[#2a4255] rounded-full h-4 overflow-hidden">
      <div
        className="h-full rounded-full bg-duo-green transition-all duration-500 ease-out relative"
        style={{ width: `${Math.max(progress, 4)}%` }}
      >
        <div className="absolute top-1 left-2 right-2 h-[4px] bg-white/25 rounded-full" />
      </div>
    </div>
  );
}

function FeedbackBar({ status, correctAnswer, onNext, isCompleting, isLastExercise }: {
  status: string;
  correctAnswer: string;
  onNext: () => void;
  isCompleting?: boolean;
  isLastExercise?: boolean;
}) {
  if (status === 'playing') return null;
  const isCorrect = status === 'feedback_correct';
  
  const buttonText = isCompleting ? 'SUBMITTING...' : (isLastExercise ? 'SUBMIT' : 'CONTINUE');

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 animate-slide-up border-t-2
      ${isCorrect ? 'bg-[#0f2e1b] border-duo-green' : 'bg-[#2e0f0f] border-duo-red'}`}>
      <div className="max-w-3xl mx-auto px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className={`flex items-center gap-3 font-extrabold text-xl mb-1 ${isCorrect ? 'text-duo-green' : 'text-duo-red'}`}>
            <span>{isCorrect ? '✅' : '❌'}</span>
            {isCorrect ? 'Excellent!' : 'Correct solution:'}
          </div>
          {!isCorrect && (
            <div className="text-white font-bold text-base">{correctAnswer}</div>
          )}
        </div>
        <button
          onClick={onNext}
          disabled={isCompleting}
          className={`shrink-0 w-full md:w-40 py-3 font-extrabold uppercase tracking-wider rounded-2xl border-b-4 text-base transition-all
            ${isCompleting ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 active:translate-y-[2px] active:border-b-2'}
            ${isCorrect
              ? 'bg-duo-green text-white border-duo-green-dark'
              : 'bg-duo-red text-white border-duo-red-dark'
            }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLegendary = searchParams.get('mode') === 'legendary';
  const { user } = useUser();
  const skillId = parseInt(params.skillId as string, 10);

  const {
    loading, error, currentExercise, status, progress, totalExercises,
    submitAnswer, nextExercise, feedbackAnswer, lessonResult, setStatus, isChecking, isCompleting,
    wrongCount, timeLimitMs, currentIndex, checkError, setCheckError, retryTrigger,
    unlockedAchievements, setUnlockedAchievements
  } = useLessonSession(skillId, isLegendary);

  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [flashingWrongAnswer, setFlashingWrongAnswer] = useState<string | null>(null);

  React.useEffect(() => {
    if (retryTrigger > 0 && selectedAnswer) {
      setFlashingWrongAnswer(selectedAnswer);
      const timer = setTimeout(() => {
        setFlashingWrongAnswer(null);
        setSelectedAnswer('');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [retryTrigger]);

  const handleCheck = () => {
    if (!selectedAnswer || isChecking) return;
    submitAnswer(selectedAnswer);
  };

  const handleNext = () => {
    setSelectedAnswer('');
    nextExercise();
  };

  const handleCloseToast = () => {
    setUnlockedAchievements(prev => prev.slice(1));
  };

  // Auto-submit after the last question is answered correctly
  React.useEffect(() => {
    if (currentIndex === totalExercises - 1 && status === 'feedback_correct') {
      const timer = setTimeout(() => {
        setSelectedAnswer('');
        nextExercise();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, totalExercises, status, nextExercise]);

  if (loading || !user) return (
    <div className="flex h-screen bg-duo-bg items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-duo-green border-t-transparent rounded-full animate-spin" />
        <span className="text-duo-text-muted font-bold">Loading lesson...</span>
      </div>
    </div>
  );
  if (error) return (
    <div className="flex h-screen bg-duo-bg items-center justify-center text-duo-red font-bold">{error}</div>
  );

  const canCheck = selectedAnswer.length > 0 && !isChecking;
  const isLastExercise = currentIndex === totalExercises - 1 && (status === 'feedback_correct' || isLegendary);

  return (
    <div className="min-h-screen bg-duo-bg flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 max-w-3xl mx-auto w-full">
        <button onClick={() => router.push('/')}
          className="text-duo-text-muted hover:text-white transition-colors w-8 h-8 flex items-center justify-center text-2xl">
          ✕
        </button>
        {isLegendary && timeLimitMs ? (
          <LegendaryTimer 
            timeLimitMs={timeLimitMs} 
            isPaused={status !== 'playing'} 
            onExpire={() => setStatus('out_of_hearts')} 
          />
        ) : (
          <ProgressBar progress={progress} />
        )}
        <div className="flex items-center gap-1.5 font-extrabold text-duo-red shrink-0">
          <span className="text-xl">❤️</span>
          <span className="text-base">{isLegendary ? `${3 - wrongCount}` : user.hearts_current}</span>
        </div>
      </div>

      {/* Exercise */}
      {status !== 'completed' && status !== 'out_of_hearts' && currentExercise && (
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-6 py-4 pb-40 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 flex flex-col w-full h-full"
            >
              <div className="mb-8">
                <div className="text-duo-text-muted text-sm font-extrabold uppercase tracking-widest mb-3">
                  {currentExercise.type === 'multiple_choice' ? 'Select the correct meaning' :
                   currentExercise.type === 'translate' ? 'Tap what you hear' :
                   currentExercise.type === 'match_pairs' ? 'Tap the matching pairs' :
                   currentExercise.type === 'fill_blank' ? 'Fill in the blank' :
                   'Write in English'}
                </div>
                <div className="flex items-center gap-4">
                  <TTSSpeaker 
                    text={currentExercise.prompt} 
                    autoPlay={user.settings?.sound_enabled ?? true} 
                  />
                  <h2 className="font-extrabold text-white text-2xl leading-snug">
                    {currentExercise.prompt}
                  </h2>
                </div>
              </div>

              <div>
                <ExerciseRenderer
                  exercise={currentExercise}
                  value={selectedAnswer}
                  onChange={setSelectedAnswer}
                  disabled={status !== 'playing' || isChecking || !!flashingWrongAnswer}
                  wrongAnswer={flashingWrongAnswer || undefined}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Error toast — shown when checkExercise request fails */}
      {checkError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3
          bg-[#3b1010] border border-duo-red text-white px-5 py-3 rounded-2xl shadow-2xl
          animate-slide-up max-w-sm w-[90vw]">
          <span className="text-lg">⚠️</span>
          <span className="flex-1 text-sm font-semibold">{checkError}</span>
          <button
            onClick={() => setCheckError(null)}
            className="text-duo-text-muted hover:text-white transition-colors text-xl leading-none"
          >&times;</button>
        </div>
      )}

      {/* Check button */}
      {status === 'playing' && (
        <div className="fixed bottom-0 left-0 right-0 bg-duo-bg border-t border-duo-border py-4 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.button
              whileHover={canCheck ? { scale: 1.02 } : {}}
              whileTap={canCheck ? { scale: 0.98 } : {}}
              onClick={handleCheck}
              disabled={!canCheck}
              className={`w-full py-4 font-extrabold uppercase tracking-wider rounded-2xl text-lg transition-colors duration-150 outline-none
                ${canCheck
                  ? 'bg-duo-green text-white hover:brightness-110 cursor-pointer'
                  : 'bg-[#2a4255] text-duo-text-muted border-[#1e3040] cursor-not-allowed'
                }`}
              style={{
                boxShadow: canCheck ? '0 4px 0 #46A302' : 'none',
                border: 'none',
                transform: 'translateY(0px)'
              }}
            >
              CHECK
            </motion.button>
          </div>
        </div>
      )}

      <FeedbackBar status={status} correctAnswer={feedbackAnswer} onNext={handleNext} isCompleting={isCompleting} isLastExercise={isLastExercise} />

      {status === 'out_of_hearts' && <OutOfHeartsModal onClose={() => router.push('/')} />}
      {status === 'completed' && lessonResult && <LessonCompleteModal result={lessonResult} onClose={() => router.push('/')} isLegendary={isLegendary} />}
      
      {unlockedAchievements.length > 0 && (
        <AchievementToast 
          achievement={unlockedAchievements[0]} 
          onClose={handleCloseToast} 
        />
      )}
    </div>
  );
}
