import React from 'react';
import { Sliders } from 'lucide-react';

const ConstraintsSection = ({ constraints, onConstraintChange }) => {
  const handleInputChange = (index, field, value) => {
    const updated = [...constraints];
    updated[index] = { ...updated[index], [field]: value };
    onConstraintChange(updated);
  };

  return (
    <div className="bg-card-bg rounded-2xl p-4 lg:p-5 shadow-premium-md border border-border-gray hover:shadow-premium-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-light rounded-xl flex items-center justify-center border border-border-gray shadow-premium">
          <Sliders className="w-5 h-5 text-secondary-text" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm lg:text-base font-bold text-primary-text">Constraints</h2>
          <p className="text-xs text-muted-text">Set optimization boundaries</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {constraints.map((constraint, index) => (
          <div key={index} className="border border-border-gray rounded-xl p-3 hover:border-secondary-text hover:shadow-premium transition-all duration-200 bg-gradient-light">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-primary-text">Constraint {index + 1}</h3>
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-semibold text-muted-text mb-1">Type</label>
                <select
                  value={constraint.type}
                  onChange={(e) => handleInputChange(index, 'type', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-border-gray rounded-lg text-xs font-medium text-primary-text focus:outline-none focus:border-secondary-text focus:shadow-premium transition-all"
                >
                  <option value="Profit">Profit</option>
                  <option value="Profitability">Profitability</option>
                  <option value="Competition Gap">Competition Gap</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-muted-text mb-1">Min</label>
                  <input
                    type="number"
                    value={constraint.minimum}
                    onChange={(e) => handleInputChange(index, 'minimum', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-border-gray rounded-lg text-xs font-medium text-primary-text focus:outline-none focus:border-secondary-text focus:shadow-premium transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-semibold text-muted-text mb-1">Max</label>
                  <input
                    type="number"
                    value={constraint.maximum}
                    onChange={(e) => handleInputChange(index, 'maximum', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-border-gray rounded-lg text-xs font-medium text-primary-text focus:outline-none focus:border-secondary-text focus:shadow-premium transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConstraintsSection;
