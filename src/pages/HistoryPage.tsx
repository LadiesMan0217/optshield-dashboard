import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTradesWithAuth } from '../stores/useTradeStore';
import { useBalanceTransactionStore } from '../stores/useBalanceTransactionStore';
import { Trade } from '../types';
import { formatCurrency } from '../utils';
import { LoadingSpinner } from '../components/ui';
import { ControlPanel } from '../components/history/ControlPanel';
import { HistoryTable } from '../components/history/HistoryTable';
import { Pagination } from '../components/history/Pagination';
import { BottomNavigation } from '../components/dashboard/BottomNavigation';

export interface FilterState {
  searchTerm: string;
  startDate: string;
  endDate: string;
  result: 'all' | 'win' | 'loss';
  tradeType: 'all' | 'fixed_hand' | 'soros';
  sortBy: 'date' | 'result' | 'profitLoss';
  sortOrder: 'asc' | 'desc';
}

export interface DayGroup {
  date: string;
  trades: Trade[];
  totalProfitLoss: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  accumulatedBalance: number;
  hasNotes: boolean;
}

const ITEMS_PER_PAGE = 15;

export const HistoryPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { trades, loading: tradesLoading, fetchTrades } = useTradesWithAuth();
  const { getTotalBalance } = useBalanceTransactionStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    startDate: '',
    endDate: '',
    result: 'all',
    tradeType: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Fetch data when user is available
  useEffect(() => {
    if (user) {
      fetchTrades();
    }
  }, [user]); // Removido fetchTrades das dependências para evitar loop infinito

  // Filter and group trades by day
  const dayGroups = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    // Apply filters
    let filteredTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Filter by current month/year
      if (tradeDate.getMonth() !== currentMonth || tradeDate.getFullYear() !== currentYear) {
        return false;
      }

      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesDate = trade.date.includes(searchLower);
        const matchesValue = trade.entry_value?.toString().includes(searchLower);
        const matchesProfit = trade.profitLoss?.toString().includes(searchLower);
        
        if (!matchesDate && !matchesValue && !matchesProfit) {
          return false;
        }
      }

      // Date range filter
      if (filters.startDate && trade.date < filters.startDate) return false;
      if (filters.endDate && trade.date > filters.endDate) return false;

      // Result filter
      if (filters.result !== 'all' && trade.result !== filters.result) return false;

      // Trade type filter
      if (filters.tradeType !== 'all' && trade.tradeType !== filters.tradeType) return false;

      return true;
    });

    // Group by date
    const grouped = filteredTrades.reduce((acc, trade) => {
      const date = trade.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(trade);
      return acc;
    }, {} as Record<string, Trade[]>);

    // Convert to array and calculate stats
    const groups: DayGroup[] = Object.entries(grouped).map(([date, dayTrades]) => {
      const totalProfitLoss = dayTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
      const winCount = dayTrades.filter(trade => trade.result === 'win').length;
      const lossCount = dayTrades.filter(trade => trade.result === 'loss').length;
      const winRate = dayTrades.length > 0 ? (winCount / dayTrades.length) * 100 : 0;
      
      return {
        date,
        trades: dayTrades,
        totalProfitLoss,
        winCount,
        lossCount,
        winRate,
        accumulatedBalance: 0, // Will be calculated after sorting
        hasNotes: false // TODO: Implement notes check
      };
    });

    // Sort groups
    groups.sort((a, b) => {
      const aValue = filters.sortBy === 'date' ? a.date : 
                    filters.sortBy === 'result' ? a.totalProfitLoss :
                    a.totalProfitLoss;
      const bValue = filters.sortBy === 'date' ? b.date :
                    filters.sortBy === 'result' ? b.totalProfitLoss :
                    b.totalProfitLoss;
      
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    // Calculate accumulated balance
    const initialBalance = user ? getTotalBalance(user.initialBalance || 0) : 0;
    let runningBalance = initialBalance;
    
    groups.forEach(group => {
      runningBalance += group.totalProfitLoss;
      group.accumulatedBalance = runningBalance;
    });

    return groups;
  }, [trades, currentDate, filters, user]); // Removido getTotalBalance das dependências

  // Pagination
  const totalPages = Math.ceil(dayGroups.length / ITEMS_PER_PAGE);
  const paginatedGroups = dayGroups.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleMonthNavigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      startDate: '',
      endDate: '',
      result: 'all',
      tradeType: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    if (dayGroups.length === 0) return;

    const headers = ['Data', 'Placar', 'Assertividade (%)', 'Resultado do Dia', 'Saldo Acumulado'];
    const rows = dayGroups.map(group => [
      new Date(group.date + 'T12:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
      `${group.winCount}W / ${group.lossCount}L`,
      group.winRate.toFixed(1),
      formatCurrency(group.totalProfitLoss),
      formatCurrency(group.accumulatedBalance)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico-operacoes-${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleDayExpansion = (date: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const loading = authLoading || tradesLoading;

  if (loading) {
    return <LoadingSpinner text="Carregando histórico..." />;
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-white">
              Histórico de Operações
            </h1>
            <div className="text-sm text-zinc-400">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Control Panel */}
        <ControlPanel
          currentDate={currentDate}
          filters={filters}
          onMonthNavigate={handleMonthNavigate}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onExportCSV={handleExportCSV}
          totalResults={dayGroups.length}
        />

        {/* History Table */}
        <div className="mt-8">
          <HistoryTable
            dayGroups={paginatedGroups}
            expandedDays={expandedDays}
            onToggleExpansion={toggleDayExpansion}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Empty State */}
        {dayGroups.length === 0 && (
          <div className="text-center py-12">
            <div className="text-zinc-500 text-lg mb-4">
              Nenhum resultado encontrado para os filtros aplicados
            </div>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation activeTab="history" />
    </div>
  );
};

export default HistoryPage;