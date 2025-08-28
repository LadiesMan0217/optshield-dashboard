import React from 'react';
import { create } from 'zustand';
import { firebaseDb } from '../lib/firebase.db';
import { BalanceTransaction } from '../types';
import { useAuth } from '../hooks/useAuth';

interface BalanceTransactionState {
  transactions: BalanceTransaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (userId: string) => Promise<void>;
  addTransaction: (userId: string, transactionData: Omit<BalanceTransaction, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Omit<BalanceTransaction, 'id' | 'createdAt' | 'userId'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearTransactions: () => void;
  getTotalBalance: (initialBalance?: number) => number;
}

const useBalanceTransactionStore = create<BalanceTransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async (userId: string) => {
    if (!userId) return;

    set({ isLoading: true, error: null });
    try {
      const transactions = await firebaseDb.getBalanceTransactions(userId);
      set({ transactions, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
    }
  },

  addTransaction: async (userId: string, transactionData) => {
    if (!userId) throw new Error('Usuário não autenticado');

    set({ isLoading: true, error: null });
    try {
      const newTransaction = await firebaseDb.addBalanceTransaction({ ...transactionData, userId });
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateTransaction: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTransaction = await firebaseDb.updateBalanceTransaction(id, updates);
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? updatedTransaction : t)),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await firebaseDb.deleteBalanceTransaction(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearTransactions: () => {
    set({ transactions: [], error: null });
  },

  getTotalBalance: (initialBalance: number = 0) => {
    const { transactions } = get();
    
    return transactions.reduce((total, transaction) => {
      if (transaction.type === 'deposit') {
        return total + transaction.amount;
      } else if (transaction.type === 'withdrawal') {
        return total - transaction.amount;
      }
      return total;
    }, initialBalance);
  },
}));

export { useBalanceTransactionStore };

export const useBalanceTransactionsWithAuth = () => {
  const { user } = useAuth();
  const store = useBalanceTransactionStore();

  React.useEffect(() => {
    if (user) {
      store.fetchTransactions();
    } else {
      store.clearTransactions();
    }
  }, [user, store]);

  return store;
};