import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react';

const UploadSection = ({ onFileUpload }) => {
  const [fileName, setFileName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileUpload(file);
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
      setFileName(file.name);
      onFileUpload(file);
    }
  };

  const handleRemoveFile = () => {
    setFileName(null);
    onFileUpload(null);
  };

  return (
    <div className="bg-card-bg rounded-2xl p-4 lg:p-5 shadow-premium-md border border-border-gray hover:shadow-premium-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-light rounded-xl flex items-center justify-center border border-border-gray shadow-premium">
          <Upload className="w-5 h-5 text-secondary-text" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm lg:text-base font-bold text-primary-text">Data Upload</h2>
          <p className="text-xs text-muted-text">Upload your pricing data file</p>
        </div>
        {fileName && (
          <div className="flex items-center gap-1.5 text-chart-green">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-semibold hidden sm:inline">Ready</span>
          </div>
        )}
      </div>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-4 lg:p-5 text-center transition-all duration-300 ${
          isDragging
            ? 'border-primary-text bg-gradient-card scale-[1.01]'
            : fileName
            ? 'border-chart-green bg-green-50/30'
            : 'border-border-gray hover:border-secondary-text hover:bg-gradient-card'
        } cursor-pointer group`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          {fileName ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gradient-success rounded-xl flex items-center justify-center shadow-premium-md flex-shrink-0">
                <FileText className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm text-primary-text font-semibold truncate">{fileName}</p>
                <p className="text-xs text-muted-text">File uploaded successfully</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gradient-light rounded-xl flex items-center justify-center border border-border-gray group-hover:scale-110 group-hover:border-primary-text transition-all duration-300 shadow-premium flex-shrink-0">
                <Upload className="w-5 h-5 text-secondary-text group-hover:text-primary-text transition-colors" strokeWidth={2} />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm text-primary-text font-semibold">Drop your file here or click to browse</p>
                <p className="text-xs text-muted-text">Supports CSV, XLSX (Max 10MB)</p>
              </div>
            </div>
          )}
        </label>
        
        {fileName && (
          <button
            onClick={handleRemoveFile}
            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-lg shadow-premium-md flex items-center justify-center hover:bg-red-50 hover:shadow-premium transition-all group/btn"
          >
            <X className="w-4 h-4 text-secondary-text group-hover/btn:text-red-500 transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadSection;
