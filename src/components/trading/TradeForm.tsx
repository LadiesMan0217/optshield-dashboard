import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Target, FileText } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../ui';
import { useTradesWithAuth } from '../../stores/useTradeStore';
import { useAuth } from '../../hooks/useAuth';
import { TradeType } from '../../types';
import { validateTradeData } from '../../utils';

interface TradeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onSuccess, onCancel }) => {
  const { addTrade, loading } = useTradesWithAuth();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: 'win' as TradeType,
    amount: '',
    risk: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const validation = validateTradeData({
      type: formData.type,
      amount: parseFloat(formData.amount),
      risk: parseFloat(formData.risk),
      date: new Date(formData.date),
      notes: formData.notes
    });

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await addTrade({
        type: formData.type,
        amount: parseFloat(formData.amount),
        risk: parseFloat(formData.risk),
        date: new Date(formData.date),
        notes: formData.notes.trim() || null
      });
      
      // Reset form
      setFormData({
        type: 'win',
        amount: '',
        risk: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      onSuccess?.();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Erro ao registrar trade' });
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
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span>Registrar Trade</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trade Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo de Trade
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('type', 'win')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'win'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                }`}
              >
                <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Win</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Trade positivo</div>
              </button>
              
              <button
                type="button"
                onClick={() => handleInputChange('type', 'loss')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'loss'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600'
                }`}
              >
                <TrendingDown className="w-6 h-6 mx-auto mb-2" />
                <div className="font-medium">Loss</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Trade negativo</div>
              </button>
            </div>
            {errors.type && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.type}</p>
            )}
          </div>

          {/* Amount */}
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

          {/* Risk */}
          <Input
            label="Risco (%)"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.risk}
            onChange={(e) => handleInputChange('risk', e.target.value)}
            error={errors.risk}
            icon={Target}
            iconPosition="left"
            placeholder="2.0"
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

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observações (opcional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Adicione observações sobre este trade..."
                rows={3}
                className="
                  w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors duration-200 resize-none
                "
              />
            </div>
            {errors.notes && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.notes}</p>
            )}
          </div>

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
              Registrar Trade
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};