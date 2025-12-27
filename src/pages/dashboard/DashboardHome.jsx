import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { PRODUCTS } from '../../utils/constants';
import { Sparkles, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Separate ProductCard component
const ProductCard = ({ product, onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = () => {
    onNavigate(product.path);
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsExpanded(prev => !prev);
  };

  return (
    <div className="bg-white rounded-xl shadow-premium-md border border-border-gray hover:shadow-premium-lg transition-all h-fit">
      {/* Main Card - Clickable */}
      <div onClick={handleCardClick} className="p-5 cursor-pointer group">
        {/* Icon */}
        <div className={`w-14 h-14 bg-gradient-to-br ${product.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-premium`}>
          <product.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-primary-text mb-2 group-hover:text-brand-dark transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-text mb-4 leading-relaxed line-clamp-2">
          {product.description}
        </p>

        {/* Action */}
        <div className="flex items-center gap-2 text-sm font-semibold text-secondary-text group-hover:text-primary-text group-hover:gap-3 transition-all pt-3 border-t border-border-gray">
          <span>Open Dashboard</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
        </div>
      </div>

      {/* Solutions/Models Section */}
      <div className="border-t border-border-gray">
        <button
          onClick={handleDropdownClick}
          className="w-full px-5 py-3 flex items-center justify-between text-sm font-semibold text-secondary-text hover:bg-gray-50 transition-colors"
        >
          <span>Solutions & Models</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          ) : (
            <ChevronDown className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          )}
        </button>
        
        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-5 pb-4 space-y-3 bg-gray-50">
            {product.solutions.map((solution, idx) => (
              <div key={idx} className="text-left">
                <h4 className="text-sm font-semibold text-primary-text">{solution.name}</h4>
                <p className="text-xs text-muted-text leading-tight mt-0.5">{solution.purpose}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout currentProduct="home" showSidebar={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-start justify-center px-6 py-6">
        <div className="w-full max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-border-gray rounded-full mb-3 shadow-premium">
              <Sparkles className="w-4 h-4 text-chart-green" strokeWidth={2} />
              <span className="text-sm font-semibold text-primary-text">Welcome Back</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-text mb-2">
              OptiNyxus Dashboard
            </h1>
            <p className="text-base text-muted-text">
              Select a product to start optimizing your business operations
            </p>
          </div>

          {/* Products Grid - items-start to prevent height matching */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
            {PRODUCTS.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onNavigate={navigate}
              />
            ))}
          </div>

          {/* Pipeline Drawings Space */}
          <div className="mt-10 p-8 bg-white rounded-xl border-2 border-dashed border-border-gray text-center">
            <p className="text-base text-muted-text">Pipeline Visualization Area</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
