import React from 'react';
import { ShieldCheck, Droplets, UtensilsCrossed } from 'lucide-react';

const ClinicalTips: React.FC = () => {
  return (
    <div className="bg-[#003B5C] text-white rounded-xl shadow-lg p-6 mb-8 print:hidden">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[#ffffff30] pb-2">
        <ShieldCheck className="w-6 h-6 text-[#EAAA00]" />
        Transition Clinical Tips
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2 text-[#EAAA00] font-semibold">
            <UtensilsCrossed className="w-5 h-5" />
            <span>Protein</span>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">
            Strive to get a serving of protein with each meal or snack to support muscle mass and satiety.
          </p>
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2 text-[#EAAA00] font-semibold">
            <Droplets className="w-5 h-5" />
            <span>Hydration</span>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">
            Stay hydrated! Drink 64oz+ of water daily to support metabolic function and reduce false hunger signals.
          </p>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2 text-[#EAAA00] font-semibold">
            <ShieldCheck className="w-5 h-5" />
            <span>Flexibility</span>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">
            Use "Quick" for busy days, and "Balanced Mix" to enjoy a home-cooked dinner. Consistency is key.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClinicalTips;