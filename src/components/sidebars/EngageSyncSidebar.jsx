import React, { useRef, useState } from 'react';
import {
  X,
  Upload,
  Play,
  CheckCircle2,
  Home,
  RotateCcw,
  Users,
  Loader2,
  Filter,
  Activity,
  Heart,
  Zap,
  RefreshCcw,
  Target,
  LayoutGrid
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const EngageSyncSidebar = ({
  isOpen,
  toggleSidebar,
  uploadedFile,
  onFileUpload,
  onRunAnalysis,
  isRunning = false,
  cltvValue,
  onCltvChange,
  elasticityValue,
  onElasticityChange,
  activeSchema,
  onSchemaChange,
  multiSelectMode,
  onMultiSelectChange,
  matrixMode,
  onMatrixModeChange,
  matrixSchemaOrder,
  onMatrixSchemaToggle,
}) => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const cltvOptions = ['All', 'High', 'Medium', 'Low'];
  const elasticityOptions = ['All', 'Elastic', 'Inelastic', 'Unit Elastic'];
  const schemaOptions = [
    { id: 'rfm',       label: 'RFM',        icon: Activity,   disabled: false, activeColor: 'border-indigo-400 bg-indigo-50 text-indigo-700',   iconColor: 'text-indigo-600' },
    { id: 'loyalty',   label: 'Loyalty',    icon: Heart,      disabled: false, activeColor: 'border-rose-400 bg-rose-50 text-rose-700',         iconColor: 'text-rose-600'   },
    { id: 'behavior',  label: 'Behavior',   icon: Zap,        disabled: false, activeColor: 'border-amber-400 bg-amber-50 text-amber-700',      iconColor: 'text-amber-600'  },
    { id: 'lifecycle', label: 'Life Cycle', icon: RefreshCcw, disabled: false, activeColor: 'border-emerald-400 bg-emerald-50 text-emerald-700', iconColor: 'text-emerald-600'},
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileUpload(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileUpload(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemoveFile = () => {
    onFileUpload(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
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
        {/* Close button (mobile only) */}
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-hover-gray z-10"
          type="button"
        >
          <X className="w-5 h-5 text-secondary-text" />
        </button>

        <div className="flex-1 overflow-y-auto">
          {/* Logo + Dashboard Home */}
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
              type="button"
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
                ref={inputRef}
                type="file"
                id="engagesync-file-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />

              <label htmlFor="engagesync-file-upload" className="cursor-pointer block">
                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-1.5 py-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-chart-green flex-shrink-0" />
                    <span className="text-[10px] text-primary-text font-semibold truncate">
                      {uploadedFile?.name || uploadedFile}
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
                  type="button"
                >
                  <X className="w-2.5 h-2.5 text-secondary-text hover:text-red-500" />
                </button>
              )}
            </div>

            {/* Run Analysis Button */}
            <button
              onClick={onRunAnalysis}
              disabled={isRunning || !uploadedFile}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-base shadow-premium-lg transition-all duration-200 ${
                isRunning || !uploadedFile
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-success text-white hover:brightness-110 active:scale-100'
              }`}
              type="button"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" strokeWidth={2} />
                  <span className="leading-none">Analyzing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white flex-shrink-0" strokeWidth={0} />
                  <span className="leading-none">Run Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* Schema Selection */}
          <div className="p-4 border-b border-border-gray">
            {/* Heading */}
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-secondary-text" strokeWidth={2} />
              <h3 className="text-lg font-bold text-primary-text">Segmentation Schema</h3>
            </div>

            {/* Toggle bar: Multi-Select | divider | 2x2 Matrix */}
            <div className="flex items-center gap-0 select-none mb-3 rounded-lg border border-border-gray overflow-hidden bg-gradient-card">
              {/* Multi-Select toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={multiSelectMode}
                onClick={(e) => { e.stopPropagation(); onMultiSelectChange(!multiSelectMode); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 transition-all duration-200 cursor-pointer ${
                  multiSelectMode ? 'bg-indigo-50' : 'hover:bg-hover-gray'
                }`}
              >
                <LayoutGrid className={`w-3 h-3 flex-shrink-0 ${multiSelectMode ? 'text-indigo-600' : 'text-secondary-text'}`} />
                <span className={`text-[10px] font-semibold whitespace-nowrap ${multiSelectMode ? 'text-indigo-700' : 'text-secondary-text'}`}>4x4 Matrix</span>
                <span
                  className={`relative inline-flex items-center rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${
                    multiSelectMode ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                  style={{ minWidth: 26, width: 26, height: 15 }}
                >
                  <span
                    className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                      multiSelectMode ? 'translate-x-[13px]' : 'translate-x-[2px]'
                    }`}
                  />
                </span>
              </button>

              {/* Vertical divider */}
              <div className="w-px self-stretch bg-border-gray flex-shrink-0" />

              {/* 2x2 Matrix toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={matrixMode}
                onClick={(e) => { e.stopPropagation(); onMatrixModeChange(!matrixMode); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 transition-all duration-200 cursor-pointer ${
                  matrixMode ? 'bg-violet-50' : 'hover:bg-hover-gray'
                }`}
              >
                <span className={`text-[10px] font-semibold whitespace-nowrap ${matrixMode ? 'text-violet-700' : 'text-secondary-text'}`}>2×2 Matrix</span>
                <span
                  className={`relative inline-flex items-center rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${
                    matrixMode ? 'bg-violet-600' : 'bg-gray-300'
                  }`}
                  style={{ minWidth: 26, width: 26, height: 15 }}
                >
                  <span
                    className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                      matrixMode ? 'translate-x-[13px]' : 'translate-x-[2px]'
                    }`}
                  />
                </span>
              </button>
            </div>

            <div className="space-y-2">
              {schemaOptions.map((option) => {
                const matrixOrderIdx = matrixSchemaOrder ? matrixSchemaOrder.indexOf(option.id) : -1;
                const isInMatrix = matrixOrderIdx !== -1;
                const isActive = matrixMode
                  ? isInMatrix
                  : (multiSelectMode || activeSchema === option.id);
                const isDisabled = option.disabled || (multiSelectMode && !matrixMode);
                const Icon = option.icon;
                const orderLabel = ['①', '②', '③', '④'];

                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      if (option.disabled) return;
                      if (matrixMode) {
                        onMatrixSchemaToggle(option.id);
                      } else if (!multiSelectMode) {
                        // Toggle: click same active schema again to deselect
                        onSchemaChange(activeSchema === option.id ? null : option.id);
                      }
                    }}
                    disabled={option.disabled || (multiSelectMode && !matrixMode)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border-2 relative ${
                      option.disabled
                        ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                        : isActive
                          ? `${option.activeColor} shadow-premium-lg cursor-pointer`
                          : matrixMode
                            ? 'border-border-gray bg-white text-secondary-text hover:border-secondary-text hover:shadow-premium cursor-pointer'
                            : 'border-border-gray bg-white text-secondary-text hover:border-secondary-text hover:shadow-premium cursor-pointer'
                    }`}
                    type="button"
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive && !option.disabled ? option.iconColor : 'text-secondary-text'
                      }`}
                      strokeWidth={2}
                    />
                    <span className="text-sm font-semibold text-left flex-1">
                      {option.label}
                    </span>
                    {/* Matrix mode: show order badge in schema's own icon color */}
                    {matrixMode && isInMatrix && (
                      <span className={`text-base font-bold flex-shrink-0 ${option.iconColor}`}>
                        {orderLabel[matrixOrderIdx]}
                      </span>
                    )}
                    {/* Multi-select mode: dot indicator */}
                    {multiSelectMode && !option.disabled && !matrixMode && (
                      <span className="w-2 h-2 rounded-full bg-white/80 flex-shrink-0" />
                    )}
                    {/* Matrix mode, not selected: show empty circle hint in schema's own color border */}
                    {matrixMode && !isInMatrix && !option.disabled && (
                      <span className="w-4 h-4 rounded-full border-2 border-dashed border-gray-300 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Matrix mode instruction */}
            {matrixMode && (
              <p className="text-[10px] text-muted-text mt-2 text-center">
                {matrixSchemaOrder && matrixSchemaOrder.length === 0 && 'Select 2 schemas to build a matrix'}
                {matrixSchemaOrder && matrixSchemaOrder.length === 1 && 'Select 1 more schema'}
                {matrixSchemaOrder && matrixSchemaOrder.length === 2 && '✓ Matrix ready! Select 2 more for a second matrix.'}
                {matrixSchemaOrder && matrixSchemaOrder.length === 3 && 'Select 1 more for a second matrix'}
                {matrixSchemaOrder && matrixSchemaOrder.length === 4 && '✓ Double matrix ready!'}
              </p>
            )}
          </div>

          {/* Filters Section */}
          <div className="p-4 border-b border-border-gray">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-secondary-text" strokeWidth={2} />
              <h3 className="text-lg font-bold text-primary-text">Filters</h3>
            </div>

            <div className="space-y-3">
              {/* CLTV Filter */}
              <div>
                <label className="block text-xs font-semibold text-muted-text mb-1">
                  CLTV (Customer Lifetime Value)
                </label>
                <select
                  value={cltvValue}
                  onChange={(e) => onCltvChange(e.target.value)}
                  className="w-full px-2 py-2 border border-border-gray rounded-lg text-xs font-medium focus:outline-none focus:border-secondary-text bg-white text-primary-text"
                >
                  {cltvOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Elasticity Filter */}
              <div>
                <label className="block text-xs font-semibold text-muted-text mb-1">
                  Elasticity (Sensitivity)
                </label>
                <select
                  value={elasticityValue}
                  onChange={(e) => onElasticityChange(e.target.value)}
                  className="w-full px-2 py-2 border border-border-gray rounded-lg text-xs font-medium focus:outline-none focus:border-secondary-text bg-white text-primary-text"
                >
                  {elasticityOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Reset footer */}
        <div className="border-t border-border-gray bg-card-bg p-4 flex-shrink-0">
          <button
            onClick={() => {
              onFileUpload(null);
              if (inputRef.current) inputRef.current.value = '';
              onSchemaChange(null);
              onMultiSelectChange(false);
              onMatrixModeChange(false);
              onMatrixSchemaToggle('__reset__');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-red-50/50 border border-red-300 text-red-600 rounded-lg hover:bg-red-100 hover:border-red-500 hover:text-red-700 transition-all duration-300 font-medium text-xs"
            type="button"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default EngageSyncSidebar;
