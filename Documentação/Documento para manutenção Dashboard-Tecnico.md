# Documentação Técnica - Dashboard OptiShield

**Data de Criação:** Janeiro 2025  
**Versão:** 1.0  
**Responsável:** Arquiteto de Software IA  
**Status:** Implementado e Testado

---

## 1. Visão Geral

O Dashboard é a página principal da aplicação OptiShield, responsável por exibir um resumo completo das operações de trading do usuário. Ele integra múltiplos componentes para fornecer uma visão consolidada do desempenho financeiro, incluindo calendário interativo, estatísticas de período e navegação rápida.

### Localização
- **Arquivo Principal:** `src/pages/Dashboard.tsx`
- **Rota:** `/dashboard` (rota protegida)
- **Componente:** `Dashboard`

---

## 2. O Que Foi Feito e Como Foi Feito

### 2.1 Estrutura Principal

O Dashboard foi implementado como um componente funcional React que integra múltiplos sub-componentes especializados:

```typescript
const Dashboard: React.FC = () => {
  // Estados locais para controle de período e data
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Estados para controle de modais
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
}
```

### 2.2 Lógica de Cálculo de Estatísticas

**Estatísticas do Período:**
- Calcula lucro/prejuízo baseado no período selecionado (mensal/semanal)
- Determina taxa de acerto (win rate) dos trades
- Calcula risco médio das operações
- Conta total de trades realizados

**Cálculo de Saldo Total:**
- Integra dados de trades e transações de balanço
- Fórmula: `(Depósitos - Saques) + Lucro/Prejuízo Acumulado`
- Mantém persistência entre períodos

### 2.3 Componentes Integrados

1. **PeriodSummary**: Exibe resumo financeiro com filtros de período
2. **InteractiveCalendar**: Calendário com resultados diários dos trades
3. **FAB (Floating Action Button)**: Menu de navegação rápida
4. **BalanceManagerModal**: Modal para gestão de depósitos/saques
5. **BottomNavigation**: Navegação entre Dashboard e Histórico

### 2.4 Gerenciamento de Estado

**Estados Locais:**
- `selectedPeriod`: Controla filtro mensal/semanal
- `currentDate`: Data de referência para cálculos
- `isBalanceModalOpen`: Controle do modal de saldo
- `isFabOpen`: Controle do menu FAB

**Estados Globais (Zustand):**
- `useTradeStore`: Dados de trades e operações
- `useBalanceTransactionStore`: Transações de depósito/saque

---

## 3. Dependências e Integrações

### 3.1 Bibliotecas Principais

```json
{
  "react": "18.3.1",
  "zustand": "4.5.5",
  "date-fns": "3.6.0",
  "lucide-react": "0.441.0",
  "framer-motion": "^11.0.0"
}
```

### 3.2 Hooks Customizados

- **useAuth**: Autenticação e controle de usuário
- **useTradeStore**: Gerenciamento de trades
- **useBalanceTransactionStore**: Gerenciamento de transações

### 3.3 Contextos

- **ThemeContext**: Tema da aplicação (Liquid Glass)
- **AuthContext**: Estado de autenticação

### 3.4 Utilitários

- **formatCurrency**: Formatação de valores monetários
- **calculateDayStats**: Cálculo de estatísticas diárias
- **getTradesByPeriod**: Filtro de trades por período

---

## 4. Relacionamentos com Outras Páginas/Arquivos

### 4.1 Navegação

**Para História:**
- Componente: `BottomNavigation`
- Rota: `/history`
- Método: `useNavigate()` do React Router

**Para Registro de Trade:**
- Acionado via FAB menu
- Rota: `/trade-registration`
- Método: Navegação programática

### 4.2 Componentes Compartilhados

**Layout:**
- `src/components/layout/Navigation.tsx`
- `src/components/ui/LoadingSpinner.tsx`

**Modais:**
- `src/components/modals/BalanceManagerModal.tsx`
- Compartilhado com outras páginas

### 4.3 Stores Compartilhadas

**useTradeStore:**
- Compartilhada com: History, TradeRegistration
- Funções: `fetchTrades`, `addTrade`, `getTradesByPeriod`

**useBalanceTransactionStore:**
- Compartilhada com: BalanceManagerModal
- Funções: `fetchTransactions`, `addTransaction`, `calculateTotalBalance`

### 4.4 Integração Firebase

**Coleções Utilizadas:**
- `users/{userId}/trades`
- `users/{userId}/balanceTransactions`
- `users/{userId}/deposits`

