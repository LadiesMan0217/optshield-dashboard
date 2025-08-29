import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, FunnelIcon, ArrowsUpDownIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { FilterState } from '../../pages/HistoryPage';

interface ControlPanelProps {
  currentDate: Date;
  filters: FilterState;
  onMonthNavigate: (direction: 'prev' | 'next') => void;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  onExportCSV: () => void;
  totalResults: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  currentDate,
  filters,
  onMonthNavigate,
  onFilterChange,
  onClearFilters,
  onExportCSV,
  totalResults
}) => {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const hasActiveFilters = 
    filters.searchTerm ||
    filters.startDate ||
    filters.endDate ||
    filters.result !== 'all' ||
    filters.tradeType !== 'all' ||
    filters.sortBy !== 'date' ||
    filters.sortOrder !== 'desc';

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onMonthNavigate('prev')}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Mês anterior"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          <div className="text-lg font-semibold min-w-[200px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          
          <button
            onClick={() => onMonthNavigate('next')}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Próximo mês"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-sm text-zinc-400">
            {totalResults} {totalResults === 1 ? 'dia' : 'dias'} encontrado{totalResults !== 1 ? 's' : ''}
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center space-x-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm"
              title="Limpar filtros"
            >
              <XMarkIcon className="w-4 h-4" />
              <span>Limpar</span>
            </button>
          )}
          
          <button
            onClick={onExportCSV}
            disabled={totalResults === 0}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg transition-colors text-sm"
            title="Exportar para CSV"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            <FunnelIcon className="w-4 h-4 inline mr-1" />
            Buscar
          </label>
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
            placeholder="Data, valor, resultado..."
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-zinc-500"
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Data Inicial
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange({ startDate: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Data Final
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange({ endDate: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
          />
        </div>

        {/* Result Filter */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Resultado
          </label>
          <select
            value={filters.result}
            onChange={(e) => onFilterChange({ result: e.target.value as FilterState['result'] })}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
          >
            <option value="all">Todos</option>
            <option value="win">Vitórias</option>
            <option value="loss">Perdas</option>
          </select>
        </div>

        {/* Trade Type Filter */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Tipo de Operação
          </label>
          <select
            value={filters.tradeType}
            onChange={(e) => onFilterChange({ tradeType: e.target.value as FilterState['tradeType'] })}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
          >
            <option value="all">Todos</option>
            <option value="fixed_hand">Mão Fixa</option>
            <option value="soros">Soros</option>
          </select>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <ArrowsUpDownIcon className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-300">Ordenar por:</span>
          </div>
          
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
            className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm"
          >
            <option value="date">Data</option>
            <option value="result">Resultado</option>
            <option value="profitLoss">Lucro/Prejuízo</option>
          </select>
          
          <select
            value={filters.sortOrder}
            onChange={(e) => onFilterChange({ sortOrder: e.target.value as FilterState['sortOrder'] })}
            className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm"
          >
            <option value="desc">Decrescente</option>
            <option value="asc">Crescente</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center space-x-2 text-sm text-blue-400">
            <FunnelIcon className="w-4 h-4" />
            <span>Filtros ativos</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;