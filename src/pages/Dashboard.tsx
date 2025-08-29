import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTradesWithAuth } from '../stores/useTradeStore';
import { useDepositsWithAuth } from '../stores/useDepositStore';
import { useBalanceTransactionStore } from '../stores/useBalanceTransactionStore';
import { useNotesWithAuth } from '../stores/useNoteStore';
import { formatCurrency, formatPercentage, calculateDayStats, calculatePeriodStats, generateCalendarDays, getPeriodDates } from '../utils';
import { PeriodFilter, CalendarDay } from '../types';
import {
  DashboardHeader,
  PeriodSummary,
  TradeCalendar,
  BottomNavigation,
  FloatingButton,
  ExpandableMenu
} from '../components/dashboard';
import { JournalModal, DepositModal, DepositHistoryModal, LoginRequiredModal, BalanceManagerModal } from '../components/modals';
import { LoadingSpinner } from '../components/ui';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { trades, loading: tradesLoading, fetchTrades } = useTradesWithAuth();
  const { deposits, loading: depositsLoading, fetchDeposits } = useDepositsWithAuth();
  const { transactions, fetchTransactions, getTotalBalance } = useBalanceTransactionStore();
  const { notes, loading: notesLoading, fetchNotes } = useNotesWithAuth();
  
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  
  // Modal states
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isDepositHistoryModalOpen, setIsDepositHistoryModalOpen] = useState(false);
  const [isBalanceManagerOpen, setIsBalanceManagerOpen] = useState(false);
  const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] = useState(false);
  const [isExpandableMenuOpen, setIsExpandableMenuOpen] = useState(false);
  const [loginRequiredMessage, setLoginRequiredMessage] = useState('');

  // Fetch data when user is available
  useEffect(() => {
    if (user) {
      fetchTrades();
      fetchDeposits();
      fetchTransactions(user.id);
      fetchNotes();
    }
  }, [user]);

  // Generate calendar days when data changes
  useEffect(() => {
    const days = generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
    setCalendarDays(days);
  }, [currentDate]);

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!trades || trades.length === 0) {
      return null;
    }
    
    const { start, end } = getPeriodDates(currentDate, selectedPeriod);
    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];
    
    const result = calculatePeriodStats(trades, startDate, endDate);
    
    return result;
  }, [trades, selectedPeriod, currentDate]);

  const loading = authLoading || tradesLoading || depositsLoading || notesLoading;

  // Calcular saldo total e lucro mensal conforme documentação
  // Saldo Total = (Depósitos - Saques) + Lucro/Prejuízo das Operações
  const balanceFromTransactions = user ? getTotalBalance(user.initialBalance || 0) : 0;
  const totalProfitLoss = trades ? trades.reduce((total, trade) => total + (trade.profitLoss || 0), 0) : 0;
  const totalBalance = balanceFromTransactions + totalProfitLoss;
  const monthlyProfit = stats?.netResult || 0;

  // Handle quick actions
  const handleQuickAction = (action: 'journal' | 'deposit' | 'analytics') => {
    if (!user) {
      setLoginRequiredMessage(
        action === 'journal' 
          ? 'Você precisa estar logado para acessar o journal de trades.'
          : action === 'deposit'
          ? 'Você precisa estar logado para registrar depósitos e saques.'
          : 'Você precisa estar logado para ver as análises detalhadas.'
      );
      setIsLoginRequiredModalOpen(true);
      return;
    }

    switch (action) {
      case 'journal':
        setIsJournalModalOpen(true);
        break;
      case 'deposit':
        setIsDepositModalOpen(true);
        break;
      case 'analytics':
        // TODO: Implement analytics modal or page
        console.log('Analytics feature coming soon!');
        break;
    }
  };

  const handleTabChange = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        // Already on dashboard
        break;
      case 'deposits':
        setIsDepositModalOpen(true);
        break;
      case 'deposit-history':
        setIsDepositHistoryModalOpen(true);
        break;
      case 'settings':
        // TODO: Implement settings modal or page
        console.log('Settings feature coming soon!');
        break;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Carregando dashboard..." />;
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'weekly': return 'Semanal';
      case 'biweekly': return 'Quinzenal';
      case 'monthly': return 'Mensal';
      default: return 'Mensal';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <DashboardHeader />
      
      {/* Main Content */}
      <div className="px-6 pb-24">
        {/* Period Summary */}
        <PeriodSummary 
          monthlyProfit={monthlyProfit}
          totalBalance={totalBalance}
          winRate={stats?.winRate || 0}
          averageRisk={stats?.averageRisk || 0}
          totalTrades={stats?.totalTrades || 0}
          period={getPeriodLabel()}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />

        {/* Calendar and Daily Summary Panel - Master-Detail Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar - Master View */}
          <div className="flex-1">
            <TradeCalendar
              trades={trades}
              currentDate={currentDate}
              selectedPeriod={selectedPeriod}
              onMonthNavigate={(direction) => {
                const newDate = new Date(currentDate);
                if (direction === 'prev') {
                  newDate.setMonth(newDate.getMonth() - 1);
                } else {
                  newDate.setMonth(newDate.getMonth() + 1);
                }
                setCurrentDate(newDate);
              }}
              onDayClick={(day, event) => {
                // Extrair a data do dia clicado
                const dayNumber = day.day.replace(/[^0-9]/g, '');
                
                if (dayNumber && !day.day.startsWith('-') && !day.day.startsWith('+')) {
                  const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(dayNumber));
                  const dateStr = selectedDate.toISOString().split('T')[0];
                  
                  // Navegar diretamente para TradeRegistration
                  navigate(`/trade-registration?date=${dateStr}`);
                }
              }}
            />
          </div>

        </div>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab="dashboard" />
        
        {/* Expandable Menu */}
        <ExpandableMenu
          isOpen={isExpandableMenuOpen}
          onClose={() => {
            console.log('Closing expandable menu');
            setIsExpandableMenuOpen(false);
          }}
          onTabChange={handleTabChange}
          onOpenBalanceManager={() => setIsBalanceManagerOpen(true)}
        />
        
        {/* Floating Button */}
         <FloatingButton onClick={() => setIsExpandableMenuOpen(true)} />
      </div>
      
      {/* Modals */}
      <JournalModal 
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
      />
      
      <DepositModal 
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
      
      <DepositHistoryModal 
        isOpen={isDepositHistoryModalOpen}
        onClose={() => setIsDepositHistoryModalOpen(false)}
      />
      
      <LoginRequiredModal 
        isOpen={isLoginRequiredModalOpen}
        onClose={() => setIsLoginRequiredModalOpen(false)}
        message={loginRequiredMessage}
      />
      
              <BalanceManagerModal 
        isOpen={isBalanceManagerOpen}
        onClose={() => setIsBalanceManagerOpen(false)}
      />
    </div>
  );
};