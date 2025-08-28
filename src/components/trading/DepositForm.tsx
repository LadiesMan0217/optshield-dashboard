import React, { useState, useEffect } from 'react';
import { PiggyBank, Calendar, DollarSign, Globe, Edit3 } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../ui';
import { useDepositsWithAuth } from '../../stores/useDepositStore';
import { useAuth } from '../../hooks/useAuth';
import { Deposit } from '../../types';

interface DepositFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Deposit;
  isEditing?: boolean;
}

export const DepositForm: React.FC<DepositFormProps> = ({ onSuccess, onCancel, initialData, isEditing = false }) => {
  const { addDeposit, updateDeposit, loading } = useDepositsWithAuth();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: initialData?.amount?.toString() || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    currency: (initialData?.currency || user?.currency || 'BRL') as 'BRL' | 'USD' | 'EUR'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    if (!formData.currency) {
      newErrors.currency = 'Moeda é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isEditing && initialData) {
        await updateDeposit(initialData.id, {
          amount: parseFloat(formData.amount),
          date: formData.date,
          currency: formData.currency
        });
      } else {
        await addDeposit({
          amount: parseFloat(formData.amount),
          date: formData.date,
          currency: formData.currency
        });
      }
      
      // Reset form only if not editing
      if (!isEditing) {
        setFormData({
          amount: '',
          date: new Date().toISOString().split('T')[0],
          currency: (user?.currency || 'BRL') as 'BRL' | 'USD' | 'EUR'
        });
      }
      
      onSuccess?.();
    } catch (error: any) {
      setErrors({ submit: error.message || (isEditing ? 'Erro ao atualizar depósito' : 'Erro ao registrar depósito') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {isEditing ? (
            <Edit3 className="w-5 h-5 text-blue-600" />
          ) : (
            <PiggyBank className="w-5 h-5 text-green-600" />
          )}
          <span>{isEditing ? 'Editar Depósito' : 'Registrar Depósito'}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Moeda da Conta
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('currency', 'BRL')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.currency === 'BRL'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                }`}
              >
                <Globe className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Real</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">BRL (R$)</div>
              </button>
              
              <button
                type="button"
                onClick={() => handleInputChange('currency', 'USD')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.currency === 'USD'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                }`}
              >
                <DollarSign className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Dólar</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">USD ($)</div>
              </button>
              
              <button
                type="button"
                onClick={() => handleInputChange('currency', 'EUR')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.currency === 'EUR'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                }`}
              >
                <Globe className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Euro</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">EUR (€)</div>
              </button>
            </div>
          </div>

          {/* Amount */}
          <Input
            label={`Valor (${formData.currency === 'BRL' ? 'R$' : formData.currency === 'USD' ? '$' : '€'})`}
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

          {/* Date */}
          <Input
            label="Data"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            error={errors.date}
            icon={Calendar}
            iconPosition="left"
            fullWidth
          />



          {/* Submit Error */}
          {errors.submit && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                fullWidth
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              fullWidth
            >
              {isEditing ? 'Atualizar Depósito' : 'Registrar Depósito'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};