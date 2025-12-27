import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import MarketEdgeSidebar from '../../components/sidebars/MarketEdgeSidebar';
import { TrendingUp, Users, Target, BarChart3 } from 'lucide-react';

const MarketEdge = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState('market_data_sample.csv');
  const [selectedMarket, setSelectedMarket] = useState('regional');
  const [competitors, setCompetitors] = useState([
    { name: 'Competitor A', market_share: '15' },
  ]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleRunAnalysis = () => {
    console.log('Running market analysis...');
    // Add your analysis logic here
  };

  const metrics = [
    { label: 'Market Share', value: '32.5%', change: '+2.3%', icon: Target },
    { label: 'Competitors', value: '24', change: '+3', icon: Users },
    { label: 'Growth Rate', value: '18.2%', change: '+5.1%', icon: TrendingUp },
    { label: 'Market Size', value: '$2.4B', change: '+12%', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-main-bg">
      <MarketEdgeSidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        uploadedFile={uploadedFile}
        onFileUpload={setUploadedFile}
        selectedMarket={selectedMarket}
        onMarketChange={setSelectedMarket}
        competitors={competitors}
        onCompetitorsChange={setCompetitors}
        onRunAnalysis={handleRunAnalysis}
      />
      <Navbar toggleSidebar={toggleSidebar} showMenuButton={true} currentProduct="marketedge" />
      
      <div className="lg:ml-[320px] pt-16">
        <div className="p-4 sm:p-6 space-y-5">
          <div className="bg-card-bg rounded-2xl p-6 shadow-premium-md border border-border-gray">
            <h1 className="text-2xl font-bold text-primary-text mb-2">MarketEdge Intelligence</h1>
            <p className="text-muted-text">Market analysis and competitive intelligence platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-card-bg rounded-2xl p-5 shadow-premium-md border border-border-gray hover:shadow-premium-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-light border border-border-gray flex items-center justify-center">
                    <metric.icon className="w-6 h-6 text-secondary-text" strokeWidth={2} />
                  </div>
                  <div className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-semibold">
                    {metric.change}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-primary-text mb-1">{metric.value}</h3>
                <p className="text-sm text-muted-text">{metric.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-card-bg rounded-2xl p-12 shadow-premium-md border border-border-gray text-center">
            <div className="w-20 h-20 bg-gradient-light rounded-2xl flex items-center justify-center mx-auto mb-6 border border-border-gray">
              <Target className="w-10 h-10 text-secondary-text" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold text-primary-text mb-3">Market Analysis Results</h2>
            <p className="text-muted-text max-w-md mx-auto">
              Configure your analysis parameters in the sidebar and click "Run Market Analysis" to see results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketEdge;
