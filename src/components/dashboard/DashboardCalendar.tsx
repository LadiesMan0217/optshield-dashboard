import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Trade } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils';

type PeriodFilter = 'weekly' | 'biweekly' | 'monthly';

interface CalendarDay {
  dayOfMonth: number;
  isCurrentMonth: boolean;
  stats?: {
    totalTrades: number;
    netResult: number;
    winRate: number;
    avgRisk: number;
  };
  hasNote?: boolean;
  fullDate: Date;
}

interface DashboardCalendarProps {
  selectedPeriod: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
  onMonthNavigate: (direction: 'prev' | 'next') => void;
  trades?: Trade[];
  notes?: any[];
}

export const DashboardCalendar: React.FC<DashboardCalendarProps> = ({
  selectedPeriod,
  onPeriodChange,
  onMonthNavigate,
  trades = [],
  notes = []
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    return startOfWeek;
  });
  const [currentBiweeklyStart, setCurrentBiweeklyStart] = useState(() => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const isFirstHalf = dayOfMonth <= 15;
    return new Date(today.getFullYear(), today.getMonth(), isFirstHalf ? 1 : 16);
  });
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<CalendarDay | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  
  // Generate calendar days based on selected period
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const days: CalendarDay[] = [];
    
    switch (selectedPeriod) {
      case 'weekly': {
        // Show current week (7 days) based on currentWeekStart
        for (let i = 0; i < 7; i++) {
          const currentDay = new Date(currentWeekStart);
          currentDay.setDate(currentWeekStart.getDate() + i);
          
          const dayString = currentDay.toISOString().split('T')[0];
          
          // Filter trades for this specific day
          const dayTrades = trades.filter(trade => {
            const tradeDate = trade.date instanceof Date 
              ? trade.date.toISOString().split('T')[0]
              : new Date(trade.date.seconds * 1000).toISOString().split('T')[0];
            return tradeDate === dayString;
          });
          
          // Calculate stats for this day
          const dayStats = dayTrades.length > 0 ? {
            totalTrades: dayTrades.length,
            netResult: dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0),
            winRate: (dayTrades.filter(trade => trade.profitLoss > 0).length / dayTrades.length) * 100,
            avgRisk: dayTrades.reduce((sum, trade) => sum + (trade.riskAmount || 0), 0) / dayTrades.length
          } : undefined;
          
          // Check if there are notes for this day
          const hasNote = notes.some(note => {
            const noteDate = note.date instanceof Date 
              ? note.date.toISOString().split('T')[0]
              : new Date(note.date.seconds * 1000).toISOString().split('T')[0];
            return noteDate === dayString;
          });
          
          days.push({
            dayOfMonth: currentDay.getDate(),
            isCurrentMonth: currentDay.getMonth() === today.getMonth(),
            stats: dayStats,
            hasNote,
            fullDate: new Date(currentDay)
          });
        }
        break;
      }
        
      case 'biweekly': {
        // Show current half of month (15 days) based on currentBiweeklyStart
        for (let i = 0; i < 15; i++) {
          const currentDay = new Date(currentBiweeklyStart);
          currentDay.setDate(currentBiweeklyStart.getDate() + i);
          
          const dayString = currentDay.toISOString().split('T')[0];
          
          // Filter trades for this specific day
          const dayTrades = trades.filter(trade => {
            const tradeDate = trade.date instanceof Date 
              ? trade.date.toISOString().split('T')[0]
              : new Date(trade.date.seconds * 1000).toISOString().split('T')[0];
            return tradeDate === dayString;
          });
          
          // Calculate stats for this day
          const dayStats = dayTrades.length > 0 ? {
            totalTrades: dayTrades.length,
            netResult: dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0),
            winRate: (dayTrades.filter(trade => trade.profitLoss > 0).length / dayTrades.length) * 100,
            avgRisk: dayTrades.reduce((sum, trade) => sum + (trade.riskAmount || 0), 0) / dayTrades.length
          } : undefined;
          
          // Check if there are notes for this day
          const hasNote = notes.some(note => {
            const noteDate = note.date instanceof Date 
              ? note.date.toISOString().split('T')[0]
              : new Date(note.date.seconds * 1000).toISOString().split('T')[0];
            return noteDate === dayString;
          });
          
          days.push({
            dayOfMonth: currentDay.getDate(),
            isCurrentMonth: currentDay.getMonth() === month,
            stats: dayStats,
            hasNote,
            fullDate: new Date(currentDay)
          });
        }
        break;
      }
        
      case 'monthly':
      default: {
        // Show full month with proper weekday alignment
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Add days from previous month to fill the first week
        const prevMonth = new Date(year, month, 0);
        const prevMonthLastDay = prevMonth.getDate();
        
        for (let i = firstDayWeekday - 1; i >= 0; i--) {
          const dayNum = prevMonthLastDay - i;
          const prevMonthDate = new Date(year, month - 1, dayNum);
          const dayString = prevMonthDate.toISOString().split('T')[0];
          
          // Filter trades for this specific day
          const dayTrades = trades.filter(trade => {
            const tradeDate = trade.date instanceof Date 
              ? trade.date.toISOString().split('T')[0]
              : new Date(trade.date.seconds * 1000).toISOString().split('T')[0];
            return tradeDate === dayString;
          });
          
          // Calculate stats for this day
          const dayStats = dayTrades.length > 0 ? {
            totalTrades: dayTrades.length,
            netResult: dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0),
            winRate: (dayTrades.filter(trade => trade.profitLoss > 0).length / dayTrades.length) * 100,
            avgRisk: dayTrades.reduce((sum, trade) => sum + (trade.riskAmount || 0), 0) / dayTrades.length
          } : undefined;
          
          // Check if there are notes for this day
          const hasNote = notes.some(note => {
            const noteDate = note.date instanceof Date 
              ? note.date.toISOString().split('T')[0]
              : new Date(note.date.seconds * 1000).toISOString().split('T')[0];
            return noteDate === dayString;
          });
          
          days.push({
            dayOfMonth: dayNum,
            isCurrentMonth: false,
            stats: dayStats,
            hasNote,
            fullDate: new Date(prevMonthDate)
          });
        }
        
        // Add all days of current month
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
          const currentDay = new Date(year, month, day);
          const dayString = currentDay.toISOString().split('T')[0];
          
          // Filter trades for this specific day
          const dayTrades = trades.filter(trade => {
            const tradeDate = trade.date instanceof Date 
              ? trade.date.toISOString().split('T')[0]
              : new Date(trade.date.seconds * 1000).toISOString().split('T')[0];
            return tradeDate === dayString;
          });
          
          // Calculate stats for this day
          const dayStats = dayTrades.length > 0 ? {
            totalTrades: dayTrades.length,
            netResult: dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0),
            winRate: (dayTrades.filter(trade => trade.profitLoss > 0).length / dayTrades.length) * 100,
            avgRisk: dayTrades.reduce((sum, trade) => sum + (trade.riskAmount || 0), 0) / dayTrades.length
          } : undefined;
          
          // Check if there are notes for this day
          const hasNote = notes.some(note => {
            const noteDate = note.date instanceof Date 
              ? note.date.toISOString().split('T')[0]
              : new Date(note.date.seconds * 1000).toISOString().split('T')[0];
            return noteDate === dayString;
          });
          
          days.push({
            dayOfMonth: day,
            isCurrentMonth: true,
            stats: dayStats,
            hasNote,
            fullDate: new Date(currentDay)
          });
        }
        
        // Add days from next month to complete the grid (42 total cells = 6 weeks)
        const totalCells = 42;
        const remainingCells = totalCells - days.length;
        
        for (let day = 1; day <= remainingCells; day++) {
          const nextMonthDate = new Date(year, month + 1, day);
          const dayString = nextMonthDate.toISOString().split('T')[0];
          
          // Filter trades for this specific day
          const dayTrades = trades.filter(trade => {
            const tradeDate = trade.date instanceof Date 
              ? trade.date.toISOString().split('T')[0]
              : new Date(trade.date.seconds * 1000).toISOString().split('T')[0];
            return tradeDate === dayString;
          });
          
          // Calculate stats for this day
          const dayStats = dayTrades.length > 0 ? {
            totalTrades: dayTrades.length,
            netResult: dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0),
            winRate: (dayTrades.filter(trade => trade.profitLoss > 0).length / dayTrades.length) * 100,
            avgRisk: dayTrades.reduce((sum, trade) => sum + (trade.riskAmount || 0), 0) / dayTrades.length
          } : undefined;
          
          // Check if there are notes for this day
          const hasNote = notes.some(note => {
            const noteDate = note.date instanceof Date 
              ? note.date.toISOString().split('T')[0]
              : new Date(note.date.seconds * 1000).toISOString().split('T')[0];
            return noteDate === dayString;
          });
          
          days.push({
            dayOfMonth: day,
            isCurrentMonth: false,
            stats: dayStats,
            hasNote,
            fullDate: new Date(nextMonthDate)
          });
        }
        break;
      }
    }
    
    setCalendarDays(days);
  }, [currentDate, currentWeekStart, currentBiweeklyStart, trades, notes, selectedPeriod]);
  
  // Helper functions for date ranges
  const getWeekRange = () => {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(currentWeekStart.getDate() + 6);
    
    return `${currentWeekStart.getDate()} a ${endOfWeek.getDate()} de ${monthNames[currentWeekStart.getMonth()]} de ${currentWeekStart.getFullYear()}`;
  };
  
  const getBiweeklyRange = () => {
    const isFirstHalf = currentBiweeklyStart.getDate() === 1;
    
    if (isFirstHalf) {
      return `1 a 15 de ${monthNames[currentBiweeklyStart.getMonth()]} de ${currentBiweeklyStart.getFullYear()}`;
    } else {
      const lastDay = new Date(currentBiweeklyStart.getFullYear(), currentBiweeklyStart.getMonth() + 1, 0).getDate();
      return `16 a ${lastDay} de ${monthNames[currentBiweeklyStart.getMonth()]} de ${currentBiweeklyStart.getFullYear()}`;
    }
  };
  
  const handlePeriodNavigate = (direction: 'prev' | 'next') => {
    setIsTransitioning(true);
    
    if (selectedPeriod === 'weekly') {
      // Navigate by week
      const newWeekStart = new Date(currentWeekStart);
      if (direction === 'prev') {
        newWeekStart.setDate(currentWeekStart.getDate() - 7);
      } else {
        newWeekStart.setDate(currentWeekStart.getDate() + 7);
      }
      setCurrentWeekStart(newWeekStart);
    } else if (selectedPeriod === 'biweekly') {
      // Navigate by biweekly period
      const newBiweeklyStart = new Date(currentBiweeklyStart);
      if (direction === 'prev') {
        // Go to previous biweekly period
        if (currentBiweeklyStart.getDate() === 1) {
          // Currently in first half, go to second half of previous month
          newBiweeklyStart.setMonth(currentBiweeklyStart.getMonth() - 1);
          newBiweeklyStart.setDate(16);
        } else {
          // Currently in second half, go to first half of same month
          newBiweeklyStart.setDate(1);
        }
      } else {
        // Go to next biweekly period
        if (currentBiweeklyStart.getDate() === 1) {
          // Currently in first half, go to second half of same month
          newBiweeklyStart.setDate(16);
        } else {
          // Currently in second half, go to first half of next month
          newBiweeklyStart.setMonth(currentBiweeklyStart.getMonth() + 1);
          newBiweeklyStart.setDate(1);
        }
      }
      setCurrentBiweeklyStart(newBiweeklyStart);
    } else {
      // Monthly navigation (existing logic)
      const newDate = new Date(currentDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      setCurrentDate(newDate);
      onMonthNavigate(direction);
    }
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handlePeriodChange = (period: PeriodFilter) => {
    setIsTransitioning(true);
    
    // Reset navigation states to current period when changing view mode
    if (period === 'weekly') {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      setCurrentWeekStart(startOfWeek);
    } else if (period === 'biweekly') {
      const today = new Date();
      const dayOfMonth = today.getDate();
      const isFirstHalf = dayOfMonth <= 15;
      setCurrentBiweeklyStart(new Date(today.getFullYear(), today.getMonth(), isFirstHalf ? 1 : 16));
    }
    
    setTimeout(() => {
      onPeriodChange(period);
      setIsTransitioning(false);
    }, 150);
  };

  const { user } = useAuth();

  const formatCurrencyLocal = (value: number) => {
    return formatCurrency(value, user?.currency || 'BRL').replace(/,\d{2}$/, '');
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getPeriodLabel = (period: PeriodFilter) => {
    switch (period) {
      case 'weekly': return 'Semanal';
      case 'biweekly': return 'Quinzenal';
      case 'monthly': return 'Mensal';
      default: return 'Mensal';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header with View Modes */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePeriodNavigate('prev')}
            className="p-2 hover:bg-neutral-800/50 rounded-lg transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-400" />
          </button>
          
          <h3 className="text-lg sm:text-xl font-bold text-white px-2 sm:px-4 tracking-tight leading-none">
             {selectedPeriod === 'weekly' && `Semana: ${getWeekRange()}`}
             {selectedPeriod === 'biweekly' && `Quinzena: ${getBiweeklyRange()}`}
             {selectedPeriod === 'monthly' && `${monthNames[currentDate.getMonth()]} de ${currentDate.getFullYear()}`}
           </h3>
          
          <button
            onClick={() => handlePeriodNavigate('next')}
            className="p-2 hover:bg-neutral-800/50 rounded-lg transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
        
        {/* View Mode Filters */}
        <div className="flex space-x-1 sm:space-x-2">
          <button
            onClick={() => handlePeriodChange('weekly')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
              selectedPeriod === 'weekly'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50'
            }`}
          >
            Semanal
          </button>
          <button
            onClick={() => handlePeriodChange('biweekly')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
              selectedPeriod === 'biweekly'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50'
            }`}
          >
            Quinzenal
          </button>
          <button
            onClick={() => handlePeriodChange('monthly')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
              selectedPeriod === 'monthly'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50'
            }`}
          >
            Mensal
          </button>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="w-full">
        {/* Days of Week Header - Show for weekly and monthly */}
        {(selectedPeriod === 'weekly' || selectedPeriod === 'monthly') && (
          <div className={`grid mb-4 ${
            selectedPeriod === 'weekly' ? 'grid-cols-7' : 'grid-cols-7'
          }`}>
            {weekDays.map((day, index) => (
              <div key={index} className="text-center py-2">
                <span className="text-xs sm:text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                  {day}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Calendar Grid - Responsivo com Clamp */}
        <div className={`relative transition-all duration-300 scale-90 ${
          isTransitioning ? 'opacity-50 scale-85' : 'opacity-100 scale-90'
        }`}>
          <div className={`grid w-full gap-1 ${
            selectedPeriod === 'weekly' 
              ? 'grid-cols-7' 
              : selectedPeriod === 'biweekly'
              ? 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-5'
              : 'grid-cols-7'
          }`} style={{
            gridTemplateColumns: selectedPeriod === 'monthly' 
              ? 'repeat(7, minmax(clamp(72px, 7.2vw, 99px), 1fr))'
              : selectedPeriod === 'weekly'
              ? 'repeat(7, minmax(clamp(80px, 8vw, 110px), 1fr))'
              : 'repeat(auto-fill, minmax(clamp(80px, 8vw, 110px), 1fr))'
          }}>
            {calendarDays.map((day, index) => {
              const hasFinancialData = day.stats && day.stats.totalTrades > 0;
              const isProfit = hasFinancialData && day.stats!.netResult > 0;
              const isLoss = hasFinancialData && day.stats!.netResult < 0;
              const isNeutral = hasFinancialData && day.stats!.netResult === 0;
              const isSelected = selectedDay === day.dayOfMonth;
              const isTodayDay = isToday(day.fullDate);
              
              return (
                <div
                  key={index}
                  onClick={() => setSelectedDay(isSelected ? null : day.dayOfMonth)}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`
                    relative aspect-square cursor-pointer group overflow-hidden
                    transition-all duration-300 ease-out
                    bg-[#0a0a0a] hover:bg-[#111111]
                    ${
                      day.isCurrentMonth
                        ? isTodayDay
                          ? 'border-2 border-cyan-400/80 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                          : hasFinancialData
                          ? isProfit
                            ? 'border border-green-500/50 hover:border-green-400'
                            : isLoss
                            ? 'border border-red-500/50 hover:border-red-400'
                            : 'border border-neutral-600/30'
                          : 'border border-neutral-700/30 hover:border-neutral-600/50'
                        : 'border border-neutral-800/20 opacity-60'
                    }
                    ${
                      isSelected 
                        ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-black shadow-xl shadow-cyan-400/40 scale-105' 
                        : 'hover:scale-102'
                    }
                  `}
                  style={{
                    borderRadius: '8px',
                    minHeight: selectedPeriod === 'weekly' ? '72px' : selectedPeriod === 'biweekly' ? '90px' : '63px'
                  }}
                >
                  {/* Glassmorphism overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-black/15 pointer-events-none rounded-lg" />
                  
                  {/* Diagonal Reflection Effect on Hover - Melhorado */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/0 to-transparent group-hover:via-white/25 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out pointer-events-none transform rotate-45 scale-150 rounded-lg" />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out pointer-events-none transform -translate-x-full -translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 rounded-lg" />
                  
                  {/* Day Number - Top Left Corner */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className={`text-sm sm:text-base font-bold drop-shadow-md ${
                      day.isCurrentMonth
                        ? hasFinancialData || isTodayDay
                          ? 'text-white'
                          : 'text-neutral-200'
                        : 'text-neutral-500'
                    }`}>
                      {day.dayOfMonth}
                    </span>
                  </div>
                  
                  {/* Financial Result - Center */}
                  {hasFinancialData && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="text-center px-2">
                        <div className={`text-sm sm:text-base font-bold drop-shadow-lg ${
                          isProfit ? 'text-[#00ff7f] drop-shadow-[0_0_8px_rgba(0,255,127,0.6)]' : isLoss ? 'text-[#ff3b30] drop-shadow-[0_0_8px_rgba(255,59,48,0.6)]' : 'text-white'
                        }`}>
                          {formatCurrencyLocal(day.stats!.netResult)}
                        </div>
                        <div className="text-xs text-white/80 mt-1">
                          {day.stats!.totalTrades} trade{day.stats!.totalTrades > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Note Indicator */}
                  {day.hasNote && (
                    <div className="absolute bottom-2 right-2 z-10">
                      <div className="w-2 h-2 bg-blue-400 rounded-full shadow-lg shadow-blue-400/60 animate-pulse" />
                    </div>
                  )}
                  
                  {/* Today Indicator */}
                  {isTodayDay && day.isCurrentMonth && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/60 animate-pulse" />
                    </div>
                  )}
                  
                  {/* Selection Border Glow */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/25 via-transparent to-cyan-600/25 pointer-events-none rounded-lg" />
                  )}
                  
                  {/* Hover Border Enhancement */}
                  <div className="absolute inset-0 border border-white/0 group-hover:border-white/40 transition-all duration-300 pointer-events-none rounded-lg" />
                </div>
              );
            })}
          </div>
          
          {/* Tooltip Detalhado */}
          {hoveredDay && hoveredDay.stats && (
            <div className="absolute z-50 pointer-events-none">
              <div 
                className="bg-neutral-900/95 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-4 shadow-2xl shadow-black/50 min-w-[280px]"
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-700/50 pb-2">
                    <h4 className="text-white font-semibold">
                      {hoveredDay.fullDate.toLocaleDateString('pt-BR', { 
                        day: 'numeric', 
                        month: 'long',
                        weekday: 'long'
                      })}
                    </h4>
                    {isToday(hoveredDay.fullDate) && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                        Hoje
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-400 text-sm">Resultado:</span>
                        <span className={`font-semibold text-sm ${
                          hoveredDay.stats.netResult > 0 
                            ? 'text-[#00ff7f]' 
                            : hoveredDay.stats.netResult < 0 
                            ? 'text-[#ff3b30]' 
                            : 'text-neutral-300'
                        }`}>
                          {formatCurrencyLocal(hoveredDay.stats.netResult)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-neutral-400 text-sm">Taxa de acerto:</span>
                        <span className="text-white font-semibold text-sm">
                          {hoveredDay.stats.winRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-400 text-sm">Trades:</span>
                        <span className="text-white font-semibold text-sm">
                          {hoveredDay.stats.totalTrades}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-neutral-400 text-sm">Risco médio:</span>
                        <span className="text-white font-semibold text-sm">
                          {hoveredDay.stats.avgRisk.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {hoveredDay.hasNote && (
                    <div className="pt-2 border-t border-neutral-700/50">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className="text-blue-400 text-sm">Possui anotações</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};