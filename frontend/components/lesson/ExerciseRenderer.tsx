import React from 'react';
import { Exercise } from '@/lib/types';
import MultipleChoiceOptions from './MultipleChoiceOptions';
import WordBank from './WordBank';
import MatchPairsGrid from './MatchPairsGrid';
import FillBlankInput from './FillBlankInput';
import TypeAnswerInput from './TypeAnswerInput';

interface Props {
    exercise: Exercise;
    value: string;
    onChange: (val: string) => void;
    disabled: boolean;
    wrongAnswer?: string;
}

export default function ExerciseRenderer({ exercise, value, onChange, disabled, wrongAnswer }: Props) {
    switch (exercise.type) {
        case 'multiple_choice':
            return <MultipleChoiceOptions options={exercise.options} value={value} onChange={onChange} disabled={disabled} wrongAnswer={wrongAnswer} />;
        case 'translate':
            return <WordBank options={exercise.options} value={value} onChange={onChange} disabled={disabled} />;
        case 'match_pairs':
            return <MatchPairsGrid options={exercise.options} value={value} onChange={onChange} disabled={disabled} />;
        case 'fill_blank':
            return <FillBlankInput value={value} onChange={onChange} disabled={disabled} isWrong={!!wrongAnswer} />;
        case 'type_answer':
            return <TypeAnswerInput value={value} onChange={onChange} disabled={disabled} isWrong={!!wrongAnswer} />;
        default:
            return <div>Unknown exercise type: {exercise.type}</div>;
    }
}
