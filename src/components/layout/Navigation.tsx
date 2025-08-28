import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  PiggyBank, 
  BookOpen, 
  Settings, 
  BarChart3 
} from 'lucide-react';

interface NavigationItem {
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    to: '/',
    icon: LayoutDashboard,
    label: 'Dashboard'
  },
  {
    to: '/trades',
    icon: TrendingUp,
    label: 'Trades'
  },
  {
    to: '/deposits',
    icon: PiggyBank,
    label: 'Depósitos'
  },
  {
    to: '/journal',
    icon: BookOpen,
    label: 'Diário'
  },
  {
    to: '/analytics',
    icon: BarChart3,
    label: 'Análises'
  },
  {
    to: '/settings',
    icon: Settings,
    label: 'Configurações'
  }
];

interface NavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  isOpen = true, 
  onClose 
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Navigation Sidebar */}
      <nav className={`
        fixed top-0 left-0 h-full bg-slate-800 border-r border-slate-700
        transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white">
            OptiShield
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Trading Journal
          </p>
        </div>
        
        {/* Navigation Items */}
        <div className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600/20 to-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border border-transparent'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r-full" />
                    )}
                    <Icon size={20} className={`transition-colors duration-200 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span className={`font-medium transition-colors duration-200 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
        
        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-medium text-blue-400 mb-2">
              Dica do Dia
            </h3>
            <p className="text-xs text-slate-300">
              Mantenha sempre um registro detalhado de suas operações para melhorar sua performance.
            </p>
          </div>
        </div>
      </nav>
    </>
  );
};