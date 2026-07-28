# Marca Aí 
## 📋 Pré-requisitos
Antes de começar, verifique se você possui:

Node.js

PostgreSQL rodando localmente

## 🛠️ Passo a Passo para Instalação

### 1. Clonar e Navegar
```
git clone https://github.com/ThierryQuevedo/INI3A-EQ1.git
cd src/marcaai/
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo chamado .env na raiz da pasta **./src/marcaai/**
adicione a seguinte string de conexão:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
```
Nota: Certifique-se de que o usuário, senha e porta coincidem com a sua instalação local do Postgres.
OBS Windows: 
```Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser```
powershell 
### 3. Instalar Dependências
```
npm install
```
## 🗄️ Banco de Dados (Drizzle ORM)Com o banco de dados postgres criado e o .env configurado, prepare as tabelas.
```
npx drizzle-kit migrate
```
drizzle-kit push // rode isso para atualizar sua tabela se necessario
```
npm run db:seed // rode isso no terminal para popular a tabela (em marcaai frontend) 
```
## 💻 Executando o Projeto
Para iniciar o servidor de desenvolvimento, execute:
```
npm run dev
```
O projeto estará disponível em **http://localhost:3000**.

## COMANDO PRA DAR NO PGADMIN4 PARA CRIAR OS BANCOS DE DADOS NO POSTGRES
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT UNIQUE,
  senha TEXT NOT NULL,
  tipo TEXT NOT NULL,
  admin BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);
 
CREATE TABLE sessoes (
  id TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  expira_em TIMESTAMP WITH TIME ZONE NOT NULL
);
 
CREATE TABLE prestadores (
  usuario_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  biografia TEXT
);
 
CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE
);
 
CREATE TABLE servicos (
  id SERIAL PRIMARY KEY,
  prestador_id INTEGER NOT NULL REFERENCES prestadores(usuario_id) ON DELETE CASCADE,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL,
  duracao_estimada INTEGER NOT NULL
);
 
CREATE TABLE disponibilidades (
  id SERIAL PRIMARY KEY,
  prestador_id INTEGER NOT NULL REFERENCES prestadores(usuario_id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fim TEXT NOT NULL
);
 
CREATE TABLE agendamentos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES usuarios(id),
  servico_id INTEGER NOT NULL REFERENCES servicos(id),
  data_hora TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente'
);
 
CREATE TABLE avaliacoes (
  id SERIAL PRIMARY KEY,
  agendamento_id INTEGER NOT NULL UNIQUE REFERENCES agendamentos(id) ON DELETE CASCADE,
  nota_para_prestador INTEGER,
  comentario_prestador TEXT,
  nota_para_cliente INTEGER,
  comentario_cliente TEXT
);



para o vitor: o claude falou pra fazer isso, mas acabou os tokens
Confirmado — coluna "servico_id" não existe. O migrate gerou o arquivo SQL mas não aplicou de fato no banco que sua aplicação usa (ou aplicou em outro banco).

Preciso ver dois arquivos pra achar a causa exata:

drizzle.config.js (mostra qual banco o migrate usa)
db/index.js (mostra qual banco a aplicação usa)

Se os dois apontarem pra DATABASE_URLs diferentes (ex: um lê de .env e outro tem a string hardcoded, ou tem .env e .env.local divergentes), é exatamente isso.

Enquanto isso, um jeito rápido de resolver sem depender do CLI: roda esse SQL direto no banco (via psql, DBeaver, pgAdmin, ou até um client web se você usa Neon/Supabase):

sql
ALTER TABLE disponibilidades
  ADD COLUMN servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE;

Se a tabela tiver linhas antigas sem esse valor, primeiro rode:

sql
DELETE FROM disponibilidades;

e depois o ALTER TABLE acima.

Isso resolve na hora. Mas ainda vale eu ver os dois arquivos de config pra garantir que o próximo drizzle-kit migrate funcione (senão você vai ter esse mesmo problema toda vez que mudar o schema).