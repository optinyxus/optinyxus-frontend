import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import OptiFlowSidebar from '../../components/sidebars/OptiFlowSidebar';
import { Activity, Zap, TrendingUp, Clock } from 'lucide-react';

const OptiFlow = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState('workflow_data_sample.csv');
  const [selectedWorkflow, setSelectedWorkflow] = useState('process');
  const [parameters, setParameters] = useState([
    { name: 'Efficiency Target', value: '90' },
  ]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleRunOptimization = () => {
    console.log('Running workflow optimization...');
    // Add your optimization logic here
  };

  const workflows = [
    { name: 'Order Processing', status: 'Active', efficiency: '94%', icon: Activity },
    { name: 'Inventory Management', status: 'Active', efficiency: '89%', icon: TrendingUp },
    { name: 'Customer Onboarding', status: 'Running', efficiency: '97%', icon: Zap },
    { name: 'Quality Control', status: 'Active', efficiency: '92%', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-main-bg">
      <OptiFlowSidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        uploadedFile={uploadedFile}
        onFileUpload={setUploadedFile}
        selectedWorkflow={selectedWorkflow}
        onWorkflowChange={setSelectedWorkflow}
        parameters={parameters}
        onParametersChange={setParameters}
        onRunOptimization={handleRunOptimization}
      />
      <Navbar toggleSidebar={toggleSidebar} showMenuButton={true} currentProduct="optiflow" />
      
      <div className="lg:ml-[320px] pt-16">
        <div className="p-4 sm:p-6 space-y-5">
          <div className="bg-card-bg rounded-2xl p-6 shadow-premium-md border border-border-gray">
            <h1 className="text-2xl font-bold text-primary-text mb-2">OptiFlow Automation</h1>
            <p className="text-muted-text">Workflow optimization and process automation platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map((workflow, index) => (
              <div key={index} className="bg-card-bg rounded-2xl p-6 shadow-premium-md border border-border-gray hover:shadow-premium-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-light border border-border-gray flex items-center justify-center">
                      <workflow.icon className="w-6 h-6 text-secondary-text" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary-text">{workflow.name}</h3>
                      <p className="text-xs text-muted-text">{workflow.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-chart-green">{workflow.efficiency}</div>
                    <div className="text-xs text-muted-text">Efficiency</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-success h-2 rounded-full transition-all duration-500"
                    style={{ width: workflow.efficiency }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card-bg rounded-2xl p-12 shadow-premium-md border border-border-gray text-center">
            <div className="w-20 h-20 bg-gradient-light rounded-2xl flex items-center justify-center mx-auto mb-6 border border-border-gray">
              <Activity className="w-10 h-10 text-secondary-text" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold text-primary-text mb-3">Workflow Optimization Results</h2>
            <p className="text-muted-text max-w-md mx-auto">
              Configure your workflow parameters in the sidebar and click "Run Workflow Optimization" to see results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptiFlow;
