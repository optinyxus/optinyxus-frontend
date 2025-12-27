import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';

const DashboardLayout = ({ children, currentProduct, showSidebar = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-main-bg">
      <Navbar 
        toggleSidebar={toggleSidebar} 
        showMenuButton={showSidebar}
        currentProduct={currentProduct}
      />
      
      <div className={`${showSidebar ? 'lg:ml-[280px]' : ''} pt-16`}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
