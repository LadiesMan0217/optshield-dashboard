import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, DollarSign, TrendingUp, TrendingDown, Edit3, Trash2, Filter } from 'lucide-react';
import { Modal } from './Modal';
import { Button, Input, Card, CardContent, OrbitalLoader } from '../ui';
import { useTradesWithAuth } from '../../stores/useTradeStore';
import { useAuth } from '../../hooks/useAuth';
import { Trade, TradeType } from '../../types';
import { formatCurrency, formatDate } from '../../utils';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'win' | 'loss';
type SortType = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export const JournalModal: React.FC<JournalModalProps> = ({ isOpen, onClose }) => {
  const { trades, loading, deleteTrade } = useTradesWithAuth();
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date-desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFilter('all');
      setSort('date-desc');
      setSearchTerm('');
      setEditingTrade(null);
    }
  }, [isOpen]);

  // Filter and sort trades
  const filteredTrades = trades
    .filter(trade => {
      if (filter !== 'all' && trade.type !== filter) return false;
      if (searchTerm && !trade.notes?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

  const handleDeleteTrade = async (tradeId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este trade?')) {
      try {
        await deleteTrade(tradeId);
      } catch (error) {
        console.error('Erro ao excluir trade:', error);
      }
    }
  };

  const getTradeIcon = (type: TradeType) => {
    return type === 'win' ? (
      <TrendingUp className="w-5 h-5 text-green-600" />
    ) : (
      <TrendingDown className="w-5 h-5 text-red-600" />
    );
  };

  const getTradeColor = (type: TradeType) => {
    return type === 'win' 
      ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
      : 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Journal de Trades"
      size="xl"
    >
      <div className="p-6">
        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <Input
            placeholder="Buscar por anotações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Filter}
            iconPosition="left"
            fullWidth
          />
          
          {/* Filter and Sort Controls */}
          <div className="flex flex-wrap gap-4">
            {/* Filter by Type */}
            <div className="flex space-x-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todos
              </Button>
              <Button
                variant={filter === 'win' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('win')}
                className="text-green-600 hover:text-green-700"
              >
                Wins
              </Button>
              <Button
                variant={filter === 'loss' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('loss')}
                className="text-red-600 hover:text-red-700"
              >
                Losses
              </Button>
            </div>
            
            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="
                px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                text-sm
              "
            >
              <option value="date-desc">Data (Mais recente)</option>
              <option value="date-asc">Data (Mais antigo)</option>
              <option value="amount-desc">Valor (Maior)</option>
              <option value="amount-asc">Valor (Menor)</option>
            </select>
          </div>
        </div>

        {/* Trades List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <OrbitalLoader 
                className="w-8 h-8" 
                message="Carregando trades..." 
                messagePlacement="bottom"
              />
            </div>
          ) : filteredTrades.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filter !== 'all' 
                  ? 'Nenhum trade encontrado com os filtros aplicados'
                  : 'Nenhum trade registrado ainda'
                }
              </p>
            </div>
          ) : (
            filteredTrades.map((trade) => (
              <Card key={trade.id} className={`border-l-4 ${getTradeColor(trade.type)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getTradeIcon(trade.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-4 mb-2">
                          <span className={`font-semibold ${
                            trade.type === 'win' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                          }`}>
                            {formatCurrency(trade.amount, user?.currency || 'BRL')}
                          </span>
                          
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(trade.date)}
                          </div>
                          
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Risco: {trade.risk}%
                          </div>
                        </div>
                        
                        {trade.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                            {trade.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTrade(trade)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTrade(trade.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredTrades.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total de Trades</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {filteredTrades.length}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Wins</p>
                <p className="text-lg font-semibold text-green-600">
                  {filteredTrades.filter(t => t.type === 'win').length}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Losses</p>
                <p className="text-lg font-semibold text-red-600">
                  {filteredTrades.filter(t => t.type === 'loss').length}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">P&L Total</p>
                <p className={`text-lg font-semibold ${
                  filteredTrades.reduce((sum, t) => sum + (t.type === 'win' ? t.amount : -t.amount), 0) >= 0
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(
                    filteredTrades.reduce((sum, t) => sum + (t.type === 'win' ? t.amount : -t.amount), 0),
                    user?.currency || 'BRL'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};