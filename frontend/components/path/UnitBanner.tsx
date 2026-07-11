import React from 'react';
import { Unit } from '@/lib/types';
import { Book } from 'lucide-react';

export default function UnitBanner({ unit }: { unit: Unit }) {
    return (
        <div 
            className="w-full text-white rounded-2xl p-4 flex justify-between items-center mb-6 shadow-sm border-b-4 opacity-95"
            style={{ 
                backgroundColor: unit.color_theme,
                borderColor: 'rgba(0,0,0,0.2)' 
            }}
        >
            <div className="flex flex-col">
                <span className="font-extrabold text-2xl drop-shadow-sm">Unit {unit.order_index}</span>
                <span className="font-bold text-lg opacity-90 drop-shadow-sm">{unit.title}</span>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl">
                <Book className="w-8 h-8 text-white" />
            </div>
        </div>
    );
}
