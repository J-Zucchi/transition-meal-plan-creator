import React, { useState } from 'react';

const Header: React.FC = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center space-y-2">
        <div className="flex items-center gap-2 min-h-[64px]">
          {!imageError ? (
            <img 
              src="https://transitionsalem.com/wp-content/uploads/2023/08/Transition-Logo-2023.png" 
              alt="Transition Medical Weight Loss" 
              className="h-16 w-auto object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            /* Fallback layout if the external image is blocked/fails */
            <div className="flex flex-col items-center">
              <h1 className="text-2xl font-bold text-[#003B5C] leading-none tracking-tight">TRANSITION</h1>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] leading-tight">Medical Weight Loss</span>
            </div>
          )}
        </div>
        
        <div className="text-center max-w-2xl mt-2">
          <p className="text-sm text-gray-600 leading-relaxed">
            Daily meal ideas designed to fit the Transition program. Simply adjust your preferences below and click "Generate Plan" to get started.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;