import React, { useState } from 'react';
import { DailyHistoryPanel, TradeCalendar } from '../components/dashboard';
import { Trade } from '../types';

// Mock data para teste
const mockTrades: Trade[] = [
  {
    id: '1',
    userId: 'test-user',
    date: '2024-01-15',
    payout: 80,
    entry_value: 100,
    result: 'win',
    profitLoss: 80,
    tradeType: 'fixed_hand',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    userId: 'test-user',
    date: '2024-01-15',
    payout: 85,
    entry_value: 50,
    result: 'loss',
    profitLoss: -50,
    tradeType: 'soros',
    level: 1,
    createdAt: '2024-01-15'
  },
  {
    id: '3',
    userId: 'test-user',
    date: '2024-01-16',
    payout: 90,
    entry_value: 75,
    result: 'win',
    profitLoss: 67.5,
    tradeType: 'fixed_hand',
    createdAt: '2024-01-16'
  }
];

export const DashboardTest: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleDayClick = (day: any) => {
    // Implementar a lógica conforme documentação
    const dayNumber = day.day.replace(/[+-]/g, '');
    if (dayNumber && !day.day.includes('+') && !day.day.includes('-')) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
      setSelectedDay(selectedDate);
    }
  };

  const handleMonthNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard Test</h1>
      
      {/* Layout mestre-detalhe conforme documentação */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar - Master View */}
        <div className="flex-1">
          <TradeCalendar
            trades={mockTrades}
            currentDate={currentDate}
            selectedPeriod="monthly"
            onMonthNavigate={handleMonthNavigate}
            onDayClick={handleDayClick}
          />
        </div>
        
        {/* Daily History Panel - Detail View */}
        {selectedDay && (
          <div className="lg:w-96">
            <DailyHistoryPanel
              selectedDate={selectedDay}
              trades={mockTrades}
              onClose={() => setSelectedDay(null)}
              onAddTrade={(date) => {
                console.log('Add trade for date:', date);
                setSelectedDay(null);
              }}
            />
          </div>
        )}
      </div>
      
      {/* Debug info */}
      <div className="mt-8 p-4 bg-zinc-800 rounded-lg">
        <h3 className="text-white font-bold mb-2">Debug Info:</h3>
        <p className="text-zinc-300">Selected Day: {selectedDay || 'None'}</p>
        <p className="text-zinc-300">Current Date: {currentDate.toLocaleDateString()}</p>
        <p className="text-zinc-300">Mock Trades: {mockTrades.length}</p>
      </div>
    </div>
  );
};
