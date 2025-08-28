import React, { useState, useMemo } from 'react';
import { PlusCircle, MinusCircle, Calendar, DollarSign, Globe, TrendingUp, TrendingDown, X, Edit2, Trash2, History, Filter, Search } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { useBalanceTransactionsWithAuth } from '../../stores/useBalanceTransactionStore';
import { formatCurrency } from '../../utils';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { BalanceTransaction } from '../../lib/firebase.types';

interface BalanceManagerProps {
  isOpen: boolean;
  onClose: () => void;
  initialBalance: number;
}

export const BalanceManager: React.FC<BalanceManagerProps> = ({ isOpen, onClose, initialBalance }) => {
  const { user } = useAuth()
  const { transactions, addTransaction, updateTransaction, deleteTransaction, isLoading } = useBalanceTransactionsWithAuth()
  
  const [activeTab, setActiveTab] = useState<'register' | 'history'>('register')
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit')
  const [formData, setFormData] = useState({
    amount: '',
    date: format(new Date(), 'dd/MM/yyyy')
  })
  const [editingTransaction, setEditingTransaction] = useState<BalanceTransaction | null>(null)
  const [errors, setErrors] = useState<{ amount?: string; date?: string }>({})
  
  // Filter states
  const [filterMonth, setFilterMonth] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal'>('all')

  // Filtered and grouped transactions
  const filteredAndGroupedTransactions = useMemo(() => {
    let filtered = [...transactions]
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType)
    }
    
    // Filter by month
    if (filterMonth) {
      const [year, month] = filterMonth.split('-')
      filtered = filtered.filter(t => {
        let transactionDate: Date
        
        if (typeof t.date === 'string') {
          const [day, monthStr, yearStr] = t.date.split('/')
          transactionDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(day))
        } else {
          transactionDate = new Date(t.date)
        }
        
        return !isNaN(transactionDate.getTime()) &&
               transactionDate.getFullYear() === parseInt(year) && 
               transactionDate.getMonth() === parseInt(month) - 1
      })
    }
    
    // Filter by date range
    if (filterStartDate && filterEndDate) {
      const startDate = parseISO(filterStartDate)
      const endDate = parseISO(filterEndDate)
      filtered = filtered.filter(t => {
        let transactionDate: Date
        
        if (typeof t.date === 'string') {
          const [day, month, year] = t.date.split('/')
          transactionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        } else {
          transactionDate = new Date(t.date)
        }
        
        return !isNaN(transactionDate.getTime()) &&
               isWithinInterval(transactionDate, { start: startDate, end: endDate })
      })
    }
    
    // Group by month
    const grouped = filtered.reduce((acc, transaction) => {
      let transactionDate: Date
      
      // Handle both string and Date formats
      if (typeof transaction.date === 'string') {
        // Parse date from dd/MM/yyyy format
        const [day, month, year] = transaction.date.split('/')
        transactionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      } else {
        // Already a Date object
        transactionDate = new Date(transaction.date)
      }
      
      // Check if date is valid
      if (isNaN(transactionDate.getTime())) {
        console.warn('Invalid date found:', transaction.date)
        return acc
      }
      
      const monthKey = format(transactionDate, 'yyyy-MM')
      const monthLabel = format(transactionDate, 'MMMM yyyy', { locale: ptBR })
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          label: monthLabel,
          transactions: []
        }
      }
      
      acc[monthKey].transactions.push(transaction)
      return acc
    }, {} as Record<string, { label: string; transactions: BalanceTransaction[] }>)
    
    // Sort months in descending order
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, value]) => ({ key, ...value }))
  }, [transactions, filterType, filterMonth, filterStartDate, filterEndDate])

  const validateForm = () => {
    const newErrors: { amount?: string; date?: string } = {}
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero'
    }
    
    if (!formData.date) {
      newErrors.date = 'Data é obrigatória'
    } else {
      // Validate dd/MM/yyyy format
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
      const match = formData.date.match(dateRegex)
      
      if (!match) {
        newErrors.date = 'Data deve estar no formato dd/MM/yyyy'
      } else {
        const [, day, month, year] = match
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        
        if (
          date.getDate() !== parseInt(day) ||
          date.getMonth() !== parseInt(month) - 1 ||
          date.getFullYear() !== parseInt(year)
        ) {
          newErrors.date = 'Data inválida'
        }
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !user) return
    
    try {
      // Convert dd/MM/yyyy to ISO format
      const [day, month, year] = formData.date.split('/')
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          type: transactionType,
          amount: parseFloat(formData.amount),
          date: isoDate
        })
        setEditingTransaction(null)
      } else {
        await addTransaction({
          type: transactionType,
          amount: parseFloat(formData.amount),
          date: isoDate
        })
      }
      
      // Reset form
      setFormData({
        amount: '',
        date: format(new Date(), 'dd/MM/yyyy')
      })
      setErrors({})
      setTransactionType('deposit')
      
      if (!editingTransaction) {
        onClose()
      }
    } catch (error) {
      console.error('Erro ao processar transação:', error)
    }
  }

  const handleEdit = (transaction: BalanceTransaction) => {
    setEditingTransaction(transaction)
    setTransactionType(transaction.type)
    setFormData({
      amount: transaction.amount.toString(),
      date: format(parseISO(transaction.date), 'dd/MM/yyyy')
    })
    setActiveTab('register')
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteTransaction(id)
      } catch (error) {
        console.error('Erro ao excluir transação:', error)
      }
    }
  }

  const cancelEdit = () => {
    setEditingTransaction(null)
    setFormData({
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd')
    })
    setTransactionType('deposit')
    setErrors({})
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTypeChange = (type) => {
    setTransactionType(type);
    // Limpar erros ao mudar tipo
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span>Gerenciar Saldo</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 mt-4">
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'register'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 inline mr-2" />
                  Registrar
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'history'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <History className="w-4 h-4 inline mr-2" />
                  Histórico
                </button>
              </div>
            </CardHeader>
            
            <CardContent className="max-h-[60vh] overflow-y-auto">
              {activeTab === 'register' ? (
                <div>
                  {editingTransaction && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        Editando transação de {format(new Date(editingTransaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                      <button
                        onClick={cancelEdit}
                        className="text-sm text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200 underline mt-1"
                      >
                        Cancelar edição
                      </button>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tipo de Transação */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Tipo de Transação
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleTypeChange('deposit')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            transactionType === 'deposit'
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                              : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                          }`}
                        >
                          <PlusCircle className="w-6 h-6 mx-auto mb-2" />
                          <div className="font-medium">Depósito</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Adicionar saldo</div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleTypeChange('withdrawal')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            transactionType === 'withdrawal'
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                              : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600'
                          }`}
                        >
                          <MinusCircle className="w-6 h-6 mx-auto mb-2" />
                          <div className="font-medium">Saque</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Retirar saldo</div>
                        </button>
                      </div>
                    </div>

                    {/* Valor */}
                    <Input
                      label={`Valor (${user?.currency === 'BRL' ? 'R$' : user?.currency === 'USD' ? '$' : '€'})`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      error={errors.amount}
                      icon={DollarSign}
                      iconPosition="left"
                      placeholder="0.00"
                      fullWidth
                    />

                    {/* Data */}
                    <Input
                      label="Data (dd/MM/yyyy)"
                      type="text"
                      value={formData.date}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '')
                        if (value.length >= 2) {
                          value = value.substring(0, 2) + '/' + value.substring(2)
                        }
                        if (value.length >= 5) {
                          value = value.substring(0, 5) + '/' + value.substring(5, 9)
                        }
                        handleInputChange('date', value)
                      }}
                      placeholder="dd/MM/yyyy"
                      maxLength={10}
                      error={errors.date}
                      icon={Calendar}
                      iconPosition="left"
                      fullWidth
                    />

                    {/* Informação sobre impacto */}
                    <div className={`p-3 rounded-lg text-sm ${
                      transactionType === 'deposit' 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {transactionType === 'deposit' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-medium">
                          {transactionType === 'deposit' 
                            ? 'Este depósito aumentará seu Saldo Total'
                            : 'Este saque diminuirá seu Saldo Total'
                          }
                        </span>
                      </div>
                      <p className="mt-1 text-xs opacity-75">
                        {transactionType === 'deposit' 
                          ? 'Depósitos não afetam o Lucro/Prejuízo do Mês, apenas o Saldo Total.'
                          : 'Saques não afetam o Lucro/Prejuízo do Mês, apenas o Saldo Total.'
                        }
                      </p>
                    </div>

                    {/* Ações */}
                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={editingTransaction ? cancelEdit : onClose}
                        fullWidth
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant={transactionType === 'deposit' ? 'primary' : 'danger'}
                        loading={isLoading}
                        fullWidth
                      >
                        {editingTransaction ? 'Atualizar' :
                          transactionType === 'deposit' ? 'Registrar Depósito' : 'Registrar Saque'
                        }
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  {/* Balance Summary */}
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Resumo do Saldo</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-blue-600 dark:text-blue-400">Saldo Inicial</p>
                        <p className="font-semibold text-blue-900 dark:text-blue-300">{formatCurrency(initialBalance)}</p>
                      </div>
                      <div>
                        <p className="text-green-600 dark:text-green-400">Total Depósitos</p>
                        <p className="font-semibold text-green-700 dark:text-green-300">
                          {formatCurrency(transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-red-600 dark:text-red-400">Total Saques</p>
                        <p className="font-semibold text-red-700 dark:text-red-300">
                          {formatCurrency(transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0))}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Histórico de Transações</h3>
                      <Filter className="w-5 h-5 text-gray-400" />
                    </div>
                    
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tipo
                        </label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value as 'all' | 'deposit' | 'withdrawal')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="all">Todos</option>
                          <option value="deposit">Depósitos</option>
                          <option value="withdrawal">Saques</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Mês
                        </label>
                        <input
                          type="month"
                          value={filterMonth}
                          onChange={(e) => setFilterMonth(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Data Início
                        </label>
                        <input
                          type="date"
                          value={filterStartDate}
                          onChange={(e) => setFilterStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Data Fim
                        </label>
                        <input
                          type="date"
                          value={filterEndDate}
                          onChange={(e) => setFilterEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                    
                    {/* Clear Filters Button */}
                    {(filterType !== 'all' || filterMonth || filterStartDate || filterEndDate) && (
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFilterType('all')
                            setFilterMonth('')
                            setFilterStartDate('')
                            setFilterEndDate('')
                          }}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Limpar Filtros
                        </Button>
                      </div>
                    )}
                    
                    {transactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <History className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p>Nenhuma transação registrada</p>
                      </div>
                    ) : filteredAndGroupedTransactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Search className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p>Nenhuma transação encontrada com os filtros aplicados</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {filteredAndGroupedTransactions.map((monthGroup) => (
                          <div key={monthGroup.key} className="space-y-3">
                            {/* Month Header */}
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                                {monthGroup.label}
                              </h4>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                ({monthGroup.transactions.length} transaç{monthGroup.transactions.length === 1 ? 'ão' : 'ões'})
                              </span>
                            </div>
                            
                            {/* Transactions for this month */}
                            <div className="space-y-2 pl-6">
                              {monthGroup.transactions.map((transaction) => (
                                <div
                                  key={transaction.id}
                                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                      transaction.type === 'deposit' 
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                    }`}>
                                      {transaction.type === 'deposit' ? 
                                        <TrendingUp className="w-4 h-4" /> : 
                                        <TrendingDown className="w-4 h-4" />
                                      }
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                                      </p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {format(parseISO(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    <span className={`font-semibold ${
                                      transaction.type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                      {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                    </span>
                                    
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(transaction)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(transaction.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};