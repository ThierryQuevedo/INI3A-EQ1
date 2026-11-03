// Confere o contraste WCAG 2.2 dos tokens de cor de src/app/globals.css,
// nos temas claro (@theme) e escuro (.dark). Lê o CSS de verdade — não há
// cópia dos valores aqui — então roda de novo a cada mudança de token.
//
// Uso (dentro de src/): npm run tokens:contraste
// Sai com código 1 se algum par obrigatório falhar.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../app/globals.css'), 'utf8');

// ---------- leitura dos blocos ----------
function bloco(seletor) {
  const ini = css.indexOf(seletor);
  if (ini < 0) throw new Error(`bloco ${seletor} não encontrado`);
  let i = css.indexOf('{', ini) + 1, prof = 1;
  const comeco = i;
  while (prof > 0) { if (css[i] === '{') prof++; else if (css[i] === '}') prof--; i++; }
  return css.slice(comeco, i - 1).replace(/\/\*[\s\S]*?\*\//g, '');
}
function vars(texto) {
  const m = {};
  for (const [, nome, valor] of texto.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) m[nome] = valor.trim();
  return m;
}
const claro = vars(bloco('@theme {'));
const escuro = { ...claro, ...vars(bloco('\n.dark {')) };

// ---------- cor ----------
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function oklchParaLinear(L, C, H) {
  const a = C * Math.cos((H * Math.PI) / 180), b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => Math.min(1, Math.max(0, c)));
}
// Devolve RGB linear (0–1) de um valor de token, resolvendo var() em cadeia.
function resolver(valor, tema, profundidade = 0) {
  if (profundidade > 10) throw new Error(`var() circular: ${valor}`);
  const v = valor.match(/^var\((--[\w-]+)\)$/);
  if (v) {
    if (!(v[1] in tema)) throw new Error(`token indefinido: ${v[1]}`);
    return resolver(tema[v[1]], tema, profundidade + 1);
  }
  const hex = valor.match(/^#([0-9a-f]{6})$/i);
  if (hex) return [0, 2, 4].map((i) => toLin(parseInt(hex[1].slice(i, i + 2), 16) / 255));
  const ok = valor.match(/^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)$/);
  if (ok) return oklchParaLinear(+ok[1] / 100, +ok[2], +ok[3]);
  throw new Error(`formato de cor não suportado: ${valor}`);
}
const luminancia = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
function razao(a, b, tema) {
  const [la, lb] = [luminancia(resolver(`var(--color-${a})`, tema)), luminancia(resolver(`var(--color-${b})`, tema))];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// ---------- pares obrigatórios ----------
// [frente, fundo, mínimo]. 4.5 = texto (1.4.3); 3 = borda de controle,
// anel de foco e gráfico que carrega informação (1.4.11).
const TEXTO = 4.5, NAO_TEXTO = 3;
const pares = [
  ['foreground', 'background', TEXTO], ['foreground', 'card', TEXTO],
  ['card-foreground', 'card', TEXTO], ['popover-foreground', 'popover', TEXTO],
  ['muted-foreground', 'background', TEXTO], ['muted-foreground', 'card', TEXTO], ['muted-foreground', 'muted', TEXTO],
  ['primary', 'background', TEXTO], ['primary', 'card', TEXTO],
  ['primary-foreground', 'primary', TEXTO], ['primary-foreground', 'primary-hover', TEXTO],
  ['secondary-foreground', 'secondary', TEXTO],
  ['cta-foreground', 'cta', TEXTO], ['cta-foreground', 'cta-hover', TEXTO],
  ['info-foreground', 'info', TEXTO],
  ['destructive-foreground', 'destructive', TEXTO], ['destructive', 'card', TEXTO],
  ['success-foreground', 'success', TEXTO], ['warning-foreground', 'warning', TEXTO],
  ['contador-foreground', 'contador', TEXTO],
  ['slot-selecionado-foreground', 'slot-selecionado', TEXTO],
  ['input', 'card', NAO_TEXTO], ['input', 'background', NAO_TEXTO],
  ['ring', 'background', NAO_TEXTO], ['ring', 'card', NAO_TEXTO],
  ['rating', 'card', NAO_TEXTO],
];

let falhas = 0;
for (const [nomeTema, tema] of [['claro', claro], ['escuro', escuro]]) {
  console.log(`\n${nomeTema}`);
  for (const [frente, fundo, minimo] of pares) {
    const r = razao(frente, fundo, tema);
    const ok = r >= minimo;
    if (!ok) falhas++;
    console.log(`  ${ok ? 'ok   ' : 'FALHA'} ${r.toFixed(2).padStart(5)}:1 (mín. ${minimo})  ${frente} sobre ${fundo}`);
  }
}
console.log(`\n${falhas === 0 ? 'Todos os pares passam.' : `${falhas} par(es) abaixo do mínimo.`}`);
console.log('Lembrete: laranja (cta) como gráfico isolado sobre branco dá ~2,2:1 — nunca use o laranja como único indicador de estado.');
process.exit(falhas === 0 ? 0 : 1);
