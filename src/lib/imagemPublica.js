import { sql } from 'drizzle-orm';
import { CAMINHO_BASE } from './caminhoBase.js';

// troca a data url por endereco curto com cache
export const TIPOS_IMAGEM = ['servico', 'avatar', 'banner'];

export function imagemPublica(coluna, tipo, colunaId) {
  if (!TIPOS_IMAGEM.includes(tipo)) throw new Error(`Tipo de imagem desconhecido: ${tipo}`);
  const prefixo = `${CAMINHO_BASE}/api/imagem/${tipo}/`;
  return sql`case
    when ${coluna} like 'data:%'
      then ${prefixo} || ${colunaId} || '/' || left(md5(${coluna}), 12) || '/'
    else ${coluna}
  end`.mapWith(String);
}
