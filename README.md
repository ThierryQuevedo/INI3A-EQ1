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
## 💻 Executando o Projeto
Para iniciar o servidor de desenvolvimento, execute:
```
npm run dev
```
O projeto estará disponível em **http://localhost:3000**.
