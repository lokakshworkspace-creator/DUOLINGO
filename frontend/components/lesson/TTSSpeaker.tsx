"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { Volume2 } from 'lucide-react';

interface Props {
  text: string;
  autoPlay?: boolean;
}

export default function TTSSpeaker({ text, autoPlay = true }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);

  const playSpeech = useCallback(() => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Optional: Customize voice/lang here if needed (e.g., utterance.lang = 'en-US')
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }, [text]);

  useEffect(() => {
    if (autoPlay) {
      // Small timeout ensures it doesn't try to play before user gesture on some browsers
      const timer = setTimeout(() => {
        playSpeech();
      }, 300);
      return () => clearTimeout(timer);
    }
    
    // Cleanup on unmount
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text, autoPlay, playSpeech]);

  return (
    <button
      onClick={playSpeech}
      className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
        isPlaying ? 'bg-duo-green text-white' : 'bg-transparent text-duo-green hover:bg-duo-green/10'
      }`}
      aria-label="Listen to sentence"
    >
      <Volume2 className={`w-7 h-7 ${isPlaying ? 'animate-pulse' : ''}`} />
    </button>
  );
}
