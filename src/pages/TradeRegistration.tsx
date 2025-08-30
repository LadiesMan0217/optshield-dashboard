import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, TrendingUp, TrendingDown, DollarSign, Edit3, Check, X, Trash2, Target, Zap } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTradesWithAuth } from '../stores/useTradeStore';
import { useNotesWithAuth } from '../stores/useNoteStore';
import { formatCurrency } from '../utils';
import { Trade } from '../types';
import { LoadingSpinner } from '../components/ui';

interface DailyStats {
  wins: number;
  losses: number;
  totalResult: number;
}

interface TradeFormData {
  payout: number;
  entryValue: number;
}

export const TradeRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { trades, addTrade, updateTrade, deleteTrade, loading, fetchTrades } = useTradesWithAuth();
  const { notes, addNote } = useNotesWithAuth();
  
  // Capturar data da URL ou usar data atual
  const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  

  
  const [formData, setFormData] = useState<TradeFormData>({
    payout: 85,
    entryValue: 0
  });
  
  const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);
  const [diaryNote, setDiaryNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payoutDisplay, setPayoutDisplay] = useState('85');
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{
    payout: string;
    entryValue: string;
    result: 'win' | 'loss';
  }>({ payout: '', entryValue: '', result: 'win' });

  // Buscar trades quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      fetchTrades();
    }
  }, [user]); // Removido fetchTrades das dependências para evitar loop infinito

  // Função para formatar payout com vírgula
  const formatPayoutInput = (value: string): string => {
    // Remove tudo que não é número, vírgula ou ponto
    const cleaned = value.replace(/[^0-9.,]/g, '');
    // Substitui ponto por vírgula
    const withComma = cleaned.replace(/\./g, ',');
    // Garante apenas uma vírgula
    const parts = withComma.split(',');
    if (parts.length > 2) {
      return parts[0] + ',' + parts.slice(1).join('');
    }
    return withComma;
  };

  // Função para converter payout display para número
  const parsePayoutValue = (value: string): number => {
    const numericValue = parseFloat(value.replace(',', '.'));
    return isNaN(numericValue) ? 0 : numericValue;
  };

  // Atualizar payout quando payoutDisplay muda
  useEffect(() => {
    const numericValue = parsePayoutValue(payoutDisplay);
    setFormData(prev => ({ ...prev, payout: numericValue }));
  }, [payoutDisplay]);

  // Funções para edição do histórico
  const startEditing = (trade: any) => {
    setEditingTradeId(trade.id);
    setEditingData({
      payout: trade.payout.toString().replace('.', ','),
      entryValue: trade.entryValue.toString().replace('.', ','),
      result: trade.result
    });
  };

  const cancelEditing = () => {
    setEditingTradeId(null);
    setEditingData({ payout: '', entryValue: '', result: 'win' });
  };

  const saveTradeEdit = async () => {
    if (!editingTradeId || !user) return;

    try {
      const payout = parsePayoutValue(editingData.payout);
      const entryValue = parsePayoutValue(editingData.entryValue);
      
      // Calcular novo profit/loss
      const profitLoss = editingData.result === 'win' 
        ? (entryValue * payout) / 100 
        : -entryValue;

      await updateTrade(editingTradeId, {
        payout,
        entryValue,
        result: editingData.result,
        profitLoss
      });

      // Atualizar a lista de trades
      await fetchTrades();
      
      // Limpar edição
      cancelEditing();
    } catch (error) {
      console.error('Erro ao atualizar trade:', error);
    }
  };

  // Função para deletar trade
  const handleDeleteTrade = async (tradeId: string) => {
    if (!user) return;
    
    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta operação? Esta ação não pode ser desfeita.');
    
    if (confirmDelete) {
      try {
        await deleteTrade(tradeId);
        // Atualizar a lista de trades
        await fetchTrades();
      } catch (error) {
        console.error('Erro ao deletar trade:', error);
        alert('Erro ao deletar operação. Tente novamente.');
      }
    }
  };

  // Filtrar trades da data selecionada
  const dailyTrades = trades.filter(trade => {
    let tradeDate: string;
    
    if (trade.date instanceof Date) {
      tradeDate = trade.date.toISOString().split('T')[0];
    } else if (typeof trade.date === 'string') {
      tradeDate = new Date(trade.date).toISOString().split('T')[0];
    } else if (trade.date && typeof trade.date === 'object' && 'seconds' in trade.date) {
      // Firestore timestamp
      tradeDate = new Date(trade.date.seconds * 1000).toISOString().split('T')[0];
    } else {
      console.warn('Formato de data inválido:', trade.date);
      return false;
    }
    
    return tradeDate === selectedDate && (trade.tradeType === 'fixed_hand' || trade.tradeType === 'soros');
  });

  // Calcular estatísticas do dia
  const dailyStats: DailyStats = dailyTrades.reduce(
    (stats, trade) => {
      if (trade.result === 'win') {
        stats.wins += 1;
      } else {
        stats.losses += 1;
      }
      stats.totalResult += trade.profitLoss;
      return stats;
    },
    { wins: 0, losses: 0, totalResult: 0 }
  );

  // Função para calcular lucro/prejuízo
  const calculateProfitLoss = (result: 'win' | 'loss', entryValue: number, payout: number): number => {
    if (result === 'win') {
      return (entryValue * payout) / 100;
    } else {
      return -entryValue;
    }
  };

  // Função para registrar operação
  const handleTradeSubmit = async (result: 'win' | 'loss') => {
    if (!user) {
      alert('Usuário não autenticado. Por favor, faça login novamente.');
      return;
    }
    
    if (formData.entryValue <= 0) {
      alert('Por favor, insira um valor de entrada válido.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const profitLoss = calculateProfitLoss(result, formData.entryValue, formData.payout);
      
      const newTrade: Omit<Trade, 'id' | 'userId' | 'createdAt'> = {
        date: selectedDate,
        payout: formData.payout,
        entry_value: formData.entryValue,
        result,
        profitLoss: profitLoss,
        tradeType: 'fixed_hand'
      };
      
      await addTrade(newTrade);
      
      // Resetar apenas o valor de entrada
      setFormData(prev => ({ ...prev, entryValue: 0 }));
    } catch (error) {
      console.error('Erro ao registrar operação:', error);
      alert('Erro ao registrar operação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para salvar anotação no diário
  const handleDiarySave = async () => {
    if (!user || !diaryNote.trim()) return;
    
    try {
      await addNote({
        date: selectedDate,
        content: diaryNote.trim()
      });
      
      setDiaryNote('');
      setIsDiaryModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar anotação:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Carregando registro de operações..." />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="w-full py-6 px-6 border-b border-neutral-800/50">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-800/50 transition-all duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-400 group-hover:text-white" />
            <span className="text-neutral-400 group-hover:text-white font-medium">Voltar</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Registro de Operações
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC'
              })}
            </p>
            
            {/* Botão de Navegação entre Tipos de Trade */}
            <div className="mt-4 flex items-center justify-center">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-0.5 flex">
                <button
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600/20 text-blue-300 border border-blue-500/30 transition-all duration-200"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Mão Fixa</span>
                </button>
                <button
                  onClick={() => navigate(`/soros?date=${selectedDate}`)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Soros Gale</span>
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsDiaryModalOpen(true)}
            className="p-3 rounded-lg bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 transition-all duration-200 group"
          >
            <BookOpen className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Placar do Dia */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vitórias */}
            <div className="bg-neutral-900/80 border border-neutral-700/50 rounded-xl p-6 hover:border-success-500/30 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-neutral-400 mb-3 uppercase tracking-wide">Vitórias</h3>
                  <div className="text-3xl font-bold text-success-400 mb-1">
                    {dailyStats.wins}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Hoje
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-success-500/10">
                  <TrendingUp className="w-5 h-5 text-success-400" />
                </div>
              </div>
            </div>

            {/* Derrotas */}
            <div className="bg-neutral-900/80 border border-neutral-700/50 rounded-xl p-6 hover:border-danger-500/30 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-neutral-400 mb-3 uppercase tracking-wide">Derrotas</h3>
                  <div className="text-3xl font-bold text-danger-400 mb-1">
                    {dailyStats.losses}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Hoje
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-danger-500/10">
                  <TrendingDown className="w-5 h-5 text-danger-400" />
                </div>
              </div>
            </div>

            {/* Resultado Total */}
            <div className={`bg-neutral-900/80 border border-neutral-700/50 rounded-xl p-6 transition-all duration-200 ${
              dailyStats.totalResult >= 0 ? 'hover:border-success-500/30' : 'hover:border-danger-500/30'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-neutral-400 mb-3 uppercase tracking-wide">Resultado Total</h3>
                  <div className={`text-3xl font-bold mb-1 ${
                    dailyStats.totalResult >= 0 ? 'text-success-400' : 'text-danger-400'
                  }`}>
                    {formatCurrency(dailyStats.totalResult)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Hoje
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${
                  dailyStats.totalResult >= 0 
                    ? 'bg-success-500/10' 
                    : 'bg-danger-500/10'
                }`}>
                  <DollarSign className={`w-5 h-5 ${
                    dailyStats.totalResult >= 0 ? 'text-success-400' : 'text-danger-400'
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Registro */}
          <div className="bg-neutral-900/80 border border-neutral-700/50 rounded-xl p-8">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Nova Operação</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payout */}
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2 uppercase tracking-wide">
                    Payout (%)
                  </label>
                  <input
                    type="text"
                    value={payoutDisplay}
                    onChange={(e) => {
                      const formatted = formatPayoutInput(e.target.value);
                      setPayoutDisplay(formatted);
                    }}
                    className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="85,5"
                  />
                  <div className="text-xs text-neutral-500 mt-1">
                    Use vírgula para decimais (ex: 85,5)
                  </div>
                </div>
                
                {/* Valor da Entrada */}
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2 uppercase tracking-wide">
                    Valor da Entrada ({user?.currency === 'BRL' ? 'R$' : user?.currency === 'USD' ? '$' : '€'})
                  </label>
                  <input
                    type="number"
                    value={formData.entryValue || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, entryValue: Number(e.target.value) }))}
                    className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              {/* Botões WIN/LOSS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => handleTradeSubmit('win')}
                  disabled={isSubmitting || formData.entryValue <= 0}
                  className="bg-success-600 hover:bg-success-500 disabled:bg-neutral-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-lg">WIN</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleTradeSubmit('loss')}
                  disabled={isSubmitting || formData.entryValue <= 0}
                  className="bg-danger-600 hover:bg-danger-500 disabled:bg-neutral-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingDown className="w-6 h-6" />
                    <span className="text-lg">LOSS</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Histórico do Dia */}
          <div className="bg-neutral-900/80 border border-neutral-700/50 rounded-xl p-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Histórico do Dia</h2>
              
              {dailyTrades.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-neutral-500 text-lg mb-2">Nenhuma operação registrada hoje</div>
                  <div className="text-neutral-600 text-sm">Registre sua primeira operação acima</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {dailyTrades.map((trade, index) => (
                    <div
                      key={trade.id}
                      className="p-4 bg-neutral-800/30 border border-neutral-700/30 rounded-lg hover:bg-neutral-800/50 transition-all duration-200"
                    >
                      {editingTradeId === trade.id ? (
                        // Modo de edição
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            {/* Seletor de resultado */}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingData(prev => ({ ...prev, result: 'win' }))}
                                className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                                  editingData.result === 'win'
                                    ? 'bg-success-500/20 text-success-400 border border-success-500/30'
                                    : 'bg-neutral-700/50 text-neutral-400 border border-neutral-600/30 hover:bg-success-500/10'
                                }`}
                              >
                                WIN
                              </button>
                              <button
                                onClick={() => setEditingData(prev => ({ ...prev, result: 'loss' }))}
                                className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                                  editingData.result === 'loss'
                                    ? 'bg-danger-500/20 text-danger-400 border border-danger-500/30'
                                    : 'bg-neutral-700/50 text-neutral-400 border border-neutral-600/30 hover:bg-danger-500/10'
                                }`}
                              >
                                LOSS
                              </button>
                            </div>
                            
                            {/* Campos de entrada */}
                            <div className="flex space-x-3 flex-1">
                              <div className="flex-1">
                                <label className="block text-xs text-neutral-400 mb-1">Entrada (R$)</label>
                                <input
                                  type="text"
                                  value={editingData.entryValue}
                                  onChange={(e) => {
                                    const formatted = formatPayoutInput(e.target.value);
                                    setEditingData(prev => ({ ...prev, entryValue: formatted }));
                                  }}
                                  className="w-full px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                  placeholder="50,00"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs text-neutral-400 mb-1">Payout (%)</label>
                                <input
                                  type="text"
                                  value={editingData.payout}
                                  onChange={(e) => {
                                    const formatted = formatPayoutInput(e.target.value);
                                    setEditingData(prev => ({ ...prev, payout: formatted }));
                                  }}
                                  className="w-full px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                  placeholder="85,5"
                                />
                              </div>
                            </div>
                            
                            {/* Botões de ação */}
                            <div className="flex space-x-2">
                              <button
                                onClick={saveTradeEdit}
                                className="p-2 bg-success-600/20 hover:bg-success-600/30 text-success-400 rounded-lg transition-all duration-200"
                                title="Salvar alterações"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-2 bg-danger-600/20 hover:bg-danger-600/30 text-danger-400 rounded-lg transition-all duration-200"
                                title="Cancelar edição"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Preview do resultado */}
                          <div className="text-sm text-neutral-400">
                            Resultado calculado: 
                            <span className={`ml-2 font-semibold ${
                              editingData.result === 'win' ? 'text-success-400' : 'text-danger-400'
                            }`}>
                              {editingData.result === 'win' 
                                ? `+${formatCurrency((parsePayoutValue(editingData.entryValue) * parsePayoutValue(editingData.payout)) / 100)}`
                                : `-${formatCurrency(parsePayoutValue(editingData.entryValue))}`
                              }
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Modo de visualização
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              trade.result === 'win' 
                                ? 'bg-success-500/20 text-success-400 border border-success-500/30'
                                : 'bg-danger-500/20 text-danger-400 border border-danger-500/30'
                            }`}>
                              {trade.result === 'win' ? 'WIN' : 'LOSS'}
                            </div>
                            
                            <div className="text-neutral-300">
                              <span className="font-medium">{formatCurrency(trade.entryValue, user?.currency || 'BRL')}</span>
                              <span className="text-neutral-500 ml-2">• {trade.payout.toString().replace('.', ',')}%</span>
                              {trade.tradeType === 'soros' && (
                                <span className="text-purple-400 ml-2">• Soros Nível {trade.level}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className={`text-lg font-bold ${
                              trade.profitLoss >= 0 ? 'text-success-400' : 'text-danger-400'
                            }`}>
                              {trade.profitLoss >= 0 ? '+' : ''}{formatCurrency(trade.profitLoss, user?.currency || 'BRL')}
                            </div>
                            
                            <button
                              onClick={() => startEditing(trade)}
                              className="p-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-400 hover:text-white rounded-lg transition-all duration-200"
                              title="Editar operação"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteTrade(trade.id)}
                              className="p-2 bg-danger-600/20 hover:bg-danger-600/30 text-danger-400 hover:text-danger-300 rounded-lg transition-all duration-200"
                              title="Excluir operação"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal do Diário */}
      {isDiaryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900/95 border border-neutral-700/50 rounded-xl p-6 w-full max-w-md">
            <div>
              <h3 className="text-lg font-bold text-white mb-4 tracking-tight">Diário do Dia</h3>
              
              <textarea
                value={diaryNote}
                onChange={(e) => setDiaryNote(e.target.value)}
                placeholder="Adicione suas anotações sobre o dia de trading..."
                className="w-full h-32 px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none"
              />
              
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleDiarySave}
                  disabled={!diaryNote.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                >
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setIsDiaryModalOpen(false);
                    setDiaryNote('');
                  }}
                  className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};