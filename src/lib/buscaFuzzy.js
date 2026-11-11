// busca aproximada sem dependencia externa

const MARCAS_ACENTO = /[̀-ͯ]/g;

function normalizarChar(c) {
  return c.normalize('NFD').replace(MARCAS_ACENTO, '').toLowerCase();
}

// sem acento e minusculo
export function normalizar(texto) {
  return String(texto ?? '').normalize('NFD').replace(MARCAS_ACENTO, '').toLowerCase();
}

// mapeia indice normalizado para o original
function normalizarComMapa(texto) {
  const original = String(texto ?? '');
  let normal = '';
  const mapa = [];
  for (let i = 0; i < original.length; i++) {
    const n = normalizarChar(original[i]);
    for (let k = 0; k < n.length; k++) {
      normal += n[k];
      mapa.push(i);
    }
  }
  return { normal, mapa };
}

function levenshtein(a, b, limite) {
  if (Math.abs(a.length - b.length) > limite) return limite + 1;
  let anterior = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const atual = [i];
    let menorDaLinha = i;
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      atual[j] = Math.min(anterior[j] + 1, atual[j - 1] + 1, anterior[j - 1] + custo);
      if (atual[j] < menorDaLinha) menorDaLinha = atual[j];
    }
    if (menorDaLinha > limite) return limite + 1;
    anterior = atual;
  }
  return anterior[b.length];
}

// erros aceitos por tamanho de palavra
function errosPermitidos(tamanho) {
  if (tamanho <= 3) return 0;
  if (tamanho <= 6) return 1;
  return 2;
}

function palavrasComPosicao(normal) {
  const lista = [];
  const re = /[a-z0-9]+/g;
  let m;
  while ((m = re.exec(normal))) lista.push({ texto: m[0], inicio: m.index });
  return lista;
}

function intervalo(inicio, fim) {
  const r = [];
  for (let i = inicio; i < fim; i++) r.push(i);
  return r;
}

// compara termo normalizado com um texto
export function compararFuzzy(termoNormal, texto) {
  const termo = termoNormal.trim();
  if (!termo || !texto) return null;
  const { normal, mapa } = normalizarComMapa(texto);
  const paraOriginal = (indices) => [...new Set(indices.map((i) => mapa[i]))];

  // 1 trecho exato
  const pos = normal.indexOf(termo);
  if (pos !== -1) {
    const inicioDePalavra = pos === 0 || !/[a-z0-9]/.test(normal[pos - 1]);
    const nota = (inicioDePalavra ? 1 : 0.85) - Math.min(pos, 30) * 0.003;
    return { nota, indices: paraOriginal(intervalo(pos, pos + termo.length)) };
  }

  // 2 palavra a palavra
  const tokens = termo.split(/\s+/).filter(Boolean);
  const palavras = palavrasComPosicao(normal);
  let soma = 0;
  const indices = [];
  let todos = true;
  for (const token of tokens) {
    let melhor = null;
    for (const p of palavras) {
      let nota = 0;
      let fim = 0;
      if (p.texto.startsWith(token)) {
        nota = 0.8;
        fim = token.length;
      } else {
        const limite = errosPermitidos(token.length);
        if (limite === 0) continue;
        // compara com a palavra e com o prefixo
        const prefixo = p.texto.slice(0, token.length);
        const dPrefixo = levenshtein(token, prefixo, limite);
        const dInteira = levenshtein(token, p.texto, limite);
        const d = Math.min(dPrefixo, dInteira);
        if (d > limite) continue;
        nota = 0.7 - d * 0.12;
        fim = dInteira <= dPrefixo ? p.texto.length : prefixo.length;
      }
      if (!melhor || nota > melhor.nota) melhor = { nota, inicio: p.inicio, fim };
    }
    if (!melhor) {
      todos = false;
      break;
    }
    soma += melhor.nota;
    indices.push(...intervalo(melhor.inicio, melhor.inicio + melhor.fim));
  }
  if (todos && tokens.length) {
    return { nota: soma / tokens.length, indices: paraOriginal(indices) };
  }

  // 3 subsequencia para termos curtos
  const compacto = termo.replace(/\s+/g, '');
  if (compacto.length < 2 || compacto.length > 12) return null;
  const achados = [];
  let j = 0;
  for (let i = 0; i < normal.length && j < compacto.length; i++) {
    if (normal[i] === compacto[j]) {
      achados.push(i);
      j++;
    }
  }
  if (j < compacto.length) return null;
  const espalhamento = achados[achados.length - 1] - achados[0] + 1;
  const densidade = compacto.length / espalhamento;
  if (densidade < 0.4) return null;
  return { nota: 0.25 + densidade * 0.3, indices: paraOriginal(achados) };
}

// busca em lista com peso por campo
export function buscarFuzzy(lista, termo, campos, { limite = 5, notaMinima = 0.3 } = {}) {
  const termoNormal = normalizar(termo).trim();
  if (!termoNormal) return [];
  const resultados = [];
  for (const item of lista) {
    let melhor = 0;
    const realces = {};
    for (const { chave, peso = 1 } of campos) {
      const r = compararFuzzy(termoNormal, item[chave]);
      if (!r) continue;
      realces[chave] = r.indices;
      const nota = r.nota * peso;
      if (nota > melhor) melhor = nota;
    }
    if (melhor >= notaMinima) resultados.push({ item, nota: melhor, realces });
  }
  resultados.sort((a, b) => b.nota - a.nota);
  return resultados.slice(0, limite);
}
