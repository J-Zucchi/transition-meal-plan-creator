
import React from 'react';
import { Macro } from '../types';
import { Flame, Dumbbell, Wheat, Droplet } from 'lucide-react';

interface DailySummaryProps {
  summary: Macro;
}

const DailySummary: React.FC<DailySummaryProps> = ({ summary }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 print:static print:shadow-none print:border-b print:border-t-0 print:border-x-0 print:border-gray-900 print:rounded-none print:mb-4 print:p-0 print:pb-2">
      
      {/* Screen View Title */}
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center print:hidden">Daily Totals</h3>
      
      {/* Print View Title & Summary combined */}
      <div className="hidden print:flex justify-between items-center text-sm font-medium text-black">
        <span className="font-bold uppercase tracking-wider text-xs">Daily Totals</span>
        <div className="flex gap-4">
          <span>{summary.calories} kcal</span>
          <span className="text-gray-400">|</span>
          <span>{summary.protein}g Protein</span>
          <span className="text-gray-400">|</span>
          <span>{summary.carbs}g Carbs</span>
          <span className="text-gray-400">|</span>
          <span>{summary.fat}g Fat</span>
        </div>
      </div>

      {/* Screen View Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        
        {/* Calories */}
        <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-100 transition-colors">
          <Flame className="w-5 h-5 text-gray-400 mb-1" />
          <span className="text-2xl font-bold text-gray-700 leading-none">{summary.calories}</span>
          <span className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-wide">Calories</span>
        </div>

        {/* Protein */}
        <div className="flex flex-col items-center justify-center p-3 bg-[#003B5C] rounded-lg shadow-sm border border-[#003B5C]">
          <Dumbbell className="w-5 h-5 text-[#EAAA00] mb-1" />
          <span className="text-2xl font-bold text-white leading-none">{summary.protein}g</span>
          <span className="text-[10px] uppercase font-bold text-blue-200 mt-1 tracking-wide">Protein</span>
        </div>

        {/* Carbs */}
        <div className="flex flex-col items-center justify-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
          <Wheat className="w-5 h-5 text-emerald-600 mb-1" />
          <span className="text-2xl font-bold text-emerald-800 leading-none">{summary.carbs}g</span>
          <span className="text-[10px] uppercase font-bold text-emerald-600 mt-1 tracking-wide">Carbs</span>
        </div>

        {/* Fat */}
        <div className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-lg border border-amber-100">
          <Droplet className="w-5 h-5 text-amber-600 mb-1" />
          <span className="text-2xl font-bold text-amber-900 leading-none">{summary.fat}g</span>
          <span className="text-[10px] uppercase font-bold text-amber-700 mt-1 tracking-wide">Fat</span>
        </div>

      </div>
    </div>
  );
};

export default DailySummary;
