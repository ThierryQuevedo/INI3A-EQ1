<p align="center">
  <img src="./src/public/images/Identidade%20visual%20marca%20ai/marcaai.png" alt="Logo Marca Aí" width="200">
</p>

<h1 align="center">Marca Aí</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React 19">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-0B1120?style=flat-square&logo=tailwindcss&logoColor=38BDF8" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Drizzle_ORM-0.45-1A1A1A?style=flat-square&logo=drizzle&logoColor=C5F74F" alt="Drizzle ORM">
</p>

---

## Sobre o projeto

O **Marca Aí** é uma plataforma de agendamento de serviços que conecta clientes a
prestadores locais. Prestadores publicam um catálogo de serviços e definem suas
disponibilidades; clientes navegam pelo catálogo, agendam atendimentos e avaliam o
serviço depois de concluído.

Principais recursos:

- Catálogo de serviços por categoria, com página de detalhe e filtros
- Cadastro de disponibilidades e agendamentos com calendário
- Avaliações mútuas entre cliente e prestador
- Autenticação por e-mail/senha ou login com Google
- Upload de foto de perfil e banner
- Painel administrativo de usuários e categorias
- Tema claro/escuro

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Actions, React Compiler) |
| Interface | React 19, Tailwind CSS 4, Radix UI, lucide-react |
| ORM | Drizzle ORM + Drizzle Kit |
| Banco de dados | PostgreSQL (driver `postgres`) |
| Autenticação | Sessão própria com cookies + `bcryptjs`; Google OAuth (`google-auth-library`) |
| E-mail | Nodemailer (SMTP) |
| Upload de arquivos | UploadThing |

---

## Pré-requisitos

Antes de começar, verifique se você possui instalado:

- **Node.js 20 LTS ou superior** e **npm** (exigência do Next.js 16 / React 19)
- Acesso a um banco **PostgreSQL** — pode ser uma instância local ou o banco
  compartilhado do grupo. A string de conexão (`DATABASE_URL`) é fornecida pela equipe.
- **Git**

---

## Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/ThierryQuevedo/INI3A-EQ1.git
cd INI3A-EQ1
```

### 2. Configurar as variáveis de ambiente

Crie o arquivo **`src/.env`** (dentro da pasta `src`, não na raiz).

Esse arquivo guarda a string de conexão do banco (`DATABASE_URL`) e as credenciais das
integrações usadas pelo projeto: upload de imagens, login com Google e envio de e-mails.

> [!IMPORTANT]
> Os valores reais são disponibilizados pelo grupo — peça o conteúdo do `.env` no canal
> da equipe e cole no arquivo `src/.env`.

> [!NOTE]
> O `src/.env` **não é versionado** (está no `.gitignore`). Nunca faça commit dele.

### 3. Instalar as dependências

Dentro da pasta `src`:

```bash
cd src
npm install
```

No Windows:

```bat
instalarDependencias.bat
```

No Linux/macOS

```bash
./instalarDependencias.sh
```

---

## Banco de dados (Drizzle ORM)

Você **não** precisa executar comandos SQL manualmente no pgAdmin. O Drizzle cuida da
estrutura direto pelo terminal. Rode os comandos abaixo **dentro da pasta `src`**.

### Criar / atualizar as tabelas

```bash
npx drizzle-kit push
```

### Popular o banco (seed)

Insere as categorias padrão iniciais:

```bash
npm run db:seed
```

> [!NOTE]
> Para recomeçar do zero (rodar as migrações e o seed em sequência), use
> `npm run db:fresh`.

### Entidades principais

`usuarios`, `sessoes`, `prestadores`, `categorias`, `servicos`, `disponibilidades`,
`agendamentos`, `avaliacoes` — definidas em `src/db/schema.ts`.

---

## Executando a aplicação

Na raiz do projeto (Windows):

```bat
run.bat
```

Ou, dentro da pasta `src`:

```bash
npm run dev
```

No Linux/macOS, a partir da raiz:

```bash
./run.sh
```

A aplicação fica disponível em:

**http://localhost:3000/26-marcaai**

> [!WARNING]
> A aplicação roda sob `basePath: /26-marcaai` (definido em `src/next.config.mjs`).
> Por isso `http://localhost:3000/` retorna **404** — acesse sempre com o sufixo
> `/26-marcaai`.

---

## Scripts npm

Executar dentro da pasta `src`.

| Script | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | Executa o ESLint |
| `npm run db:push` | Aplica o schema Drizzle no banco |
| `npm run db:seed` | Insere as categorias padrão |
| `npm run db:fresh` | Roda as migrações e o seed do zero |

---

## Estrutura do projeto

```text
INI3A-EQ1/
├── instalarDependencias.bat   # atalho: cd src && npm install
├── run.bat / run.sh           # atalho: inicia o servidor de desenvolvimento
├── docs/                      # casos de uso, MoSCoW, design tokens, sprints
└── src/                       # aplicação Next.js
    ├── app/
    │   ├── (app)/             # rotas autenticadas (dashboard, agendamentos, serviços, admin...)
    │   ├── (public)/          # rotas públicas (home, login, cadastro, sobre, termos...)
    │   ├── actions/           # Server Actions
    │   ├── api/               # rotas de API (auth Google, uploadthing)
    │   └── components/        # componentes de UI, layout e features
    ├── db/                    # schema.ts, seed.js e conexão
    ├── lib/                   # utilidades (sessão, e-mail, slug, imagens, Google OAuth)
    ├── public/images/         # identidade visual do Marca Aí
    ├── drizzle.config.js
    └── next.config.mjs
```

---

## Deploy / produção

A aplicação é servida atrás de um proxy Apache sob o caminho `/26-marcaai` — daí o
`basePath: '/26-marcaai'` e o `trailingSlash: true` em `src/next.config.mjs`.

- Ambiente de produção: **http://eq.projetoscti.com.br/26-marcaai**
- Build de produção (dentro de `src`):

```bash
npm run build
npm run start
```
