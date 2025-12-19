import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import MainContent from '../../components/layout/MainContent';
import Header from '../../components/layout/Header';

const HealthcareApp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-50 ${isSidebarOpen ? 'w-72' : 'w-0'} md:w-72 md:block`}>
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          activeTab={"doctorslist"}
        />
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-72' : ''} md:ml-72`}>
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Main content with scrollable area */}
        <div className="flex-1 overflow-y-auto ">
          <MainContent activeTab={"Doctors List"} />
        </div>
      </div>
    </div>
  );
};

export default HealthcareApp;
