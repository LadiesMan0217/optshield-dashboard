import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, Edit3, Trash2, Filter, DollarSign, Calendar, TrendingUp, TrendingDown, List, PlusCircle } from 'lucide-react';
import { Modal } from '../modals/Modal';
import { Button, Input } from '../ui';
import { useBalanceTransactionsWithAuth } from '../../stores/useBalanceTransactionStore';
import { useAuth } from '../../hooks/useAuth';
import { BalanceTransaction } from '../../types';

interface BalanceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BalanceManagerModal: React.FC<BalanceManagerModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useBalanceTransactionsWithAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<BalanceTransaction | null>(null);
  const [formData, setFormData] = useState({
    type: 'deposit' as 'deposit' | 'withdrawal',
    value: '',
    currency: 'BRL',
    date: new Date().toISOString().split('T')[0],
  });
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  useEffect(() => {
    if (currentTransaction) {
      setFormData({
        type: currentTransaction.type,
        value: currentTransaction.value.toString(),
        currency: currentTransaction.currency,
        date: new Date(currentTransaction.date).toISOString().split('T')[0],
      });
      setActiveTab('form');
      setIsEditing(true);
    }
  }, [currentTransaction]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const transactionData = {
        type: formData.type,
        value: parseFloat(formData.value),
        currency: formData.currency,
        date: new Date(formData.date).getTime(),
      };

      if (isEditing && currentTransaction) {
        await updateTransaction(currentTransaction.id, transactionData);
      } else {
        await addTransaction(transactionData);
      }
      resetForm();
      setActiveTab('history');
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  const handleEdit = (transaction: BalanceTransaction) => {
    setCurrentTransaction(transaction);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentTransaction(null);
    setFormData({
      type: 'deposit',
      value: '',
      currency: 'BRL',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : currency === 'USD' ? 'USD' : 'EUR'
    }).format(value);
  };

  const filteredTransactions = transactions.filter(t =>
    (t.type || '').toLowerCase().includes(filter.toLowerCase()) ||
    (t.currency || '').toLowerCase().includes(filter.toLowerCase())
  );

  const getTransactionIcon = (type: 'deposit' | 'withdrawal') => {
    return type === 'deposit' ? (
      <TrendingUp className="w-5 h-5 text-green-400" />
    ) : (
      <TrendingDown className="w-5 h-5 text-red-400" />
    );
  };

  const getTransactionColor = (type: 'deposit' | 'withdrawal') => {
    return type === 'deposit' 
      ? 'border-l-green-500'
      : 'border-l-red-500';
  };

  const TabButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    icon: React.ElementType;
  }> = ({ label, isActive, onClick, icon: Icon }) => (
    <button
      onClick={onClick}
      className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold flex items-center justify-center transition-all duration-300 ${
        isActive
          ? 'bg-neutral-700/50 text-white shadow-md'
          : 'bg-transparent text-neutral-400 hover:bg-neutral-800/50'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gerenciar Saldo"
      size="md"
      hideTitle
    >
      <div className="relative bg-gradient-to-br from-black/80 via-black/70 to-black/80 backdrop-blur-xl border border-neutral-800/50 rounded-2xl shadow-2xl overflow-hidden">
        <div className="relative z-10 p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Gerenciar Saldo</h2>
            <p className="text-neutral-400 text-sm">Adicione ou veja o histórico de transações.</p>
          </div>

          <div className="bg-black/20 p-1 rounded-xl flex items-center mb-6">
            <TabButton
              label={isEditing ? "Editar Transação" : "Nova Transação"}
              isActive={activeTab === 'form'}
              onClick={() => setActiveTab('form')}
              icon={isEditing ? Edit3 : PlusCircle}
            />
            <TabButton
              label="Histórico"
              isActive={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              icon={List}
            />
          </div>

          {activeTab === 'form' && (
            <div className="animate-fade-in">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Transação</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-3 border border-neutral-700 rounded-lg bg-neutral-900/50 backdrop-blur-sm text-white focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all">
                    <option value="deposit">Depósito</option>
                    <option value="withdrawal">Retirada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Valor</label>
                  <Input type="number" name="value" value={formData.value} onChange={handleInputChange} placeholder="0.00" icon={DollarSign} iconPosition="left" required fullWidth />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Moeda</label>
                  <select name="currency" value={formData.currency} onChange={handleInputChange} className="w-full p-3 border border-neutral-700 rounded-lg bg-neutral-900/50 backdrop-blur-sm text-white focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all">
                    <option value="BRL">BRL</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Data</label>
                  <Input type="date" name="date" value={formData.date} onChange={handleInputChange} icon={Calendar} iconPosition="left" required fullWidth />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button type="submit" variant="premium" disabled={loading} className="flex-1 bg-gradient-to-r from-neutral-800 to-neutral-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    {isEditing ? 'Atualizar' : 'Adicionar'}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="secondary" onClick={resetForm}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-fade-in">
              <Input
                placeholder="Filtrar por tipo ou moeda..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                icon={Filter}
                iconPosition="left"
                fullWidth
                className="mb-4"
              />
              <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <PiggyBank className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma transação encontrada</p>
                  </div>
                ) : (
                  filteredTransactions.map(transaction => (
                    <div key={transaction.id} className={`p-3 rounded-lg border-l-4 ${getTransactionColor(transaction.type)} bg-neutral-800/50 border border-neutral-700/50`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-semibold text-white">{transaction.type === 'deposit' ? 'Depósito' : 'Retirada'}</p>
                            <p className="text-sm text-gray-400">{formatDate(new Date(transaction.date))}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className={`font-bold ${transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                              {transaction.type === 'deposit' ? '+' : '-'}
                              {formatCurrency(transaction.value || 0, transaction.currency)}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)} className="p-2 text-white hover:bg-white/10">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(transaction.id)} className="p-2 text-red-400 hover:bg-red-400/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};