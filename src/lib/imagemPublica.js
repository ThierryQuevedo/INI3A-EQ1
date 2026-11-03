import { sql } from 'drizzle-orm';
import { CAMINHO_BASE } from './caminhoBase.js';

/*
 * As imagens enviadas por /api/upload ficam gravadas no banco como data URL
 * (base64). Selecionar essa coluna direto faz cada página embutir os bytes da
 * foto no HTML — e de novo no payload do React —, sem cache e sem
 * redimensionamento. O catálogo chegava a 1,2 MB de HTML só disso.
 *
 * `imagemPublica` troca, na própria consulta, a data URL por um endereço curto
 * servido por app/api/imagem/[tipo]/[id]/[versao]/route.js. A versão é um
 * pedaço do md5 do conteúdo: imagem nova → endereço novo, então a resposta
 * pode ter cache "immutable". URLs externas (UploadThing, Google, picsum)
 * passam intactas, e o base64 nem sai do Postgres.
 *
 * Uso: `urlImagem: imagemPublica(servicos.urlImagem, 'servico', servicos.id)`
 */
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
