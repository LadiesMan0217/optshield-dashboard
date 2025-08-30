# Relatório de Divergências - Trading Shield Dashboard

## Resumo Executivo

Este relatório documenta as divergências críticas encontradas entre a implementação atual do projeto Trading Shield e as especificações definidas na **Documentação Técnica: Dashboard Principal (React)**. A documentação deve ser considerada como a **fonte única da verdade** para todas as regras de negócio e arquitetura.

---

## 1. DIVERGÊNCIAS DE ARQUITETURA DE COMPONENTES

### 1.1 Componentes Ausentes (CRÍTICO)

#### **PeriodSummary.jsx**
- **Status**: AUSENTE
- **Especificação**: Deve calcular e mostrar o Lucro/Prejuízo do Mês, Taxa de Acerto (Win Rate) e Risco Médio
- **Situação Atual**: Funcionalidade parcialmente implementada em `KPICards.tsx`, mas não segue a especificação exata
- **Impacto**: Violação da arquitetura definida

#### **DayCell.jsx**
- **Status**: AUSENTE
- **Especificação**: Representa um único dia no calendário com cálculo e exibição do resultado financeiro do dia
- **Situação Atual**: Lógica implementada diretamente em `DashboardCalendar.tsx`
- **Impacto**: Violação da separação de responsabilidades

#### **BalanceManager.jsx**
- **Status**: AUSENTE
- **Especificação**: Componente para registro de depósitos e saques com formulário específico
- **Situação Atual**: Funcionalidade parcial em `DepositModal.tsx` (apenas depósitos)
- **Impacto**: Funcionalidade de saques completamente ausente

### 1.2 Componentes com Nomenclatura Incorreta

#### **DashboardPage vs Dashboard.tsx**
- **Especificação**: `DashboardPage.jsx`
- **Implementação Atual**: `Dashboard.tsx`
- **Impacto**: Divergência de nomenclatura

#### **Calendar vs DashboardCalendar.tsx**
- **Especificação**: `Calendar.jsx`
- **Implementação Atual**: `DashboardCalendar.tsx`
- **Impacto**: Divergência de nomenclatura

---

## 2. DIVERGÊNCIAS CRÍTICAS DE REGRAS DE NEGÓCIO

### 2.1 Cálculo do Saldo Total (CRÍTICO)

#### **Especificação da Documentação**:
```
Saldo Total = Saldo Inicial + Depósitos - Saques
```

#### **Implementação Atual**:
- `Header.tsx` exibe apenas `user.initial_balance`
- **NÃO** considera depósitos e saques no cálculo
- **NÃO** existe funcionalidade de saques

#### **Impacto**: 
- Violação fundamental da regra de negócio
- Usuários não conseguem visualizar saldo real
- Sistema não reflete transações financeiras corretamente

### 2.2 Funcionalidade de Saques (CRÍTICO)

#### **Especificação**: 
- Sistema deve permitir registro de saques
- Saques devem alterar o Saldo Total
- Estrutura Firebase: `balanceTransactions` com `type: "withdrawal"`

#### **Implementação Atual**:
- **AUSENTE** completamente
- Apenas depósitos são suportados
- Estrutura Firebase usa tabela `deposits` ao invés de `balanceTransactions`

### 2.3 Separação Lucro/Prejuízo do Mês vs Saldo Total

#### **Especificação**:
- **Lucro/Prejuízo do Mês**: Calculado apenas dos trades do mês atual, zerado mensalmente
- **Saldo Total**: Valor cumulativo transportado entre meses
- **Depósitos/Saques**: Afetam apenas Saldo Total, não o Lucro/Prejuízo

#### **Implementação Atual**:
- Lógica parcialmente correta para Lucro/Prejuízo do Mês
- **FALHA** no cálculo do Saldo Total (não considera depósitos/saques)
- Não há separação clara entre os dois conceitos na UI

---

## 3. DIVERGÊNCIAS DE ESTRUTURA FIREBASE

### 3.1 Estrutura de Transações de Saldo