**Funções Firebase:**
- `getTrades()`: Busca trades do usuário
- `getBalanceTransactions()`: Busca transações
- Todas encapsuladas em `src/lib/firebase.db.ts`

---

## 5. Orientações para Manutenção Futura

### 5.1 Adicionando Novos Períodos de Filtro

1. **Atualizar tipo do estado:**
```typescript
type PeriodType = 'monthly' | 'weekly' | 'daily' | 'yearly';
```

2. **Implementar lógica de cálculo:**
```typescript
const periodStats = useMemo(() => {
  switch(selectedPeriod) {
    case 'daily': return calculateDailyStats(trades, currentDate);
    case 'yearly': return calculateYearlyStats(trades, currentDate);
    // ...
  }
}, [trades, selectedPeriod, currentDate]);
```

3. **Atualizar componente PeriodSummary:**
- Adicionar botão do novo período
- Implementar lógica de cálculo correspondente

### 5.2 Adicionando Novos Cards de Estatística

1. **Calcular nova métrica:**
```typescript
const newMetric = useMemo(() => {
  return calculateNewMetric(trades, selectedPeriod);
}, [trades, selectedPeriod]);
```

2. **Passar para PeriodSummary:**
```typescript
<PeriodSummary
  // props existentes...
  newMetric={newMetric}
/>
```

3. **Implementar no PeriodSummary:**
- Adicionar prop na interface
- Criar novo card com formatação adequada

### 5.3 Modificando Cálculos de Saldo

**⚠️ ATENÇÃO:** Mudanças no cálculo de saldo afetam toda a aplicação.

1. **Localização da lógica:**
   - `useBalanceTransactionStore.ts` - função `calculateTotalBalance`
   - `Dashboard.tsx` - cálculo do `totalBalance`

2. **Passos para modificação:**
   - Atualizar função `calculateTotalBalance`
   - Testar em ambiente de desenvolvimento
   - Validar com dados históricos
   - Atualizar testes automatizados

### 5.4 Adicionando Novos Componentes

1. **Estrutura recomendada:**
```
src/components/dashboard/
├── NewComponent.tsx
├── NewComponent.test.tsx
└── index.ts
```

2. **Integração no Dashboard:**
```typescript
import { NewComponent } from '../components/dashboard/NewComponent';

// No JSX do Dashboard
<NewComponent 
  data={relevantData}
  onAction={handleAction}
/>
```

### 5.5 Modificando Estilos (Liquid Glass)

**Classes Tailwind principais:**
- `bg-black`: Fundo preto absoluto
- `bg-white/10`: Efeito glass
- `backdrop-blur-md`: Blur do glass
- `border-white/20`: Bordas translúcidas

**⚠️ Evitar:**
- Cores azuis (usar branco/cinza/verde)
- Fundos sólidos (manter transparência)
- Bordas sólidas (usar translúcidas)

---

## 6. Plano de Restauração Automática

### 6.1 Problemas Comuns e Soluções

**Problema: Dashboard não carrega dados**

1. **Verificar autenticação:**
```typescript
// Em Dashboard.tsx, adicionar log
console.log('User authenticated:', user?.uid);
```

2. **Verificar stores:**
```typescript
// Verificar se stores estão inicializando
console.log('Trades loaded:', trades.length);
console.log('Balance transactions:', balanceTransactions.length);
```

3. **Verificar Firebase:**
```typescript
// Testar conexão Firebase
try {
  const testTrades = await getTrades();
  console.log('Firebase connection OK:', testTrades.length);
} catch (error) {
  console.error('Firebase error:', error);
}
```

**Problema: Cálculos incorretos**

1. **Verificar dados de entrada:**
```typescript
// Log dos dados brutos
console.log('Raw trades:', trades);
console.log('Raw transactions:', balanceTransactions);
```

2. **Verificar lógica de cálculo:**
```typescript
// Adicionar logs nos cálculos
const periodStats = useMemo(() => {
  console.log('Calculating for period:', selectedPeriod);
  const result = calculatePeriodStats(trades, selectedPeriod, currentDate);
  console.log('Period stats result:', result);
  return result;
}, [trades, selectedPeriod, currentDate]);
```

**Problema: Componentes não renderizam**

1. **Verificar props:**
```typescript
// Antes de cada componente
console.log('PeriodSummary props:', {
  monthlyProfit,
  totalBalance,
  winRate,
  // ...
});
```

2. **Verificar estados:**
```typescript
// Log dos estados locais
console.log('Dashboard states:', {
  selectedPeriod,
  currentDate,
  isBalanceModalOpen,
  isFabOpen
});
```

