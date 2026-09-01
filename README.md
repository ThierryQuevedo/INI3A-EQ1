# Marca Aí

Sistema de agendamentos online integrado com banco de dados PostgreSQL utilizando Drizzle ORM.

## 📋 Pré-requisitos

Antes de começar, verifique se você possui instalado em sua máquina:
* **Node.js** (Versão LTS recomendada)
* **PostgreSQL** ativo e rodando localmente

---

## 🛠️ Passo a Passo para Instalação

### 1. Clonar o Repositório
Abra o terminal e clone o projeto:
```bash
git clone https://github.com/ThierryQuevedo/INI3A-EQ1.git
cd INI3A-EQ1
```

### 2. Configurar as Variáveis de Ambiente
Crie um arquivo chamado `.env` no arquivo src e coloque os dados que o grupo disponibilizará

```
> ⚠️ **Nota:** Certifique-se de alterar o usuário, a senha, a porta e o nome do banco de dados na URL acima caso suas configurações locais do Postgres sejam diferentes.

### 3. Instalar as Dependências
Execute o comando abaixo para baixar as dependências do projeto:
```bash
npm install
```

---

## 🗄️ Banco de Dados & Sincronização (Drizzle ORM)

Você **não** precisa executar comandos SQL manualmente no PgAdmin4. O Drizzle resolve tudo diretamente pelo terminal.

### Criar as Tabelas
Gere e execute as migrações para estruturar as tabelas do banco de dados automaticamente:
```bash
npx drizzle-kit push
```

### Popular o Banco (Seed)
Insira as categorias padrões iniciais executando o script de seed:
```bash
npm run db:seed
```

---

## 💻 Executando a Aplicação

Para iniciar o servidor de desenvolvimento, utilize o comando:
```bash
run.bat
```

A aplicação estará disponível no seu navegador em: **http://localhost:3000**

Para acessar o site: **http://eq.projetoscti.com.br/26-marcaai**
