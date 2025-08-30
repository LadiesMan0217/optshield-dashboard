Documentação Técnica: Página de Histórico de Operações
1. Objetivo
Este documento define os requisitos técnicos e as regras de negócio para a criação da página de "Histórico de Operações" da aplicação Trading Shield em React. O objetivo é construir uma interface rica em funcionalidades, visualmente atraente e responsiva, que permita ao usuário analisar seu desempenho passado com precisão.

2. Regras Gerais de Desenvolvimento
Diretriz Absoluta: O desenvolvimento desta página deve seguir estritamente as regras definidas no arquivo .trae/rules/project_rules.md.

Atualização da Documentação: Ao final da implementação, se qualquer detalhe funcional divergir ou precisar ser adicionado a este documento, ele deverá ser atualizado para refletir o estado final do produto.

3. Arquitetura de Componentes
A página deve ser modularizada para garantir a separação de responsabilidades:

HistoryPage.jsx (Componente Principal): Orquestra a página, gerenciando estados de filtros, ordenação, paginação e os dados buscados do Firebase.

ControlPanel.jsx (Painel de Controle): Agrupa todos os controles de interação do usuário (seleção de mês, busca, filtros, ordenação e ações).

HistoryTable.jsx (Tabela de Histórico): Exibe os dados das operações de forma tabular e agrupada.

Pagination.jsx (Paginação): Controla a navegação entre as páginas de resultados da tabela.

4. Funcionalidades e Regras de Negócio
4.1 Painel de Controle (ControlPanel.jsx)
Navegação de Mês: Botões para navegar entre os meses e um título exibindo o mês/ano corrente.

Filtros Combinados: Os filtros devem operar em conjunto:

Busca livre (por data, valor, anotações).

Período Personalizado (intervalo de datas).

Filtrar por Resultado ("Win"/"Loss").

Filtro por Tipo de Operação: Um seletor para filtrar as operações por estratégia (ex: "Mão fixa", "Soros").

Ordenação: Controles para ordenar os dados por colunas relevantes.

Ações:

Limpar Filtros: Um botão para resetar todas as seleções.

Exportar para CSV: Um botão para exportar a visualização atual da tabela (com todos os filtros aplicados) para um arquivo no formato CSV.

4.2 Tabela de Histórico (HistoryTable.jsx)
Agrupamento por Dia (Requisito Crítico): A tabela deve agrupar todas as operações de um mesmo dia em uma única linha principal (resumo diário).

Linha Principal (Resumo do Dia):

Colunas Obrigatórias: Data, Placar (ex: 1W / 1L), Assertividade (%), Resultado Financeiro do Dia, Saldo Acumulado e Anotações (com ícone indicativo).

Interação de Clique: Clicar nesta linha deve expandir/recolher uma seção de detalhes abaixo dela.

Linha de Detalhe (Trades Individuais):

Esta seção, visível ao expandir a linha principal, deve listar cada trade individual do dia.

Requisito: Além das informações detalhadas (hora, resultado, valor), esta visualização deve exibir o Tipo de Operação (ex: "Mão fixa", "Soros").

Cálculo de Saldo Acumulado: A coluna deve mostrar a evolução do patrimônio, começando pelo Saldo Total do usuário e somando o resultado de cada dia.

4.3 Regra da Moeda
Consistência: A exibição de todos os valores monetários na página deve respeitar a moeda definida para o mês em questão, conforme a regra de negócio do primeiro depósito.

4.4 Paginação
A paginação deve ser aplicada sobre os dias agrupados, exibindo um número definido de dias por página (ex: 15 dias).

5. Design e Experiência do Usuário (UX/UI)
Qualidade Visual: O design deve ser caprichado e profissional, agregando alto valor percebido à página. Utilize transições suaves, espaçamento adequado e uma hierarquia visual clara.

Responsividade (Requisito Crítico): A página deve ser perfeitamente funcional e esteticamente agradável em todas as resoluções (desktop, tablet e mobile). A tabela de dados, em particular, deve ter uma solução elegante para telas pequenas (ex: scroll horizontal controlado ou cards em vez de linhas).

6. Fluxo de Dados
Carregamento: A HistoryPage busca todos os trades do usuário no Firebase.

Processamento: A HistoryPage aplica os filtros e a ordenação selecionados.

Renderização: A lista processada é passada para a HistoryTable, que agrupa os dados por dia e os exibe de forma paginada.

7. Requisitos Adicionais
Estado de Carregamento: Um indicador de carregamento (loading spinner) deve ser exibido enquanto os dados são buscados.

Estado Vazio: Uma mensagem clara deve ser mostrada se nenhum resultado for encontrado para os filtros aplicados.