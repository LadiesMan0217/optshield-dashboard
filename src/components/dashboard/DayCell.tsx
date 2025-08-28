import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DayCellProps {
  date: Date;
  dailyResult: number; // Resultado financeiro do dia
  isCurrentMonth: boolean;
  isToday: boolean;
  hasOperations: boolean;
}

export const DayCell: React.FC<DayCellProps> = ({ 
  date, 
  dailyResult, 
  isCurrentMonth, 
  isToday, 
  hasOperations 
}) => {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    if (value === 0) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(value));
  };

  const handleClick = () => {
    // Redirecionar para tela de registro de operações com data pré-selecionada
    const formattedDate = format(date, 'yyyy-MM-dd');
    navigate(`/trade-registration?date=${formattedDate}`);
  };

  const getCellStyle = () => {
    let baseStyle = 'min-h-[80px] p-2 border border-white/10 cursor-pointer transition-all duration-200 hover:bg-white/5 flex flex-col justify-between';
    
    // Estilo baseado no resultado financeiro
    if (hasOperations && dailyResult !== 0) {
      if (dailyResult > 0) {
        baseStyle += ' bg-green-500/20 hover:bg-green-500/30 border-green-400/30';
      } else {
        baseStyle += ' bg-red-500/20 hover:bg-red-500/30 border-red-400/30';
      }
    } else {
      baseStyle += ' bg-white/5';
    }

    // Destacar dia atual
    if (isToday) {
      baseStyle += ' ring-2 ring-blue-400/50';
    }

    // Dias fora do mês atual ficam mais opacos
    if (!isCurrentMonth) {
      baseStyle += ' opacity-40';
    }

    return baseStyle;
  };

  const getTextColor = () => {
    if (!isCurrentMonth) return 'text-white/40';
    if (isToday) return 'text-blue-400 font-bold';
    return 'text-white/80';
  };

  const getResultColor = () => {
    if (dailyResult > 0) return 'text-green-400';
    if (dailyResult < 0) return 'text-red-400';
    return 'text-white/60';
  };

  return (
    <div 
      className={getCellStyle()}
      onClick={handleClick}
      title={`${format(date, 'dd/MM/yyyy', { locale: ptBR })} - Clique para registrar operação`}
    >
      {/* Número do dia */}
      <div className={`text-sm ${getTextColor()}`}>
        {format(date, 'd')}
      </div>

      {/* Resultado financeiro do dia */}
      {hasOperations && dailyResult !== 0 && (
        <div className={`text-xs font-medium ${getResultColor()} text-center`}>
          {dailyResult > 0 ? '+' : '-'}{formatCurrency(dailyResult)}
        </div>
      )}

      {/* Indicador de operações */}
      {hasOperations && (
        <div className="flex justify-center mt-1">
          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default DayCell;