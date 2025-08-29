# Guia de Regras do Projeto OptiShield

## 1. Padrões de Tecnologia e Dependências

### Stack Principal
- **React**: 18.3.1 com TypeScript
- **Vite**: 5.4.2 (bundler e dev server)
- **Firebase**: 10.13.2 (autenticação, Firestore, hosting)
- **Zustand**: 4.5.5 (gerenciamento de estado global)
- **React Router**: 6.26.2 (roteamento)
- **Tailwind CSS**: 3.4.10 (estilização)
- **Lucide React**: 0.441.0 (ícones)
- **Date-fns**: 3.6.0 (manipulação de datas)
- **Playwright**: 1.47.2 (testes automatizados)

### Regras de Dependências
- **SEMPRE** usar `date-fns` para manipulação de datas (nunca Date nativo)
- **SEMPRE** usar `lucide-react` para ícones (consistência visual)
- **NUNCA** adicionar bibliotecas de UI externas (usar componentes customizados)
- **SEMPRE** usar TypeScript strict mode
- Manter versões das dependências atualizadas e compatíveis

## 2. Arquitetura e Estrutura de Código

### Estrutura de Pastas
```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Button, Input, LoadingSpinner)
│   ├── layout/         # Layout e navegação (Navigation)
│   ├── dashboard/      # Componentes específicos do dashboard
│   ├── trading/        # Componentes de trading (DepositForm, DepositHistory)
│   └── modals/         # Modais da aplicação
├── contexts/           # Contextos React (ThemeContext)
├── hooks/              # Hooks customizados (useAuth)
├── lib/                # Configurações e utilitários (firebase.ts, firebase.db.ts)
├── pages/              # Páginas da aplicação (Dashboard, Login, SignUp)
├── stores/             # Gerenciamento de estado Zustand
├── test/               # Componentes de teste
├── types/              # Tipos TypeScript
└── utils/              # Funções utilitárias
```

### Padrões de Nomenclatura
- **Componentes**: PascalCase (ex: `DashboardCalendar.tsx`, `TradeRegistration.tsx`)
- **Hooks**: camelCase com prefixo "use" (ex: `useAuth.tsx`, `useTradeStore.ts`)
- **Stores**: camelCase com sufixo "Store" (ex: `useTradeStore.ts`)
- **Tipos**: PascalCase (ex: `Trade`, `BalanceTransaction`)
- **Funções utilitárias**: camelCase (ex: `formatCurrency`, `calculateDayStats`)
- **Arquivos de configuração**: kebab-case (ex: `vite.config.ts`, `playwright.config.ts`)

### Gerenciamento de Estado
- **Estado Global**: Zustand com stores separadas por domínio:
  - `useTradeStore`: Gerencia operações de trading
  - `useBalanceTransactionStore`: Gerencia transações de saldo
  - `useDepositStore`: Gerencia depósitos e saques
  - `useNoteStore`: Gerencia anotações do journal
- **Estado Local**: useState para componentes específicos
- **Autenticação**: Context API com hook `useAuth`

## 3. Regras de Interação com o Firebase

### Estrutura do Firestore
```
users/{userId}/
├── trades/{tradeId}
│   ├── date: string (YYYY-MM-DD)
│   ├── result: 'win' | 'loss'
│   ├── profitLoss: number
│   ├── payout: number
│   ├── entry_value: number
│   ├── tradeType: 'fixed_hand' | 'soros'
│   ├── level?: number (para Soros)
│   └── createdAt: string
├── balanceTransactions/{transactionId}
│   ├── type: 'deposit' | 'withdrawal'
│   ├── amount: number
│   ├── date: string (YYYY-MM-DD)
│   ├── currency: string
│   └── createdAt: string
├── deposits/{depositId}
│   ├── amount: number
│   ├── date: string (YYYY-MM-DD)
│   ├── currency: string
│   └── type: 'deposit' | 'withdrawal'
└── notes/{noteId}
    ├── date: string (YYYY-MM-DD)
    ├── content: string
    └── createdAt: string
```

### Regras de Consulta
- **SEMPRE** encapsular consultas Firebase em `src/lib/firebase.db.ts`
- **NUNCA** usar `getDoc` ou `getDocs` diretamente nos componentes
- **SEMPRE** usar as funções wrapper: `getTrades()`, `addTrade()`, `getBalanceTransactions()`, etc.
- **SEMPRE** tratar erros nas operações Firebase
- **SEMPRE** usar transações para operações que afetam múltiplas coleções

### Autenticação
- Usar Firebase Auth com email/senha
- **SEMPRE** verificar `user.emailVerified` antes de permitir acesso
- Implementar logout automático em caso de erro de autenticação
- **NUNCA** armazenar dados sensíveis no localStorage

## 4. Regras de Negócio Fundamentais

### Cálculo de Saldo
- **Saldo Total** = (Depósitos - Saques) + Lucro/Prejuízo Acumulado das Operações
- O saldo é **SEMPRE** cumulativo e persiste entre meses
- **NUNCA** zerar o saldo total no início de um novo mês

### Lucro/Prejuízo Mensal
- Calculado **APENAS** com trades do mês corrente
- **SEMPRE** zera no início de cada novo mês
- Fórmula: Soma de `profitLoss` de todos os trades do mês

