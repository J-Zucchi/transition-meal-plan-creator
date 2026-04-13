import React, { useMemo, useState } from 'react';
import { Meal } from '../types';
import { Copy, Check, ShoppingCart } from 'lucide-react';

interface ShoppingListProps {
  meals: Meal[];
}

type Category = 'Produce' | 'Meat & Seafood' | 'Dairy & Eggs' | 'Pantry & Dry Goods' | 'Snacks & Supplements' | 'Frozen' | 'Other';

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  'Produce': ['fresh', 'apple', 'banana', 'berry', 'berries', 'spinach', 'kale', 'lettuce', 'onion', 'garlic', 'tomato', 'pepper', 'avocado', 'lemon', 'lime', 'fruit', 'veg', 'carrot', 'celery', 'cucumber', 'zucchini', 'squash', 'potato', 'sweet potato', 'herb', 'cilantro', 'parsley', 'basil'],
  'Meat & Seafood': ['chicken', 'beef', 'pork', 'turkey', 'salmon', 'tuna', 'fish', 'shrimp', 'sausage', 'bacon', 'steak', 'meat', 'deli'],
  'Dairy & Eggs': ['milk', 'cheese', 'yogurt', 'butter', 'egg', 'cream', 'chobani', 'oikos', 'fairlife', 'ghee', 'whey'],
  'Pantry & Dry Goods': ['rice', 'pasta', 'oat', 'bread', 'wrap', 'tortilla', 'oil', 'vinegar', 'sauce', 'spice', 'salt', 'pepper', 'nut', 'almond', 'peanut', 'seed', 'honey', 'syrup', 'flour', 'bean', 'lentil', 'chickpea', 'broth', 'stock', 'cereal', 'granola', 'quinoa', 'dressing', 'mustard', 'mayo', 'ketchup', 'salsa'],
  'Snacks & Supplements': ['protein powder', 'quest', 'rx bar', 'p3', 'bar', 'snack', 'cracker', 'chip', 'popcorn', 'jerky'],
  'Frozen': ['frozen'],
  'Other': []
};

function categorizeIngredient(ingredient: string): Category {
  const lower = ingredient.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'Other') continue;
    if (keywords.some(kw => lower.includes(kw))) {
      return category as Category;
    }
  }
  return 'Other';
}

const ShoppingList: React.FC<ShoppingListProps> = ({ meals }) => {
  const [copied, setCopied] = useState(false);

  const categorizedIngredients = useMemo(() => {
    const all = meals.flatMap(m => m?.ingredients || []);
    const unique = Array.from(new Set(all.map(i => i.trim())));
    
    const grouped: Partial<Record<Category, string[]>> = {};
    
    unique.forEach(item => {
      const cat = categorizeIngredient(item);
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat]!.push(item);
    });
    
    // Sort items within each category
    Object.keys(grouped).forEach(cat => {
      grouped[cat as Category]!.sort();
    });
    
    return grouped;
  }, [meals]);

  const totalItems = useMemo(() => {
    return Object.values(categorizedIngredients).reduce((acc, curr) => acc + (curr?.length || 0), 0);
  }, [categorizedIngredients]);

  const handleCopy = () => {
    let text = `Transition Medical Weight Loss - Shopping List:\n\n`;
    
    const categoryOrder: Category[] = ['Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Pantry & Dry Goods', 'Snacks & Supplements', 'Frozen', 'Other'];
    
    categoryOrder.forEach(cat => {
      if (categorizedIngredients[cat] && categorizedIngredients[cat]!.length > 0) {
        text += `--- ${cat} ---\n`;
        categorizedIngredients[cat]!.forEach(item => {
          text += `• ${item}\n`;
        });
        text += `\n`;
      }
    });

    navigator.clipboard.writeText(text.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryOrder: Category[] = ['Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Pantry & Dry Goods', 'Snacks & Supplements', 'Frozen', 'Other'];

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden h-fit sticky top-6 print:static print:shadow-none print:border print:border-gray-200">
      <div className="bg-[#003B5C] p-4 flex justify-between items-center text-white print:bg-white print:text-black print:border-b print:border-gray-200">
        <h3 className="font-bold flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-[#EAAA00] print:text-black" />
          Shopping List
        </h3>
        <span className="text-xs bg-[#ffffff20] px-2 py-1 rounded-full print:bg-gray-100 print:text-black">{totalItems} items</span>
      </div>
      
      <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar print:max-h-none print:overflow-visible">
        <div className="space-y-6 print:space-y-4">
          {categoryOrder.map(cat => {
            const items = categorizedIngredients[cat];
            if (!items || items.length === 0) return null;
            
            return (
              <div key={cat}>
                <h4 className="font-bold text-sm text-[#003B5C] border-b border-gray-200 pb-1 mb-2 print:text-black">{cat}</h4>
                <ul className="space-y-2 print:space-y-1">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 print:text-black">
                      <input type="checkbox" className="mt-0.5 rounded border-gray-300 text-[#003B5C] focus:ring-[#003B5C] cursor-pointer print:border-gray-400" />
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100 print:hidden">
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