import React from 'react';
import { Settings, Bell } from 'lucide-react';

export const DashboardHeader: React.FC = () => {
  return (
    <header className="w-full py-6 px-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Empty left space for balance */}
        <div className="flex-1"></div>
        
        {/* Centered Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm">
            <span className="text-white font-bold text-lg">OS</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight leading-none">
            Opti<span className="text-blue-400">Shield</span>
          </h1>
        </div>

        {/* Right Icons */}
        <div className="flex-1 flex justify-end items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-neutral-800/50 backdrop-blur-sm transition-all duration-200 group">
            <Settings size={20} className="text-neutral-400 group-hover:text-white" />
          </button>
          <button className="p-2 rounded-full hover:bg-neutral-800/50 backdrop-blur-sm transition-all duration-200 group">
            <Bell size={20} className="text-neutral-400 group-hover:text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};