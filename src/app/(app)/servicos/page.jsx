export const dynamic = 'force-dynamic';

import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { servicos, usuarios, categorias } from '@/db/schema';
import ServicosClient from './ServicosClient';

export default async function ServicosPage() {
  const dadosBrutos = await db
    .select({
      id: servicos.id,
      slug: servicos.slug,
      nomeServico: servicos.nome,
      preco: servicos.preco,
      duracao: servicos.duracaoEstimada,
      nomeProfissional: usuarios.nome,
      nomeCategoria: categorias.nome,
    })
    .from(servicos)
    .leftJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .leftJoin(categorias, eq(servicos.categoriaId, categorias.id));

  return <ServicosClient servicos={dadosBrutos} />;
}
