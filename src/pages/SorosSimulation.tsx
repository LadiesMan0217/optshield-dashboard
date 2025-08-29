import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, TrendingUp, TrendingDown, DollarSign, Target, Zap, Edit2, Trash2, Copy } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTradesWithAuth } from '../stores/useTradeStore';
import { useNotesWithAuth } from '../stores/useNoteStore';
import { formatCurrency } from '../utils';
import { Trade } from '../types';
import { LoadingSpinner } from '../components/ui';
import { LevelSelector } from '../components/ui/level-selector';
import { Switch } from '../components/ui/switch';

interface SorosLevel {
  level: number;
  entry_value: number;
  payout: number;
  expectedProfit: number;
  isActive: boolean;
  isCompleted: boolean;
  result?: 'win' | 'loss';
}

interface SorosConfig {
  payout: number;
  useProtection: boolean;
  maxLevels: number;
}

interface SorosStats {
  wins: number;
  losses: number;
  totalResult: number;
}

const SorosSimulation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trades, addTrade, loading } = useTradesWithAuth();
  const { addNote } = useNotesWithAuth();
  
  // Estados para o diário
  const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);
  const [diaryNote, setDiaryNote] = useState('');
  
  // Capturar data da URL ou usar data atual
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  const [config, setConfig] = useState<SorosConfig>({
    payout: 85,
    useProtection: true,
    maxLevels: 3
  });
  
  // Valores fixos para cálculos
  const INITIAL_VALUE = 10;
  const PROTECTION_VALUE = 10;
  
  const [sorosLevels, setSorosLevels] = useState<SorosLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [protectionProfit, setProtectionProfit] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLossNotification, setShowLossNotification] = useState(false);
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);
  const [payoutInput, setPayoutInput] = useState<string>('85');

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
  
  // Calcular níveis Soros
  const calculateSorosLevels = () => {
    const levels: SorosLevel[] = [];
    
    if (config.useProtection) {
      // Nível 0 (Proteção) - entrada fixa de R$10
      const entry_value = PROTECTION_VALUE;
      const expectedProfit = Math.round((entry_value * config.payout / 100) * 100) / 100;
      
      levels.push({
        level: 0,
        entry_value,
        payout: config.payout,
        expectedProfit,
        isActive: true,
        isCompleted: false
      });
      
      // Nível 1 usa APENAS o lucro do nível 0
      let currentEntryValue = expectedProfit;
      for (let i = 1; i <= config.maxLevels; i++) {
        const levelExpectedProfit = Math.round((currentEntryValue * config.payout / 100) * 100) / 100;
        levels.push({
          level: i,
          entry_value: currentEntryValue,
          payout: config.payout,
          expectedProfit: levelExpectedProfit,
          isActive: false,
          isCompleted: false
        });
        // Próximo nível usa entrada + lucro (acumulado)
        currentEntryValue = currentEntryValue + levelExpectedProfit;
      }
    } else {
      // Sem proteção - Soros Normal
      let currentEntryValue = INITIAL_VALUE;
      
      for (let i = 1; i <= config.maxLevels; i++) {
        const expectedProfit = Math.round((currentEntryValue * config.payout / 100) * 100) / 100;
        levels.push({
          level: i,
          entry_value: currentEntryValue,
          payout: config.payout,
          expectedProfit,
          isActive: i === 1,
          isCompleted: false
        });
        // Próximo nível usa entrada + lucro (acumulado)
        currentEntryValue = currentEntryValue + expectedProfit;
      }
    }
    
    return levels;
  };
  
  // Atualizar payout
  const updatePayout = (newPayout: number) => {
    setConfig(prev => ({ ...prev, payout: newPayout }));
    
    const updatedLevels = sorosLevels.map(level => {
      const expectedProfit = Math.round((level.entry_value * newPayout / 100) * 100) / 100;
      return {
        ...level,
        payout: newPayout,
        expectedProfit
      };
    });
    
    setSorosLevels(updatedLevels);
  };

  // Atualizar payout com formatação
  const handlePayoutChange = (value: string) => {
    const formatted = formatPayoutInput(value);
    setPayoutInput(formatted);
    
    const numericValue = parsePayoutValue(formatted);
    if (numericValue >= 1 && numericValue <= 100) {
      updatePayout(numericValue);
    }
  };
  
  // Atualizar payout de um nível específico
  const updateLevelPayout = (levelNumber: number, newPayout: number) => {
    const updatedLevels = sorosLevels.map(level => {
      if (level.level === levelNumber) {
        const expectedProfit = Math.round((level.entry_value * newPayout / 100) * 100) / 100;
        return {
          ...level,
          payout: newPayout,
          expectedProfit
        };
      }
      return level;
    });
    
    setSorosLevels(updatedLevels);
  };
  
  // Função para lidar com mudança de payout individual
   const handleIndividualPayoutChange = (levelNumber: number, value: string) => {
     const formatted = formatPayoutInput(value);
     const numericValue = parsePayoutValue(formatted);
     
     if (numericValue >= 1 && numericValue <= 100) {
       updateLevelPayout(levelNumber, numericValue);
     }
   };
  
  // Atualizar valor de entrada
  const updateEntryValue = (level: number, newEntryValue: number) => {
    const updatedLevels = sorosLevels.map(l => {
      if (l.level === level) {
        const expectedProfit = Math.round((newEntryValue * l.payout / 100) * 100) / 100;
        return {
          ...l,
          entry_value: newEntryValue,
          expectedProfit
        };
      }
      return l;
    });
    
    setSorosLevels(updatedLevels);
  };
  
  // Resetar simulação
  const resetSimulation = () => {
    const newLevels = calculateSorosLevels();
    setSorosLevels(newLevels);
    setCurrentLevel(config.useProtection ? 0 : 1);
    setProtectionProfit(0);
  };
  
  // Salvar edição de trade
  const saveTradeEdit = async (tradeId: string, newResult: 'win' | 'loss', entry_value: number, payout: number) => {
    if (!user) return;
    
    try {
      const profitLoss = newResult === 'win' 
        ? Math.round((entry_value * payout / 100) * 100) / 100
        : Math.round(-entry_value * 100) / 100;
      
      // Aqui você implementaria a lógica para atualizar o trade no Firebase
      console.log('Atualizando trade:', { tradeId, newResult, profitLoss });
      setEditingTradeId(null);
      
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
      alert('Erro ao salvar edição. Tente novamente.');
    }
  };
  
  // Deletar trade
  const deleteTrade = async (tradeId: string) => {
    if (!user) return;
    
    if (!confirm('Tem certeza que deseja deletar esta operação?')) return;
    
    try {
      // Aqui você implementaria a lógica para deletar o trade no Firebase
      console.log('Deletando trade:', tradeId);
      
    } catch (error) {
      console.error('Erro ao deletar trade:', error);
      alert('Erro ao deletar operação. Tente novamente.');
    }
  };
  
  // Função para copiar valor de entrada
  const copyEntryValue = async (entryValue: number) => {
    try {
      await navigator.clipboard.writeText(entryValue.toString());
      // Você pode adicionar uma notificação de sucesso aqui se desejar
    } catch (error) {
      console.error('Erro ao copiar valor:', error);
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = entryValue.toString();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };
  
  // Função para processar resultado (WIN/LOSS)
  const handleResult = async (result: 'win' | 'loss') => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const activeLevelIndex = sorosLevels.findIndex(level => level.isActive);
      const activeLevel = sorosLevels[activeLevelIndex];
      
      if (!activeLevel) {
        setIsSubmitting(false);
        return;
      }
      
      // Calcular lucro/prejuízo
      let profitLoss: number;
      if (result === 'win') {
        profitLoss = Math.round(activeLevel.expectedProfit * 100) / 100;
      } else {
        profitLoss = Math.round(-activeLevel.entry_value * 100) / 100;
      }
      
      // Registrar operação no Firebase
      const newTrade: Omit<Trade, 'id' | 'userId' | 'createdAt'> = {
        date: new Date().toISOString().split('T')[0],
        payout: activeLevel.payout,
        entry_value: activeLevel.entry_value,
        result,
        profitLoss: profitLoss,
        tradeType: 'soros',
        level: activeLevel.level
      };
      
      await addTrade(newTrade);
      
      // Atualizar estado da simulação
      const newLevels = [...sorosLevels];
      newLevels[activeLevelIndex] = {
        ...activeLevel,
        isActive: false,
        isCompleted: true,
        result
      };
      
      if (result === 'win') {
          if (activeLevel.level === 0) {
            // Nível 0 vencido - próximo nível usa valor inicial + lucro da proteção
            const roundedProfit = Math.round(activeLevel.expectedProfit * 100) / 100;
            setProtectionProfit(roundedProfit);
            
            const level1Index = newLevels.findIndex(l => l.level === 1);
            if (level1Index !== -1) {
              // Nível 1 usa apenas o lucro da proteção
              const newEntryValue = roundedProfit;
              const newExpectedProfit = Math.round((newEntryValue * newLevels[level1Index].payout / 100) * 100) / 100;
              
              newLevels[level1Index] = {
                ...newLevels[level1Index],
                entry_value: newEntryValue,
                expectedProfit: newExpectedProfit,
                isActive: true
              };
              
              // Atualizar níveis subsequentes - cada nível usa entrada + lucro acumulado
              let currentEntryValue = newEntryValue + newExpectedProfit;
              for (let i = level1Index + 1; i < newLevels.length; i++) {
                const expectedProfit = Math.round((currentEntryValue * newLevels[i].payout / 100) * 100) / 100;
                newLevels[i] = {
                  ...newLevels[i],
                  entry_value: currentEntryValue,
                  expectedProfit: expectedProfit
                };
                currentEntryValue = currentEntryValue + expectedProfit;
              }
              
              setCurrentLevel(1);
            }
          } else {
            const nextLevelIndex = newLevels.findIndex(l => l.level === activeLevel.level + 1);
            if (nextLevelIndex !== -1) {
            // Próximo nível usa entrada + lucro acumulado
            const nextEntryValue = activeLevel.entry_value + Math.round(activeLevel.expectedProfit * 100) / 100;
            const nextExpectedProfit = Math.round((nextEntryValue * newLevels[nextLevelIndex].payout / 100) * 100) / 100;
            
            newLevels[nextLevelIndex] = {
              ...newLevels[nextLevelIndex],
              entry_value: nextEntryValue,
              expectedProfit: nextExpectedProfit,
              isActive: true
            };
            
            // Atualizar níveis subsequentes
            let currentEntryValue = nextEntryValue + nextExpectedProfit;
            for (let i = nextLevelIndex + 1; i < newLevels.length; i++) {
              const expectedProfit = Math.round((currentEntryValue * newLevels[i].payout / 100) * 100) / 100;
              newLevels[i] = {
                ...newLevels[i],
                entry_value: currentEntryValue,
                expectedProfit: expectedProfit
              };
              currentEntryValue = currentEntryValue + expectedProfit;
            }
            
            setCurrentLevel(newLevels[nextLevelIndex].level);
            }
          }
        setSorosLevels(newLevels);
      } else {
        setShowLossNotification(true);
        setSorosLevels(newLevels);
        setTimeout(() => {
          setShowLossNotification(false);
        }, 3000);
      }
      
    } catch (error) {
      console.error('Erro ao processar resultado:', error);
      alert('Erro ao processar resultado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calcular estatísticas do dia
  const dailyStats: SorosStats = React.useMemo(() => {
    if (!trades) return { wins: 0, losses: 0, totalResult: 0 };
    
    const today = new Date().toISOString().split('T')[0];
    const todayTrades = trades.filter(trade => {
      const tradeDate = trade.date;
      return tradeDate.startsWith(today) && trade.tradeType === 'soros';
    });
    
    const wins = todayTrades.filter(trade => trade.result === 'win').length;
    const losses = todayTrades.filter(trade => trade.result === 'loss').length;
    const totalResult = todayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    
    return { wins, losses, totalResult };
  }, [trades]);
  
  // Calcular histórico acumulado
  const dailyTrades = React.useMemo(() => {
    if (!trades) return [];
    
    // Filtrar trades do dia atual
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const sorosTrades = trades
      .filter(trade => {
        const tradeDate = new Date(trade.createdAt);
        return trade.tradeType === 'soros' && 
               typeof trade.date === 'string' &&
               tradeDate >= startOfDay && 
               tradeDate < endOfDay;
      })
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return aTime - bTime;
      });
    
    let currentBalance = config.useProtection ? PROTECTION_VALUE : INITIAL_VALUE;
    
    return sorosTrades.map(trade => {
      let accumulated: number;
      let finalAccumulated: number;
      
      if (config.useProtection) {
        if (trade.level === 0) {
          // Nível 0 (proteção) - usa valor de proteção
          if (trade.result === 'win') {
            accumulated = currentBalance + trade.profitLoss;
            currentBalance = PROTECTION_VALUE; // Mantém proteção
            finalAccumulated = currentBalance;
          } else {
            accumulated = currentBalance + trade.profitLoss;
            currentBalance = PROTECTION_VALUE; // Mantém proteção
            finalAccumulated = currentBalance;
          }
        } else {
          // Níveis 1+ - usa valor inicial + lucros acumulados
          if (trade.result === 'win') {
            accumulated = currentBalance + trade.profitLoss;
            currentBalance = accumulated;
            finalAccumulated = currentBalance;
          } else {
            accumulated = currentBalance + trade.profitLoss;
            currentBalance = PROTECTION_VALUE; // Volta para proteção
            finalAccumulated = currentBalance;
          }
        }
      } else {
        // Sem proteção
        if (trade.result === 'win') {
          accumulated = currentBalance + trade.profitLoss;
          currentBalance = accumulated;
        } else {
          accumulated = currentBalance + trade.profitLoss;
          currentBalance = Math.max(0, accumulated);
        }
        finalAccumulated = currentBalance;
      }
      
      return {
        ...trade,
        accumulated: Math.round(accumulated * 100) / 100,
        finalAccumulated: Math.round(finalAccumulated * 100) / 100
      };
    });
  }, [trades, config]);
  
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

  // Inicializar níveis
  useEffect(() => {
    resetSimulation();
  }, [config.useProtection]);

  // Sincronizar payoutInput com config.payout
  useEffect(() => {
    setPayoutInput(config.payout.toString().replace('.', ','));
  }, [config.payout]);
  
  if (loading) {
    return <LoadingSpinner text="Carregando simulação Soros..." />;
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
              Simulação Soros
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
                  onClick={() => navigate(`/trade-registration?date=${selectedDate}`)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Mão Fixa</span>
                </button>
                <button
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium bg-purple-600/20 text-purple-300 border border-purple-500/30 transition-all duration-200"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Soros Gale</span>
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsDiaryModalOpen(true)}
            className="p-3 rounded-lg bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 transition-all duration-200 group"
          >
            <BookOpen className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Placar do Dia */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vitórias */}
            <div className="group relative bg-gradient-to-br from-neutral-900/60 via-neutral-800/40 to-neutral-900/60 backdrop-blur-xl border border-neutral-700/50 rounded-xl p-6 overflow-hidden transition-all duration-300 hover:border-success-500/30 hover:shadow-lg hover:shadow-success-500/10 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none" />
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-success-400 to-success-600 shadow-lg shadow-success-500/30"></div>
              
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-neutral-400 mb-3 tracking-wide uppercase">Vitórias</h3>
                  <div className="text-3xl font-bold text-success-400 mb-1 tracking-tight leading-none">
                    {dailyStats.wins}
                  </div>
                  <div className="text-xs text-neutral-500 tracking-wider font-normal">
                        Hoje
                      </div>
                </div>
                <div className="p-3 rounded-lg bg-success-500/10 border border-success-500/20">
                  <TrendingUp className="w-5 h-5 text-success-400" />
                </div>
              </div>
            </div>

            {/* Derrotas */}
            <div className="group relative bg-gradient-to-br from-neutral-900/60 via-neutral-800/40 to-neutral-900/60 backdrop-blur-xl border border-neutral-700/50 rounded-xl p-6 overflow-hidden transition-all duration-300 hover:border-danger-500/30 hover:shadow-lg hover:shadow-danger-500/10 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none" />
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-danger-400 to-danger-600 shadow-lg shadow-danger-500/30"></div>
              
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-neutral-400 mb-3 tracking-wide uppercase">Derrotas</h3>
                  <div className="text-3xl font-bold text-danger-400 mb-1 tracking-tight leading-none">
                    {dailyStats.losses}
                  </div>
                  <div className="text-xs text-neutral-500 tracking-wider font-normal">
                    Hoje
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20">
                  <TrendingDown className="w-5 h-5 text-danger-400" />
                </div>
              </div>
            </div>

            {/* Resultado Total */}
            <div className="group relative bg-gradient-to-br from-neutral-900/60 via-neutral-800/40 to-neutral-900/60 backdrop-blur-xl border border-neutral-700/50 rounded-xl p-6 overflow-hidden transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none" />
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b shadow-lg ${
                dailyStats.totalResult >= 0 
                  ? 'from-success-400 to-success-600 shadow-success-500/30' 
                  : 'from-danger-400 to-danger-600 shadow-danger-500/30'
              }`}></div>
              
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-neutral-400 mb-3 tracking-wide uppercase">Resultado</h3>
                  <div className={`text-3xl font-bold mb-1 tracking-tight leading-none ${
                    dailyStats.totalResult >= 0 ? 'text-success-400' : 'text-danger-400'
                  }`}>
                    {formatCurrency(dailyStats.totalResult, user?.currency || 'BRL')}
                  </div>
                  <div className="text-xs text-neutral-500 tracking-wider font-normal">
                    Hoje
                  </div>
                </div>
                <div className={`p-3 rounded-lg border ${
                  dailyStats.totalResult >= 0 
                    ? 'bg-success-500/10 border-success-500/20' 
                    : 'bg-danger-500/10 border-danger-500/20'
                }`}>
                  <DollarSign className={`w-5 h-5 ${
                    dailyStats.totalResult >= 0 ? 'text-success-400' : 'text-danger-400'
                  }`} />
                </div>
              </div>
            </div>
          </div>
        
          {/* Configurações */}
          <div className="bg-gradient-to-br from-neutral-900/60 via-neutral-800/40 to-neutral-900/60 backdrop-blur-xl border border-neutral-700/50 rounded-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6 tracking-tight">Configurações da Simulação</h2>
            
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
                <div className="flex items-center space-x-3">
                  <Switch
                    isSelected={config.useProtection}
                    onChange={(isSelected) => setConfig(prev => ({ ...prev, useProtection: isSelected }))}
                  >
                    <span className="text-xs md:text-sm font-medium text-neutral-300">
                      Usar Proteção
                    </span>
                  </Switch>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs md:text-sm font-medium text-neutral-300">Níveis Máximos</label>
                    <LevelSelector
                      value={config.maxLevels}
                      onChange={(levels) => setConfig(prev => ({ ...prev, maxLevels: levels }))}
                      min={1}
                      max={10}
                    />
                  </div>
                  <button
                    onClick={resetSimulation}
                    className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-600/25 text-sm md:text-base"
                  >
                    Resetar Simulação
                  </button>
                </div>
              </div>
            </div>
          </div>
        
          {/* Níveis Soros - Cards Responsivos */}
          <div className="bg-gradient-to-br from-neutral-900/60 via-neutral-800/40 to-neutral-900/60 backdrop-blur-xl border border-neutral-700/50 rounded-xl overflow-hidden">
            <div className="p-4 md:p-6 border-b border-neutral-700/50">
              <h2 className="text-base md:text-lg font-semibold text-white tracking-tight">Níveis Soros</h2>
              <p className="text-xs md:text-sm text-neutral-400 mt-1">Simulação de operações em formato de cards</p>
            </div>
            
            {/* Desktop - Tabela */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-800/50 border-b border-neutral-700/50">
                    <th className="text-left py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm font-medium text-neutral-300 tracking-wide">Nível</th>
                    <th className="text-right py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm font-medium text-neutral-300 tracking-wide">Entrada</th>
                    <th className="text-right py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm font-medium text-neutral-300 tracking-wide">Payout</th>
                    <th className="text-right py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm font-medium text-neutral-300 tracking-wide">Lucro</th>
                    <th className="text-center py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm font-medium text-neutral-300 tracking-wide">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sorosLevels.map((level) => (
                    <tr
                      key={level.level}
                      className={`border-b border-neutral-700/30 transition-all duration-200 hover:bg-neutral-800/30 ${
                        level.isActive
                          ? 'bg-purple-600/10 border-purple-500/30'
                          : level.isCompleted
                          ? level.result === 'win'
                            ? 'bg-success-600/10 border-success-500/30'
                            : 'bg-danger-600/10 border-danger-500/30'
                          : ''
                      }`}
                    >
                      <td className="py-3 md:py-4 px-3 md:px-6">
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                            level.isActive
                              ? 'bg-purple-500 shadow-lg shadow-purple-500/50'
                              : level.isCompleted
                              ? level.result === 'win'
                                ? 'bg-success-500 shadow-lg shadow-success-500/50'
                                : 'bg-danger-500 shadow-lg shadow-danger-500/50'
                              : 'bg-neutral-600'
                          }`}></div>
                          <span className="text-white font-medium text-xs md:text-sm">
                            {level.level === 0 ? 'Nível 0' : `Nível ${level.level}`}
                          </span>
                        </div>
                      </td>
                      
                      <td className="py-3 md:py-4 px-3 md:px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-white font-mono text-xs md:text-sm">
                            {formatCurrency(level.entry_value, user?.currency || 'BRL')}
                          </span>
                          {level.isActive && (
                            <button
                              onClick={() => copyEntryValue(level.entry_value)}
                              disabled={isSubmitting}
                              className="p-1 bg-blue-600/20 hover:bg-blue-600/30 disabled:bg-blue-600/10 border border-blue-500/30 hover:border-blue-500/50 text-blue-300 hover:text-blue-200 disabled:text-blue-400/50 rounded text-xs transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                              title="Copiar valor de entrada"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-3 md:py-4 px-3 md:px-6 text-right">
                        <input
                          type="text"
                          value={level.payout.toString().replace('.', ',')}
                          onChange={(e) => handleIndividualPayoutChange(level.level, e.target.value)}
                          className="w-16 px-2 py-1 bg-neutral-800/50 border border-neutral-600/50 rounded text-white text-xs text-right focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                          placeholder="85,5"
                        />
                        <span className="text-neutral-400 text-xs ml-1">%</span>
                      </td>
                      
                      <td className="py-3 md:py-4 px-3 md:px-6 text-right">
                        <span className="text-success-400 font-mono text-xs md:text-sm">
                          {formatCurrency(level.expectedProfit, user?.currency || 'BRL')}
                        </span>
                      </td>
                      
                      <td className="py-3 md:py-4 px-3 md:px-6">
                        {level.isActive ? (
                          <div className="flex items-center justify-center space-x-1 md:space-x-2">
                            <button
                              onClick={() => handleResult('win')}
                              disabled={isSubmitting}
                              className="px-2 md:px-4 py-1 md:py-2 bg-success-600/20 hover:bg-success-600/30 disabled:bg-success-600/10 border border-success-500/30 hover:border-success-500/50 text-success-300 hover:text-success-200 disabled:text-success-400/50 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                            >
                              Win
                            </button>
                            <button
                              onClick={() => handleResult('loss')}
                              disabled={isSubmitting}
                              className="px-2 md:px-4 py-1 md:py-2 bg-danger-600/20 hover:bg-danger-600/30 disabled:bg-danger-600/10 border border-danger-500/30 hover:border-danger-500/50 text-danger-300 hover:text-danger-200 disabled:text-danger-400/50 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                            >
                              Loss
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <span className="text-neutral-500 text-xs md:text-sm">-</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile - Cards */}
            <div className="md:hidden p-4 space-y-3">
              {sorosLevels.map((level) => (
                <div
                  key={level.level}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    level.isActive
                      ? 'bg-purple-600/10 border-purple-500/30'
                      : level.isCompleted
                      ? level.result === 'win'
                        ? 'bg-success-600/10 border-success-500/30'
                        : 'bg-danger-600/10 border-danger-500/30'
                      : 'bg-neutral-800/30 border-neutral-700/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        level.isActive
                          ? 'bg-purple-500 shadow-lg shadow-purple-500/50'
                          : level.isCompleted
                          ? level.result === 'win'
                            ? 'bg-success-500 shadow-lg shadow-success-500/50'
                            : 'bg-danger-500 shadow-lg shadow-danger-500/50'
                          : 'bg-neutral-600'
                      }`}></div>
                      <span className="text-white font-medium text-sm">
                        {level.level === 0 ? 'Nível 0' : `Nível ${level.level}`}
                      </span>
                    </div>
                    {level.isActive && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyEntryValue(level.entry_value)}
                          disabled={isSubmitting}
                          className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded text-xs font-medium"
                          title="Copiar valor de entrada"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleResult('win')}
                          disabled={isSubmitting}
                          className="px-3 py-1 bg-success-600/20 hover:bg-success-600/30 border border-success-500/30 text-success-300 rounded text-xs font-medium"
                        >
                          Win
                        </button>
                        <button
                          onClick={() => handleResult('loss')}
                          disabled={isSubmitting}
                          className="px-3 py-1 bg-danger-600/20 hover:bg-danger-600/30 border border-danger-500/30 text-danger-300 rounded text-xs font-medium"
                        >
                          Loss
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-400 block mb-1">Entrada</span>
                      <span className="text-white font-mono">
                        {formatCurrency(level.entry_value, user?.currency || 'BRL')}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block mb-1">Payout</span>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={level.payout.toString().replace('.', ',')}
                          onChange={(e) => handleIndividualPayoutChange(level.level, e.target.value)}
                          className="w-12 px-1 py-0.5 bg-neutral-800/50 border border-neutral-600/50 rounded text-white text-xs text-right focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                          placeholder="85,5"
                        />
                        <span className="text-neutral-400 text-xs ml-1">%</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-neutral-400 block mb-1">Lucro Esperado</span>
                      <span className="text-success-400 font-mono">
                        {formatCurrency(level.expectedProfit, user?.currency || 'BRL')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        
          {/* Histórico de Operações */}
          <div className="bg-gradient-to-br from-neutral-900/60 via-neutral-800/40 to-neutral-900/60 backdrop-blur-xl border border-neutral-700/50 rounded-xl overflow-hidden">
            <div className="p-4 md:p-6 border-b border-neutral-700/50">
              <h2 className="text-lg md:text-xl font-semibold text-white tracking-tight">Histórico de Operações</h2>
              <p className="text-xs md:text-sm text-neutral-400 mt-1">Registro completo das operações realizadas</p>
            </div>
            
            {dailyTrades.length === 0 ? (
              <div className="p-4 md:p-8 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 bg-neutral-800/50 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-neutral-500" />
                </div>
                <p className="text-neutral-400 mb-2 text-sm md:text-base">Nenhuma operação registrada ainda</p>
                <p className="text-xs md:text-sm text-neutral-500">Suas operações aparecerão aqui conforme você as registrar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-neutral-800/50 border-b border-neutral-700/50">
                      <th className="text-left py-2 md:py-4 px-3 md:px-6 text-xs md:text-sm font-medium text-neutral-300 tracking-wide">Data/Hora</th>
                      <th className="text-left py-2 md:py-4 px-3 md:px-6 text-xs md:text-sm font-medium text-neutral-300 tracking-wide">Nível</th>
                      <th className="text-right py-2 md:py-4 px-3 md:px-6 text-xs md:text-sm font-medium text-neutral-300 tracking-wide">Entrada</th>
                      <th className="text-right py-2 md:py-4 px-3 md:px-6 text-xs md:text-sm font-medium text-neutral-300 tracking-wide">Payout</th>
                      <th className="text-center py-2 md:py-4 px-3 md:px-6 text-xs md:text-sm font-medium text-neutral-300 tracking-wide">Resultado</th>
                      <th className="text-right py-2 md:py-4 px-3 md:px-6 text-xs md:text-sm font-medium text-neutral-300 tracking-wide">Resultado</th>
                      <th className="text-right py-2 md:py-4 px-3 md:px-6 text-xs md:text-sm font-medium text-neutral-300 tracking-wide">Acumulado</th>
                      <th className="text-center py-2 md:py-4 px-3 md:px-6 text-xs md:text-sm font-medium text-neutral-300 tracking-wide">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyTrades.map((trade, index) => {
                      // Calcular acumulado até este ponto
                      const accumulatedValue = dailyTrades
                        .slice(0, index + 1)
                        .reduce((sum, t) => sum + (t.profitLoss || 0), 0);
                      
                      return (
                        <tr key={trade.id || index} className="border-b border-neutral-700/30 hover:bg-neutral-800/30 transition-all duration-200">
                          <td className="py-2 md:py-4 px-3 md:px-6">
                            <div className="text-white font-medium text-xs md:text-sm">
                              {new Date(trade.createdAt).toLocaleDateString('pt-BR', {
                                timeZone: 'UTC'
                              })}
                            </div>
                            <div className="text-xs text-neutral-400">
                              <span className="md:hidden">
                                {new Date(trade.createdAt).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit'
                                })}
                              </span>
                              <span className="hidden md:inline">
                                {new Date(trade.createdAt).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  second: '2-digit'
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 md:py-4 px-3 md:px-6">
                            <span className="inline-flex items-center px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full text-xs font-medium bg-purple-600/20 text-purple-300 border border-purple-500/30">
                              <span className="md:hidden">{trade.level === 0 ? 'N0' : `N${trade.level}`}</span>
                              <span className="hidden md:inline">{trade.level === 0 ? 'Nível 0' : `Nível ${trade.level}`}</span>
                            </span>
                          </td>
                          <td className="py-2 md:py-4 px-3 md:px-6 text-right">
                            <span className="text-white font-mono text-xs md:text-sm">
                              {formatCurrency(trade.entry_value, user?.currency || 'BRL')}
                            </span>
                          </td>
                          <td className="py-2 md:py-4 px-3 md:px-6 text-right">
                            <span className="text-white font-mono text-xs md:text-sm">
                              {trade.payout}%
                            </span>
                          </td>
                          <td className="py-2 md:py-4 px-3 md:px-6 text-center">
                            <span className={`inline-flex items-center px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-medium ${
                              trade.result === 'win' 
                                ? 'bg-success-600/20 text-success-300 border border-success-500/30' 
                                : 'bg-danger-600/20 text-danger-300 border border-danger-500/30'
                            }`}>
                              {trade.result === 'win' ? 'WIN' : 'LOSS'}
                            </span>
                          </td>
                          <td className="py-2 md:py-4 px-3 md:px-6 text-right">
                            <span className={`font-mono font-medium text-xs md:text-sm ${
                              (trade.profitLoss || 0) >= 0 ? 'text-success-400' : 'text-danger-400'
                            }`}>
                              {formatCurrency(trade.profitLoss || 0, user?.currency || 'BRL')}
                            </span>
                          </td>
                          <td className="py-2 md:py-4 px-3 md:px-6 text-right">
                            <span className={`font-mono font-medium text-xs md:text-sm ${
                              accumulatedValue >= 0 ? 'text-success-400' : 'text-danger-400'
                            }`}>
                              {formatCurrency(accumulatedValue, user?.currency || 'BRL')}
                            </span>
                          </td>
                          <td className="py-2 md:py-4 px-3 md:px-6">
                            <div className="flex items-center justify-center space-x-1 md:space-x-2">
                              <button
                                onClick={() => setEditingTradeId(trade.id)}
                                className="p-1 md:p-2 text-neutral-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                                title="Editar operação"
                              >
                                <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                              </button>
                              <button
                                onClick={() => deleteTrade(trade.id)}
                                className="p-1 md:p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                                title="Deletar operação"
                              >
                                <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal do Diário */}
      {isDiaryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white tracking-tight">Anotações do Diário</h3>
              <button
                onClick={() => setIsDiaryModalOpen(false)}
                className="p-2 hover:bg-neutral-700/50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Data: {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                    timeZone: 'UTC'
                  })}
                </label>
                <textarea
                  value={diaryNote}
                  onChange={(e) => setDiaryNote(e.target.value)}
                  placeholder="Escreva suas anotações sobre o dia de trading..."
                  className="w-full h-32 px-4 py-3 bg-neutral-800/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all duration-200"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsDiaryModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-neutral-700/50 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg font-medium transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDiarySave}
                  disabled={!diaryNote.trim()}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-purple-600/50 disabled:to-purple-700/50 text-white disabled:text-white/50 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notificação de Loss */}
      {showLossNotification && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-danger-600 to-danger-700 text-white px-6 py-4 rounded-lg shadow-lg shadow-danger-600/25 z-50 border border-danger-500/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-danger-500/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="font-semibold">Loss Registrado!</div>
              <div className="text-sm opacity-90">
                {config.useProtection 
                  ? 'Capital protegido mantido. Simulação reiniciada.'
                  : 'Simulação encerrada.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SorosSimulation;