import React from 'react';
import { TrendingUp, ShoppingBag, Target, Award } from 'lucide-react';

const OptimizationOptions = ({ selectedOption, onOptionChange }) => {
  const options = [
    { 
      id: 'profit', 
      label: 'Profit Maximization',
      description: 'Maximize overall profit margins',
      icon: TrendingUp,
    },
    { 
      id: 'sales', 
      label: 'Sales Maximization',
      description: 'Increase total sales volume',
      icon: ShoppingBag,
    },
    { 
      id: 'profitability', 
      label: 'Profitability Maximization',
      description: 'Optimize profitability ratios',
      icon: Target,
    },
    { 
      id: 'competitive', 
      label: 'Competitive Advantage',
      description: 'Beat competitor pricing',
      icon: Award,
    },
  ];

  return (
    <div className="bg-card-bg rounded-2xl p-4 lg:p-5 shadow-premium-md border border-border-gray hover:shadow-premium-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-light rounded-xl flex items-center justify-center border border-border-gray shadow-premium">
          <Target className="w-5 h-5 text-secondary-text" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm lg:text-base font-bold text-primary-text">Optimization Strategy</h2>
          <p className="text-xs text-muted-text">Choose your optimization goal</p>
        </div>
      </div>
      
      <div className="space-y-2">
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => onOptionChange(option.id)}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 border ${
              selectedOption === option.id
                ? 'border-primary-text bg-gradient-card shadow-premium-md scale-[1.01]'
                : 'border-border-gray hover:border-secondary-text hover:bg-hover-gray hover:shadow-premium'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 border ${
              selectedOption === option.id 
                ? 'bg-gradient-dark border-primary-text' 
                : 'bg-gradient-light border-border-gray'
            }`}>
              <option.icon className={`w-4 h-4 ${selectedOption === option.id ? 'text-white' : 'text-secondary-text'}`} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-primary-text mb-0.5">{option.label}</div>
              <p className="text-[10px] text-muted-text leading-tight">{option.description}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              selectedOption === option.id
                ? 'border-primary-text bg-primary-text shadow-premium'
                : 'border-border-gray'
            }`}>
              {selectedOption === option.id && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptimizationOptions;
