import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp, TrendingDown, Grid, BarChart3, Percent, Target } from 'lucide-react';
import { Trade } from '../../types';
import { formatCurrency } from '../../utils';

export type TradeDayType = {
  day: string;
  classNames: string;
  tradeInfo?: {
    id: string;
    date: string;
    result: 'win' | 'loss';
    profitLoss: number;
    entryValue: number;
    payout: number;
    tradeType: string;
  }[];
};

interface TradeDayProps {
  classNames: string;
  day: TradeDayType;
  onHover: (day: string | null) => void;
  onClick?: (day: TradeDayType, event?: React.MouseEvent) => void;
}

const TradeDay: React.FC<TradeDayProps> = ({ classNames, day, onHover, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const dayProfit = day.tradeInfo?.reduce((sum, trade) => sum + trade.profitLoss, 0) || 0;
  const isProfitable = dayProfit > 0;
  const hasLoss = dayProfit < 0;
  const hasData = day.tradeInfo && day.tradeInfo.length > 0;
  
  // Determinar cor de fundo baseada no resultado do dia
  const getBackgroundColor = () => {
    if (!hasData) return classNames;
    if (isProfitable) return 'bg-gradient-to-br from-green-600/80 to-green-700/60 border border-green-500/50';
    if (hasLoss) return 'bg-gradient-to-br from-red-600/80 to-red-700/60 border border-red-500/50';
    return 'bg-gradient-to-br from-zinc-700/80 to-zinc-800/60 border border-zinc-600/50';
  };
  
  return (
    <>
      <motion.div
        className={`relative flex items-center justify-center py-1 ${getBackgroundColor()} cursor-pointer transition-all duration-200 shadow-lg`}
        style={{ 
          height: '5rem', 
          borderRadius: 16,
          // Efeito de reflexo
          background: hasData 
            ? isProfitable 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(21, 128, 61, 0.6) 100%), linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'
              : hasLoss
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.8) 0%, rgba(153, 27, 27, 0.6) 100%), linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'
              : 'linear-gradient(135deg, rgba(113, 113, 122, 0.8) 0%, rgba(63, 63, 70, 0.6) 100%), linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'
            : isHovered 
              ? 'linear-gradient(135deg, rgba(63, 63, 70, 0.6) 0%, rgba(39, 39, 42, 0.4) 100%), linear-gradient(45deg, rgba(255, 255, 255, 0.08) 0%, transparent 50%)'
              : undefined,
          boxShadow: hasData 
            ? isProfitable
              ? '0 4px 20px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              : hasLoss
              ? '0 4px 20px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              : '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : isHovered
              ? '0 2px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              : undefined
        }}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => {
          setIsHovered(true);
          onHover(day.day);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onHover(null);
        }}
        onClick={(event) => onClick?.(day, event)}
        id={`day-${day.day}`}
      >
        {/* Número do dia */}
        <motion.div className="flex flex-col items-center justify-center z-10">
          {!(day.day[0] === '+' || day.day[0] === '-') && (
            <span className={`text-sm font-semibold ${
              hasData ? 'text-white drop-shadow-lg' : 'text-zinc-400'
            }`}>
              {day.day}
            </span>
          )}
        </motion.div>
        
        {/* Informações de trades */}
        {hasData && (
          <>
            {/* Contador de trades */}
            <motion.div
              className={`absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full p-1 text-[10px] font-bold text-white shadow-lg ${
                isProfitable ? 'bg-green-500' : hasLoss ? 'bg-red-500' : 'bg-zinc-600'
              }`}
              layoutId={`day-${day.day}-trade-count`}
              style={{
                borderRadius: 999,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
            >
              {day.tradeInfo!.length}
            </motion.div>
            
            {/* Resultado do dia */}
            {dayProfit !== 0 && (
              <motion.div
                className={`absolute top-1 left-1 flex items-center justify-center rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white shadow-lg ${
                  isProfitable ? 'bg-green-500/90' : 'bg-red-500/90'
                }`}
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
              >
                {isProfitable ? '+' : ''}{formatCurrency(dayProfit)}
              </motion.div>
            )}
          </>
        )}

        {/* Tooltip ao passar o mouse */}
        <AnimatePresence>
          {hasData && isHovered && (
            <motion.div
              className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg px-3 py-2 shadow-xl">
                <div className="text-xs text-white font-medium mb-1">
                  Dia {day.day}
                </div>
                <div className="text-xs text-zinc-300 mb-1">
                  {day.tradeInfo!.length} trade{day.tradeInfo!.length > 1 ? 's' : ''}
                </div>
                <div className={`text-xs font-bold ${
                  isProfitable ? 'text-green-400' : hasLoss ? 'text-red-400' : 'text-zinc-400'
                }`}>
                  {isProfitable ? '+' : ''}{formatCurrency(dayProfit)}
                </div>
                {/* Seta do tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-700"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

const TradeCalendarGrid: React.FC<{ 
  days: TradeDayType[];
  onHover: (day: string | null) => void;
  onDayClick?: (day: TradeDayType, event?: React.MouseEvent) => void;
}> = ({ days, onHover, onDayClick }) => {
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, index) => (
        <TradeDay
          key={`${day.day}-${index}`}
          classNames={day.classNames}
          day={day}
          onHover={onHover}
          onClick={onDayClick}
        />
      ))}
    </div>
  );
};

interface TradeCalendarProps {
  trades: Trade[];
  currentDate: Date;
  onMonthNavigate: (direction: 'prev' | 'next') => void;
  selectedPeriod?: 'weekly' | 'biweekly' | 'monthly';
  onDayClick?: (day: TradeDayType, event?: React.MouseEvent) => void;
}

export const TradeCalendar: React.FC<TradeCalendarProps> = ({
  trades,
  currentDate,
  onMonthNavigate,
  selectedPeriod = 'monthly',
  onDayClick
}) => {
  const [detailsView, setDetailsView] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const handleDayHover = (day: string | null) => {
    setHoveredDay(day);
  };

  const handleDayClick = (day: TradeDayType, event?: React.MouseEvent) => {
    if (onDayClick) {
      onDayClick(day, event);
    } else {
      // Comportamento padrão: abrir visualização de detalhes
      setDetailsView(true);
      setHoveredDay(day.day);
    }
  };

  // Gerar dias do calendário com dados de trades
  const calendarDays = useMemo(() => {
    if (!currentDate) return [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    

    
    // Primeiro dia do mês e último dia
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Dias da semana anterior para completar a primeira semana
    const startDayOfWeek = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const days: TradeDayType[] = [];
    
    // Dias do mês anterior
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      days.push({
        day: `-${day}`,
        classNames: 'bg-zinc-800/30'
      });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTrades = trades.filter(trade => trade.date === dateStr);
      

      
              const tradeInfo = dayTrades.map(trade => ({
          id: trade.id,
          date: new Date(trade.date + 'T12:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
          result: trade.result,
          profitLoss: trade.profitLoss,
          entryValue: trade.entry_value || 0,
          payout: trade.payout,
          tradeType: trade.tradeType
        }));
      
      days.push({
        day: String(day).padStart(2, '0'),
        classNames: dayTrades.length > 0 ? 'bg-zinc-800 border border-zinc-600' : 'bg-zinc-900',
        tradeInfo: tradeInfo.length > 0 ? tradeInfo : undefined
      });
    }
    
    // Completar com dias do próximo mês se necessário
    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextMonthDay = 1;
    while (days.length < totalCells) {
      days.push({
        day: `+${nextMonthDay}`,
        classNames: 'bg-zinc-800/30'
      });
      nextMonthDay++;
    }
    
    return days;
  }, [trades, currentDate]);

  // Removido useMemo desnecessário que pode causar re-renderizações
  const sortedDays = calendarDays;

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

  return (
    <AnimatePresence mode="wait">
      <motion.div className="relative mx-auto my-6 flex w-full flex-col items-center justify-center gap-6 lg:flex-row">
        <motion.div layout className="w-full max-w-2xl">
          <motion.div
            key="calendar-view"
            className="flex w-full flex-col gap-4"
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onMonthNavigate('prev')}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <motion.h2 className="text-2xl font-bold tracking-wider text-white">
                  {monthNames[currentDate.getMonth()]} <span className="opacity-50">{currentDate.getFullYear()}</span>
                </motion.h2>
                
                <button
                  onClick={() => onMonthNavigate('next')}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <motion.button
                className="relative flex items-center gap-3 rounded-lg border border-zinc-600 px-3 py-2 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                onClick={() => setDetailsView(!detailsView)}
              >
                <Calendar className="w-4 h-4" />
                <Grid className="w-4 h-4" />
                <div
                  className="absolute left-0 top-0 h-[85%] w-8 rounded-md bg-white/10 transition-transform duration-300"
                  style={{
                    top: '50%',
                    transform: detailsView
                      ? 'translateY(-50%) translateX(32px)'
                      : 'translateY(-50%) translateX(4px)',
                  }}
                />
              </motion.button>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="rounded-xl bg-zinc-800 py-2 text-center text-xs text-zinc-300 font-medium"
                >
                  {day}
                </div>
              ))}
            </div>
            
            <TradeCalendarGrid days={calendarDays} onHover={handleDayHover} onDayClick={handleDayClick} />
          </motion.div>
        </motion.div>
        
        {detailsView && (
          <motion.div
            className="w-full max-w-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              key="details-view"
              className="flex w-full flex-col gap-4"
            >
              <div className="flex w-full flex-col items-start justify-between">
                <motion.h2 className="mb-2 text-2xl font-bold tracking-wider text-white">
                  Trades do Mês
                </motion.h2>
                <p className="font-medium text-zinc-400">
                  Visualize todos os trades realizados no mês selecionado.
                </p>
              </div>
              
              {/* Resumo Mensal */}
              {(() => {
                const monthTrades = trades.filter(trade => {
                  const tradeDate = new Date(trade.date);
                  return tradeDate.getMonth() === currentDate.getMonth() && 
                         tradeDate.getFullYear() === currentDate.getFullYear();
                });
                

                
                const totalProfit = monthTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
                const wins = monthTrades.filter(trade => trade.result === 'win').length;
                const losses = monthTrades.filter(trade => trade.result === 'loss').length;
                const winRate = monthTrades.length > 0 ? (wins / monthTrades.length) * 100 : 0;
                const totalVolume = monthTrades.reduce((sum, trade) => sum + (trade.entry_value || 0), 0);
                const averagePayout = monthTrades.length > 0 ? monthTrades.reduce((sum, trade) => sum + trade.payout, 0) / monthTrades.length : 0;
                
                const fixedHandTrades = monthTrades.filter(trade => trade.tradeType === 'fixed_hand');
                const sorosTrades = monthTrades.filter(trade => trade.tradeType === 'soros');
                
                return monthTrades.length > 0 ? (
                  <motion.div 
                    className="w-full bg-zinc-800/30 rounded-lg p-4 mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Métricas Principais */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-zinc-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          {totalProfit >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-zinc-400 text-xs">Resultado</span>
                        </div>
                        <div className={`font-bold text-sm ${
                          totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatCurrency(totalProfit)}
                        </div>
                        <div className="text-zinc-500 text-xs">
                          {monthTrades.length} trade{monthTrades.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-blue-400" />
                          <span className="text-zinc-400 text-xs">Taxa de Acerto</span>
                        </div>
                        <div className="text-white font-bold text-sm">
                          {winRate.toFixed(1)}%
                        </div>
                        <div className="text-zinc-500 text-xs">
                          {wins}W / {losses}L
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart3 className="w-4 h-4 text-purple-400" />
                          <span className="text-zinc-400 text-xs">Volume</span>
                        </div>
                        <div className="text-white font-bold text-sm">
                          {formatCurrency(totalVolume)}
                        </div>
                        <div className="text-zinc-500 text-xs">
                          Média: {formatCurrency(monthTrades.length > 0 ? totalVolume / monthTrades.length : 0)}
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Percent className="w-4 h-4 text-yellow-400" />
                          <span className="text-zinc-400 text-xs">Payout Médio</span>
                        </div>
                        <div className="text-white font-bold text-sm">
                          {averagePayout.toFixed(1)}%
                        </div>
                        <div className="text-zinc-500 text-xs">
                          {monthTrades.length > 0 ? `${Math.min(...monthTrades.map(t => t.payout))}% - ${Math.max(...monthTrades.map(t => t.payout))}%` : '-'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Breakdown por Tipo */}
                    {(fixedHandTrades.length > 0 || sorosTrades.length > 0) && (
                      <div className="grid grid-cols-2 gap-3">
                        {fixedHandTrades.length > 0 && (
                          <div className="bg-zinc-800/30 rounded-lg p-3">
                            <div className="text-zinc-400 text-xs mb-1">Mão Fixa</div>
                            <div className="text-white font-semibold text-sm">
                              {fixedHandTrades.length} trade{fixedHandTrades.length !== 1 ? 's' : ''}
                            </div>
                            <div className={`text-xs font-medium ${
                              fixedHandTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0) >= 0 
                                ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatCurrency(fixedHandTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0))}
                            </div>
                          </div>
                        )}
                        
                        {sorosTrades.length > 0 && (
                          <div className="bg-zinc-800/30 rounded-lg p-3">
                            <div className="text-zinc-400 text-xs mb-1">Soros</div>
                            <div className="text-white font-semibold text-sm">
                              {sorosTrades.length} trade{sorosTrades.length !== 1 ? 's' : ''}
                            </div>
                            <div className={`text-xs font-medium ${
                              sorosTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0) >= 0 
                                ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatCurrency(sorosTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : null;
              })()}
              
              <motion.div
                className="flex h-[400px] flex-col items-start justify-start overflow-hidden overflow-y-scroll rounded-xl border border-zinc-700 bg-zinc-900/50 shadow-lg"
                layout
              >
                <AnimatePresence>
                  {hoveredDay ? (
                    // Show trades for the hovered day only
                    (() => {
                      const hoveredDayData = sortedDays.find(day => day.day === hoveredDay);
                      if (!hoveredDayData || !hoveredDayData.tradeInfo || hoveredDayData.tradeInfo.length === 0) {
                        return (
                          <div className="flex items-center justify-center h-full w-full text-zinc-500">
                            <div className="text-center">
                              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>Nenhum trade encontrado para o dia {hoveredDay}</p>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <motion.div
                          key={hoveredDayData.day}
                          className="w-full border-b border-zinc-700 py-0 last:border-b-0"
                          layout
                        >
                          {hoveredDayData.tradeInfo.map((trade, tIndex) => {
                            const isProfit = trade.result === 'win';
                            return (
                              <motion.div
                                key={tIndex}
                                className="border-b border-zinc-800 p-4 last:border-b-0 hover:bg-zinc-800/30 transition-colors"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{
                                  duration: 0.2,
                                  delay: tIndex * 0.05,
                                }}
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="text-sm text-zinc-300">
                                    {trade.date}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    trade.result === 'win' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                  }`}>
                                    {trade.result === 'win' ? 'WIN' : 'LOSS'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-semibold text-white">
                                    {trade.tradeType === 'soros' ? 'Soros' : 'Mão fixa'}
                                  </h3>
                                  <span className="text-sm text-zinc-400">
                                    Payout: {trade.payout}%
                                  </span>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                  <div className="text-zinc-400">
                                    Entrada: {formatCurrency(trade.entryValue || 0)}
                                  </div>
                                  <div className={`flex items-center font-semibold ${
                                    isProfit ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {isProfit ? (
                                      <TrendingUp className="w-4 h-4 mr-1" />
                                    ) : (
                                      <TrendingDown className="w-4 h-4 mr-1" />
                                    )}
                                    {formatCurrency(trade.profitLoss)}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      );
                    })()
                  ) : (
                    // Show all trades when no day is hovered
                    sortedDays
                      .filter((day) => day.tradeInfo)
                      .map((day) => (
                        <motion.div
                          key={day.day}
                          className="w-full border-b border-zinc-700 py-0 last:border-b-0"
                          layout
                        >
                          {day.tradeInfo &&
                            day.tradeInfo.map((trade, tIndex) => {
                              const isProfit = trade.result === 'win';
                              return (
                                <motion.div
                                  key={tIndex}
                                  className="border-b border-zinc-800 p-4 last:border-b-0 hover:bg-zinc-800/30 transition-colors"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{
                                    duration: 0.2,
                                    delay: tIndex * 0.05,
                                  }}
                                >
                                  <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm text-zinc-300">
                                      {trade.date}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      trade.result === 'win' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                      {trade.result === 'win' ? 'WIN' : 'LOSS'}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-semibold text-white">
                                      {trade.tradeType === 'soros' ? 'Soros' : 'Mão fixa'}
                                    </h3>
                                    <span className="text-sm text-zinc-400">
                                      Payout: {trade.payout}%
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="text-zinc-400">
                                      Entrada: {formatCurrency(trade.entryValue || 0)}
                                    </div>
                                    <div className={`flex items-center font-semibold ${
                                      isProfit ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                      {isProfit ? (
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                      ) : (
                                        <TrendingDown className="w-4 h-4 mr-1" />
                                      )}
                                      {formatCurrency(trade.profitLoss)}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                        </motion.div>
                      ))
                  )}
                </AnimatePresence>
                
                {!hoveredDay && sortedDays.filter((day) => day.tradeInfo).length === 0 && (
                  <div className="flex items-center justify-center h-full w-full text-zinc-500">
                    <div className="text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum trade encontrado neste mês</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default TradeCalendar;