### Moeda e Localização
- A moeda do mês é definida no **primeiro depósito** do mês
- **SEMPRE** respeitar a moeda definida em toda a UI do mês
- Usar formatação brasileira (R$) como padrão
- **SEMPRE** usar `formatCurrency()` para exibir valores monetários

### Validações de Data
- **SEMPRE** usar formato ISO (YYYY-MM-DD) para armazenamento
- **SEMPRE** usar `date-fns` para manipulação e formatação
- Considerar fuso horário brasileiro (UTC-3) nas operações
- **NUNCA** usar Date.now() diretamente, usar `format(new Date(), 'yyyy-MM-dd')`

### Tipos de Operação
- **Fixed Hand**: Operação simples com payout fixo
- **Soros**: Operação com níveis (1-5), cada nível dobra o valor
- **SEMPRE** validar `level` para operações Soros (obrigatório)
- **SEMPRE** calcular `profitLoss` baseado no resultado e tipo

## 5. Padrões de Testes

### Framework de Testes
- **Playwright**: Testes end-to-end e de integração
- Configuração: `playwright.config.ts`
- Diretório: `tests/`
- Base URL: `http://localhost:3001`

### Estrutura de Testes
- **Testes de UI**: Validar componentes visuais e interações
- **Testes de Navegação**: Verificar roteamento e fluxos
- **Testes de Responsividade**: Validar diferentes tamanhos de tela
- **Testes de Performance**: Verificar tempo de carregamento

### Regras de Criação de Testes
- **SEMPRE** criar testes para novas funcionalidades críticas
- **SEMPRE** usar dados de teste (não produção)
- Credenciais de teste: `teste@teste.com` / `123456`
- **SEMPRE** limpar estado entre testes
- **NUNCA** depender de dados externos em testes

### Padrões de Teste
```typescript
// Estrutura padrão de teste
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/');
  });

  test('should validate specific behavior', async ({ page }) => {
    // Implementação do teste
  });
});
```

## 6. Padrões de Código e Qualidade

### ESLint e Formatação
- Configuração: `.eslintrc.json`
- **SEMPRE** corrigir erros de linter antes de commit
- **NUNCA** usar `eslint-disable` sem justificativa
- Permitir warnings, focar apenas em erros críticos

### TypeScript
- **SEMPRE** usar tipos explícitos
- **NUNCA** usar `any` (usar `unknown` se necessário)
- **SEMPRE** definir interfaces para props de componentes
- **SEMPRE** usar tipos do Firebase (`src/lib/firebase.types.ts`)

### Componentes React
- **SEMPRE** usar componentes funcionais com hooks
- **SEMPRE** definir props interface
- **SEMPRE** usar `React.FC` para componentes
- **SEMPRE** implementar loading states
- **SEMPRE** tratar estados de erro

### Estilização
- **SEMPRE** usar Tailwind CSS
- **NUNCA** usar CSS inline ou styled-components
- Tema: Liquid Glass com fundo preto absoluto
- **SEMPRE** usar classes de responsividade (`sm:`, `md:`, `lg:`)
- **NUNCA** usar cores azuis (usar branco/cinza/verde)

## 7. Segurança e Boas Práticas

### Variáveis de Ambiente
- **SEMPRE** usar `.env` para configurações sensíveis
- **NUNCA** commitar arquivos `.env`
- **SEMPRE** manter `.env.example` atualizado
- **SEMPRE** usar `VITE_` prefix para variáveis do Vite

### Firestore Security Rules
- **SEMPRE** validar autenticação: `request.auth != null`
- **SEMPRE** validar propriedade do documento: `request.auth.uid == userId`
- **NUNCA** permitir acesso público a dados do usuário
- **SEMPRE** validar tipos de dados nas rules

### Tratamento de Erros
- **SEMPRE** implementar try/catch em operações assíncronas
- **SEMPRE** exibir mensagens de erro amigáveis ao usuário
- **SEMPRE** logar erros para debugging (console.error)
- **NUNCA** expor detalhes técnicos ao usuário final

## 8. Processo de Manutenção

### Revisão Contínua
- **ANTES** de iniciar qualquer tarefa, revisar este arquivo
- **SEMPRE** verificar se mudanças afetam regras existentes
- **SEMPRE** atualizar este documento quando necessário

### Atualização Obrigatória
- **SEMPRE** que uma nova funcionalidade for adicionada
- **SEMPRE** que uma regra de negócio for alterada
- **SEMPRE** que a arquitetura for modificada
- **SEMPRE** que novos padrões forem estabelecidos

### Versionamento
- Este documento deve ser versionado junto com o código
- **SEMPRE** documentar mudanças significativas
- **SEMPRE** manter histórico de alterações importantes
- **SEMPRE** documentar decisões arquiteturais
- **SEMPRE** documentar padrões de código
- **SEMPRE** documentar padrões de segurança
- **SEMPRE** documentar padrões de performance
- **SEMPRE** documentar padrões de usabilidade
- **SEMPRE** documentar padrões de acessibilidade
- **SEMPRE** documentar com data e hora da última atualização

---

**Última atualização**: Janeiro 2025
**Versão do projeto**: OptiShield v1.0
**Responsável**: Arquiteto de Software IA