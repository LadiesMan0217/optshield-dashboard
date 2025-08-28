import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Target, BarChart3, Wallet, Filter } from 'lucide-react';
import { PeriodFilter } from '../../types';

interface PeriodSummaryProps {
  monthlyProfit: number;
  totalBalance: number;
  winRate: number;
  averageRisk: number;
  totalTrades: number;
  period: string; // Ex: "Janeiro 2024"
  selectedPeriod: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
}

export const PeriodSummary: React.FC<PeriodSummaryProps> = ({ 
  monthlyProfit, 
  totalBalance,
  winRate, 
  averageRisk, 
  totalTrades, 
  period,
  selectedPeriod,
  onPeriodChange
}) => {
  const [showBalance, setShowBalance] = useState(false);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.0%';
    }
    return `${value.toFixed(1)}%`;
  };

  const isProfitable = monthlyProfit >= 0;
  const displayValue = showBalance ? totalBalance : monthlyProfit;
  const displayLabel = showBalance ? 'Saldo da Conta' : 'Lucro/Prejuízo do Mês';
  const displayIcon = showBalance ? Wallet : (isProfitable ? TrendingUp : TrendingDown);
  const displayColor = showBalance ? 'text-blue-400' : (isProfitable ? 'text-success-400' : 'text-red-400');
  const borderColor = showBalance ? 'border-blue-500/20' : (isProfitable ? 'border-success-500/20' : 'border-red-500/20');
  const bgColor = showBalance ? 'bg-blue-500/10' : (isProfitable ? 'bg-success-500/10' : 'bg-red-500/10');
  const gradientColor = showBalance ? 'from-blue-400 to-blue-600 shadow-blue-500/30' : (isProfitable ? 'from-success-400 to-success-600 shadow-success-500/30' : 'from-red-400 to-red-600 shadow-red-500/30');
  const hoverBorder = showBalance ? 'hover:border-blue-500/30' : 'hover:border-success-500/30';
  const hoverShadow = showBalance ? 'hover:shadow-blue-500/10' : 'hover:shadow-success-500/10';

  const handleToggle = () => {
    setShowBalance(!showBalance);
  };

  const periodOptions: { value: PeriodFilter; label: string }[] = [
    { value: 'weekly', label: 'Semanal' },
    { value: 'biweekly', label: 'Quinzenal' },
    { value: 'monthly', label: 'Mensal' }
  ];

  return (
    <div className="mb-6">
      {/* Filtros de Período */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400" />
          <span className="text-sm font-medium text-neutral-400 uppercase tracking-wide">Período:</span>
        </div>
        <div className="flex gap-2">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onPeriodChange(option.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                selectedPeriod === option.value
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-neutral-800/50 text-neutral-400 border border-neutral-700/50 hover:bg-neutral-700/50 hover:text-neutral-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Lucro/Prejuízo do Mês ou Saldo da Conta */}
      <div 
        className={`group relative bg-gradient-to-br from-neutral-900/60 via-neutral-800/40 to-neutral-900/60 backdrop-blur-xl border border-neutral-700/50 rounded-xl p-6 overflow-hidden transition-all duration-300 ${hoverBorder} hover:shadow-lg ${hoverShadow} hover:scale-[1.02] cursor-pointer`}
        onClick={handleToggle}
        title="Clique para alternar entre saldo e lucro/prejuízo"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none"></div>
        <div className={`absolute left-0 top-0 bottom-0 w-1 shadow-lg bg-gradient-to-b ${gradientColor}`}></div>
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-neutral-400 mb-3 tracking-wide uppercase">
              {displayLabel}
            </h3>
            <div className={`text-3xl font-bold mb-1 tracking-tight leading-none ${displayColor}`}>
              {formatCurrency(displayValue)}
            </div>
            <div className="text-xs text-neutral-500 tracking-wider font-normal">
              {showBalance ? 'Saldo total disponível' : `${totalTrades} operações no período`}
            </div>
          </div>
          <div className={`p-3 rounded-lg border ${bgColor} ${borderColor}`}>
            {React.createElement(displayIcon, { className: `w-5 h-5 ${displayColor}` })}
          </div>
        </div>
      </div>

      {/* Taxa de Acerto (Win Rate) */}
      <div className="group relative bg-gradient-to-br from-neutral-900/60 via-neutral-800/40 to-neutral-900/60 backdrop-blur-xl border border-neutral-700/50 rounded-xl p-6 overflow-hidden transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none"></div>
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30"></div>
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-neutral-400 mb-3 tracking-wide uppercase">
              Taxa de Acerto
            </h3>
            <div className="text-3xl font-bold text-white mb-1 tracking-tight leading-none">
              {formatPercentage(winRate)}
            </div>
            <div className="text-xs text-neutral-500 tracking-wider font-normal">
              Win Rate do período
            </div>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Risco Médio */}
      <div className="group relative bg-gradient-to-br from-neutral-900/60 via-neutral-800/40 to-neutral-900/60 backdrop-blur-xl border border-neutral-700/50 rounded-xl p-6 overflow-hidden transition-all duration-300 hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/10 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none"></div>
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/30"></div>
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-neutral-400 mb-3 tracking-wide uppercase">
              Risco Médio
            </h3>
            <div className="text-3xl font-bold text-white mb-1 tracking-tight leading-none">
              {formatPercentage(averageRisk)}
            </div>
            <div className="text-xs text-neutral-500 tracking-wider font-normal">
              Risco por operação
            </div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PeriodSummary;