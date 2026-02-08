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
        
        <div className="text-center max-w-3xl">
          <h1 className="text-3xl font-bold text-[#003B5C] mb-3">Transition Meal Plan Creator</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Designed to generate customizable meal plans with optimal macronutrients to help patients lose weight effectively. Each plan includes complete recipes, step-by-step instructions, and detailed macros. 
            Use the <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-50 text-[#003B5C] rounded mx-1 text-xs">⟳</span> 
            <span className="font-semibold">Swap Option</span> button to customize each meal to your taste, and your daily totals and shopping list will update instantly! You can also print your plan for easy reference.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;