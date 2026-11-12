import { CAMINHO_BASE } from './caminhoBase.js';


// Regras para qualquer endereço de imagem que vá para o banco (foto de perfil,
// banner, foto de serviço). Server actions são endpoints públicos: sem esta
// checagem dava para gravar qualquer texto (link externo de rastreamento,
// `javascript:`, data URL de HTML, arquivo de vários MB...).

export const LIMITE_IMAGEM_BYTES = 5 * 1024 * 1024; // 5 MB, o mesmo de /api/upload

const MIMES_PERMITIDOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Mesmos hosts liberados em `images.remotePatterns` (next.config.js).
const HOSTS_PERMITIDOS = [
  'picsum.photos',
  'images.unsplash.com',
  'utfs.io',
  'yexqwi4vi7.ufs.sh',
  'lh3.googleusercontent.com',
];

const RE_DATA_URL = /^data:([a-z/]+);base64,([A-Za-z0-9+/=\s]+)$/i;

/** Data URL de imagem PNG/JPG/WEBP de até 5 MB? */
export function dataUrlDeImagemValida(valor) {
  if (typeof valor !== 'string') return false;
  const partes = RE_DATA_URL.exec(valor);
  if (!partes || !MIMES_PERMITIDOS.includes(partes[1].toLowerCase())) return false;
  // Cada 4 caracteres de base64 viram 3 bytes.
  const bytes = Math.floor((partes[2].replace(/\s/g, '').length * 3) / 4);
  return bytes <= LIMITE_IMAGEM_BYTES;
}

/** Endereço curto de /api/imagem: a foto já está no banco e não mudou. */
export function ehEnderecoInternoDeImagem(valor) {
  return typeof valor === 'string' && valor.startsWith(`${CAMINHO_BASE}/api/imagem/`);
}

/**
 * Valida o valor que vai para a coluna de imagem.
 * Devolve `{ valido: true, valor }` (valor pode ser `null` = remover a foto),
 * `{ valido: true, semMudanca: true }` ou `{ valido: false }`.
 */
export function validarUrlImagem(entrada) {
  const valor = typeof entrada === 'string' ? entrada.trim() : '';
  if (!valor) return { valido: true, valor: null };

  if (ehEnderecoInternoDeImagem(valor)) return { valido: true, semMudanca: true };

  if (valor.startsWith('data:')) {
    return dataUrlDeImagemValida(valor) ? { valido: true, valor } : { valido: false };
  }

  try {
    const url = new URL(valor);
    if (url.protocol === 'https:' && HOSTS_PERMITIDOS.includes(url.hostname)) {
      return { valido: true, valor };
    }
  } catch {
    // não é URL
  }
  return { valido: false };
}

export const ERRO_IMAGEM_INVALIDA = 'Imagem inválida. Envie um arquivo PNG, JPG ou WEBP de até 5 MB.';
