import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClockIcon, Settings } from 'lucide-react';

interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab = 'dashboard',
  onTabChange
}) => {
  const navigate = useNavigate();
  
  const navigationItems = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      action: () => navigate('/')
    },
    {
      id: 'history',
      icon: ClockIcon,
      label: 'Histórico',
      action: () => navigate('/history')
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Configurações',
      action: () => navigate('/settings')
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900/50 backdrop-blur-lg border-t border-neutral-700 z-40">
      <div className="flex items-center justify-around py-2 max-w-md mx-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-400 hover:text-neutral-300'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${
                isActive ? 'text-white' : 'text-neutral-400'
              }`} />
              <span className={`text-xs font-medium ${
                isActive ? 'text-white' : 'text-neutral-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};