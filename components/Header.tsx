import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 print:hidden">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col items-center justify-center space-y-4">
        <img 
          src="https://transitionsalem.com/wp-content/uploads/2022/09/Logo.jpeg" 
          alt="Transition Medical Weight Loss" 
          className="h-24 w-auto object-contain"
        />
        
        <div className="text-center max-w-2xl">
          <h1 className="text-3xl font-bold text-[#003B5C] mb-2">Transition Meal Plan Generator</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Daily meal ideas designed to fit the Transition program. Simply adjust your preferences below and click "Generate Plan" to get started.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;