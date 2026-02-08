import React, { useState } from 'react';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import ClinicalTips from './components/ClinicalTips';
import MealCard from './components/MealCard';
import DailySummary from './components/DailySummary';
import ShoppingList from './components/ShoppingList';
import { UserSettings, MealPlanResponse } from './types';
import { generateMealPlan } from './services/geminiService';
import { AlertCircle, Printer } from 'lucide-react';

const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    gender: 'Female',
    calories: 1100,
    cookingStyle: 'Balanced Mix',
    exclusions: '',
  });

  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateMealPlan(settings);
      setMealPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800 print:bg-white">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full print:p-0">
        
        <div className="space-y-8 print:space-y-4">
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

          {mealPlan && !isLoading && (
             <div className="animate-fadeIn">
               
               <div className="flex items-center justify-between mb-6 print:mb-4">
                  <h2 className="text-2xl font-bold text-[#003B5C] print:text-black">Your Daily Plan</h2>
                  
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
                 <div className="lg:col-span-2 space-y-6 print:space-y-4 print:mb-8">
                    <DailySummary summary={mealPlan.summary} />
                    
                    <div className="space-y-4 print:space-y-6">
                      {mealPlan.meals.map((meal, index) => (
                        <MealCard key={index} meal={meal} />
                      ))}
                    </div>
                 </div>

                 {/* Right Column: Shopping List */}
                 <div className="lg:col-span-1 print:break-before-page">
                   <ShoppingList meals={mealPlan.meals} />
                 </div>
               </div>
             </div>
          )}

          <ClinicalTips />
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
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};

export default App;