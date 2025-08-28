    Documentação Técnica: Módulo de Depósitos e Saques
1. Componente Responsável: BalanceManager.jsx
Este componente é o único responsável por gerenciar as transações de depósito e saque do usuário. Ele pode ser implementado como um modal que é acionado a partir do Dashboard.

2. Interface e Campos do Formulário
O BalanceManager deve apresentar um formulário claro e simples contendo os seguintes campos:

Tipo de Transação (Obrigatório):

Implementado com botões de rádio ou um seletor.

Opções: Depósito, Saque.

Deve ter "Depósito" como valor padrão.

Valor (Obrigatório):

Um campo de entrada numérica (<input type="number">).

Deve aceitar apenas valores positivos.

Seletor de Moeda (Condicional e Obrigatório):

Um seletor (<select>) com as opções de moeda (ex: USD, BRL).

Regra de Visibilidade: Este campo só deve ser exibido e obrigatório se for o primeiro depósito que o usuário está registrando para o mês em questão.

Data (Obrigatório):

Um campo de entrada de data (<input type="date">).

Deve vir preenchido com a data atual por padrão.

Botão de Ação:

Um botão "Salvar Transação".

Fica habilitado apenas se todos os campos obrigatórios estiverem preenchidos.

3. Comportamento e Fluxo de Dados
Acionamento: O usuário abre o BalanceManager a partir de um botão no Dashboard.

Submissão: Ao salvar:

Um novo documento é criado em: users/{userId}/balanceTransactions/{transactionId}.

Campos do Documento: type ("deposit"/"withdrawal"), amount (number), date (timestamp), currency (string, salvo apenas na primeira transação do mês).

Regra de Negócio CRÍTICA:

Após salvar, o estado global deve ser atualizado, recalculando o Saldo Total da conta.

Esta ação NÃO DEVE afetar o Lucro/Prejuízo do Mês.

4. Gerenciamento de Transações (Edição e Exclusão)
Necessidade: O usuário deve ter a capacidade de corrigir erros. Uma interface para visualizar e gerenciar transações passadas é necessária (pode ser dentro do BalanceManager ou em uma tela separada).

Funcionalidades:

Excluir Transação: O usuário pode excluir um depósito ou saque. Ao fazer isso, o Saldo Total da conta deve ser recalculado imediatamente para refletir a remoção.

Editar Transação: O usuário pode editar o valor de uma transação. A lógica de recálculo do Saldo Total também se aplica aqui.

5. Regra de Negócio: Moeda Mensal e Saldo Inicial
Saldo Inicial da Conta: No momento do cadastro, o usuário pode definir um "Saldo Inicial". Este valor define o ponto de partida do Saldo Total e também define e trava a moeda para o primeiro mês de uso.

Definição da Moeda Mensal: Para os meses seguintes, a moeda é definida e travada no momento do primeiro depósito de cada mês.

Consistência Total: Uma vez que a moeda de um mês é definida, todos os valores financeiros referentes àquele mês (no calendário, resumos, relatórios) devem ser exibidos naquela moeda.

6. Tratamento de Erros e Feedback ao Usuário
Validação: O campo "Valor" não pode ser zero ou negativo. Todos os campos são obrigatórios.

Feedback de Sucesso: Após salvar uma transação, o modal deve fechar e o Saldo Total na tela principal deve ser atualizado instantaneamente.

Feedback de Erro: Se ocorrer uma falha ao salvar (ex: problema de conexão com o Firebase), o sistema não deve fechar o modal. Em vez disso, deve exibir uma mensagem de erro clara e concisa para o usuário (ex: "Falha ao salvar. Verifique sua conexão e tente novamente.").