import { create } from 'zustand'
import { useCallback } from 'react'
import { firebaseDb } from '../lib/firebase.db'
import type { Trade, TradeState } from '../types'
import { useAuth } from '../hooks/useAuth'

interface TradeStore extends TradeState {
  fetchTrades: (userId: string, startDate?: string, endDate?: string) => Promise<void>
  reset: () => void
}

export const useTradeStore = create<TradeStore>((set, get) => ({
  trades: [],
  loading: false,

  fetchTrades: async (userId: string, startDate?: string, endDate?: string) => {
    if (!userId) {
      console.warn('fetchTrades: userId é obrigatório')
      return
    }
    set({ loading: true })
    try {
      const trades = await firebaseDb.getTrades(userId, startDate, endDate)
      set({ trades, loading: false })
    } catch (error) {
      console.error('Erro ao buscar trades:', error)
      set({ loading: false })
    }
  },

  addTrade: async (tradeData) => {
    set({ loading: true })
    try {
      // Get current user from auth context
      const userId = get().trades[0]?.userId // This is a workaround, ideally we'd get userId from context
      if (!userId) throw new Error('User not authenticated')

      const newTrade = await firebaseDb.addTrade({
        ...tradeData,
        userId: userId,
      })

      set((state) => ({
        trades: [newTrade, ...state.trades],
        loading: false,
      }))
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  updateTrade: async (id, updates) => {
    set({ loading: true })
    try {
      const updatedTrade = await firebaseDb.updateTrade(id, updates)
      
      set((state) => ({
        trades: state.trades.map((trade) =>
          trade.id === id ? updatedTrade : trade
        ),
        loading: false,
      }))
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  deleteTrade: async (id) => {
    set({ loading: true })
    try {
      await firebaseDb.deleteTrade(id)
      
      set((state) => ({
        trades: state.trades.filter((trade) => trade.id !== id),
        loading: false,
      }))
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  getTradesByDate: (date) => {
    return get().trades.filter((trade) => {
      const tradeDate = new Date(trade.date)
      const targetDate = new Date(date)
      return tradeDate.toDateString() === targetDate.toDateString()
    })
  },

  getTradesByPeriod: (startDate, endDate) => {
    return get().trades.filter(
      (trade) => {
        const tradeDate = new Date(trade.date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        return tradeDate >= start && tradeDate <= end
      }
    )
  },

  reset: () => {
    set({ trades: [], loading: false })
  },
}))

// Hook to use trade store with auth context
export const useTradesWithAuth = () => {
  const { user } = useAuth()
  const store = useTradeStore()

  const fetchTrades = useCallback(async (startDate?: string, endDate?: string) => {
    if (!user) {
      console.warn('useTradesWithAuth: Tentativa de buscar trades sem usuário autenticado')
      return
    }
    return store.fetchTrades(user.id, startDate, endDate)
  }, [user, store.fetchTrades])

  const addTrade = useCallback(async (tradeData: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated')
    console.log('🔍 useTradesWithAuth.addTrade: Usuário autenticado:', user.id)
    return firebaseDb.addTrade({
      ...tradeData,
      userId: user.id,
    }).then((newTrade) => {
      useTradeStore.setState((state) => ({
        trades: [newTrade, ...state.trades],
      }))
      return newTrade
    })
  }, [user])

  const updateTrade = useCallback(async (id: string, updates: Partial<Trade>) => {
    if (!user) throw new Error('User not authenticated')
    return store.updateTrade(id, updates)
  }, [user, store.updateTrade])

  const deleteTrade = useCallback(async (id: string) => {
    if (!user) throw new Error('User not authenticated')
    return store.deleteTrade(id)
  }, [user, store.deleteTrade])

  const getTradesByDate = useCallback((date: string) => {
    return store.getTradesByDate(date)
  }, [store.getTradesByDate])

  const getTradesByPeriod = useCallback((startDate: string, endDate: string) => {
    return store.getTradesByPeriod(startDate, endDate)
  }, [store.getTradesByPeriod])

  return {
    trades: store.trades,
    loading: store.loading,
    fetchTrades,
    addTrade,
    updateTrade,
    deleteTrade,
    getTradesByDate,
    getTradesByPeriod,
  }
}