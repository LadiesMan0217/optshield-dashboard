import React, { useState } from 'react'
import { ChevronDown, Eye, EyeOff, Settings, LogOut, Sun, Moon, User, Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useThemeContext } from '../../contexts/ThemeContext'
import { Button } from '../ui/Button'
import { formatCurrency } from '../../utils'
import { useBalanceTransactionStore } from '../../stores/useBalanceTransactionStore'
import { useTradesWithAuth } from '../../stores/useTradeStore'

interface HeaderProps {
  onMenuClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, signOut } = useAuth()
  const { isDarkMode, toggleTheme } = useThemeContext()
  const { getTotalBalance } = useBalanceTransactionStore()
  const { trades } = useTradesWithAuth()
  const [showBalance, setShowBalance] = useState(!user?.hide_balance)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Calcular saldo total conforme documentação: (Depósitos - Saques) + Lucro/Prejuízo das Operações
  const balanceFromTransactions = user ? user.initial_balance + getTotalBalance() : 0
  const totalProfitLoss = trades ? trades.reduce((total, trade) => total + (trade.profitLoss || 0), 0) : 0
  const totalBalance = balanceFromTransactions + totalProfitLoss

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const toggleBalance = () => {
    setShowBalance(!showBalance)
  }

  return (
    <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Mobile Menu Button */}
        <div className="flex items-center">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-full hover:bg-slate-700 transition-all duration-200 mr-4"
            >
              <Menu size={20} className="text-slate-400 hover:text-white" />
            </button>
          )}
        </div>

        {/* Centered Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">OS</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Opti<span className="text-blue-500">Shield</span>
          </h1>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-3">
          {user && (
            <>
              {/* Balance Display */}
              <div className="hidden sm:flex items-center space-x-3 bg-slate-800 rounded-xl px-4 py-2 border border-slate-700">
                <button
                  onClick={toggleBalance}
                  className="p-2 rounded-full hover:bg-slate-700 transition-all duration-200 group"
                >
                  {showBalance ? (
                    <EyeOff size={16} className="text-slate-400 group-hover:text-white" />
                  ) : (
                    <Eye size={16} className="text-slate-400 group-hover:text-white" />
                  )}
                </button>
                <div className="text-sm">
                  <span className="text-slate-400">Saldo:</span>
                  <span className="ml-2 font-semibold text-white">
                    {showBalance 
                      ? formatCurrency(totalBalance, user.currency)
                      : '••••••'
                    }
                  </span>
                </div>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-slate-700 transition-all duration-200 group"
                >
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.display_name || user.email}
                      className="w-8 h-8 rounded-full border-2 border-slate-600 group-hover:border-blue-500 transition-colors"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <User className="w-4 h-4 text-slate-300 group-hover:text-white" />
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm text-slate-300 group-hover:text-white transition-colors">
                    {user.display_name || user.email}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-all duration-200 group-hover:rotate-180" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-slate-700 bg-slate-750">
                        <p className="text-sm font-semibold text-white">
                          {user.display_name || 'Usuário'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{user.email}</p>
                      </div>
                      
                      <button className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center space-x-3 transition-all duration-200">
                        <Settings className="w-4 h-4" />
                        <span>Configurações</span>
                      </button>
                      
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center space-x-3 transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-700 transition-all duration-200 group"
            title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
          >
            {isDarkMode ? (
              <Sun size={20} className="text-slate-400 group-hover:text-yellow-400 transition-colors" />
            ) : (
              <Moon size={20} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Balance */}
      {user && (
        <div className="sm:hidden mt-3 flex items-center justify-center space-x-2 bg-zinc-800 rounded-lg px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            icon={showBalance ? EyeOff : Eye}
            onClick={toggleBalance}
            className="p-1 h-auto"
          />
          <div className="text-sm">
            <span className="text-zinc-400">Saldo:</span>
            <span className="ml-1 font-semibold text-white">
              {showBalance 
                ? formatCurrency(totalBalance, user.currency)
                : '••••••'
              }
            </span>
          </div>
        </div>
      )}
    </header>
  )
}