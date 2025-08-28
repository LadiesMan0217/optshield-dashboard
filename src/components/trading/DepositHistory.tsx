import React, { useState, useEffect } from 'react';
import { History, Edit3, Trash2, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Modal } from '../ui';
import { useDepositsWithAuth } from '../../stores/useDepositStore';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDate } from '../../utils';
import { Deposit } from '../../types';
import { DepositForm } from './DepositForm';

interface DepositHistoryProps {
  onClose?: () => void;
}

export const DepositHistory: React.FC<DepositHistoryProps> = ({ onClose }) => {
  const { deposits, loading, fetchDeposits, deleteDeposit } = useDepositsWithAuth();
  const { user } = useAuth();
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [deletingDeposit, setDeletingDeposit] = useState<Deposit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch deposits when component mounts
  useEffect(() => {
    if (user) {
      fetchDeposits();
    }
  }, [user, fetchDeposits]);

  // Filter deposits for current month
  const currentMonthDeposits = deposits.filter(deposit => {
    const depositDate = new Date(deposit.date);
    const currentDate = new Date();
    return (
      depositDate.getMonth() === currentDate.getMonth() &&
      depositDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Calculate total deposits for current month
  const totalCurrentMonth = currentMonthDeposits.reduce((sum, deposit) => sum + deposit.amount, 0);

  const handleEdit = (deposit: Deposit) => {
    setEditingDeposit(deposit);
  };

  const handleDelete = async () => {
    if (!deletingDeposit) return;
    
    setIsDeleting(true);
    try {
      await deleteDeposit(deletingDeposit.id);
      setDeletingDeposit(null);
    } catch (error) {
      console.error('Erro ao excluir depósito:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setEditingDeposit(null);
    fetchDeposits(); // Refresh the list
  };

  const currentMonth = new Date().toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando histórico...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-green-600" />
              <span>Histórico de Depósitos - {currentMonth}</span>
            </div>
            {onClose && (
              <Button variant="secondary" size="sm" onClick={onClose}>
                Fechar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Summary */}
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Total depositado em {currentMonth.toLowerCase()}
              </span>
              <span className="text-lg font-bold text-green-700 dark:text-green-300">
                {formatCurrency(totalCurrentMonth, user?.currency || 'BRL')}
              </span>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              {currentMonthDeposits.length} depósito{currentMonthDeposits.length !== 1 ? 's' : ''} registrado{currentMonthDeposits.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Deposits List */}
          {currentMonthDeposits.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                Nenhum depósito registrado este mês
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Os depósitos registrados aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentMonthDeposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(deposit.amount, deposit.currency)}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(deposit.date)}</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                          {deposit.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(deposit)}
                      className="p-2"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeletingDeposit(deposit)}
                      className="p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingDeposit && (
        <Modal
          isOpen={true}
          onClose={() => setEditingDeposit(null)}
          size="md"
          showCloseButton={false}
        >
          <div className="p-6">
            <DepositForm
              initialData={editingDeposit}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingDeposit(null)}
              isEditing={true}
            />
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDeposit && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingDeposit(null)}
          size="sm"
        >
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Excluir Depósito
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Valor do depósito:
              </div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(deletingDeposit.amount, deletingDeposit.currency)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Data: {formatDate(deletingDeposit.date)}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setDeletingDeposit(null)}
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={isDeleting}
                fullWidth
              >
                Excluir
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};