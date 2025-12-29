import React, { useState } from 'react';
import {
  X,
  Upload,
  Target,
  Sliders,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  Home,
  TrendingUp,
  DollarSign,
  Percent,
  Package,
  RotateCcw,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PriceGenixSidebar = ({
  isOpen,
  toggleSidebar,
  uploadedFile,
  onFileUpload,
  selectedOptimization,
  onOptimizationChange,
  constraints,
  onConstraintsChange,
  onRunOptimization,
  onReset
}) => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);

  const optimizationOptions = [
    { id: 'sales', label: 'Sales Maximization', icon: TrendingUp },
    { id: 'profit', label: 'Profit Maximization', icon: DollarSign },
    { id: 'profitability', label: 'Profitability Maximization', icon: Percent },
    { id: 'competitive', label: 'Competitive Advantage', icon: Award }
  ];

  const constraintTypes = [
    { value: 'Sales', unit: '₹', hasFormat: false },
    { value: 'Profit', unit: '₹', hasFormat: false },
    { value: 'Profit Percentage', unit: '%', hasFormat: false },
    { value: 'Units', unit: '', hasFormat: true },
    { value: 'Discount', unit: '', hasFormat: true }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file.name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileUpload(file.name);
    }
  };

  const handleRemoveFile = () => {
    onFileUpload(null);
  };

  const handleConstraintChange = (index, field, value) => {
    const updated = [...constraints];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'type') {
      const constraintType = constraintTypes.find((ct) => ct.value === value);
      if (constraintType?.hasFormat) {
        updated[index].format = 'percentage';
      } else {
        delete updated[index].format;
      }
    }

    onConstraintsChange(updated);
  };

  const handleAddConstraint = () => {
    const availableTypes = constraintTypes.filter(
      (ct) => !constraints.some((c) => c.type === ct.value)
    );

    if (availableTypes.length > 0) {
      onConstraintsChange([
        ...constraints,
        { type: '', minimum: '', maximum: '', format: 'percentage' }
      ]);
    }
  };

  const handleRemoveConstraint = (index) => {
    onConstraintsChange(constraints.filter((_, i) => i !== index));
  };

  const getConstraintUnit = (constraint) => {
    const type = constraintTypes.find((ct) => ct.value === constraint.type);
    if (!type) return '';

    if (type.hasFormat && constraint.format) {
      return constraint.format === 'percentage' ? '%' : 'Qty';
    }

    return type.unit;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-screen w-[320px] bg-card-bg border-r border-border-gray z-50 transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Close Button (Mobile) */}
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-hover-gray z-10"
        >
          <X className="w-5 h-5 text-secondary-text" />
        </button>

        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-border-gray">
            <div className="flex justify-center mb-3">
              <img
                src="/optinyxuslogo.png"
                alt="OptiNyxus"
                className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate('/dashboard')}
              />
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-card border border-border-gray hover:shadow-premium-md hover:border-secondary-text transition-all duration-200 group"
            >
              <Home
                className="w-3.5 h-3.5 text-secondary-text group-hover:text-primary-text transition-colors"
                strokeWidth={2}
              />
              <span className="text-xs font-semibold text-secondary-text group-hover:text-primary-text transition-colors">
                Dashboard Home
              </span>
            </button>
          </div>

          {/* Data Upload */}
          <div className="p-4 border-b border-border-gray">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-secondary-text" strokeWidth={2} />
              <h3 className="text-sm font-bold text-primary-text">Data Upload</h3>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-2 text-center transition-all duration-300 mb-3 ${
                isDragging
                  ? 'border-primary-text bg-gradient-card'
                  : uploadedFile
                  ? 'border-green-300 bg-green-50/30'
                  : 'border-border-gray hover:border-secondary-text hover:bg-gradient-card cursor-pointer'
              }`}
            >
              <input
                type="file"
                id="sidebar-file-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />

              <label htmlFor="sidebar-file-upload" className="cursor-pointer block">
                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-1.5 py-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-chart-green flex-shrink-0" />
                    <span className="text-[10px] text-primary-text font-semibold truncate">
                      {uploadedFile}
                    </span>
                  </div>
                ) : (
                  <div className="py-1 flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-muted-text" strokeWidth={1.5} />
                    <p className="text-[10px] text-primary-text font-medium">
                      Drop file or click
                    </p>
                  </div>
                )}
              </label>

              {uploadedFile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full shadow-premium flex items-center justify-center hover:bg-red-50 transition-colors border border-border-gray"
                >
                  <X className="w-2.5 h-2.5 text-secondary-text hover:text-red-500" />
                </button>
              )}
            </div>

            {/* RUN ENGINE BUTTON - centered icon + text together */}
            <button
              onClick={onRunOptimization}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-success text-white rounded-xl font-bold text-base shadow-premium-lg transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-100"
            >
              <Play className="w-4 h-4 fill-white flex-shrink-0" strokeWidth={0} />
              <span className="leading-none">Run Engine</span>
            </button>
          </div>

          {/* Objective */}
          <div className="p-4 border-b border-border-gray">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-secondary-text" strokeWidth={2} />
              <h3 className="text-sm font-bold text-primary-text">Objective</h3>
            </div>

            <div className="space-y-2">
              {optimizationOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onOptimizationChange(option.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                    selectedOptimization === option.id
                      ? 'border-primary-text bg-primary-text text-white shadow-premium-lg'
                      : 'border-border-gray bg-white text-secondary-text hover:border-secondary-text hover:shadow-premium'
                  }`}
                >
                  <option.icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      selectedOptimization === option.id ? 'text-white' : 'text-secondary-text'
                    }`}
                    strokeWidth={2}
                  />
                  <span className="text-sm font-semibold text-left flex-1">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div className="p-4 border-b border-border-gray">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-secondary-text" strokeWidth={2} />
                <h3 className="text-sm font-bold text-primary-text">Constraints</h3>
              </div>

              {constraints.length < constraintTypes.length && (
                <button
                  onClick={handleAddConstraint}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-chart-green hover:bg-green-600 text-white transition-colors shadow-premium"
                  title="Add Constraint"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {constraints.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-text">
                  No constraints added yet
                </div>
              ) : (
                constraints.map((constraint, index) => {
                  const selectedType = constraintTypes.find((ct) => ct.value === constraint.type);
                  const showFormatSelector = selectedType?.hasFormat;

                  return (
                    <div
                      key={index}
                      className="border-2 border-border-gray rounded-xl p-2.5 bg-white hover:border-secondary-text transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-primary-text">
                          Constraint {index + 1}
                        </span>
                        <button
                          onClick={() => handleRemoveConstraint(index)}
                          className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-secondary-text hover:text-red-500" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-muted-text mb-1 font-semibold">
                            Type
                          </label>
                          <select
                            value={constraint.type}
                            onChange={(e) =>
                              handleConstraintChange(index, 'type', e.target.value)
                            }
                            className="w-full px-2 py-1.5 border border-border-gray rounded-lg text-xs font-medium focus:outline-none focus:border-secondary-text focus:shadow-premium bg-white"
                          >
                            <option value="">Select</option>
                            {constraintTypes.map((ct) => (
                              <option
                                key={ct.value}
                                value={ct.value}
                                disabled={constraints.some(
                                  (c, i) => i !== index && c.type === ct.value
                                )}
                              >
                                {ct.value}
                              </option>
                            ))}
                          </select>
                        </div>

                        {showFormatSelector && (
                          <div>
                            <label className="block text-xs text-muted-text mb-1 font-semibold">
                              Format
                            </label>
                            <select
                              value={constraint.format || 'percentage'}
                              onChange={(e) =>
                                handleConstraintChange(index, 'format', e.target.value)
                              }
                              className="w-full px-2 py-1.5 border border-border-gray rounded-lg text-xs font-medium focus:outline-none focus:border-secondary-text focus:shadow-premium bg-white"
                            >
                              <option value="percentage">Percentage</option>
                              <option value="number">Numbers</option>
                            </select>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-muted-text mb-1 font-semibold">
                              Min {constraint.type ? `(${getConstraintUnit(constraint)})` : ''}
                            </label>
                            <input
                              type="number"
                              value={constraint.minimum}
                              onChange={(e) =>
                                handleConstraintChange(index, 'minimum', e.target.value)
                              }
                              className="w-full px-2 py-1.5 border border-border-gray rounded-lg text-xs font-medium focus:outline-none focus:border-secondary-text focus:shadow-premium bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-muted-text mb-1 font-semibold">
                              Max {constraint.type ? `(${getConstraintUnit(constraint)})` : ''}
                            </label>
                            <input
                              type="number"
                              value={constraint.maximum}
                              onChange={(e) =>
                                handleConstraintChange(index, 'maximum', e.target.value)
                              }
                              className="w-full px-2 py-1.5 border border-border-gray rounded-lg text-xs font-medium focus:outline-none focus:border-secondary-text focus:shadow-premium bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="h-4" />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border-gray bg-card-bg p-4 flex-shrink-0">
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-red-50/50 border border-red-300 text-red-600 rounded-lg hover:bg-red-100 hover:border-red-500 hover:text-red-700 transition-all duration-300 font-medium text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default PriceGenixSidebar;
