import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Plus, Calendar, Target, DollarSign, Percent, BarChart3 } from 'lucide-react';
import { Trade } from '../../types';
import { formatCurrency } from '../../utils';

interface DailySummaryPanelProps {
  selectedDate: string | null;
  trades: Trade[];
  onClose: () => void;
  onAddTrade: (date: string) => void;
}

export const DailySummaryPanel: React.FC<DailySummaryPanelProps> = ({
  selectedDate,
  trades,
  onClose,
  onAddTrade
}) => {
  if (!selectedDate) return null;

  const dayTrades = trades.filter(trade => trade.date === selectedDate);
  const totalProfit = dayTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
  const wins = dayTrades.filter(trade => trade.result === 'win').length;
  const losses = dayTrades.filter(trade => trade.result === 'loss').length;
  const winRate = dayTrades.length > 0 ? (wins / dayTrades.length) * 100 : 0;
  
  // Métricas adicionais
  const totalVolume = dayTrades.reduce((sum, trade) => sum + (trade.entry_value || 0), 0);
  const averageEntry = dayTrades.length > 0 ? totalVolume / dayTrades.length : 0;
  const averagePayout = dayTrades.length > 0 ? dayTrades.reduce((sum, trade) => sum + trade.payout, 0) / dayTrades.length : 0;
  const bestTrade = dayTrades.length > 0 ? Math.max(...dayTrades.map(t => t.profitLoss || 0)) : 0;
  const worstTrade = dayTrades.length > 0 ? Math.min(...dayTrades.map(t => t.profitLoss || 0)) : 0;
  
  // Separar trades por tipo
  const fixedHandTrades = dayTrades.filter(trade => trade.tradeType === 'fixed_hand');
  const sorosTrades = dayTrades.filter(trade => trade.tradeType === 'soros');

  const formattedDate = format(parseISO(selectedDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="w-full max-w-2xl bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            Resumo do Dia
          </h3>
          <p className="text-zinc-400 text-sm">
            {capitalizedDate}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-400 text-sm">Placar</span>
          </div>
          <div className="text-white font-bold text-lg">
            {wins}W / {losses}L
          </div>
          <div className="text-zinc-400 text-xs">
            Taxa: {winRate.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-zinc-400 text-sm">Resultado</span>
          </div>
          <div className={`font-bold text-lg flex items-center ${
            totalProfit > 0 ? 'text-green-400' : totalProfit < 0 ? 'text-red-400' : 'text-zinc-400'
          }`}>
            {totalProfit > 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : totalProfit < 0 ? (
              <TrendingDown className="w-4 h-4 mr-1" />
            ) : (
              <Calendar className="w-4 h-4 mr-1" />
            )}
            {formatCurrency(totalProfit)}
          </div>
          <div className="text-zinc-400 text-xs">
            {dayTrades.length} operação{dayTrades.length !== 1 ? 'ões' : ''}
          </div>
        </div>
        
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span className="text-zinc-400 text-sm">Volume</span>
          </div>
          <div className="text-white font-bold text-lg">
            {formatCurrency(totalVolume)}
          </div>
          <div className="text-zinc-400 text-xs">
            Média: {formatCurrency(averageEntry)}
          </div>
        </div>
        
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-yellow-400" />
            <span className="text-zinc-400 text-sm">Payout Médio</span>
          </div>
          <div className="text-white font-bold text-lg">
            {averagePayout.toFixed(1)}%
          </div>
          <div className="text-zinc-400 text-xs">
            {dayTrades.length > 0 ? `${Math.min(...dayTrades.map(t => t.payout))}% - ${Math.max(...dayTrades.map(t => t.payout))}%` : '-'}
          </div>
        </div>
      </div>

      {/* Métricas Detalhadas */}
      {dayTrades.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <div className="text-zinc-400 text-sm mb-2">Melhor Operação</div>
            <div className="text-green-400 font-bold text-lg">
              {formatCurrency(bestTrade)}
            </div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <div className="text-zinc-400 text-sm mb-2">Pior Operação</div>
            <div className="text-red-400 font-bold text-lg">
              {formatCurrency(worstTrade)}
            </div>
          </div>
        </div>
      )}

      {/* Breakdown por Tipo */}
      {(fixedHandTrades.length > 0 || sorosTrades.length > 0) && (
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-3">Breakdown por Tipo</h4>
          <div className="grid grid-cols-2 gap-4">
            {fixedHandTrades.length > 0 && (
              <div className="bg-zinc-800/30 rounded-lg p-3">
                <div className="text-zinc-400 text-sm mb-1">Mão Fixa</div>
                <div className="text-white font-semibold">
                  {fixedHandTrades.filter(t => t.result === 'win').length}W / {fixedHandTrades.filter(t => t.result === 'loss').length}L
                </div>
                <div className="text-zinc-400 text-xs">
                  {formatCurrency(fixedHandTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0))}
                </div>
              </div>
            )}
            {sorosTrades.length > 0 && (
              <div className="bg-zinc-800/30 rounded-lg p-3">
                <div className="text-zinc-400 text-sm mb-1">Soros</div>
                <div className="text-white font-semibold">
                  {sorosTrades.filter(t => t.result === 'win').length}W / {sorosTrades.filter(t => t.result === 'loss').length}L
                </div>
                <div className="text-zinc-400 text-xs">
                  {formatCurrency(sorosTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Trade Button */}
      <button
        onClick={() => onAddTrade(selectedDate)}
        className="w-full mb-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center"
      >
        <Plus className="w-5 h-5 mr-2" />
        Registrar Nova Operação
      </button>

      {/* Trades List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {dayTrades.length > 0 ? (
          dayTrades.map((trade, index) => (
            <div
              key={trade.id}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    trade.result === 'win' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {trade.result === 'win' ? 'WIN' : 'LOSS'}
                  </span>
                  <span className="text-zinc-400 text-sm">
                    #{index + 1}
                  </span>
                </div>
                <div className={`font-semibold ${
                  trade.result === 'win' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatCurrency(trade.profitLoss || 0)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-400">Tipo:</span>
                  <span className="text-white ml-2">
                    {trade.tradeType === 'soros' ? 'Soros' : 'Mão Fixa'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400">Payout:</span>
                  <span className="text-white ml-2">{trade.payout}%</span>
                </div>
                <div>
                  <span className="text-zinc-400">Entrada:</span>
                  <span className="text-white ml-2">
                    {formatCurrency(trade.entry_value || 0)}
                  </span>
                </div>
                {trade.level && (
                  <div>
                    <span className="text-zinc-400">Nível:</span>
                    <span className="text-white ml-2">{trade.level}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-500 mb-2">Nenhuma operação registrada</p>
            <p className="text-zinc-600 text-sm">
              Clique em "Registrar Nova Operação" para começar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};