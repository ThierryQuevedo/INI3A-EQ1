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
| `bg-primary` / `text-primary-foreground` | Ação principal (CTA) |
| `bg-primary-hover` | Hover de `primary` |
| `bg-secondary` / `text-secondary-foreground` | Ação secundária |
| `bg-accent` / `text-accent-foreground` | Destaque pontual (laranja) — reservado a CTAs/ações, não a rótulos passivos |
| `bg-accent-hover` | Hover de `accent` |
| `bg-info` / `text-info-foreground` | Badges e tags informativas ("Hoje", categoria) — separado de `accent` de propósito |
| `bg-muted` / `text-muted-foreground` | Fundos neutros e texto secundário |
| `bg-destructive` / `text-destructive-foreground` | Ações destrutivas, erros |
| `border-border` | Borda padrão |
| `bg-input` | Fundo/borda de campos de formulário |
| `ring-ring` | Anel de foco |
| `text-success` / `text-warning` / `text-danger` | Estados pontuais (sem par `-foreground` dedicado — combine com `*-foreground` apropriado do contexto) |

## Paleta de marca (escala 50→950)

Usada **apenas** para derivar os tokens semânticos no `@theme` — não usar direto em componentes.

- **Azul** (`tcc-azul`): `#EFF4FE` (50) → `#01112A` (950). Base da marca; `azul-500` é o `primary` no tema claro, `azul-400` no escuro.
- **Laranja** (`tcc-laranja`): `#FFF4EE` (50) → `#3A1D01` (900). Base do `accent`.
- **Neutro** (`tcc-neutro`): de cinza frio (`#FAF9F7`, 50) a quase-preto quente (`#100E0C`, 900). Base de `foreground`/`muted-foreground`.
- **Estados**: `success` `#16A34A`, `warning` `#B45309`, `danger` `#DC2626` (valores diferentes no `.dark`).

## Tipografia

- **Fontes**: `font-sans` (Inter, corpo) e `font-display` (Urbanist, títulos). `h1`–`h3` usam `font-display` automaticamente via `@layer base`, com tracking mais justo (`-0.02em`); `h4`–`h6` ficam em `font-sans` com `-0.01em`. Carregadas em `src/app/layout.js`.
- **Escala** (piso de acessibilidade: nada no produto deve renderizar abaixo de 14px):

| Classe | Tamanho | Line-height |
|---|---|---|
| `text-caption` | 14px | 1.4 |
| `text-body-sm` | 15px | 1.5 |
| `text-body` | 16px | 1.6 |
| `text-body-lg` | 18px | 1.6 |
| `text-h6` | 20px | 1.35 |
| `text-h5` | 24px | 1.3 |
| `text-h4` | 30px | 1.25 |
| `text-h3` | 36px | 1.2 |
| `text-h2` | 48px | 1.1 |
| `text-h1` | 60px | 1.05 |

## Espaçamento

Múltiplos de 8px, sem tokens dedicados — use a escala padrão do Tailwind seguindo esta disciplina:

- `2` — micro (ícone ↔ texto)
- `4` — padding interno de campo
- `6` — padding de card pequeno
- `8` — padding de card/componente padrão
- `12` — padding de card grande
- `16` / `24` — entre blocos dentro de uma seção
- `32` — entre seções de uma página

## Raios (`radius-*`)

Disciplina de uso — pílula em tudo lê como genérico, então cada raio tem um papel fixo:

- `rounded-full` — só em elementos circulares/ação rápida (chip de categoria, avatar, botão só-ícone)
- `rounded-xl` (1.5rem) — botões de texto e inputs
- `rounded-2xl` (2rem) — superfícies/cards
- `rounded-sm` / `rounded-md` / `rounded-lg` — usos pontuais menores (0.5rem / 0.75rem / 1rem)

## Sombras (`shadow-*`)

Suaves, baixa opacidade, blur generoso (elevação estilo Apple):

- `shadow-soft` — repouso (estado padrão de card)
- `shadow-card` — só em hover de elementos clicáveis
- `shadow-elevated` — reservada a camadas flutuantes de verdade (modal, bottom sheet, dropdown, toast)

Valores diferentes no tema escuro (sombras mais fortes contra o fundo escuro).

## Movimento

Um par easing/duração por intenção, nunca um valor genérico único:

| Easing | Uso |
|---|---|
| `ease-apple` | transições de estado |
| `ease-out-apple` | entradas |
| `ease-in-apple` | saídas |

| Duração | Uso |
|---|---|
| `duration-fast` (150ms) | hover, press, toggle |
| `duration-base` (220ms) | dropdown, toast, transição de página |
| `duration-slow` (320ms) | modal, bottom sheet |

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
- Contraste verificado manualmente nos comentários do CSS (ex.: `accent-foreground` escuro sobre laranja, `muted-foreground` ~7:1 contra fundo claro) — ao trocar um token, reconferir contraste WCAG AA (4.5:1 para texto normal)

## Componentes de UI

`src/app/components/ui/` — primitivos reutilizáveis em qualquer domínio:

- **Button** (`button.jsx`) — via `cva`, variantes `default` / `destructive` / `outline` / `secondary` / `accent` / `ghost` / `link`; tamanhos `default` / `sm` / `lg` / `icon`
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
