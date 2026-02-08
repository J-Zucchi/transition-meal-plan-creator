import React, { useState } from 'react';
import { Meal } from '../types';
import { ChevronDown, ChevronUp, Clock, Flame, Dumbbell, Wheat, Droplet, RefreshCw } from 'lucide-react';

interface MealCardProps {
  meal: Meal;
  slotTitle: string;
  onSwap?: () => void;
  optionIndex: number;
  totalOptions: number;
}

const MealCard: React.FC<MealCardProps> = ({ meal, slotTitle, onSwap, optionIndex, totalOptions }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md print:shadow-none print:border-b print:border-t-0 print:border-x-0 print:border-gray-300 print:rounded-none print:break-inside-avoid">
      
      {/* Header / Summary View */}
      <div 
        className="p-5 cursor-pointer print:p-0 print:mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start">
          <div className="w-full">
            
            {/* Slot Title (e.g. BREAKFAST) */}
            <div className="flex items-center justify-between mb-2 print:mb-1">
              <h4 className="text-xs font-extrabold text-[#EAAA00] uppercase tracking-widest print:text-black print:text-[10px]">
                {slotTitle}
              </h4>

               {/* Swap Button - Hidden in Print */}
               {onSwap && totalOptions > 1 && (
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     onSwap();
                   }}
                   className="flex items-center gap-1.5 text-xs font-medium text-[#003B5C] bg-blue-50 hover:bg-[#EAAA00] hover:text-[#003B5C] px-2 py-1 rounded-md transition-all print:hidden group z-10"
                   title="Try a different option"
                 >
                   <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                   <span>Option {optionIndex + 1}/{totalOptions}</span>
                 </button>
               )}
            </div>

            {/* Tags Row */}
            <div className="flex items-center gap-2 mb-2 print:mb-1">
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded tracking-wider print:bg-transparent print:p-0 print:text-gray-500">
                  {meal.type}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1 text-gray-500 text-[10px] uppercase font-bold tracking-wide print:text-gray-500">
                  <Clock className="w-3 h-3 print:hidden" /> 
                  {meal.prepTime}
                </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 leading-tight print:text-base">{meal.title}</h3>
            
            {/* Description: Shown in header only on screen if collapsed. Hidden in print (shown in body instead). */}
            <div className={`${isExpanded ? 'hidden' : 'block'} print:hidden`}>
               <p className="text-sm text-gray-500 mt-2 line-clamp-2">{meal.description}</p>
            </div>
          </div>
          
          <button className="text-gray-400 hover:text-[#003B5C] transition-colors print:hidden ml-4 mt-6">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Macros Strip */}
        <div className="mt-4 flex flex-wrap gap-2 print:mt-1 print:gap-3">
           {/* Calories */}
           <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold print:bg-transparent print:p-0 print:text-gray-600">
              <Flame className="w-3.5 h-3.5 print:hidden" />
              <span>{meal.macros.calories} kcal</span>
           </div>
           
           <span className="hidden print:block text-gray-300">|</span>

           {/* Protein */}
           <div className="flex items-center gap-1.5 px-3 py-1 bg-[#003B5C] text-white rounded-full text-xs font-bold shadow-sm print:bg-transparent print:shadow-none print:p-0 print:text-black">
              <Dumbbell className="w-3.5 h-3.5 text-[#EAAA00] print:hidden" />
              <span>{meal.macros.protein}g Protein</span>
           </div>

           <span className="hidden print:block text-gray-300">|</span>

           {/* Carbs */}
           <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-medium print:bg-transparent print:border-none print:p-0 print:text-gray-600">
              <Wheat className="w-3.5 h-3.5 text-emerald-600 print:hidden" />
              <span>{meal.macros.carbs}g Carbs</span>
           </div>
           
           <span className="hidden print:block text-gray-300">|</span>

           {/* Fats */}
           <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-100 rounded-full text-xs font-medium print:bg-transparent print:border-none print:p-0 print:text-gray-600">
              <Droplet className="w-3.5 h-3.5 text-amber-600 print:hidden" />
              <span>{meal.macros.fat}g Fat</span>
           </div>
        </div>
      </div>

      {/* Expanded Content */}
      <div className={`${isExpanded ? 'block border-t border-gray-100 bg-gray-50/50' : 'hidden'} p-5 animate-fadeIn print-force-visible print:bg-white print:p-0 print:pt-2 print:pb-4 print:border-none print:animate-none`}>
        <p className="text-sm text-gray-600 italic mb-4 print:text-gray-800 print:mb-3 print:text-xs">{meal.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4 print:grid-cols-2">
          <div>
            <h4 className="text-xs font-bold text-[#003B5C] uppercase tracking-wider mb-2 print:text-black print:mb-1">Ingredients</h4>
            <ul className="text-sm text-gray-700 space-y-1 print:text-gray-900 print:text-xs">
              {meal.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-[#EAAA00] flex-shrink-0 print:bg-black print:mt-1" />
                  <span>{ing}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#003B5C] uppercase tracking-wider mb-2 print:text-black print:mb-1">Instructions</h4>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside marker:text-[#003B5C] marker:font-semibold print:text-gray-900 print:marker:text-black print:text-xs">
              {meal.instructions.map((inst, idx) => (
                <li key={idx}>
                  <span className="inline">{inst}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealCard;