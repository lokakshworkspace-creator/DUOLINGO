import React, { useState, useEffect } from 'react';
import { ExerciseOption } from '@/lib/types';

interface Props {
  options: ExerciseOption[];
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}

export default function WordBank({ options, value, onChange, disabled }: Props) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  useEffect(() => {
    if (!value) {
      setSelectedWords([]);
      setAvailableWords(options.map(o => o.content));
    }
  }, [value, options]);

  const handleSelect = (word: string, idx: number) => {
    if (disabled) return;
    const newAvailable = [...availableWords];
    newAvailable.splice(idx, 1);
    setAvailableWords(newAvailable);
    const newSelected = [...selectedWords, word];
    setSelectedWords(newSelected);
    onChange(newSelected.join(' '));
  };

  const handleDeselect = (word: string, idx: number) => {
    if (disabled) return;
    const newSelected = [...selectedWords];
    newSelected.splice(idx, 1);
    setSelectedWords(newSelected);
    setAvailableWords([...availableWords, word]);
    onChange(newSelected.join(' '));
  };

  return (
    <div className="flex flex-col w-full gap-8">
      {/* Answer area */}
      <div className="flex flex-wrap gap-2 min-h-[56px] p-3 border-b-2 border-duo-border items-center">
        {selectedWords.map((word, i) => (
          <button key={`sel-${i}`} disabled={disabled} onClick={() => handleDeselect(word, i)}
            className="bg-duo-bg-card border-2 border-b-4 border-duo-border rounded-xl px-4 py-2 font-bold text-white hover:bg-duo-bg-card2 active:translate-y-[2px] active:border-b-2 transition-all">
            {word}
          </button>
        ))}
      </div>
      {/* Word bank */}
      <div className="flex flex-wrap justify-center gap-3">
        {availableWords.map((word, i) => (
          <button key={`avail-${i}`} disabled={disabled} onClick={() => handleSelect(word, i)}
            className="bg-duo-bg-card border-2 border-b-4 border-duo-border rounded-xl px-4 py-2 font-bold text-white hover:bg-duo-bg-card2 active:translate-y-[2px] active:border-b-2 transition-all">
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}
