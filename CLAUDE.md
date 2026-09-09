# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Regras obrigatórias

Estas duas regras valem para toda sessão neste repositório e têm prioridade sobre qualquer conveniência.

**1. Não faça commit.** Não rode `git commit`, `git push`, `git merge`, `git rebase`, `git reset --hard` nem qualquer outro comando que altere o histórico ou o estado do repositório remoto. Deixe as alterações apenas no working tree — quem decide o que entra no histórico é a equipe. Comandos de leitura (`git status`, `git diff`, `git log`, `git show`) são permitidos. Só faça uma exceção se o usuário pedir explicitamente na conversa, e apenas para aquele pedido.

**2. Não fale com o servidor `projetoscti.com.br`.** Nenhuma requisição a `eq.projetoscti.com.br`, `galeria.projetoscti.com.br` ou qualquer subdomínio — sem `curl`, `WebFetch`, SSH ou disparo manual dos workflows do GitHub Actions. Isso inclui o webhook de `galeria-sync.yml` e o ambiente de produção em `/26-marcaai`. Para testar qualquer coisa, use o servidor local (`npm run dev` em `http://localhost:3000/26-marcaai`).

As duas regras se reforçam: como o `deploy.yml` publica em produção a cada push em `main` (ver a seção **Deploy**), um commit enviado é também uma conversa com aquele servidor — inclusive um `drizzle-kit push` no banco de produção.

## Onde rodar os comandos

A aplicação Next.js vive em `src/`, **não** na raiz do repositório. Todo comando npm / drizzle-kit precisa ser executado dentro de `src/`. Os scripts da raiz (`run.bat`, `run.sh`, `instalarDependencias.bat`, `instalarDependencias.sh`) são apenas atalhos com `--prefix src`.

```bash
cd src
npm install
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção
npm run start      # sobe o build
npm run lint       # ESLint (eslint-config-next core-web-vitals)
npm run db:push    # aplica db/schema.ts no banco (drizzle-kit push)
npm run db:seed    # insere as categorias padrão
npm run db:fresh   # drizzle-kit migrate + seed
```

Não há framework de testes configurado no projeto — não existe comando de teste.

As variáveis de ambiente ficam em `src/.env` (fora do versionamento). As lidas pelo código são: `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URL`, `SITE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.

Os scripts de seed rodam com `node --experimental-strip-types --env-file=.env`; por isso `db/seed.js` importa `./index.ts` com a extensão `.ts` explícita.

## basePath

`src/next.config.mjs` define `basePath: '/26-marcaai'` e `trailingSlash: true`. Em desenvolvimento a aplicação responde em **http://localhost:3000/26-marcaai** — `http://localhost:3000/` retorna 404.

Caminhos internos (`redirect('/login')`, `<Link href="/servicos">`) continuam sem o prefixo; o Next adiciona o basePath sozinho. Hosts de imagem remota são liberados em `remotePatterns` no mesmo arquivo (`utfs.io`, `yexqwi4vi7.ufs.sh`, `picsum.photos`) — um novo host de upload precisa ser adicionado ali. `reactCompiler: true` está ativo.

## Autenticação e sessão

Sessão própria em banco, não NextAuth.

- `src/lib/session.js` — `criarSessao(usuarioId)` gera um id aleatório de 32 bytes, insere em `sessoes` e grava o cookie httpOnly `marcaai_session` com validade de 24h (`SESSION_DURATION_MS`).
- `src/app/actions/auth.actions.ts` — fonte única de verdade da sessão:
  - `getSession()` faz o join `sessoes` → `usuarios`, apaga a sessão expirada e devolve o usuário ou `null`;
  - `requireSession()` redireciona para `/login`;
  - `requireAdmin()` redireciona para `/dashboard` quando `usuario.admin` é falso;
  - além de `cadastrar`, `login`, `logout` e as actions `atualizar*` de perfil.

**Não existe middleware.** Cada página protegida e cada action que altera dados precisa chamar `requireSession()` / `requireAdmin()` / `getSession()` por conta própria. `src/app/(app)/layout.js` só renderiza Header e Footer — criar uma página dentro de `(app)` **não** a torna protegida.

Login com Google: `src/app/api/auth/google/route.js` gera o cookie de state e redireciona; `src/app/api/auth/google/callback/route.js` conclui o fluxo e chama `criarSessao`. O cliente OAuth vem de `src/lib/google-oauth.js`.

Senhas usam `bcryptjs` com custo 10.

## Camada de dados

- `src/db/index.ts` exporta a instância única `db` (postgres-js + Drizzle com o schema anexado). Lança erro na importação se `DATABASE_URL` não estiver definida.
- `src/db/schema.ts` é a única definição do schema. **Não há pasta de migrações versionada** — `drizzle-kit push` sincroniza direto contra o banco. `drizzle.config.js` aponta a saída para `./drizzle`.
- Tabelas: `usuarios`, `sessoes`, `prestadores`, `categorias`, `servicos`, `disponibilidades`, `agendamentos`, `avaliacoes`.
- Convenção de nomes: coluna snake_case no Postgres ↔ campo camelCase no Drizzle (`url_imagem` → `urlImagem`).

