import { create } from 'zustand'
import { firebaseDb } from '../lib/firebase.db'
import type { Deposit, DepositState } from '../types'
import { useAuth } from '../hooks/useAuth'

interface DepositStore extends DepositState {
  fetchDeposits: (userId: string) => Promise<void>
  reset: () => void
}

export const useDepositStore = create<DepositStore>((set, get) => ({
  deposits: [],
  loading: false,

  fetchDeposits: async (userId: string) => {
    if (!userId) {
      console.warn('fetchDeposits: userId é obrigatório')
      return
    }
    set({ loading: true })
    try {
      const deposits = await firebaseDb.getDeposits(userId)
      set({ deposits, loading: false })
    } catch (error) {
      console.error('Erro ao buscar depósitos:', error)
      set({ loading: false })
    }
  },

  addDeposit: async (depositData) => {
    set({ loading: true })
    try {
      const userId = get().deposits[0]?.userId
      if (!userId) throw new Error('User not authenticated')

      const newDeposit = await firebaseDb.addDeposit({
        ...depositData,
        userId: userId,
      })

      set((state) => ({
        deposits: [newDeposit, ...state.deposits],
        loading: false,
      }))
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  updateDeposit: async (id, updates) => {
    set({ loading: true })
    try {
      const updatedDeposit = await firebaseDb.updateDeposit(id, updates)
      
      set((state) => ({
        deposits: state.deposits.map((deposit) =>
          deposit.id === id ? updatedDeposit : deposit
        ),
        loading: false,
      }))
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  deleteDeposit: async (id) => {
    set({ loading: true })
    try {
      await firebaseDb.deleteDeposit(id)
      
      set((state) => ({
        deposits: state.deposits.filter((deposit) => deposit.id !== id),
        loading: false,
      }))
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  getTotalDeposits: () => {
    return get().deposits.reduce((total, deposit) => total + deposit.amount, 0)
  },

  reset: () => {
    set({ deposits: [], loading: false })
  },
}))

// Hook to use deposit store with auth context
export const useDepositsWithAuth = () => {
  const { user } = useAuth()
  const store = useDepositStore()

  const fetchDeposits = async () => {
    if (!user) {
      console.warn('useDepositsWithAuth: Tentativa de buscar depósitos sem usuário autenticado')
      return
    }
    return store.fetchDeposits(user.id)
  }

  const addDeposit = async (depositData: Omit<Deposit, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated')
    return firebaseDb.addDeposit({
      ...depositData,
      userId: user.id,
    }).then((newDeposit) => {
      useDepositStore.setState((state) => ({
        deposits: [newDeposit, ...state.deposits],
      }))
      return newDeposit
    })
  }

  const updateDeposit = async (id: string, updates: Partial<Omit<Deposit, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) throw new Error('User not authenticated')
    return store.updateDeposit(id, updates)
  }

  const deleteDeposit = async (id: string) => {
    if (!user) throw new Error('User not authenticated')
    return store.deleteDeposit(id)
  }

  return {
    ...store,
    fetchDeposits,
    addDeposit,
    updateDeposit,
    deleteDeposit,
  }
}