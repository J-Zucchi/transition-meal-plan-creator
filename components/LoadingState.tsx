
import React, { useState, useEffect } from 'react';
import { Loader2, ChefHat, Calculator, ShoppingCart, Sparkles } from 'lucide-react';

const MESSAGES = [
  { text: "Analyzing your nutritional profile...", icon: Calculator },
  { text: "Brainstorming healthy breakfast options...", icon: ChefHat },
  { text: "Designing high-protein lunches...", icon: ChefHat },
  { text: "Crafting delicious dinner recipes...", icon: ChefHat },
  { text: "Calculating daily macro totals...", icon: Calculator },
  { text: "Compiling your shopping list...", icon: ShoppingCart },
  { text: "Finalizing your personalized plan...", icon: Sparkles },
];

const LoadingState: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Increased duration from 1800ms to 3500ms to better match API latency
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < MESSAGES.length - 1 ? prev + 1 : prev));
    }, 3500); 

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = MESSAGES[currentStep].icon;

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-12 flex flex-col items-center justify-center text-center animate-fadeIn my-8">
      
      {/* Animated Icon Circle */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[#EAAA00] rounded-full opacity-20 animate-ping"></div>
        <div className="relative bg-blue-50 p-4 rounded-full">
          <CurrentIcon className="w-8 h-8 text-[#003B5C] animate-bounce" />
        </div>
      </div>

      {/* Text Content */}
      <h3 className="text-xl font-bold text-[#003B5C] mb-2 transition-all duration-300">
        {MESSAGES[currentStep].text}
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        This usually takes about 20-30 seconds.
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-md h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#003B5C] to-[#005f8f] transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / MESSAGES.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default LoadingState;
