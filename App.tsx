
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import ClinicalTips from './components/ClinicalTips';
import MealCard from './components/MealCard';
import DailySummary from './components/DailySummary';
import ShoppingList from './components/ShoppingList';
import LoadingState from './components/LoadingState';
import { UserSettings, MealPlanResponse, Macro, Meal } from './types';
import { generateMealPlanStream } from './services/geminiService';
import { AlertCircle, Printer } from 'lucide-react';

const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    gender: 'Female',
    calories: 1100,
    creativityLevel: 2,
    exclusions: '',
    preferences: '',
  });

  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  // Track selected option index for each slot: { 0: 0, 1: 2, ... }
  const [selections, setSelections] = useState<number[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    
    // Capture previous meals to ensure variety on subsequent generations
    const previousMeals = mealPlan 
      ? mealPlan.slots.flatMap(slot => slot.options?.map(opt => opt.title).filter(Boolean) as string[])
      : [];

    const MAX_RETRIES = 3;
    let success = false;
    let finalError: string | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Client-side generation attempt ${attempt}/${MAX_RETRIES} starting...`);
        setMealPlan(null); 
        setSelections([]);
        
        let lastLoggedPlan: MealPlanResponse | null = null;

        for await (const partialPlan of generateMealPlanStream({ ...settings, previousMeals })) {
          lastLoggedPlan = partialPlan;
          setMealPlan(partialPlan);
          setSelections(prev => {
            if (partialPlan.slots && prev.length < partialPlan.slots.length) {
              const next = [...prev];
              while (next.length < partialPlan.slots.length) next.push(0);
              return next;
            }
            return prev;
          });
        }

        // Quality assurance check: are there at least 4 generated meal slots?
        // Prompt normally requests exactly 5. If we ended up with fewer than 4 or nothing, retry.
        if (!lastLoggedPlan || !lastLoggedPlan.slots || lastLoggedPlan.slots.length < 4) {
          throw new Error("Generation completed but was partial or incomplete.");
        }

        success = true;
        break; // Successfully generated the full plan, exit the loop
      } catch (err) {
        console.warn(`Client-side generation attempt ${attempt} failed:`, err);
        finalError = err instanceof Error ? err.message : "An unexpected error occurred.";
        
        // Wait a brief period (1.5 seconds) before retrying
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }

    if (!success) {
      setError(finalError);
      setMealPlan(null); // Clear broken/partial plans if error occurs on last retry
    }
    
    setIsLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSwap = (slotIndex: number) => {
    if (!mealPlan || !mealPlan.slots || !mealPlan.slots[slotIndex]) return;
    setSelections(prev => {
      const next = [...prev];
      const currentOption = next[slotIndex] || 0;
      const totalOptions = mealPlan.slots[slotIndex].options?.length || 1;
      next[slotIndex] = (currentOption + 1) % totalOptions;
      return next;
    });
  };

  // Compute the currently active set of meals based on selections
  const activeMeals = useMemo(() => {
    if (!mealPlan || !mealPlan.slots || selections.length === 0) return [];
    return mealPlan.slots.map((slot, index) => {
      if (!slot?.options || slot.options.length === 0) return null;
      const selectedIndex = selections[index] || 0;
      return slot.options[selectedIndex] || slot.options[0];
    }).filter(Boolean) as Meal[];
  }, [mealPlan, selections]);

  // Compute summary dynamically from active meals
  const currentSummary: Macro = useMemo(() => {
    return activeMeals.reduce((acc, meal) => ({
      calories: acc.calories + (meal.macros?.calories || 0),
      protein: acc.protein + (meal.macros?.protein || 0),
      carbs: acc.carbs + (meal.macros?.carbs || 0),
      fat: acc.fat + (meal.macros?.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [activeMeals]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800 print:bg-white">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full print:p-0">
        
        <div className="space-y-8 print:space-y-6">
          <SettingsPanel 
            settings={settings}
            setSettings={setSettings}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3 print:hidden">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-bold text-sm">Error Generating Plan</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {isLoading && <LoadingState />}

          {mealPlan && activeMeals.length > 0 && (
             <div className="animate-fadeIn">
               
               <div className="flex items-center justify-between mb-6 print:mb-2">
                  <h2 className="text-2xl font-bold text-[#003B5C] print:text-xl print:text-black">Your Daily Plan</h2>
                  
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 text-[#003B5C] hover:text-[#EAAA00] transition-colors print:hidden"
                  >
                    <Printer className="w-5 h-5" />
                    <span className="font-semibold">Print Plan</span>
                  </button>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
                 {/* Left Column: Meals */}
                 <div className="lg:col-span-2 space-y-6 print:space-y-6 print:mb-8">
                    <DailySummary summary={currentSummary} />
                    
                    <div className="space-y-4 print:space-y-6">
                      {mealPlan.slots.map((slot, index) => {
                        const selectedIndex = selections[index] || 0;
                        const meal = slot?.options?.[selectedIndex] || slot?.options?.[0];
                        if (!meal) return null;

                        return (
                          <MealCard 
                            key={`${index}-${selectedIndex}`} // Force re-render on swap
                            meal={meal} 
                            slotTitle={slot?.title || `Meal ${index + 1}`}
                            onSwap={() => handleSwap(index)}
                            optionIndex={selectedIndex}
                            totalOptions={slot?.options?.length || 1}
                          />
                        );
                      })}
                    </div>
                 </div>

                 {/* Right Column: Shopping List */}
                 <div className="lg:col-span-1 print:break-before-page">
                   <ShoppingList meals={activeMeals} />
                 </div>
               </div>
             </div>
          )}

          {!isLoading && !mealPlan && !error && <ClinicalTips />}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 py-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Transition Medical Weight Loss. All rights reserved.</p>
          <p className="mt-2 text-xs">Medical Disclaimer: This AI tool provides suggestions based on general clinic guidelines. Always consult your provider for specific medical advice.</p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @media print {
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
          }
          @page {
            margin: 2cm;
          }
          /* GLOBAL OVERRIDE: Force elements with this class to appear in print */
          .print-force-visible {
            display: block !important;
            opacity: 1 !important;
            height: auto !important;
            visibility: visible !important;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
