import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { servicos, usuarios } from '@/db/schema';
import { TIPOS_IMAGEM } from '@/lib/imagemPublica';

/*
 * Serve as imagens que estão gravadas no banco como data URL (ver
 * lib/imagemPublica.js). São as mesmas fotos já exibidas publicamente em
 * catálogo e perfis, então não há checagem de sessão.
 */

const COLUNA_POR_TIPO = {
  servico: { tabela: servicos, coluna: servicos.urlImagem, id: servicos.id },
  avatar: { tabela: usuarios, coluna: usuarios.urlImagem, id: usuarios.id },
  banner: { tabela: usuarios, coluna: usuarios.urlBanner, id: usuarios.id },
};

const MIMES_PERMITIDOS = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

export async function GET(_request, { params }) {
  const { tipo, id, versao } = await params;
  const idNumero = Number(id);

  if (!TIPOS_IMAGEM.includes(tipo) || !Number.isInteger(idNumero) || idNumero <= 0) {
    return new Response(null, { status: 404 });
  }

  const { tabela, coluna, id: colunaId } = COLUNA_POR_TIPO[tipo];
  const [linha] = await db.select({ valor: coluna }).from(tabela).where(eq(colunaId, idNumero)).limit(1);
  const valor = linha?.valor;

  const partes = typeof valor === 'string' ? /^data:([^;,]+);base64,(.+)$/s.exec(valor) : null;
  if (!partes || !MIMES_PERMITIDOS.has(partes[1].toLowerCase())) {
    return new Response(null, { status: 404 });
  }

  const bytes = Buffer.from(partes[2], 'base64');
  // Versão confere com o conteúdo atual → cache permanente. Versão antiga
  // (imagem trocada depois que a página foi gerada) → entrega a atual, mas
  // sem fixar no cache.
  const versaoAtual = createHash('md5').update(valor).digest('hex').slice(0, 12);
  const cache =
    versao === versaoAtual ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate';

  return new Response(bytes, {
    headers: {
      'Content-Type': partes[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : partes[1].toLowerCase(),
      'Content-Length': String(bytes.length),
      'Cache-Control': cache,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
