import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ toggleSidebar }) => (
  <header className="bg-white shadow-sm md:hidden">
    <div className="p-4 flex items-center justify-between">
      <button 
        className="p-2 hover:bg-gray-100 rounded-lg"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <h1 className="text-xl font-bold">
        <span className="text-blue-600">Health</span>
        <span className="text-green-500">Care</span>
      </h1>
    </div>
  </header>
);

export default Header;