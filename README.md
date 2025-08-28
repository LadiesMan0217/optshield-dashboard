# OptShield - Sistema de Controle de Trading

Um sistema completo para controle e análise de operações de trading, desenvolvido com React, TypeScript e Firebase.

## 🚀 Funcionalidades

- **Autenticação**: Sistema completo de login/registro com Firebase Auth
- **Dashboard**: Visão geral com métricas e calendário de trades
- **Registro de Trades**: Formulário completo para registrar operações
- **Controle de Depósitos**: Gerenciamento de depósitos e saques
- **Journal de Trading**: Anotações diárias para análise
- **Tema Dark**: Interface moderna com tema escuro
- **Responsivo**: Otimizado para desktop e mobile

## 🛠️ Tecnologias

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (estilização)
- Firebase (backend e autenticação)
- Zustand (gerenciamento de estado)
- React Router (roteamento)
- Lucide React (ícones)

## 📋 Pré-requisitos

- Node.js 16+ 
- npm ou yarn
- Conta no Firebase

## ⚙️ Configuração

### 1. Clone o projeto
```bash
git clone <url-do-repositorio>
cd optshield-react
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie uma conta
2. Crie um novo projeto
3. Vá em **Settings > API**
4. Copie a **URL** e a **anon key**
5. Renomeie `.env.example` para `.env`
6. Substitua os valores no arquivo `.env`:

```env
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-project-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 4. Configure o banco de dados

No console do Firebase, configure o Firestore Database e Authentication conforme necessário.

```sql
-- Habilitar RLS (Row Level Security)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Tabela de perfis
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Tabela de trades
CREATE TABLE trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  pair TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  quantity DECIMAL(20,8) NOT NULL,
  entry_price DECIMAL(20,8) NOT NULL,
  exit_price DECIMAL(20,8),
  result TEXT CHECK (result IN ('win', 'loss', 'breakeven')),
  pnl DECIMAL(20,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de depósitos
CREATE TABLE deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount DECIMAL(20,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notas do journal
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para trades
CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" ON trades
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades" ON trades
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para deposits
CREATE POLICY "Users can view own deposits" ON deposits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deposits" ON deposits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deposits" ON deposits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deposits" ON deposits
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para notes
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Habilitar RLS nas tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 5. Execute o projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 📱 Como usar

1. **Registro/Login**: Crie uma conta ou faça login
2. **Dashboard**: Visualize suas métricas e calendário
3. **Adicionar Trade**: Use o botão "+" para registrar operações
4. **Depósitos**: Gerencie seus depósitos e saques
5. **Journal**: Faça anotações diárias sobre suas operações

## 🔧 Scripts disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter

## 📝 Estrutura do projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Button, Input, etc.)
│   ├── layout/         # Layout e navegação
│   └── modals/         # Modais da aplicação
├── hooks/              # Hooks customizados
├── lib/                # Configurações e utilitários
├── pages/              # Páginas da aplicação
├── store/              # Gerenciamento de estado (Zustand)
└── types/              # Tipos TypeScript
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.