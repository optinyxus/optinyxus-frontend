import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(product.path)}
      className="group bg-white rounded-xl p-5 md:p-6 shadow-premium-md border border-border-gray hover:border-primary-text hover:shadow-premium-lg transition-all duration-300 cursor-pointer hover:scale-[1.02]"
    >
      {/* Icon */}
      <div className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${product.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-premium`}>
        <product.icon className="w-7 h-7 md:w-8 md:h-8 text-white" strokeWidth={2.5} />
      </div>

      {/* Title */}
      <h3 className="text-lg md:text-xl font-bold text-primary-text mb-2 md:mb-3 group-hover:text-brand-dark transition-colors">
        {product.name}
      </h3>

      {/* Description */}
      <p className="text-sm md:text-sm text-muted-text mb-4 leading-relaxed">
        {product.description}
      </p>

      {/* Action */}
      <div className="flex items-center gap-2 text-sm font-semibold text-secondary-text group-hover:text-primary-text group-hover:gap-3 transition-all pt-3 border-t border-border-gray">
        <span>Open Dashboard</span>
        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
      </div>
    </div>
  );
};

export default ProductCard;
