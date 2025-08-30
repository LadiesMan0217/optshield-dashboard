import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PeriodSummary } from '../components/dashboard/PeriodSummary';
import { BalanceManagerModal } from '../components/dashboard/BalanceManagerModal';
import { Plus } from 'lucide-react';
import { PeriodFilter } from '../types';
import { BottomNavigation } from '../components/dashboard/BottomNavigation';
import InteractiveCalendar from '../components/dashboard/InteractiveCalendar';
import { useTradesWithAuth } from '../stores/useTradeStore';
import { useBalanceTransactionsWithAuth } from '../stores/useBalanceTransactionStore';
import { useAuth } from '../hooks/useAuth';
import { calculatePeriodStats, getPeriodDates } from '../utils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { trades, fetchTrades } = useTradesWithAuth();
  const { getTotalBalance } = useBalanceTransactionsWithAuth();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  useEffect(() => {
    if (user) {
      // Fetches all trades for the user, which is needed for total balance calculation
      fetchTrades();
    }
  }, [user, fetchTrades]);

  const { periodStats, totalBalance } = useMemo(() => {
    const { start, end } = getPeriodDates(currentDate, selectedPeriod);
    const startDateStr = format(start, 'yyyy-MM-dd');
    const endDateStr = format(end, 'yyyy-MM-dd');

    const stats = calculatePeriodStats(trades, startDateStr, endDateStr);

    // Calcula o lucro total de todos os trades
    const totalProfitFromAllTrades = trades.reduce((acc, trade) => {
      const profit = trade.profitLoss || 0;
      return acc + (isNaN(profit) ? 0 : profit);
    }, 0);
    
    // Obtém o saldo base das transações de depósito/saque
    const initialBalance = user?.initialBalance || 0;
    const baseBalance = getTotalBalance(isNaN(initialBalance) ? 0 : initialBalance);
    
    // Calcula o saldo total final
    const finalTotalBalance = (isNaN(baseBalance) ? 0 : baseBalance) + totalProfitFromAllTrades;

    return { 
      periodStats: stats, 
      totalBalance: isNaN(finalTotalBalance) ? 0 : finalTotalBalance 
    };
  }, [trades, currentDate, selectedPeriod, user, getTotalBalance]);

  const handlePeriodChange = (period: PeriodFilter) => {
    setSelectedPeriod(period);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="transition-all duration-300 pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-8">
            <PeriodSummary 
              monthlyProfit={periodStats.netResult}
              totalBalance={totalBalance}
              winRate={periodStats.winRate}
              averageRisk={periodStats.averageRisk}
              totalTrades={periodStats.totalTrades}
              period={format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
            />
          </div>
          
          <div>
            <InteractiveCalendar trades={trades} />
          </div>

        </div>
      </div>
      
      <div className="fixed bottom-24 right-6 z-50">
        {showFabMenu && (
          <div className="absolute bottom-16 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2 min-w-[200px]">
            <button 
              className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 rounded-lg transition-colors duration-200 flex items-center gap-3"
              onClick={() => { window.location.href = '/trade-registration'; }}
            >
              <span>📈</span>
              Registrar Trade
            </button>
            <button 
              className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 rounded-lg transition-colors duration-200 flex items-center gap-3"
              onClick={() => { window.location.href = '/soros-simulation'; }}
            >
              <span>🎯</span>
              Simulação Soros
            </button>
            <button 
              className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 rounded-lg transition-colors duration-200 flex items-center gap-3"
              onClick={() => {
                setShowFabMenu(false);
                setShowBalanceModal(true);
              }}
            >
              <span>💰</span>
              Gestão de Depósito
            </button>
          </div>
        )}
        
        <button
          onClick={() => setShowFabMenu(!showFabMenu)}
          className={`w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
            showFabMenu ? 'rotate-45' : 'rotate-0'
          }`}
        >
          <Plus className="w-6 h-6 transition-transform duration-300" />
        </button>
      </div>

      <BalanceManagerModal 
        isOpen={showBalanceModal} 
        onClose={() => setShowBalanceModal(false)} 
      />
      
      <BottomNavigation activeTab="dashboard" />
    </div>
  );
};

export default Dashboard;
