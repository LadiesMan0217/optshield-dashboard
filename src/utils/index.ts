import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Trade, DayStats, PeriodStats, PeriodFilter } from '../types'

// Date utilities
export const formatDate = (date: string | Date, formatStr: string = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: ptBR })
}

export const formatCurrency = (amount: number, currency: string = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatPercentage = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.0%'
  }
  return `${value.toFixed(1)}%`
}

export const getCurrentDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd')
}

export const getDateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd')
}

// Period utilities
export const getPeriodDates = (date: Date, filter: PeriodFilter) => {
  const today = new Date()
  
  switch (filter) {
    case 'weekly':
      // Current week (7 days)
      return {
        start: startOfWeek(today, { weekStartsOn: 0 }), // Sunday
        end: endOfWeek(today, { weekStartsOn: 0 })
      }
    case 'biweekly':
      // Current half of month (15 days)
      const dayOfMonth = today.getDate()
      const isFirstHalf = dayOfMonth <= 15
      const year = today.getFullYear()
      const month = today.getMonth()
      
      if (isFirstHalf) {
        return {
          start: new Date(year, month, 1),
          end: new Date(year, month, 15)
        }
      } else {
        const lastDay = new Date(year, month + 1, 0).getDate()
        return {
          start: new Date(year, month, 16),
          end: new Date(year, month, lastDay)
        }
      }
    case 'monthly':
      return {
        start: startOfMonth(date),
        end: endOfMonth(date)
      }
    default:
      return {
        start: startOfWeek(today, { weekStartsOn: 0 }),
        end: endOfWeek(today, { weekStartsOn: 0 })
      }
  }
}

// Trade calculations
export const calculateDayStats = (trades: Trade[], date: string): DayStats => {
  const dayTrades = trades.filter(trade => trade.date === date)
  const wins = dayTrades.filter(trade => trade.result === 'win').length
  const losses = dayTrades.filter(trade => trade.result === 'loss').length
  const totalTrades = dayTrades.length
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0
  
  const totalProfit = dayTrades
    .filter(trade => trade.result === 'win')
    .reduce((sum, trade) => sum + (trade.profitLoss || 0), 0)
  
  const totalLoss = Math.abs(dayTrades
    .filter(trade => trade.result === 'loss')
    .reduce((sum, trade) => sum + (trade.profitLoss || 0), 0))
  
  const netResult = totalProfit - totalLoss

  return {
    date,
    trades: dayTrades,
    totalTrades,
    wins,
    losses,
    winRate,
    totalProfit,
    totalLoss,
    netResult
  }
}

export const calculatePeriodStats = (trades: Trade[], startDate: string, endDate: string): PeriodStats => {
  const periodTrades = trades.filter(trade => {
    // Converter a data do trade para string no formato yyyy-MM-dd
    const tradeDate = typeof trade.date === 'string' ? trade.date : format(trade.date, 'yyyy-MM-dd');
    return tradeDate >= startDate && tradeDate <= endDate;
  })
  

  
  const wins = periodTrades.filter(trade => trade.result === 'win').length
  const losses = periodTrades.filter(trade => trade.result === 'loss').length
  const totalTrades = periodTrades.length
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0
  
  const totalProfit = periodTrades
    .filter(trade => trade.result === 'win')
    .reduce((sum, trade) => sum + (trade.profitLoss || 0), 0)
  
  const totalLoss = Math.abs(periodTrades
    .filter(trade => trade.result === 'loss')
    .reduce((sum, trade) => sum + (trade.profitLoss || 0), 0))
  
  const netResult = totalProfit - totalLoss
  

  
  const averageRisk = totalTrades > 0 
    ? periodTrades.reduce((sum, trade) => sum + (trade.entry_value || 0), 0) / totalTrades 
    : 0

  // Calculate best and worst days
  const dayStatsMap = new Map<string, DayStats>()
  periodTrades.forEach(trade => {
    if (!dayStatsMap.has(trade.date)) {
      dayStatsMap.set(trade.date, calculateDayStats(trades, trade.date))
    }
  })
  
  const dayStats = Array.from(dayStatsMap.values())
  const bestDay = dayStats.length > 0 
    ? dayStats.reduce((best, day) => day.netResult > best.netResult ? day : best)
    : null
  
  const worstDay = dayStats.length > 0
    ? dayStats.reduce((worst, day) => day.netResult < worst.netResult ? day : worst)
    : null

  return {
    startDate,
    endDate,
    totalTrades,
    wins,
    losses,
    winRate,
    totalProfit,
    totalLoss,
    netResult,
    averageRisk,
    bestDay,
    worstDay
  }
}

// Calendar utilities
export const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = startOfWeek(firstDay, { weekStartsOn: 1 })
  const endDate = endOfWeek(lastDay, { weekStartsOn: 1 })
  
  const days = []
  let currentDate = startDate
  
  while (currentDate <= endDate) {
    days.push({
      date: getDateString(currentDate),
      dayOfMonth: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: getDateString(currentDate) === getCurrentDate(),
      stats: null,
      hasNote: false
    })
    currentDate = addDays(currentDate, 1)
  }
  
  return days
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length >= 6
}

export const validateTradeData = (data: any): boolean => {
  return (
    data.payout > 0 &&
    data.entry_value > 0 &&
    ['win', 'loss'].includes(data.result) &&
    data.date &&
    data.date.length === 10
  )
}

// Storage utilities
export const getStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export const setStorageItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Silently fail if localStorage is not available
  }
}

export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Theme utilities
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'dark'
}

export const applyTheme = (theme: 'light' | 'dark'): void => {
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}