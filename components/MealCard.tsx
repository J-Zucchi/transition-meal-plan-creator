import React, { useState } from 'react';
import { Meal } from '../types';
import { ChevronDown, ChevronUp, Clock, Flame, Dumbbell, Wheat, Droplet } from 'lucide-react';

interface MealCardProps {
  meal: Meal;
}

const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md print:shadow-none print:border print:border-gray-200 print:break-inside-avoid">
      
      {/* Header / Summary View */}
      <div 
        className="p-5 cursor-pointer print:p-4 print:pb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded mb-2 tracking-wider print:border print:border-gray-300 print:bg-white">
              {meal.type}
            </span>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{meal.title}</h3>
            <div className="flex items-center text-gray-500 text-xs mt-1 space-x-3 print:text-gray-700">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {meal.prepTime}
              </span>
            </div>
            {/* Show description in header only if collapsed and NOT printing. In print, description is in body. */}
            <div className={isExpanded ? 'hidden' : 'block print:hidden'}>
               <p className="text-sm text-gray-500 mt-2 line-clamp-2">{meal.description}</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-[#003B5C] transition-colors print:hidden">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Macros Strip */}
        <div className="mt-4 flex flex-wrap gap-2 print:mt-2">
           {/* Calories */}
           <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold print:bg-white print:border print:border-gray-300">
              <Flame className="w-3.5 h-3.5" />
              <span>{meal.macros.calories} kcal</span>
           </div>
           
           {/* Protein - Highlighted */}
           <div className="flex items-center gap-1.5 px-3 py-1 bg-[#003B5C] text-white rounded-full text-xs font-bold shadow-sm print:bg-white print:text-black print:border print:border-gray-300 print:shadow-none">
              <Dumbbell className="w-3.5 h-3.5 text-[#EAAA00] print:text-black" />
              <span>{meal.macros.protein}g Protein</span>
           </div>

           {/* Carbs */}
           <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-medium print:bg-white print:text-black print:border-gray-300">
              <Wheat className="w-3.5 h-3.5 text-emerald-600 print:text-black" />
              <span>{meal.macros.carbs}g Carbs</span>
           </div>
           
           {/* Fats */}
           <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-100 rounded-full text-xs font-medium print:bg-white print:text-black print:border-gray-300">
              <Droplet className="w-3.5 h-3.5 text-amber-600 print:text-black" />
              <span>{meal.macros.fat}g Fat</span>
           </div>
        </div>
      </div>

      {/* Expanded Content - Always rendered in DOM but visibility toggled via CSS. 
          This allows 'print:block' to override 'hidden' state. */}
      <div className={`${isExpanded ? 'block border-t border-gray-100 bg-gray-50/50' : 'hidden'} p-5 animate-fadeIn print:block print:bg-white print:p-4 print:pt-0 print:border-none print:animate-none`}>
        <p className="text-sm text-gray-600 italic mb-4 print:text-gray-800">{meal.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
          <div>
            <h4 className="text-xs font-bold text-[#003B5C] uppercase tracking-wider mb-2 print:text-black">Ingredients</h4>
            <ul className="text-sm text-gray-700 space-y-1 print:text-gray-900">
              {meal.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-[#EAAA00] flex-shrink-0 print:bg-black" />
                  <span>{ing}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#003B5C] uppercase tracking-wider mb-2 print:text-black">Instructions</h4>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside marker:text-[#003B5C] marker:font-semibold print:text-gray-900 print:marker:text-black">
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