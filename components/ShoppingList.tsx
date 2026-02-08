import React, { useMemo, useState } from 'react';
import { Meal } from '../types';
import { Copy, Check, ShoppingCart } from 'lucide-react';

interface ShoppingListProps {
  meals: Meal[];
}

const ShoppingList: React.FC<ShoppingListProps> = ({ meals }) => {
  const [copied, setCopied] = useState(false);

  const ingredients = useMemo(() => {
    // Flatten and roughly deduplicate ingredients
    // Note: Perfect programmatic deduplication of natural language ingredients is hard without AI,
    // but we can do simple string cleaning.
    const all = meals.flatMap(m => m.ingredients);
    const unique = Array.from(new Set(all.map(i => i.trim())));
    return unique.sort();
  }, [meals]);

  const handleCopy = () => {
    const text = `Transition Medical Weight Loss - Shopping List:\n\n${ingredients.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden h-fit sticky top-6">
      <div className="bg-[#003B5C] p-4 flex justify-between items-center text-white">
        <h3 className="font-bold flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-[#EAAA00]" />
          Shopping List
        </h3>
        <span className="text-xs bg-[#ffffff20] px-2 py-1 rounded-full">{ingredients.length} items</span>
      </div>
      
      <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
        <ul className="space-y-3">
          {ingredients.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 border-b border-gray-50 pb-2 last:border-0">
              <input type="checkbox" className="mt-1 rounded border-gray-300 text-[#003B5C] focus:ring-[#003B5C] cursor-pointer" />
              <span className="leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <button
          onClick={handleCopy}
          className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 ${
            copied 
              ? 'bg-green-600 text-white' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied to Clipboard
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy List
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ShoppingList;