### 6.2 Passos de Restauração Completa

**Passo 1: Backup e Verificação**
```bash
# Fazer backup do arquivo atual
cp src/pages/Dashboard.tsx src/pages/Dashboard.backup.tsx

# Verificar integridade do projeto
npm run build
```

**Passo 2: Restaurar Dependências**
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

**Passo 3: Verificar Stores**
```typescript
// Testar stores individualmente
import { useTradeStore } from '../stores/useTradeStore';
import { useBalanceTransactionStore } from '../stores/useBalanceTransactionStore';

// Verificar se funções existem
console.log('Trade store functions:', Object.keys(useTradeStore.getState()));
console.log('Balance store functions:', Object.keys(useBalanceTransactionStore.getState()));
```

**Passo 4: Restaurar Componente**

Se o Dashboard estiver corrompido, usar esta estrutura mínima:

```typescript
import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTradeStore } from '../stores/useTradeStore';
import { useBalanceTransactionStore } from '../stores/useBalanceTransactionStore';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { trades, fetchTrades } = useTradeStore();
  const { balanceTransactions, fetchTransactions } = useBalanceTransactionStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Carregar dados na inicialização
  React.useEffect(() => {
    if (user) {
      fetchTrades();
      fetchTransactions();
    }
  }, [user]);
  
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1>Dashboard - Modo de Recuperação</h1>
      <p>Trades: {trades.length}</p>
      <p>Transações: {balanceTransactions.length}</p>
    </div>
  );
};

export default Dashboard;
```

**Passo 5: Testar e Validar**
```bash
# Executar testes
npm run test

# Testar em desenvolvimento
npm run dev

# Verificar no navegador
# http://localhost:3001/dashboard
```

### 6.3 Checklist de Validação

- [ ] Dashboard carrega sem erros
- [ ] Dados de trades são exibidos
- [ ] Cálculos de saldo estão corretos
- [ ] Filtros de período funcionam
- [ ] Calendário exibe dados corretos
- [ ] FAB menu funciona
- [ ] Modal de saldo abre/fecha
- [ ] Navegação para histórico funciona
- [ ] Responsividade mantida
- [ ] Performance adequada

---

## 7. Testes e Validação

### 7.1 Testes Automatizados Implementados

**Playwright Tests:**
- Login e autenticação
- Carregamento do dashboard
- Funcionalidade dos filtros de período
- Alternância entre saldo e lucro/prejuízo
- Menu FAB e navegação
- Modal de gestão de saldo
- Navegação para histórico

**Localização:** `tests/dashboard-*.spec.ts`

### 7.2 Cenários de Teste Manual

1. **Teste de Carga Inicial:**
   - Acessar `/dashboard`
   - Verificar carregamento de dados
   - Validar cálculos exibidos

2. **Teste de Interatividade:**
   - Clicar em filtros de período
   - Alternar entre saldo/lucro
   - Usar menu FAB
   - Abrir/fechar modais

3. **Teste de Responsividade:**
   - Testar em mobile (375px)
   - Testar em tablet (768px)
   - Testar em desktop (1024px+)

### 7.3 Métricas de Performance

- **Tempo de carregamento inicial:** < 2s
- **Tempo de resposta dos filtros:** < 500ms
- **Uso de memória:** < 50MB
- **Bundle size:** Monitorar com `npm run build`

---

## 8. Considerações de Segurança

### 8.1 Proteção de Dados

- Todos os dados são filtrados por `user.uid`
- Firestore Rules validam propriedade dos documentos
- Não há exposição de dados de outros usuários

### 8.2 Validação de Entrada

- Todas as datas são validadas com `date-fns`
- Valores monetários são sanitizados
- Estados são tipados com TypeScript

### 8.3 Tratamento de Erros

- Try/catch em todas as operações assíncronas
- Fallbacks para estados de erro
- Logs de erro para debugging

---

## 9. Histórico de Alterações

| Data | Versão | Alteração | Responsável |
|------|--------|-----------|-------------|
| Jan 2025 | 1.0 | Implementação inicial completa | Arquiteto IA |
| Jan 2025 | 1.0 | Testes automatizados implementados | Arquiteto IA |
| Jan 2025 | 1.0 | Documentação técnica criada | Arquiteto IA |

---

## 10. Contatos e Suporte

**Arquiteto Responsável:** Sistema IA  
**Documentação:** Este arquivo  
**Repositório:** OptiShield React  
**Última Atualização:** Janeiro 2025

---

*Este documento deve ser atualizado sempre que houver modificações significativas no Dashboard ou em seus componentes relacionados.*