import React, { useState, useEffect } from 'react';
import { ExerciseOption } from '@/lib/types';

interface Props {
  options: ExerciseOption[];
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}

export default function MatchPairsGrid({ options, value, onChange, disabled }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [errorIds, setErrorIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (matchedIds.size === options.length && options.length > 0) {
      onChange('done');
    }
  }, [matchedIds, options, onChange]);

  const handleClick = (opt: ExerciseOption) => {
    if (disabled || matchedIds.has(opt.id) || errorIds.has(opt.id)) return;
    if (selectedId === null) {
      setSelectedId(opt.id);
    } else if (selectedId === opt.id) {
      setSelectedId(null);
    } else {
      const firstOpt = options.find(o => o.id === selectedId);
      if (firstOpt && firstOpt.pair_key === opt.pair_key) {
        setMatchedIds(new Set(Array.from(matchedIds).concat([selectedId, opt.id])));
        setSelectedId(null);
      } else {
        setErrorIds(new Set([selectedId, opt.id]));
        setTimeout(() => { setErrorIds(new Set()); setSelectedId(null); }, 1000);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {options.map((opt) => {
        const isSelected = selectedId === opt.id;
        const isMatched = matchedIds.has(opt.id);
        const isError = errorIds.has(opt.id);
        let cls = 'bg-duo-bg-card border-duo-border text-white hover:bg-duo-bg-card2 cursor-pointer';
        if (isMatched) cls = 'bg-duo-bg-card2 border-[#1e3040] text-duo-text-muted opacity-40 cursor-default';
        else if (isError) cls = 'bg-[#2e0f0f] border-duo-red text-duo-red border-b-2 translate-y-[2px] cursor-default';
        else if (isSelected) cls = 'bg-[#1a3545] border-duo-blue text-white border-b-2 translate-y-[2px] cursor-pointer';
        return (
          <button key={opt.id} disabled={disabled || isMatched} onClick={() => handleClick(opt)}
            className={`p-4 rounded-2xl border-2 border-b-4 font-bold text-base transition-all ${cls}`}>
            {opt.content}
          </button>
        );
      })}
    </div>
  );
}
