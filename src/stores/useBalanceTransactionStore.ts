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
    
    // Garante que o saldo inicial seja um número válido
    const safeInitialBalance = isNaN(initialBalance) ? 0 : initialBalance;
    
    const totalBalance = transactions.reduce((total, transaction) => {
      // Garante que o amount seja um número válido
      const amount = isNaN(transaction.amount) ? 0 : transaction.amount;
      
      if (transaction.type === 'deposit') {
        return total + amount;
      } else if (transaction.type === 'withdrawal') {
        return total - amount;
      }
      return total;
    }, safeInitialBalance);
    
    // Garante que o resultado final seja um número válido
    return isNaN(totalBalance) ? 0 : totalBalance;
  },
}));

export { useBalanceTransactionStore };

export const useBalanceTransactionsWithAuth = () => {
  const { user } = useAuth();
  const {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    addTransaction: addTransactionToStore,
    updateTransaction: updateTransactionInStore,
    deleteTransaction: deleteTransactionInStore,
    clearTransactions,
    getTotalBalance,
  } = useBalanceTransactionStore();

  React.useEffect(() => {
    if (user?.id) {
      fetchTransactions(user.id);
    } else {
      clearTransactions();
    }
  }, [user?.id, fetchTransactions, clearTransactions]);

  const addTransaction = async (transactionData: Omit<BalanceTransaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user?.id) {
      console.error('❌ useBalanceTransactionsWithAuth.addTransaction: Usuário não autenticado ou sem ID.');
      throw new Error('Usuário não autenticado');
    }
    return addTransactionToStore(user.id, transactionData);
  };

  const updateTransaction = async (id: string, updates: Partial<BalanceTransaction>) => {
    if (!user?.id) throw new Error('Usuário não autenticado');
    return updateTransactionInStore(id, updates);
  };

  const deleteTransaction = async (id: string) => {
    if (!user?.id) throw new Error('Usuário não autenticado');
    return deleteTransactionInStore(id);
  };

  return {
    transactions,
    isLoading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTotalBalance,
    fetchTransactions,
    clearTransactions,
  };
};