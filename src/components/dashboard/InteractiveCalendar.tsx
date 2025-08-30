import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, BarChart3, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Columns, Grid } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isToday, format as formatDate, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trade, DayStats } from '../../types';
import { formatCurrency, calculateDayStats } from '../../utils';

export type CalendarDay = {
  date: string; // YYYY-MM-DD
  dayOfMonth: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  stats: DayStats | null;
  classNames: string;
};

interface DayProps {
  day: CalendarDay;
  onHover: (day: CalendarDay | null) => void;
}

const Day: React.FC<DayProps> = ({ day, onHover }) => {
  const [showPopup, setShowPopup] = useState(false);
  const hasStats = day.stats && day.stats.totalTrades > 0;
  const isWinning = hasStats && day.stats!.netResult > 0;
  const isLosing = hasStats && day.stats!.netResult < 0;
  const isBreakeven = hasStats && day.stats!.netResult === 0;

  let bgColor = 'bg-transparent';
  let textColor = 'text-zinc-300';
  let borderColor = 'border-zinc-800/50';
  let hoverBg = 'hover:bg-zinc-800/30';

  if (day.isToday) {
    bgColor = 'bg-zinc-700/30';
    textColor = 'text-white';
    borderColor = 'border-zinc-600';
    hoverBg = 'hover:bg-zinc-600/40';
  } else if (hasStats) {
    if (isWinning) {
      bgColor = 'bg-green-500/20';
      textColor = 'text-green-300';
      borderColor = 'border-green-500/30';
      hoverBg = 'hover:bg-green-500/30';
    } else if (isLosing) {
      bgColor = 'bg-red-500/20';
      textColor = 'text-red-300';
      borderColor = 'border-red-500/30';
      hoverBg = 'hover:bg-red-500/30';
    } else if (isBreakeven) {
      bgColor = 'bg-zinc-600/20';
      textColor = 'text-zinc-300';
      borderColor = 'border-zinc-600/30';
      hoverBg = 'hover:bg-zinc-600/30';
    }
  }

  if (!day.isCurrentMonth) {
    bgColor = 'bg-transparent';
    textColor = 'text-zinc-600';
    borderColor = 'border-transparent';
    hoverBg = 'hover:bg-zinc-800/20';
  }

  const handleClick = () => {
    if (day.isCurrentMonth) {
      const searchParams = new URLSearchParams({ date: day.date });
      window.location.href = `/trade-registration?${searchParams.toString()}`;
    }
  };

  const handleMouseEnter = () => {
    onHover(day);
    if (hasStats) {
      setShowPopup(true);
    }
  };

  const handleMouseLeave = () => {
    onHover(null);
    setShowPopup(false);
  };

  return (
    <motion.div
      className={`relative flex items-center justify-center ${bgColor} ${textColor} ${borderColor} ${hoverBg} transition-all duration-200 cursor-pointer border rounded-lg`}
      style={{ height: '5rem', borderRadius: 12 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      id={`day-${day.date}`}
    >
      <motion.div className="flex flex-col items-center justify-center h-full w-full p-1">
        <span className="text-sm font-medium mb-1">{day.dayOfMonth}</span>
        {hasStats && (
          <motion.div
            className="flex flex-col items-center justify-center text-[9px] font-bold space-y-0.5"
            layoutId={`day-${day.date}-stats`}
          >
            {/* Valor do lucro/prejuízo */}
            <div className={`px-1 py-0.5 rounded text-[8px] font-bold ${
              day.stats!.netResult > 0 ? 'text-green-400 bg-green-900/30' :
              day.stats!.netResult < 0 ? 'text-red-400 bg-red-900/30' :
              'text-yellow-400 bg-yellow-900/30'
            }`}>
              {formatCurrency(day.stats!.netResult)}
            </div>
            
            {/* Wins e Losses */}
            <div className="flex items-center space-x-1 text-[8px]">
              <span className="text-green-400 font-bold">{day.stats!.wins}W</span>
              <span className="text-zinc-500">/</span>
              <span className="text-red-400 font-bold">{day.stats!.losses}L</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Popup de resumo */}
      <AnimatePresence>
        {showPopup && hasStats && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg p-3 min-w-[200px] shadow-2xl"
          >
            <div className="text-xs text-zinc-300 mb-2 font-medium">
              {format(new Date(day.date), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Trades:</span>
                <span className="text-white font-medium">{day.stats!.totalTrades}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-zinc-400">Resultado:</span>
                <span className={`font-medium ${
                  isWinning ? 'text-green-400' : 
                  isLosing ? 'text-red-400' : 
                  'text-yellow-400'
                }`}>
                  {formatCurrency(day.stats!.netResult)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-zinc-400">Taxa de Acerto:</span>
                <span className="text-white font-medium">
                  {((day.stats!.wins / day.stats!.totalTrades) * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-1 border-t border-zinc-700">
                <span className="text-green-400">{day.stats!.wins}W</span>
                <span className="text-zinc-500">/</span>
                <span className="text-red-400">{day.stats!.losses}L</span>
              </div>
            </div>
            
            {/* Seta do popup */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-zinc-900 border-l border-t border-zinc-700 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface CalendarGridProps {
  days: CalendarDay[];
  onHover: (day: CalendarDay | null) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ days, onHover }) => {
  return (
    <div className="grid grid-cols-7 gap-3">
      {days.map((day) => (
        <Day
          key={day.date}
          day={day}
          onHover={onHover}
        />
      ))}
    </div>
  );
};

interface InteractiveCalendarProps {
  trades: Trade[];
}

const InteractiveCalendar = React.forwardRef<
  HTMLDivElement,
  InteractiveCalendarProps
>(({ trades, ...props }, ref) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<CalendarDay | null>(null);
  const [showTradesPanel, setShowTradesPanel] = useState(false);

  const calendarDays = useMemo((): CalendarDay[] => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const tradesByDate = trades.reduce((acc, trade) => {
      (acc[trade.date] = acc[trade.date] || []).push(trade);
      return acc;
    }, {} as Record<string, Trade[]>);

    const days: CalendarDay[] = [];
    let day = startDate;
    while (day <= endDate) {
      const dateStr = formatDate(day, 'yyyy-MM-dd');
      const dayTrades = tradesByDate[dateStr];
      const isCurrentMonth = isSameMonth(day, currentDate);
      
      let classNames = 'bg-[#1e1e1e]';
      if (!isCurrentMonth) {
        classNames = 'bg-zinc-700/20';
      } else if (dayTrades && dayTrades.length > 0) {
        const stats = calculateDayStats(trades, dateStr);
        if (stats.netResult > 0) {
          classNames = 'bg-green-500/20 border border-green-500/30 cursor-pointer';
        } else if (stats.netResult < 0) {
          classNames = 'bg-red-500/20 border border-red-500/30 cursor-pointer';
        } else {
          classNames = 'bg-zinc-500/20 border border-zinc-500/30 cursor-pointer';
        }
      }
      
      days.push({
        date: dateStr,
        dayOfMonth: formatDate(day, 'd'),
        isCurrentMonth,
        isToday: isToday(day),
        stats: dayTrades ? calculateDayStats(trades, dateStr) : null,
        classNames
      });
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate, trades]);

  // Ordenar dias com trades baseado no hover
  const sortedDaysWithTrades = useMemo(() => {
    const daysWithTrades = calendarDays.filter(day => day.stats && day.stats.totalTrades > 0);
    if (!hoveredDay) return daysWithTrades;
    
    return [...daysWithTrades].sort((a, b) => {
      if (a.date === hoveredDay.date) return -1;
      if (b.date === hoveredDay.date) return 1;
      return 0;
    });
  }, [calendarDays, hoveredDay]);

  const handleDayHover = (day: CalendarDay | null) => {
    setHoveredDay(day);
  };



  const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={ref}
        className="relative mx-auto my-10 flex w-full max-w-6xl items-start justify-center gap-8 lg:flex-row flex-col"
        {...props}
      >
        <motion.div layout className="w-full max-w-2xl">
          <motion.div
            key="calendar-view"
            className="flex w-full flex-col gap-4"
          >
            <div className="flex w-full items-center justify-between">
              <motion.h2 className="mb-2 text-4xl font-bold tracking-wider text-zinc-300">
                {format(currentDate, 'MMMM', { locale: ptBR }).toUpperCase()}{' '}
                <span className="opacity-50">{format(currentDate, 'yyyy')}</span>
              </motion.h2>
              <div className="flex items-center gap-2">
                <motion.button
                  className="relative flex items-center gap-3 rounded-lg border border-[#323232] px-1.5 py-1 text-[#323232]"
                  onClick={() => setShowTradesPanel(!showTradesPanel)}
                >
                  <Columns className="z-[2]" />
                  <Grid className="z-[2]" />
                  <div
                    className="absolute left-0 top-0 h-[85%] w-7 rounded-md bg-white transition-transform duration-300"
                    style={{
                      top: '50%',
                      transform: showTradesPanel
                        ? 'translateY(-50%) translateX(40px)'
                        : 'translateY(-50%) translateX(4px)',
                    }}
                  ></div>
                </motion.button>
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-zinc-400" />
                </button>
                <button
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-3">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="rounded-xl bg-zinc-800/50 py-3 text-center text-sm text-white font-medium"
                >
                  {day}
                </div>
              ))}
            </div>
            
            <CalendarGrid days={calendarDays} onHover={handleDayHover} />
          </motion.div>
        </motion.div>
        
        {showTradesPanel && (
          <motion.div
            className="w-full max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              key="trades-panel"
              className="mt-4 flex w-full flex-col gap-4"
            >
              <div className="flex w-full flex-col items-start justify-between">
                <motion.h2 className="mb-2 text-4xl font-bold tracking-wider text-zinc-300">
                  Trades
                </motion.h2>
                <p className="font-medium text-zinc-300/50">
                  Visualize todos os trades do mês. Passe o mouse sobre um dia para destacá-lo.
                </p>
              </div>
              <motion.div
                className="flex h-[620px] flex-col items-start justify-start overflow-hidden overflow-y-scroll rounded-xl border-2 border-[#323232] shadow-md"
                layout
              >
                <AnimatePresence>
                  {sortedDaysWithTrades.map((day) => (
                    <motion.div
                      key={day.date}
                      className={`w-full border-b-2 border-[#323232] py-0 last:border-b-0 ${
                        hoveredDay && hoveredDay.date === day.date ? 'bg-zinc-800/30' : ''
                      }`}
                      layout
                    >
                      {day.stats && day.stats.trades && day.stats.trades.map((trade, tIndex) => (
                        <motion.div
                          key={`${day.date}-${tIndex}`}
                          className="border-b border-[#323232] p-3 last:border-b-0"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{
                            duration: 0.2,
                            delay: tIndex * 0.05,
                          }}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm text-white">
                              {format(parseISO(day.date), 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                            <span className={`text-sm font-medium ${
                              trade.result === 'win' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {trade.result === 'win' ? 'WIN' : 'LOSS'}
                            </span>
                          </div>
                          <h3 className="mb-1 text-lg font-semibold text-white">
                            {formatCurrency(trade.entry_value)}
                          </h3>
                          <p className="mb-1 text-sm text-zinc-600">
                            {trade.tradeType === 'fixed_hand' ? 'Fixed Hand' : 'Soros'}
                          </p>
                          <div className={`flex items-center ${
                            trade.profitLoss > 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {trade.profitLoss > 0 ? (
                              <TrendingUp className="mr-1 h-4 w-4" />
                            ) : (
                              <TrendingDown className="mr-1 h-4 w-4" />
                            )}
                            <span className="text-sm font-medium">
                              {formatCurrency(trade.profitLoss)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});

InteractiveCalendar.displayName = 'InteractiveCalendar';

export default InteractiveCalendar;