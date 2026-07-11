import { useState, useEffect, useCallback, useRef } from 'react';
import { Exercise } from '@/lib/types';
import { startLesson, checkExercise, completeLesson, startLegendary, checkLegendary, completeLegendary } from '@/lib/api';
import { useUser } from '@/context/UserContext';

export function useLessonSession(skillId: number, isLegendary: boolean = false) {
    const { refreshUser } = useUser();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [checkError, setCheckError] = useState<string | null>(null);
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const [status, setStatus] = useState<'playing' | 'feedback_correct' | 'feedback_wrong' | 'completed' | 'out_of_hearts'>('playing');
    const [feedbackAnswer, setFeedbackAnswer] = useState<string>('');
    const [lessonResult, setLessonResult] = useState<any>(null);
    const [isChecking, setIsChecking] = useState(false);

    const [wrongCount, setWrongCount] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [timeLimitMs, setTimeLimitMs] = useState<number | null>(null);
    const [retryTrigger, setRetryTrigger] = useState(0);
    const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);

    const hasCompletedRef = useRef(false);
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        const start = isLegendary ? startLegendary : startLesson;
        start(skillId).then(data => {
            setAttemptId(data.attempt_id || data.session_id);
            setExercises(data.exercises);
            if (data.time_limit_ms) setTimeLimitMs(data.time_limit_ms);
            setLoading(false);
        }).catch(e => {
            setError(e.message);
            setLoading(false);
        });
    }, [skillId, isLegendary]);

    // Derive current exercise from state — always in sync
    const currentExercise = exercises[currentIndex] ?? null;

    const submitAnswer = useCallback(async (answer: string) => {
        if (!attemptId || !currentExercise || isChecking) return;
        setIsChecking(true);
        setCheckError(null);
        try {
            let result;
            if (isLegendary) {
                result = await checkLegendary(attemptId, currentExercise.id, answer);
            } else {
                result = await checkExercise(attemptId, currentExercise.id, answer);
            }
            refreshUser();

            setFeedbackAnswer(result.correct_answer);
            if (result.correct) {
                setStatus('feedback_correct');
                setCorrectCount(c => c + 1);
            } else if (result.retry) {
                setRetryTrigger(prev => prev + 1);
                // Keep status as 'playing'
            } else {
                setStatus('feedback_wrong');
                setWrongCount(prev => {
                    const newCount = prev + 1;
                    if (isLegendary && newCount >= 3) {
                        setTimeout(() => setStatus('out_of_hearts'), 2000);
                    } else if (!isLegendary && result.hearts_remaining === 0) {
                        setTimeout(() => setStatus('out_of_hearts'), 2000);
                    }
                    return newCount;
                });
            }
        } catch (e: any) {
            // Never silently swallow — surface to user so the screen isn't frozen
            const msg = e?.message || 'Something went wrong. Please try again.';
            console.error('[submitAnswer]', msg);
            setCheckError(msg);
        } finally {
            setIsChecking(false);
        }
    }, [attemptId, currentExercise, isChecking, isLegendary, refreshUser]);

    const finishLesson = useCallback(async () => {
        if (!attemptId || hasCompletedRef.current) return;
        hasCompletedRef.current = true;
        setIsCompleting(true);
        try {
            let result;
            if (isLegendary) {
                result = await completeLegendary(attemptId, correctCount, wrongCount);
            } else {
                result = await completeLesson(attemptId);
            }
            setLessonResult(result);
            if (result.unlocked_achievements?.length > 0) {
                setUnlockedAchievements(result.unlocked_achievements);
            }
            setStatus('completed');
            refreshUser();
        } catch (e: any) {
            hasCompletedRef.current = false;
            const msg = e?.message || "Couldn't finish the lesson — please try again.";
            console.error('[finishLesson]', msg);
            setCheckError(msg);
        } finally {
            setIsCompleting(false);
        }
    }, [attemptId, isLegendary, correctCount, wrongCount, refreshUser]);

    const nextExercise = useCallback(async () => {
        if (status === 'feedback_correct') {
            const nextIdx = currentIndex + 1;
            setProgress((nextIdx / exercises.length) * 100);

            if (nextIdx < exercises.length) {
                setCurrentIndex(nextIdx);
                setStatus('playing');
            } else {
                // All exercises done — complete the lesson
                await finishLesson();
            }

        } else if (status === 'feedback_wrong') {
            let nextLength = exercises.length;
            if (!isLegendary && currentExercise) {
                setExercises(prev => {
                    const next = [...prev];
                    // Insert the failed exercise at least 2 spots ahead of where we are,
                    // so it never appears immediately next.
                    const insertAt = Math.min(currentIndex + 3, next.length);
                    next.splice(insertAt, 0, currentExercise);
                    return next;
                });
                nextLength += 1;
            }
            
            const nextIdx = currentIndex + 1;
            setProgress((nextIdx / nextLength) * 100);
            
            if (nextIdx < nextLength) {
                setCurrentIndex(nextIdx);
                setStatus('playing');
            } else {
                await finishLesson();
            }
        }
    }, [status, exercises.length, currentIndex, finishLesson, isLegendary, currentExercise]);

    return {
        loading, error, checkError, setCheckError, currentExercise, status, progress,
        submitAnswer, nextExercise, feedbackAnswer, lessonResult, setStatus,
        isChecking, isCompleting, totalExercises: exercises.length,
        wrongCount, correctCount, timeLimitMs,
        currentIndex, retryTrigger, unlockedAchievements, setUnlockedAchievements
    };
}