#### **Especificação**:
```
users/{userId}/balanceTransactions/{transactionId}
Campos: type ("deposit"/"withdrawal"), amount (number), date (timestamp)
```

#### **Implementação Atual**:
```
users/{userId}/deposits/{depositId}
Campos: amount, currency, date, created_at
```

#### **Problemas**:
- Estrutura diferente da especificada
- Não suporta saques (withdrawals)
- Campos adicionais não especificados (currency)

### 3.2 Estrutura de Trades

#### **Especificação**:
```
Campos: date (string "YYYY-MM-DD"), result ("win"/"loss"), profit (number)
```

#### **Implementação Atual**:
```
Campos: date, payout, entryValue, result, profitLoss, tradeType, level, createdAt
```

#### **Análise**: 
- Estrutura mais complexa que a especificada
- Campo `profit` vs `profitLoss` (nomenclatura)
- Campos adicionais para diferentes tipos de trade

---

## 4. DIVERGÊNCIAS DE FLUXO DE DADOS

### 4.1 Cálculo e Propagação de Estado

#### **Especificação**:
- `DashboardPage` deve calcular `totalBalance` e `monthlyProfit`
- Valores devem ser passados via props para componentes filhos
- Recálculo automático após operações

#### **Implementação Atual**:
- Cálculos distribuídos entre vários componentes
- Estado gerenciado por stores Zustand
- **AUSENTE**: Cálculo centralizado do `totalBalance`

### 4.2 Reatividade do Sistema

#### **Especificação**:
- Registro de trade → recalcula `monthlyProfit` E `totalBalance`
- Registro de depósito/saque → recalcula APENAS `totalBalance`

#### **Implementação Atual**:
- Apenas trades são suportados completamente
- Saques não existem
- Depósitos não afetam exibição do saldo

---

## 5. DIVERGÊNCIAS DE INTERFACE

### 5.1 Exibição do Saldo Total

#### **Especificação**: 
- `DashboardHeader` deve exibir o Saldo Total calculado

#### **Implementação Atual**:
- `DashboardHeader.tsx` não exibe saldo
- `Header.tsx` exibe apenas saldo inicial

### 5.2 Interação com DayCell

#### **Especificação**:
- Clique em `DayCell` deve redirecionar para registro de operações com data pré-selecionada

#### **Implementação Atual**:
- Funcionalidade implementada em `DashboardCalendar.tsx`
- Não há componente `DayCell` separado

---

## 6. PRIORIZAÇÃO DE CORREÇÕES

### 🔴 **CRÍTICO - Implementação Imediata**
1. **Implementar cálculo correto do Saldo Total** (inicial + depósitos - saques)
2. **Criar funcionalidade de saques** completa
3. **Criar componente BalanceManager** conforme especificação
4. **Ajustar estrutura Firebase** para `balanceTransactions`

### 🟡 **ALTO - Próxima Sprint**
1. **Criar componentes PeriodSummary e DayCell** separados
2. **Centralizar cálculos** em DashboardPage
3. **Corrigir nomenclatura** dos componentes
4. **Implementar fluxo de dados** conforme especificação

### 🟢 **MÉDIO - Backlog**
1. Ajustar campos da estrutura de trades
2. Melhorar separação visual entre Saldo Total e Lucro/Prejuízo
3. Otimizar reatividade do sistema

---

## 7. CONCLUSÃO

O projeto apresenta **divergências críticas** em relação à documentação técnica, especialmente nas regras de negócio fundamentais de gerenciamento de saldo. A implementação atual não suporta a funcionalidade completa de saques e não calcula corretamente o Saldo Total, violando os requisitos básicos do sistema.

**Recomendação**: Implementação imediata das correções críticas antes de qualquer nova funcionalidade, seguindo estritamente as especificações da documentação técnica.

---

*Relatório gerado em: " + new Date().toLocaleString('pt-BR') + "*
*Baseado na análise do código-fonte vs Documentação Técnica: Dashboard Principal (React)*