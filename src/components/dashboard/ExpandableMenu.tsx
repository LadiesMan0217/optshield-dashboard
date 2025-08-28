import React from 'react';
import { X, BarChart3, PiggyBank, Settings, TrendingUp, History, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExpandableMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onTabChange?: (tab: string) => void;
  onOpenBalanceManager?: () => void;
}

export const ExpandableMenu: React.FC<ExpandableMenuProps> = ({
  isOpen,
  onClose,
  onTabChange,
  onOpenBalanceManager
}) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'trade',
      icon: BarChart3,
      label: 'Registrar',
      action: () => {
        navigate('/trade-registration');
        onClose();
      }
    },
    {
      id: 'soros',
      icon: TrendingUp,
      label: 'Soros',
      action: () => {
        navigate('/soros');
        onClose();
      }
    },
    {
      id: 'balance-manager',
      icon: Wallet,
      label: 'Gerenciar Caixa',
      action: () => {
        onOpenBalanceManager?.();
        onClose();
      }
    },
    {
      id: 'deposit-history',
      icon: History,
      label: 'Histórico',
      action: () => {
        onTabChange?.('deposit-history');
        onClose();
      }
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Configurações',
      action: () => {
        onTabChange?.('settings');
        onClose();
      }
    }
  ];

  console.log('ExpandableMenu render - isOpen:', isOpen);
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out">
        <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/50 rounded-2xl p-6 shadow-2xl shadow-black/50 min-w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Menu</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800/50 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
          
          {/* Menu Items */}
          <div className="space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center space-x-4 p-4 rounded-xl bg-neutral-800/30 hover:bg-neutral-700/50 border border-neutral-700/30 hover:border-neutral-600/50 transition-all duration-200 group"
                >
                  <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 group-hover:bg-blue-600/30 transition-colors duration-200">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-white font-medium group-hover:text-blue-100 transition-colors duration-200">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};