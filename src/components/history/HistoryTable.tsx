import React from 'react';
import { ChevronDownIcon, ChevronRightIcon, TrophyIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { DayGroup } from '../../pages/HistoryPage';
import { formatCurrency } from '../../utils';
import { Trade } from '../../types';

interface HistoryTableProps {
  dayGroups: DayGroup[];
  expandedDays: Set<string>;
  onToggleExpansion: (date: string) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  dayGroups,
  expandedDays,
  onToggleExpansion
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T12:00:00').toLocaleDateString('pt-BR', {
      timeZone: 'UTC',
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString + 'T12:00:00').toLocaleTimeString('pt-BR', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResultIcon = (result: string) => {
    return result === 'win' ? (
      <TrophyIcon className="w-4 h-4 text-green-400" />
    ) : (
      <XMarkIcon className="w-4 h-4 text-red-400" />
    );
  };

  const getResultColor = (result: string) => {
    return result === 'win' ? 'text-green-400' : 'text-red-400';
  };

  const getTradeTypeLabel = (tradeType: string) => {
    return tradeType === 'fixed_hand' ? 'Mão Fixa' : 'Soros';
  };

  const getTradeTypeColor = (tradeType: string) => {
    return tradeType === 'fixed_hand' ? 'text-blue-400' : 'text-purple-400';
  };

  if (dayGroups.length === 0) {
    return (
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-8 text-center">
        <div className="text-zinc-500 text-lg">
          Nenhum dado encontrado para o período selecionado
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden">
      {/* Table Header */}
      <div className="bg-zinc-800/50 px-6 py-4 border-b border-zinc-700">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-zinc-300">
          <div className="col-span-3">Data</div>
          <div className="col-span-2 text-center">Placar</div>
          <div className="col-span-2 text-center">Assertividade</div>
          <div className="col-span-2 text-right">Resultado do Dia</div>
          <div className="col-span-2 text-right">Saldo Acumulado</div>
          <div className="col-span-1 text-center">Detalhes</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-zinc-800">
        {dayGroups.map((dayGroup) => {
          const isExpanded = expandedDays.has(dayGroup.date);
          
          return (
            <div key={dayGroup.date}>
              {/* Day Summary Row */}
              <div className="px-6 py-4 hover:bg-zinc-800/30 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Date */}
                  <div className="col-span-3">
                    <div className="font-medium text-white">
                      {formatDate(dayGroup.date)}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-green-400 font-medium">{dayGroup.winCount}W</span>
                      <span className="text-zinc-500">/</span>
                      <span className="text-red-400 font-medium">{dayGroup.lossCount}L</span>
                    </div>
                  </div>

                  {/* Win Rate */}
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        dayGroup.winRate >= 70 ? 'bg-green-900/50 text-green-400' :
                        dayGroup.winRate >= 50 ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-red-900/50 text-red-400'
                      }`}>
                        {dayGroup.winRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Daily Result */}
                  <div className="col-span-2 text-right">
                    <div className={`font-medium ${
                      dayGroup.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(dayGroup.totalProfitLoss)}
                    </div>
                  </div>

                  {/* Accumulated Balance */}
                  <div className="col-span-2 text-right">
                    <div className={`font-medium ${
                      dayGroup.accumulatedBalance >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(dayGroup.accumulatedBalance)}
                    </div>
                  </div>

                  {/* Expand Button */}
                  <div className="col-span-1 text-center">
                    <button
                      onClick={() => onToggleExpansion(dayGroup.date)}
                      className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                      title={isExpanded ? 'Ocultar detalhes' : 'Ver detalhes'}
                    >
                      {isExpanded ? (
                        <ChevronDownIcon className="w-4 h-4" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Trade Details */}
              {isExpanded && (
                <div className="bg-zinc-800/20 border-t border-zinc-700">
                  <div className="px-6 py-4">
                    <div className="text-sm font-medium text-zinc-300 mb-3">
                      Operações do dia ({dayGroup.trades.length})
                    </div>
                    
                    <div className="space-y-2">
                      {dayGroup.trades.map((trade, index) => (
                        <div
                          key={`${trade.id}-${index}`}
                          className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-700"
                        >
                          <div className="flex items-center space-x-4">
                            {/* Result Icon */}
                            <div className="flex items-center space-x-2">
                              {getResultIcon(trade.result)}
                              <span className={`text-sm font-medium ${getResultColor(trade.result)}`}>
                                {trade.result === 'win' ? 'WIN' : 'LOSS'}
                              </span>
                            </div>

                            {/* Trade Type */}
                            <div className={`text-sm font-medium ${getTradeTypeColor(trade.tradeType)}`}>
                              {getTradeTypeLabel(trade.tradeType)}
                            </div>

                            {/* Time */}
                            <div className="text-sm text-zinc-400">
                              {formatTime(trade.date)}
                            </div>
                          </div>

                          <div className="flex items-center space-x-6 text-sm">
                            {/* Entry Value */}
                            <div className="text-right">
                              <div className="text-zinc-400">Entrada</div>
                              <div className="font-medium text-white">
                                {formatCurrency(trade.entry_value || 0)}
                              </div>
                            </div>

                            {/* Payout */}
                            {trade.payout && (
                              <div className="text-right">
                                <div className="text-zinc-400">Payout</div>
                                <div className="font-medium text-white">
                                  {trade.payout}%
                                </div>
                              </div>
                            )}

                            {/* Profit/Loss */}
                            <div className="text-right min-w-[100px]">
                              <div className="text-zinc-400">Resultado</div>
                              <div className={`font-medium ${
                                (trade.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {formatCurrency(trade.profitLoss || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryTable;