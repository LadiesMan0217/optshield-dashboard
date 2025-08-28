import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, Edit3, Trash2, Filter, DollarSign, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Modal } from '../modals/Modal';
import { Button, Input, Card, CardContent } from '../ui';
import { useBalanceTransactionsWithAuth } from '../../stores/useBalanceTransactionStore';
import { useAuth } from '../../hooks/useAuth';
import { BalanceTransaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils';

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

  useEffect(() => {
    if (currentTransaction) {
      setFormData({
        type: currentTransaction.type,
        value: currentTransaction.value.toString(),
        currency: currentTransaction.currency,
        date: new Date(currentTransaction.date).toISOString().split('T')[0],
      });
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
        await addTransaction(user.uid, transactionData);
      }
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  const handleEdit = (transaction: BalanceTransaction) => {
    setIsEditing(true);
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
      <TrendingUp className="w-5 h-5 text-green-600" />
    ) : (
      <TrendingDown className="w-5 h-5 text-red-600" />
    );
  };

  const getTransactionColor = (type: 'deposit' | 'withdrawal') => {
    return type === 'deposit' 
      ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
      : 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Transação' : 'Gerenciar Saldo'}
      size="xl"
    >
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Transação */}
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <PiggyBank className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isEditing ? 'Editar Transação' : 'Nova Transação'}
                  </h3>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Transação
                    </label>
                    <select 
                      name="type" 
                      value={formData.type} 
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="deposit">Depósito</option>
                      <option value="withdrawal">Retirada</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Valor
                    </label>
                    <Input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      icon={DollarSign}
                      iconPosition="left"
                      required
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Moeda
                    </label>
                    <select 
                      name="currency" 
                      value={formData.currency} 
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="BRL">BRL</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data
                    </label>
                    <Input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      icon={Calendar}
                      iconPosition="left"
                      required
                      fullWidth
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isEditing ? 'Atualizar' : 'Adicionar'}
                    </Button>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={resetForm}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Histórico de Transações */}
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Histórico de Transações
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredTransactions.length} transações
                  </span>
                </div>
                
                <Input
                  placeholder="Filtrar por tipo ou moeda..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  icon={Filter}
                  iconPosition="left"
                  fullWidth
                  className="mb-4"
                />
                
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <PiggyBank className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma transação encontrada</p>
                    </div>
                  ) : (
                    filteredTransactions.map(transaction => (
                      <div
                        key={transaction.id}
                        className={`p-4 rounded-lg border-l-4 ${getTransactionColor(transaction.type)} border border-gray-200 dark:border-gray-700`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {transaction.type === 'deposit' ? 'Depósito' : 'Retirada'}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(new Date(transaction.date))}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className={`font-bold ${
                                transaction.type === 'deposit' 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {transaction.type === 'deposit' ? '+' : '-'}
                                {formatCurrency(transaction.value || 0, transaction.currency)}
                              </p>
                            </div>
                            
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(transaction)}
                                className="p-2"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(transaction.id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Modal>
  );
};