import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import EngageSyncSidebar from '../../components/sidebars/EngageSyncSidebar';
import { Zap, MessageSquare, Users, Mail } from 'lucide-react';

const EngageSync = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState('customer_data_sample.csv');
  const [selectedCampaign, setSelectedCampaign] = useState('email');
  const [channels, setChannels] = useState([
    { name: 'Email Newsletter', audience: '5000' },
  ]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLaunchCampaign = () => {
    console.log('Launching campaign...');
    // Add your campaign logic here
  };

  const channelStats = [
    { name: 'Email Campaigns', active: 12, sent: '24.5K', icon: Mail },
    { name: 'Chat Support', active: 8, sent: '18.2K', icon: MessageSquare },
    { name: 'Customer Portal', active: 156, sent: '45.8K', icon: Users },
    { name: 'Notifications', active: 24, sent: '32.1K', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-main-bg">
      <EngageSyncSidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        uploadedFile={uploadedFile}
        onFileUpload={setUploadedFile}
        selectedCampaign={selectedCampaign}
        onCampaignChange={setSelectedCampaign}
        channels={channels}
        onChannelsChange={setChannels}
        onLaunchCampaign={handleLaunchCampaign}
      />
      <Navbar toggleSidebar={toggleSidebar} showMenuButton={true} currentProduct="engagesync" />
      
      <div className="lg:ml-[320px] pt-16">
        <div className="p-4 sm:p-6 space-y-5">
          <div className="bg-card-bg rounded-2xl p-6 shadow-premium-md border border-border-gray">
            <h1 className="text-2xl font-bold text-primary-text mb-2">EngageSync Hub</h1>
            <p className="text-muted-text">Customer engagement and communication synchronization</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channelStats.map((channel, index) => (
              <div key={index} className="bg-card-bg rounded-2xl p-6 shadow-premium-md border border-border-gray hover:shadow-premium-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-light border border-border-gray flex items-center justify-center">
                      <channel.icon className="w-6 h-6 text-secondary-text" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary-text">{channel.name}</h3>
                      <p className="text-xs text-muted-text">{channel.active} Active</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-semibold">
                    Live
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-primary-text">{channel.sent}</div>
                    <div className="text-xs text-muted-text">Messages Sent</div>
                  </div>
                  <div className="text-sm text-chart-green font-semibold">+12.5%</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card-bg rounded-2xl p-12 shadow-premium-md border border-border-gray text-center">
            <div className="w-20 h-20 bg-gradient-light rounded-2xl flex items-center justify-center mx-auto mb-6 border border-border-gray">
              <Zap className="w-10 h-10 text-secondary-text" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold text-primary-text mb-3">Campaign Results</h2>
            <p className="text-muted-text max-w-md mx-auto">
              Configure your campaign settings in the sidebar and click "Launch Campaign" to start
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngageSync;
