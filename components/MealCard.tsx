import React, { useState } from 'react';
import { Meal } from '../types';
import { ChevronDown, ChevronUp, Clock, Flame, Dumbbell, Wheat, Droplet } from 'lucide-react';

interface MealCardProps {
  meal: Meal;
}

const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
      
      {/* Header / Summary View */}
      <div 
        className="p-5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded mb-2 tracking-wider">
              {meal.type}
            </span>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{meal.title}</h3>
            <div className="flex items-center text-gray-500 text-xs mt-1 space-x-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {meal.prepTime}
              </span>
            </div>
            {!isExpanded && (
               <p className="text-sm text-gray-500 mt-2 line-clamp-2">{meal.description}</p>
            )}
          </div>
          <button className="text-gray-400 hover:text-[#003B5C] transition-colors">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Macros Strip */}
        <div className="mt-4 flex flex-wrap gap-2">
           {/* Calories */}
           <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
              <Flame className="w-3.5 h-3.5" />
              <span>{meal.macros.calories} kcal</span>
           </div>
           
           {/* Protein - Highlighted */}
           <div className="flex items-center gap-1.5 px-3 py-1 bg-[#003B5C] text-white rounded-full text-xs font-bold shadow-sm">
              <Dumbbell className="w-3.5 h-3.5 text-[#EAAA00]" />
              <span>{meal.macros.protein}g Protein</span>
           </div>

           {/* Carbs */}
           <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-medium">
              <Wheat className="w-3.5 h-3.5" />
              <span>{meal.macros.carbs}g Carbs</span>
           </div>
           
           {/* Fats */}
           <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-100 rounded-full text-xs font-medium">
              <Droplet className="w-3.5 h-3.5" />
              <span>{meal.macros.fat}g Fat</span>
           </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-5 animate-fadeIn">
          <p className="text-sm text-gray-600 italic mb-4">{meal.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-bold text-[#003B5C] uppercase tracking-wider mb-2">Ingredients</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {meal.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-[#EAAA00] flex-shrink-0" />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#003B5C] uppercase tracking-wider mb-2">Instructions</h4>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside marker:text-[#003B5C] marker:font-semibold">
                {meal.instructions.map((inst, idx) => (
                  <li key={idx}>
                    <span className="inline">{inst}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealCard;