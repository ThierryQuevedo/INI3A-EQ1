# Design System — MarcaAI

Este documento descreve o design system da aplicação: paleta, tipografia, espaçamento, raios, sombras, movimento, tema escuro, acessibilidade e os componentes de UI disponíveis.

> **Fonte autoritativa:** `src/app/globals.css`, definido via `@theme` do Tailwind CSS 4. **Não existe `tailwind.config.js`**, apesar do que `src/components.json` sugere. Qualquer divergência entre este documento e `globals.css` — vale o CSS.

## Regra de ouro: tokens semânticos, nunca cores de marca cruas

As cores de marca (`tcc-azul-*`, `tcc-laranja-*`, `tcc-neutro-*`) existem só para alimentar os tokens semânticos abaixo. **Nunca** use `bg-tcc-azul-500` direto no markup — use `bg-primary`. Isso é o que garante que o tema claro e o escuro continuem corretos automaticamente, já que cada token semântico é redefinido dentro do bloco `.dark`.

| Token semântico | Uso |
|---|---|
| `bg-background` / `text-foreground` | Fundo e texto padrão da página |
| `bg-card` / `text-card-foreground` | Superfície de cards |
| `bg-surface` / `text-surface-foreground` | Alias de superfície (mesmo valor de `card`) |
| `bg-popover` / `text-popover-foreground` | Dropdowns, popovers |
| `bg-primary` / `text-primary-foreground` | Ação principal e navegação (azul) |
| `bg-primary-hover` | Hover de `primary` |
| `bg-secondary` / `text-secondary-foreground` | Ação secundária |
| `bg-cta` / `text-cta-foreground` / `bg-cta-hover` | **Laranja: só o ato de marcar horário** (máx. 1 por tela). No Button, `variant="marcar"` |
| `bg-accent` / `text-accent-*` | Primitivo do laranja que alimenta `cta` — não usar em markup |
| `bg-contador` / `text-contador-foreground` | Contadores (não lidas) — azul, nunca laranja |
| `bg-slot*` / `bg-indicador-hoje` | Horários e calendário: estados por preenchimento azul, sem laranja |
| `bg-info` / `text-info-foreground` | Badges e tags informativas ("Hoje", categoria) — separado de `accent` de propósito |
| `bg-muted` / `text-muted-foreground` | Fundos neutros e texto secundário |
| `bg-destructive` / `text-destructive-foreground` | Ações destrutivas, erros |
| `border-border` | Divisória **decorativa** (sem mínimo de contraste) |
| `border-input` | **Contorno de controle** (campo, botão outline, horário, chip tocável) — ≥ 3:1 (WCAG 1.4.11). Não usar como fundo |
| `ring-ring` | Anel de foco (azul-500 no claro, ≥ 3:1) |
| `text-success` / `text-warning` / `text-danger` | Estados pontuais; `success-foreground` e `warning-foreground` existem nos dois temas |

## Paleta de marca (escala 50→950)

Usada **apenas** para derivar os tokens semânticos no `@theme` — não usar direto em componentes.

Escalas em **OKLCH**, recalculadas a partir das âncoras da marca, que continuam exatas: azul-400 `#5696FC`, azul-500 `#1471D5`, azul-600 `#0E5CB3`, laranja-400 `#FD953A`.

- **Azul** (`tcc-azul` 50→950). `azul-600` é o `primary` no claro, `azul-400` no escuro.
- **Laranja** (`tcc-laranja` 50→950). Base do `cta`. Como gráfico isolado sobre branco dá só ~2,2:1 — **nunca é o único indicador de estado**.
- **Neutro frio único** (`tcc-neutro` 50→950, matiz do azul). Fundo, texto, bordas e superfícies do escuro saem daqui.
- **Estados**: `success` `#157034`, `warning` `#92400E`, `danger` `#B91C1C` (valores próprios no `.dark`).

## Tipografia

- **Fontes**: `font-sans` (Inter, corpo, `next/font/google`) e `font-display` (**Satoshi 700**, títulos, `next/font/local` com o woff2 oficial em `src/app/fonts/` — licença ITF FFL v2.0, sem subset nem conversão). `h1`–`h3` usam `font-display` automaticamente via `@layer base`, com tracking mais justo (`-0.02em`); `h4`–`h6` ficam em `font-sans` com `-0.01em`. Carregadas em `src/app/layout.js`.
- **Escala** (piso de acessibilidade: nada no produto deve renderizar abaixo de 14px):

| Classe | Tamanho | Line-height |
|---|---|---|
| `text-caption` | 14px | 1.45 |
| `text-body-sm` | 15px | 1.5 |
| `text-body` | 16px | 1.6 |
| `text-body-lg` | 18px | 1.6 |
| `text-h6` | 18→20px (fluido) | 1.35 |
| `text-h5` | 20→24px | 1.3 |
| `text-h4` | 22→30px | 1.25 |
| `text-h3` | 26→36px | 1.2 |
| `text-h2` | 30→48px | 1.12 |
| `text-h1` | 34→56px | 1.08 |

Os títulos usam `clamp()` entre 360px e 1280px de largura e já trazem peso e tracking no token. O corpo é fixo. Proibido `text-[Npx]` abaixo de 14px e as classes `text-xs`/`text-sm` do Tailwind — use a escala acima.

## Espaçamento

Múltiplos de 8px na escala padrão do Tailwind, mais tokens com nome: `h-toque`/`min-w-toque` (44px, alvo mínimo; para ícone ou switch de desenho menor, `area-toque` estende só a área clicável, e botões de texto compactos usam `pointer-coarse:h-11` para crescer apenas em telas de toque), `h-toque-confortavel` (48px, ações principais), `px-margem` (margem lateral fluida 16→32px), `py-secao` (entre seções 32→64px) e `max-w-leitura` (40rem). Disciplina:

- `2` — micro (ícone ↔ texto)
- `4` — padding interno de campo
- `6` — padding de card pequeno
- `8` — padding de card/componente padrão
- `12` — padding de card grande
- `16` / `24` — entre blocos dentro de uma seção
- `32` — entre seções de uma página

## Raios (`radius-*`)

Disciplina de uso — pílula em tudo lê como genérico, então cada raio tem um papel fixo:

- `rounded-sm` (6px) — checkbox, dia do calendário
- `rounded-md` (8px) — badge, chip
- `rounded-lg` (12px) = `rounded-controle` — botões de texto, inputs, itens de lista, horários
- `rounded-xl` (16px) = `rounded-superficie` — cards, diálogos, bottom sheet
- `rounded-2xl` (20px) — hero, banner
- `rounded-full` — só avatar, botão só-ícone, ponto de status e contador. Nunca em botão com texto.

## Sombras (`shadow-*`)

Suaves, tingidas com o neutro frio:

- `shadow-soft` — repouso (estado padrão de card)
- `shadow-card` — só em hover de elementos clicáveis
- `shadow-elevated` — reservada a camadas flutuantes de verdade (modal, bottom sheet, dropdown, toast)

Valores diferentes no tema escuro (sombras mais fortes contra o fundo escuro).

## Movimento

Um par easing/duração por intenção, nunca um valor genérico único:

| Easing | Uso |
|---|---|
| `ease-padrao` (= `ease-apple`, alias de compatibilidade) | mudança de estado |
| `ease-entrada` | algo aparece |
| `ease-saida` | algo sai (~75% da duração de entrada) |
| `ease-sheet` | bottom sheet |

| Duração | Classe | Uso |
|---|---|---|
| 150ms (padrão de toda `transition`) | `duracao-rapida` | hover, press, toggle |
| 220ms | `duracao-base` | dropdown, toast, troca de painel |
| 380ms | `duracao-lenta` | modal, bottom sheet |

O Tailwind 4 **não** gera classe a partir de `--duration-*` (`duration-fast` não existe): use as `@utility` acima ou `duration-(--duration-base)`. Para framer-motion, os mesmos valores em segundos estão em `src/lib/motion.js`.

`prefers-reduced-motion: reduce` já é respeitado globalmente em `@layer base` (zera duração/iteração de animações e transições) — manter esse bloco funcionando ao adicionar novas animações.

## Tema escuro

Ativado via classe `.dark` na `<html>`, controlado pelo `next-themes` (`attribute="class"`, ver `src/app/components/theme-provider.jsx`). **Toda cor nova precisa ser definida nos dois blocos**, `@theme` (claro) e `.dark` (escuro), em `globals.css` — nunca só em um dos dois.

## Acessibilidade

Recursos já implementados em `globals.css` — não remover nem quebrar ao editar o arquivo:

- `.skip-link` — pular para `<main>` via teclado/leitor de tela
- `:focus-visible` — anel de foco visível e consistente em todo o site
- `.sr-only-status` — texto só para leitor de tela, reforça estados indicados por cor (badges, disponibilidade, notas)
- Bloco `prefers-reduced-motion: reduce`
- Piso tipográfico de 14px (nenhum texto de interface deve ficar menor)
- Contraste verificado por script: **`npm run tokens:contraste`** (dentro de `src/`) lê o `globals.css` e confere 26 pares em cada tema (4.5:1 para texto, 3:1 para borda de controle, foco e gráfico). Rode sempre que trocar um token.

## Componentes de UI

`src/app/components/ui/` — primitivos reutilizáveis em qualquer domínio:

- **Button** (`button.jsx`) — via `cva`, variantes `default` (azul) / `marcar` (laranja, só o ato de marcar horário) / `destructive` / `outline` / `secondary` / `ghost` / `ghost-destructive` / `link`; tamanhos `default` / `sm` / `compacto` / `lg` / `icon`
- **Card** (`card.jsx`) — `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardFooter`; props `interactive`, `dashed`, `padding` (`default` / `sm` / `none`)
- **Input**, **InputCatalogo**, **FormField**, **Combobox**, **Switch** — formulário
- **Avatar**, **ServiceImageUpload**, **PlaceholderImage** — imagem/upload
- **BottomSheet**, **ConfirmDialog**, **Toast** / **ToastProvider** — overlays e feedback
- **EmptyState**, **Skeleton** / **AdminTableSkeleton** / **AuthPageSkeleton** / **InfoPageSkeleton**, **ProgressBar** — estados de carregamento e vazio
- **DurationTag**, **PriceTag**, **EstrelasNota** — exibição de dados de domínio (duração, preço, nota)
- **PageContainer**, **PageTransition**, **BotaoVoltar**, **BotaoExcluirConfirm**, **ThemeToggle** — navegação e utilitários de página

`src/app/components/layout/` — casco da aplicação: `Header`, `HeaderDesktopNav`, `Footer`, `AppShell`, `BottomNav`, `MenuPerfilDropdown`.

`src/app/components/features/<domínio>/` — componentes específicos de cada área (`agendamentos`, `auth`, `dashboard`, `disponibilidades`, `favoritos`, `home`, `mensagens`, `notificacoes`, `perfil`, `servicos`).

Config do shadcn/ui em `src/components.json` (`tsx: false`, alias `@/app/components`, base color `slate` — apenas referência de scaffolding; a paleta real é a de marca acima).

## Idioma

Nomes de domínio, textos de interface e comentários em português, seguindo a convenção do restante do projeto.
