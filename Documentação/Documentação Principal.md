Documentação Técnica: Dashboard Principal (React)
1. Objetivo do Documento
Este documento estabelece os requisitos técnicos e as regras de negócio para o desenvolvimento do Dashboard principal da aplicação OptiShield. O objetivo é garantir que a versão em React seja coesa, funcional e siga a lógica de negócio definida, servindo como um guia definitivo para a equipe de desenvolvimento.

2. Stack de Tecnologia
Framework: React (com Vite)

Estilização: Tailwind CSS

Banco de Dados: Firebase (Firestore)

Biblioteca de Datas: date-fns (Recomendado)

3. Arquitetura de Componentes
A arquitetura da página do Dashboard será baseada na seguinte componentização:

DashboardPage.jsx (Componente Principal):

Orquestra toda a página.

Gerencia os estados principais: data selecionada no calendário (selectedDay), dados dos trades e o saldo da conta.

Busca os dados do Firestore e os distribui para os componentes filhos.

Requisito: Deve renderizar o Calendar.jsx e o DailyHistoryPanel.jsx lado a lado, criando uma visualização de mestre-detalhe.

Calendar.jsx:

Renderiza a grade do calendário.

Instancia um DayCell.jsx para cada dia do período visível.

DayCell.jsx:

Representa um único dia no calendário. É o principal ponto de interação visual.

DailyHistoryPanel.jsx (NOVO):

Um painel que aparece ao lado do calendário.

Requisito: Sua visibilidade é controlada pelo estado selectedDay da DashboardPage. Ele exibe os detalhes do dia que foi clicado no calendário.

Outros Componentes: DashboardHeader.jsx, PeriodSummary.jsx, BalanceManager.jsx seguem as especificações anteriores.

4. Funcionalidades do Calendário e Interação
Esta seção detalha os requisitos de interação e exibição de resultados no calendário.

4.1 DayCell.jsx - A Célula do Dia
Estilo Visual (Cor de Fundo): A cor da célula deve refletir o resultado financeiro do dia.

Verde: Se o resultado total dos trades do dia for positivo (lucro).

Vermelho: Se o resultado total for negativo (prejuízo).

Neutro/Cinza: Para dias sem operações ou fins de semana.

Interação de Hover (Passar o Mouse):

Ao passar o mouse sobre uma célula com operações, um popup (tooltip) com um resumo rápido deve aparecer.

Conteúdo do Popup: Deve incluir, no mínimo, o placar (ex: 5W / 2L), a taxa de acerto e o resultado financeiro do dia.

Interação de Clique:

Ao clicar na célula, a DashboardPage deve atualizar seu estado selectedDay com a data da célula clicada.

Esta ação não muda de página. Em vez disso, ela aciona a exibição do componente DailyHistoryPanel.jsx ao lado do calendário.

4.2 DailyHistoryPanel.jsx - O Histórico do Dia
Visibilidade: Este painel só é exibido quando um dia é selecionado no calendário (quando selectedDay não é nulo).

Layout: Deve ser posicionado ao lado do calendário, permitindo que o usuário veja a visão geral (calendário) e os detalhes (painel) ao mesmo tempo.

Conteúdo:

Deve exibir uma lista detalhada de todas as operações do dia selecionado.

O formato deve seguir o modelo de planilha já existente no projeto, mostrando cada trade com seu resultado (WIN/LOSS), valor de entrada, payout e lucro/prejuízo.

Deve haver um botão ou link claro para "Registrar Nova Operação", que levará ao formulário de registro para aquela data.

5. Regras de Negócio: Gerenciamento de Saldo
(Esta seção permanece a mesma, pois é fundamental e não foi alterada)

Saldo Total: Representa o valor monetário real na conta do usuário. Este valor é cumulativo e deve ser transportado entre os meses.

Lucro/Prejuízo do Mês: É calculado exclusivamente a partir das operações de trade (profit) realizadas no mês corrente. Este valor deve ser zerado ao iniciar um novo mês.

Depósitos e Saques: Estas transações alteram apenas o Saldo Total. Elas não impactam o cálculo do Lucro/Prejuízo do Mês.

6. Fluxo de Dados e Comportamento Esperado
Carregamento: DashboardPage busca os dados (trades e balanceTransactions).

Renderização Inicial: O calendário é exibido. O DailyHistoryPanel está oculto.

Interação do Usuário:

Usuário clica em um DayCell.

DashboardPage atualiza o estado selectedDay.

O React re-renderiza a página, agora mostrando o DailyHistoryPanel preenchido com os dados do dia selecionado.

Reatividade: Qualquer novo trade ou transação de saldo deve atualizar todos os cálculos e a UI em tempo real.

7. Requisitos Adicionais
(Esta seção permanece a mesma)

Estilo: Tema escuro, cores de destaque azul/ciano, fonte "Inter", e estilização via Tailwind CSS.

Responsividade: O layout mestre-detalhe deve se adaptar para telas menores (ex: em mobile, o painel pode aparecer como um modal ou abaixo do calendário).

Estrutura Firebase:

Trades: users/{userId}/trades/{tradeId}

Transações de Saldo: users/{userId}/balanceTransactions/{transactionId}