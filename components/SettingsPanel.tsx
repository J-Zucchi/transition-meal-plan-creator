import React, { useEffect } from 'react';
import { UserSettings, Gender, CookingStyle } from '../types';
import { Clock, Sliders, ChefHat, Sparkles, Loader2 } from 'lucide-react';

interface SettingsPanelProps {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  onGenerate: () => void;
  isLoading: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings, onGenerate, isLoading }) => {
  
  // Logic: Switch default calories based on gender
  const handleGenderChange = (gender: Gender) => {
    const defaultCalories = gender === 'Female' ? 1100 : 1500;
    setSettings(prev => ({ ...prev, gender, calories: defaultCalories }));
  };

  const handleCaloriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, calories: Number(e.target.value) }));
  };

  const handleStyleChange = (style: CookingStyle) => {
    setSettings(prev => ({ ...prev, cookingStyle: style }));
  };

  const handleExclusionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, exclusions: e.target.value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 print:hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
        
        {/* Gender Toggle */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Gender</label>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['Female', 'Male'] as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => handleGenderChange(g)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  settings.gender === g
                    ? 'bg-white text-[#003B5C] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Calorie Slider */}
        <div className="flex flex-col gap-2">
           <div className="flex justify-between items-center">
             <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Daily Target</label>
             <span className="text-[#003B5C] font-bold bg-blue-50 px-2 py-0.5 rounded text-sm">
               {settings.calories} Calories
             </span>
           </div>
           <input 
             type="range" 
             min="900" 
             max="2000" 
             step="50"
             value={settings.calories}
             onChange={handleCaloriesChange}
             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#EAAA00]"
           />
           <div className="flex justify-between text-xs text-gray-400 px-1">
             <span>900</span>
             <span>2000</span>
           </div>
        </div>

        {/* Cooking Style */}
        <div className="flex flex-col gap-2 lg:col-span-2">
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Cooking Style</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Quick & Easy', icon: Clock, label: 'Quick' },
              { id: 'Balanced Mix', icon: Sliders, label: 'Balanced' },
              { id: 'Home Cooked', icon: ChefHat, label: 'Cooked' }
            ].map((item) => {
               const Icon = item.icon;
               const isSelected = settings.cookingStyle === item.id;
               return (
                 <button
                   key={item.id}
                   onClick={() => handleStyleChange(item.id as CookingStyle)}
                   className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200 ${
                     isSelected 
                      ? 'border-[#003B5C] bg-[#003B5C] text-white shadow-md transform scale-[1.02]' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#EAAA00] hover:text-[#003B5C]'
                   }`}
                 >
                   <Icon className="w-5 h-5 mb-1" />
                   <span className="text-xs font-medium">{item.label}</span>
                 </button>
               )
            })}
          </div>
        </div>

        {/* Exclusions */}
        <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Exclusions / Allergies</label>
          <input 
             type="text" 
             placeholder="e.g., No shellfish, gluten-free, dislike mushrooms..."
             value={settings.exclusions}
             onChange={handleExclusionsChange}
             className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-[#003B5C] focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Generate Button */}
        <div className="md:col-span-2 lg:col-span-1">
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="w-full h-[50px] bg-[#EAAA00] hover:bg-[#d49900] text-[#003B5C] font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Designing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Plan
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsPanel;