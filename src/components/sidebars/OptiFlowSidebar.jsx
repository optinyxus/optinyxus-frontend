import React, { useState } from 'react';
import { 
  X, Upload, Target, Sliders, Play, Plus, Trash2, CheckCircle2, Home, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OptiFlowSidebar = ({ 
  isOpen, 
  toggleSidebar, 
  uploadedFile,
  onFileUpload,
  selectedWorkflow,
  onWorkflowChange,
  parameters,
  onParametersChange,
  onRunOptimization
}) => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);

  const workflowOptions = [
    { id: 'process', label: 'Process Optimization', description: 'Optimize business processes' },
    { id: 'resource', label: 'Resource Allocation', description: 'Optimize resource distribution' },
    { id: 'scheduling', label: 'Scheduling Optimization', description: 'Optimize task scheduling' },
    { id: 'automation', label: 'Automation Flow', description: 'Automate repetitive tasks' },
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

  const handleParameterChange = (index, field, value) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    onParametersChange(updated);
  };

  const handleAddParameter = () => {
    onParametersChange([...parameters, { name: '', value: '100' }]);
  };

  const handleRemoveParameter = (index) => {
    if (parameters.length > 1) {
      onParametersChange(parameters.filter((_, i) => i !== index));
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className={`fixed left-0 top-0 h-screen w-[320px] bg-card-bg border-r border-border-gray overflow-y-auto z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-hover-gray"
        >
          <X className="w-5 h-5 text-secondary-text" />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-border-gray">
          <div className="flex justify-center mb-4">
            <img 
              src="/optinyxuslogo.png" 
              alt="OptiNyxus"
              className="h-12 w-auto"
            />
          </div>
          
          {/* Home Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-card border border-border-gray hover:shadow-premium-md hover:border-secondary-text transition-all duration-200 group"
          >
            <Home className="w-4 h-4 text-secondary-text group-hover:text-primary-text transition-colors" strokeWidth={2} />
            <span className="text-sm font-semibold text-secondary-text group-hover:text-primary-text transition-colors">Dashboard Home</span>
          </button>
        </div>

        {/* Data Upload */}
        <div className="p-4 border-b border-border-gray">
          <div className="flex items-center gap-2 mb-3">
            <Upload className="w-4 h-4 text-secondary-text" strokeWidth={2} />
            <h3 className="text-sm font-bold text-primary-text">Workflow Data Upload</h3>
          </div>
          <p className="text-xs text-muted-text mb-3">Upload your workflow data file</p>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 ${
              isDragging
                ? 'border-primary-text bg-gradient-card'
                : uploadedFile
                ? 'border-green-300 bg-green-50/30'
                : 'border-border-gray hover:border-secondary-text hover:bg-gradient-card'
            } cursor-pointer`}
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
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-chart-green flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-primary-text font-semibold block truncate">{uploadedFile}</span>
                    <span className="text-xs text-muted-text">File uploaded successfully</span>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-muted-text mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-xs text-primary-text font-medium mb-1">Drop your file here or click to browse</p>
                  <p className="text-[10px] text-muted-text">Supports CSV, XLSX (Max 10MB)</p>
                </div>
              )}
            </label>
            
            {uploadedFile && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-premium flex items-center justify-center hover:bg-red-50 transition-colors border border-border-gray"
              >
                <X className="w-4 h-4 text-secondary-text hover:text-red-500" />
              </button>
            )}
          </div>
        </div>

        {/* Workflow Type */}
        <div className="p-4 border-b border-border-gray">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-secondary-text" strokeWidth={2} />
            <h3 className="text-sm font-bold text-primary-text">Workflow Type</h3>
          </div>
          <p className="text-xs text-muted-text mb-3">Choose your optimization target</p>
          
          <div className="space-y-2">
            {workflowOptions.map((option) => (
              <label
                key={option.id}
                onClick={() => onWorkflowChange(option.id)}
                className={`flex items-start gap-2 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                  selectedWorkflow === option.id
                    ? 'border-primary-text bg-gradient-card shadow-premium'
                    : 'border-transparent hover:bg-hover-gray'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  selectedWorkflow === option.id
                    ? 'border-primary-text bg-primary-text'
                    : 'border-border-gray'
                }`}>
                  {selectedWorkflow === option.id && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-primary-text">{option.label}</div>
                  <p className="text-xs text-muted-text leading-tight mt-0.5">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div className="p-4 border-b border-border-gray">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-secondary-text" strokeWidth={2} />
              <h3 className="text-sm font-bold text-primary-text">Parameters</h3>
            </div>
            <button
              onClick={handleAddParameter}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-chart-green hover:bg-green-600 text-white transition-colors shadow-premium"
              title="Add Parameter"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
          <p className="text-xs text-muted-text mb-3">Set workflow parameters</p>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {parameters.map((parameter, index) => (
              <div key={index} className="border-2 border-border-gray rounded-xl p-3 bg-gradient-light hover:border-secondary-text transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-primary-text">Parameter {index + 1}</span>
                  {parameters.length > 1 && (
                    <button
                      onClick={() => handleRemoveParameter(index)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-secondary-text hover:text-red-500" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] text-muted-text mb-1 font-medium">Parameter Name</label>
                    <input
                      type="text"
                      value={parameter.name}
                      onChange={(e) => handleParameterChange(index, 'name', e.target.value)}
                      placeholder="Enter parameter name"
                      className="w-full px-3 py-2 border border-border-gray rounded-lg text-xs font-medium focus:outline-none focus:border-secondary-text focus:shadow-premium bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] text-muted-text mb-1 font-medium">Value</label>
                    <input
                      type="number"
                      value={parameter.value}
                      onChange={(e) => handleParameterChange(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 border border-border-gray rounded-lg text-xs font-medium focus:outline-none focus:border-secondary-text focus:shadow-premium bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Run Button */}
        <div className="p-4">
          <button
            onClick={onRunOptimization}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-success text-white rounded-xl hover:shadow-premium-xl transition-all duration-300 transform hover:scale-[1.02] font-bold text-sm shadow-premium-lg"
          >
            <Play className="w-5 h-5 fill-white" strokeWidth={0} />
            <span>Run Workflow Optimization</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default OptiFlowSidebar;
