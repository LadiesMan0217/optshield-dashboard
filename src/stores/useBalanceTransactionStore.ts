import React from 'react';
import { create } from 'zustand';
import { firebaseDb } from '../lib/firebase.db';
import { BalanceTransaction } from '../lib/firebase.types';
import { useAuth } from '../hooks/useAuth';

interface BalanceTransactionState {
  transactions: BalanceTransaction[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTransactions: (userId: string) => Promise<void>;
  addTransaction: (userId: string, transactionData: Omit<BalanceTransaction, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Omit<BalanceTransaction, 'id' | 'createdAt'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearTransactions: () => void;
  getTotalBalance: (initialBalance: number) => number;
}

export const useBalanceTransactionStore = create<BalanceTransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async (userId: string) => {
    if (!userId) {
      console.warn('useBalanceTransactionStore: Usuário não autenticado');
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const transactions = await firebaseDb.getBalanceTransactions(userId);
      set({ transactions, isLoading: false });
    } catch (error) {
      console.error('Erro ao buscar transações de saldo:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false 
      });
    }
  },

  addTransaction: async (userId: string, transactionData) => {
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    set({ isLoading: true, error: null });
    
    try {
      const newTransaction = await firebaseDb.addBalanceTransaction({
        ...transactionData,
        userId: userId
      });
      
      const { transactions } = get();
      set({ 
        transactions: [newTransaction, ...transactions],
        isLoading: false 
      });
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false 
      });
      throw error;
    }
  },

  clearTransactions: () => {
    set({ transactions: [], error: null });
  },

  updateTransaction: async (id: string, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedTransaction = await firebaseDb.updateBalanceTransaction(id, updates);
      
      const { transactions } = get();
      set({ 
        transactions: transactions.map(t => 
          t.id === id ? updatedTransaction : t
        ),
        isLoading: false 
      });
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteTransaction: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await firebaseDb.deleteBalanceTransaction(id);
      
      const { transactions } = get();
      set({ 
        transactions: transactions.filter(t => t.id !== id),
        isLoading: false 
      });
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false 
      });
      throw error;
    }
  },

  getTotalBalance: (initialBalance: number) => {
    const { transactions } = get();
    
    return transactions.reduce((total, transaction) => {
      if (transaction.type === 'deposit') {
        return total + transaction.amount;
      } else if (transaction.type === 'withdrawal') {
        return total - transaction.amount;
      }
      return total;
    }, initialBalance);
  }
}));

// Hook personalizado para usar com autenticação
export const useBalanceTransactionsWithAuth = () => {
  const { user } = useAuth();
  const store = useBalanceTransactionStore();
  
  React.useEffect(() => {
    if (user?.id) {
      store.fetchTransactions(user.id);
    } else {
      store.clearTransactions();
    }
  }, [user?.id, store.fetchTransactions, store.clearTransactions]);

  const addTransactionWithAuth = React.useCallback(
    (transactionData: Omit<BalanceTransaction, 'id' | 'createdAt' | 'userId'>) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }
      return store.addTransaction(user.id, transactionData);
    },
    [user?.id, store.addTransaction]
  );

  const updateTransactionWithAuth = React.useCallback(
    (id: string, updates: Partial<Omit<BalanceTransaction, 'id' | 'createdAt'>>) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }
      return store.updateTransaction(id, updates);
    },
    [user?.id, store.updateTransaction]
  );

  const deleteTransactionWithAuth = React.useCallback(
    (id: string) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }
      return store.deleteTransaction(id);
    },
    [user?.id, store.deleteTransaction]
  );
  
  return {
    ...store,
    addTransaction: addTransactionWithAuth,
    updateTransaction: updateTransactionWithAuth,
    deleteTransaction: deleteTransactionWithAuth
  };
};