Pontos que costumam confundir:

- `usuarios.tipo` guarda `'cliente'` ou `'prestador'`; `usuarios.admin` é um booleano separado — os dois são independentes.
- `prestadores` é 1:1 com `usuarios` e sua **chave primária é `usuario_id`**. Logo, `servicos.prestadorId` é o id do *usuário*, não um id próprio de prestador; o código compara os dois diretamente (ver `src/app/actions/servicos.actions.ts`).
- `agendamentos.status` é texto livre; os valores em uso são `'pendente'` e `'concluido'` (`src/app/actions/agendamentos.actions.ts`). Concluir um agendamento é o que habilita o fluxo de avaliação.
- `db/seed.js` só insere as quatro categorias padrão e faz `insert` puro — rodar de novo duplica as linhas.

## Estrutura e convenções da aplicação

- Grupos de rota: `src/app/(public)/` (home, login, cadastro, sobre, termos, suporte) e `src/app/(app)/` (dashboard, agendamentos, servicos, disponibilidades, configuracoes, admin). Os dois layouts são idênticos (Header + Footer); a separação é organizacional.
- Mutações ficam em `src/app/actions/*.actions.ts` com `'use server'` no topo do arquivo: `auth`, `servicos`, `agendamentos`, `disponibilidades`, `avaliacoes`. CRUD administrativo pequeno usa closures `'use server'` declaradas dentro da própria página (`src/app/(app)/admin/categorias/page.jsx`). Siga o padrão do arquivo vizinho.
- Actions de formulário seguem a assinatura `(estadoAnterior, formData)` do `useActionState` e **retornam** `{ erro }` ou `{ erro: null, sucesso: true }` em vez de lançar exceção.
- Depois de escrever no banco, chame `revalidatePath(...)` da rota afetada.
- Componentes: `app/components/ui/` (primitivos), `app/components/layout/` (Header, Footer, MenuSlide, MenuPerfilDropdown, ThemeToggle, AvatarUpload) e `app/components/features/<domínio>/`.
- JS e TS convivem de propósito: server actions e `db/` são `.ts`; páginas e componentes são `.jsx`. `tsconfig.json` tem `strict: false` e `allowJs`. Não converta arquivos em massa.
- Alias `@/*` → `src/*`. `cn()` de `src/lib/utils.js` para juntar classes. Config shadcn em `src/components.json` (`tsx: false`, componentes em `@/app/components`).
- Uploads de avatar e banner passam por UploadThing: o router está em `src/app/api/uploadthing/core.js`, cujo middleware valida a sessão e grava `urlImagem` / `urlBanner` no usuário ao concluir.

## Estilo e design tokens

- Tailwind CSS 4 configurado inteiramente em `src/app/globals.css` via `@theme` — **não existe `tailwind.config.js`** (apesar de `components.json` citar um).
- Use os tokens semânticos (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `bg-primary`, `text-muted-foreground`, `bg-accent`, `bg-destructive`). O próprio arquivo instrui a não usar os valores de marca `tcc-*` diretamente no markup, para que claro e escuro continuem corretos.
- Escala tipográfica própria: `text-caption`, `text-body-sm`, `text-body`, `text-body-lg`, `text-h6` … `text-h1` (14px é o piso de acessibilidade declarado). Fontes expostas como `font-sans` (Inter) e `font-display` (Urbanist), carregadas em `src/app/layout.js`.
- Tema escuro é por classe (`@custom-variant dark`), controlado pelo `next-themes` com `attribute="class"` (`src/app/components/theme-provider.jsx`). Toda cor nova precisa ser definida **nos dois blocos**: `@theme` e `.dark`.
- Recursos de acessibilidade já presentes no CSS: `.skip-link`, anel de `:focus-visible`, `.sr-only-status` e o bloco `prefers-reduced-motion`. Mantenha-os funcionando.
- `docs/design-tokens.css` é uma cópia separada e desatualizada; `src/app/globals.css` é o arquivo autoritativo.

## Idioma

Nomes de domínio, colunas, rotas, textos de interface e comentários estão em português (`servicos`, `agendamentos`, `disponibilidades`, `prestador`, `criadoEm`). Código novo segue a mesma convenção; só APIs de framework e biblioteca ficam em inglês.

## Deploy

`.github/workflows/deploy.yml`: todo push em `main` conecta por SSH ao servidor do CTI, faz `git reset --hard origin/main` e, dentro de `src/`, roda `npm install`, `npm run build`, `npx drizzle-kit push` e reinicia o processo pm2 `marcaai` na porta 49681, atrás de um proxy Apache em `/26-marcaai`.

Ou seja: **uma alteração em `db/schema.ts` que chegue à `main` é aplicada automaticamente no banco de produção.** Trate edições de schema como migração de produção.

`.github/workflows/galeria-sync.yml` dispara um webhook para a Galeria CTI quando `hub/**` muda. `hub/dados.json` é metadado do projeto para essa galeria, não código da aplicação.

Os dois workflows existem para ser executados pelo GitHub, não a partir daqui: conforme as **Regras obrigatórias**, não os acione manualmente nem faça requisições ao `projetoscti.com.br`.