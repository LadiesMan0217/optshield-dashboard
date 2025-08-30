Documentação Técnica: Configurações da Conta e Widget de Usuário
1. Objetivo
Implementar um sistema de gerenciamento de conta simplificado, focado nas funcionalidades essenciais de edição de perfil, e integrar um widget de usuário na página principal do Dashboard para criar um ponto de acesso rápido e uma saudação personalizada.

2. Parte 1: Widget de Usuário no Dashboard
Este novo componente será o ponto de entrada para o perfil e as configurações do usuário, localizado na página principal (Dashboard.tsx).

2.1 Localização e Layout
Posição: Canto superior direito da tela do Dashboard.

Componentes: Deve ser composto por um Avatar e um texto de saudação.

2.2 Funcionalidades do Widget
Avatar do Usuário:

Com Foto: Se o usuário fez login com uma conta Google que possui foto, exibir a foto de perfil (user.photoURL).

Sem Foto: Se não houver foto, exibir um círculo com as iniciais do nome do usuário (Ex: "Caio Rodrigues" → "CR").

O componente do Avatar deve ser um link que leva para a nova página de "Configurações".

Saudação Personalizada:

Ao lado do avatar, exibir uma mensagem simples, como: "Olá, 

NomedoUsu 
a
ˊ
 rio
".

3. Parte 2: Página de Configurações da Conta
Esta página será o local central para o usuário gerenciar seus dados de cadastro e preferências.

3.1 Arquitetura e Acesso
Criação: Criar uma nova página chamada SettingsPage.tsx.

Acesso: A página terá duas formas de acesso:

Através do clique no Avatar no Widget de Usuário (canto superior direito).

Através de um ícone de "Configurações" localizado no canto direito do menu de navegação inferior.

3.2 Funcionalidades da Página
A página deve ser um formulário simples e limpo, contendo as seguintes seções:

Perfil:

Editar Nome de Exibição:

Um campo de texto pré-preenchido com o nome atual do usuário.

Um botão "Salvar" que atualiza o displayName do usuário no Firebase.

ID de Usuário (para Suporte):

Exibir o ID de usuário do Firebase (user.uid) de forma visível.

Adicionar um botão ao lado do ID para "Copiar", facilitando o envio para o suporte.

Segurança da Conta:

Gerenciar E-mail:

Exibir o e-mail atual do usuário (pode ser mascarado por padrão).

Um botão "Alterar E-mail" que abre um modal, solicitando o novo e-mail e a senha atual para confirmação.

Gerenciar Senha:

Um botão "Alterar Senha" que abre um modal, solicitando a senha atual, a nova senha e a confirmação da nova senha.

Gestão de Risco (Futura Implementação):

Esta seção será implementada em uma versão futura.

Objetivo: Permitir que o usuário defina uma meta de ganho diária e um limite de perda diário. O sistema utilizará esses valores para fornecer avisos e insights no Dashboard.

Status Atual: Exibir um texto indicando "Em breve".

4. Estrutura de Dados (Firebase)
Toda a funcionalidade se baseará diretamente no objeto user do Firebase Authentication. Não há necessidade de criar novas coleções no Firestore para esta tarefa.

A foto do Google (photoURL) e o nome (displayName) já vêm prontos do provedor de autenticação.

5. Fluxo de Implementação
Criar a SettingsPage.tsx com os formulários e a lógica para interagir com o Firebase Auth (updateProfile, updateEmail, updatePassword).

Criar o UserWidget.tsx no Dashboard, com a lógica para exibir o avatar e a saudação.

Integrar o UserWidget.tsx na Dashboard.tsx.

Configurar a navegação (roteamento) para que o clique no Avatar e no ícone do menu leve para a SettingsPage.tsx.