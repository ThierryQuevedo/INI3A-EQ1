export const dynamic = 'force-dynamic';

import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { servicos, usuarios, categorias } from '@/db/schema';
import ServicosClient from './ServicosClient';
import { comEstatisticas } from '@/lib/avaliacoes';
import { calcularProximosHorariosLivres } from '@/app/actions/disponibilidades.actions';

export default async function ServicosPage() {
  const dadosBrutos = await db
    .select({
      id: servicos.id,
      slug: servicos.slug,
      nomeServico: servicos.nome,
      preco: servicos.preco,
      urlImagem: servicos.urlImagem,
      duracaoEstimada: servicos.duracaoEstimada,
      prestadorId: servicos.prestadorId,
      prestadorSlug: usuarios.slug,
      nomeProfissional: usuarios.nome,
      categoriaId: servicos.categoriaId,
      nomeCategoria: categorias.nome,
    })
    .from(servicos)
    .leftJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .leftJoin(categorias, eq(servicos.categoriaId, categorias.id));

  const listaCategorias = await db
    .select({ id: categorias.id, nome: categorias.nome })
    .from(categorias);

  const comEstat = await comEstatisticas(dadosBrutos);
  const proximosHorarios = await calcularProximosHorariosLivres(comEstat.map((s) => s.id));
  const listaServicos = comEstat.map((s) => ({ ...s, proximoHorario: proximosHorarios[s.id] ?? null }));

  return <ServicosClient servicos={listaServicos} categorias={listaCategorias} />;
}
