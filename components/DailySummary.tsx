import React from 'react';
import { Macro } from '../types';
import { Flame, Dumbbell, Wheat, Droplet } from 'lucide-react';

interface DailySummaryProps {
  summary: Macro;
}

const DailySummary: React.FC<DailySummaryProps> = ({ summary }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 sticky top-4 z-10 print:static print:shadow-none print:border-0 print:mb-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center print:text-gray-600">Daily Totals</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Calories */}
        <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-100 transition-colors print:bg-white print:border-gray-200">
          <Flame className="w-5 h-5 text-gray-400 mb-1 print:text-black" />
          <span className="text-2xl font-bold text-gray-700 leading-none print:text-black">{summary.calories}</span>
          <span className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-wide print:text-gray-600">Calories</span>
        </div>

        {/* Protein */}
        <div className="flex flex-col items-center justify-center p-3 bg-[#003B5C] rounded-lg shadow-sm border border-[#003B5C] print:bg-white print:border-gray-200 print:shadow-none">
          <Dumbbell className="w-5 h-5 text-[#EAAA00] mb-1 print:text-black" />
          <span className="text-2xl font-bold text-white leading-none print:text-black">{summary.protein}g</span>
          <span className="text-[10px] uppercase font-bold text-blue-200 mt-1 tracking-wide print:text-gray-600">Protein</span>
        </div>

        {/* Carbs */}
        <div className="flex flex-col items-center justify-center p-3 bg-emerald-50 rounded-lg border border-emerald-100 print:bg-white print:border-gray-200">
          <Wheat className="w-5 h-5 text-emerald-600 mb-1 print:text-black" />
          <span className="text-2xl font-bold text-emerald-800 leading-none print:text-black">{summary.carbs}g</span>
          <span className="text-[10px] uppercase font-bold text-emerald-600 mt-1 tracking-wide print:text-gray-600">Carbs</span>
        </div>

        {/* Fat */}
        <div className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-lg border border-amber-100 print:bg-white print:border-gray-200">
          <Droplet className="w-5 h-5 text-amber-600 mb-1 print:text-black" />
          <span className="text-2xl font-bold text-amber-900 leading-none print:text-black">{summary.fat}g</span>
          <span className="text-[10px] uppercase font-bold text-amber-700 mt-1 tracking-wide print:text-gray-600">Fat</span>
        </div>

      </div>
    </div>
  );
};

export default DailySummary;