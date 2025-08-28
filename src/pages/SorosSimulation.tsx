import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTradesWithAuth } from '../stores/useTradeStore';
import { Trade } from '../types';

interface SorosLevel {
  level: number;
  entryValue: number;
  payout: number;
  expectedProfit: number;
  isActive: boolean;
  isCompleted: boolean;
  result?: 'win' | 'loss';
}

interface SorosConfig {
  initialValue: number;
  payout: number;
  useProtection: boolean;
  protectionValue: number;
}

interface SorosStats {
  wins: number;
  losses: number;
  totalResult: number;
}

const SorosSimulation: React.FC = () => {
  const { user } = useAuth();
  const { trades, addTrade } = useTradesWithAuth();
  
  const [config, setConfig] = useState<SorosConfig>({
    initialValue: 10,
    payout: 80,
    useProtection: true,
    protectionValue: 10
  });
  
  const [sorosLevels, setSorosLevels] = useState<SorosLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [protectionProfit, setProtectionProfit] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLossNotification, setShowLossNotification] = useState(false);
  
  // Calcular níveis Soros
  const calculateSorosLevels = () => {
    const levels: SorosLevel[] = [];
    
    if (config.useProtection) {
      // Nível 0 (Proteção)
      const entryValue = config.protectionValue;
      const expectedProfit = Math.round((entryValue * config.payout / 100) * 100) / 100;
      
      levels.push({
        level: 0,
        entryValue,
        payout: config.payout,
        expectedProfit,
        isActive: true,
        isCompleted: false
      });
      
      // Níveis subsequentes usando apenas o lucro
      let currentEntryValue = expectedProfit;
      for (let i = 1; i <= 5; i++) {
        const levelExpectedProfit = Math.round((currentEntryValue * config.payout / 100) * 100) / 100;
        levels.push({
          level: i,
          entryValue: currentEntryValue,
          payout: config.payout,
          expectedProfit: levelExpectedProfit,
          isActive: false,
          isCompleted: false
        });
        currentEntryValue = levelExpectedProfit;
      }
    } else {
      // Sem proteção - usar valor inicial
      let totalAccumulated = config.initialValue;
      
      for (let i = 1; i <= 6; i++) {
        const expectedProfit = Math.round((totalAccumulated * config.payout / 100) * 100) / 100;
        levels.push({
          level: i,
          entryValue: totalAccumulated,
          payout: config.payout,
          expectedProfit,
          isActive: i === 1,
          isCompleted: false
        });
        totalAccumulated += expectedProfit;
      }
    }
    
    return levels;
  };
  
  // Atualizar payout
  const updatePayout = (newPayout: number) => {
    setConfig(prev => ({ ...prev, payout: newPayout }));
    
    const updatedLevels = sorosLevels.map(level => {
      const expectedProfit = Math.round((level.entryValue * newPayout / 100) * 100) / 100;
      return {
        ...level,
        payout: newPayout,
        expectedProfit
      };
    });
    
    setSorosLevels(updatedLevels);
  };
  
  // Atualizar valor de entrada
  const updateEntryValue = (level: number, newEntryValue: number) => {
    const updatedLevels = sorosLevels.map(l => {
      if (l.level === level) {
        const expectedProfit = Math.round((newEntryValue * l.payout / 100) * 100) / 100;
        return {
          ...l,
          entryValue: newEntryValue,
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
  const saveTradeEdit = async (tradeId: string, newResult: 'win' | 'loss', entryValue: number, payout: number) => {
    if (!user) return;
    
    try {
      const profitLoss = newResult === 'win' 
        ? Math.round((entryValue * payout / 100) * 100) / 100
        : Math.round(-entryValue * 100) / 100;
      
      // Aqui você implementaria a lógica para atualizar o trade no Firebase
      console.log('Atualizando trade:', { tradeId, newResult, profitLoss });
      
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
      alert('Erro ao salvar edição. Tente novamente.');
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
        profitLoss = Math.round(-activeLevel.entryValue * 100) / 100;
      }
      
      // Registrar operação no Firebase
      const newTrade: Omit<Trade, 'id' | 'userId' | 'createdAt'> = {
        date: new Date().toISOString().split('T')[0],
        payout: activeLevel.payout,
        entry_value: activeLevel.entryValue,
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
              // Nível 1 usa valor inicial + lucro da proteção
              const newEntryValue = config.initialValue + roundedProfit;
              const newExpectedProfit = Math.round((newEntryValue * newLevels[level1Index].payout / 100) * 100) / 100;
              
              newLevels[level1Index] = {
                ...newLevels[level1Index],
                entryValue: newEntryValue,
                expectedProfit: newExpectedProfit,
                isActive: true
              };
              
              // Atualizar níveis subsequentes
              let currentProfit = newExpectedProfit;
              for (let i = level1Index + 1; i < newLevels.length; i++) {
                const expectedProfit = Math.round((currentProfit * newLevels[i].payout / 100) * 100) / 100;
                newLevels[i] = {
                  ...newLevels[i],
                  entryValue: currentProfit,
                  expectedProfit: expectedProfit
                };
                currentProfit = expectedProfit;
              }
              
              setCurrentLevel(1);
            }
          } else {
          const nextLevelIndex = newLevels.findIndex(l => l.level === activeLevel.level + 1);
          if (nextLevelIndex !== -1) {
            const nextEntryValue = Math.round(activeLevel.expectedProfit * 100) / 100;
            const nextExpectedProfit = Math.round((nextEntryValue * newLevels[nextLevelIndex].payout / 100) * 100) / 100;
            
            newLevels[nextLevelIndex] = {
              ...newLevels[nextLevelIndex],
              entryValue: nextEntryValue,
              expectedProfit: nextExpectedProfit,
              isActive: true
            };
            
            let currentProfit = nextExpectedProfit;
            for (let i = nextLevelIndex + 1; i < newLevels.length; i++) {
              const expectedProfit = Math.round((currentProfit * newLevels[i].payout / 100) * 100) / 100;
              newLevels[i] = {
                ...newLevels[i],
                entryValue: currentProfit,
                expectedProfit: expectedProfit
              };
              currentProfit = expectedProfit;
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
    
    const sorosTrades = trades
      .filter(trade => trade.tradeType === 'soros' && typeof trade.date === 'string')
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return aTime - bTime;
      });
    
    let currentBalance = config.useProtection ? config.protectionValue : config.initialValue;
    
    return sorosTrades.map(trade => {
      let accumulated: number;
      let finalAccumulated: number;
      
      if (config.useProtection) {
        if (trade.level === 0) {
          // Nível 0 (proteção) - usa valor de proteção
          if (trade.result === 'win') {
            accumulated = currentBalance + trade.profitLoss;
            currentBalance = config.protectionValue; // Mantém proteção
            finalAccumulated = currentBalance;
          } else {
            accumulated = currentBalance + trade.profitLoss;
            currentBalance = config.protectionValue; // Mantém proteção
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
            currentBalance = config.protectionValue; // Volta para proteção
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
  
  // Inicializar níveis
  useEffect(() => {
    resetSimulation();
  }, [config.useProtection, config.protectionValue, config.initialValue]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Simulação Soros
        </h1>
        
        {/* Configurações */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Configurações</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor Inicial (R$)
              </label>
              <input
                type="number"
                value={config.initialValue}
                onChange={(e) => setConfig(prev => ({ ...prev, initialValue: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payout (%)
              </label>
              <input
                type="number"
                value={config.payout}
                onChange={(e) => updatePayout(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
                max="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Usar Proteção
              </label>
              <select
                value={config.useProtection ? 'true' : 'false'}
                onChange={(e) => setConfig(prev => ({ ...prev, useProtection: e.target.value === 'true' }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
            
            {config.useProtection && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor Proteção (R$)
                </label>
                <input
                  type="number"
                  value={config.protectionValue}
                  onChange={(e) => setConfig(prev => ({ ...prev, protectionValue: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  step="0.01"
                />
              </div>
            )}
          </div>
          
          <button
            onClick={resetSimulation}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Resetar Simulação
          </button>
        </div>
        
        {/* Níveis Soros */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Níveis Soros</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorosLevels.map((level) => (
              <div
                key={level.level}
                className={`p-4 rounded-lg border-2 transition-all ${
                  level.isActive
                    ? 'border-yellow-400 bg-yellow-400/20'
                    : level.isCompleted
                    ? level.result === 'win'
                      ? 'border-green-400 bg-green-400/20'
                      : 'border-red-400 bg-red-400/20'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-white">
                    {level.level === 0 ? 'Proteção' : `Nível ${level.level}`}
                  </h3>
                  {level.isCompleted && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      level.result === 'win' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {level.result === 'win' ? 'WIN' : 'LOSS'}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Entrada:</span>
                    <span className="text-white font-medium">R$ {level.entryValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Payout:</span>
                    <span className="text-white font-medium">{level.payout}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Lucro Esperado:</span>
                    <span className="text-green-400 font-medium">R$ {level.expectedProfit.toFixed(2)}</span>
                  </div>
                </div>
                
                {level.isActive && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleResult('win')}
                      disabled={isSubmitting}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      WIN
                    </button>
                    <button
                      onClick={() => handleResult('loss')}
                      disabled={isSubmitting}
                      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      LOSS
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Estatísticas do Dia */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Estatísticas do Dia</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{dailyStats.wins}</div>
              <div className="text-sm text-gray-300">Vitórias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{dailyStats.losses}</div>
              <div className="text-sm text-gray-300">Derrotas</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                dailyStats.totalResult >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                R$ {dailyStats.totalResult.toFixed(2)}
              </div>
              <div className="text-sm text-gray-300">Resultado Total</div>
            </div>
          </div>
        </div>
        
        {/* Histórico */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Histórico de Operações</h2>
          
          {dailyTrades.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Nenhuma operação registrada ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-2 px-3 text-gray-300">Data</th>
                    <th className="text-left py-2 px-3 text-gray-300">Nível</th>
                    <th className="text-left py-2 px-3 text-gray-300">Entrada</th>
                    <th className="text-left py-2 px-3 text-gray-300">Payout</th>
                    <th className="text-left py-2 px-3 text-gray-300">Resultado</th>
                    <th className="text-left py-2 px-3 text-gray-300">P&L</th>
                    <th className="text-left py-2 px-3 text-gray-300">Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyTrades.map((trade, index) => (
                    <tr key={index} className="border-b border-white/10">
                      <td className="py-2 px-3 text-white">{trade.date}</td>
                      <td className="py-2 px-3 text-white">
                        {trade.level === 0 ? 'Proteção' : `Nível ${trade.level}`}
                      </td>
                      <td className="py-2 px-3 text-white">R$ {trade.entryValue.toFixed(2)}</td>
                      <td className="py-2 px-3 text-white">{trade.payout}%</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.result === 'win' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {trade.result === 'win' ? 'WIN' : 'LOSS'}
                        </span>
                      </td>
                      <td className={`py-2 px-3 font-medium ${
                        trade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        R$ {trade.profitLoss.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-white font-medium">
                        R$ {trade.finalAccumulated.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Notificação de Loss */}
        {showLossNotification && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
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
    </div>
  );
};

export default SorosSimulation;