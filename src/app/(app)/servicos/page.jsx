export const dynamic = 'force-dynamic';

import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { servicos, usuarios, categorias, prestadores } from '@/db/schema';
import ServicosClient from './ServicosClient';
import { comEstatisticas } from '@/lib/avaliacoes';
import { calcularProximosHorariosLivres } from '@/app/actions/disponibilidades.actions';
import { listarIdsFavoritos } from '@/app/actions/favoritos.actions';

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
      prestadorLatitude: prestadores.latitude,
      prestadorLongitude: prestadores.longitude,
    })
    .from(servicos)
    .leftJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .leftJoin(categorias, eq(servicos.categoriaId, categorias.id))
    .leftJoin(prestadores, eq(prestadores.usuarioId, servicos.prestadorId));

  const listaCategorias = await db
    .select({ id: categorias.id, nome: categorias.nome })
    .from(categorias);

  const comEstat = await comEstatisticas(dadosBrutos);
  const proximosHorarios = await calcularProximosHorariosLivres(comEstat.map((s) => s.id));
  const { servicos: idsFavoritados } = await listarIdsFavoritos();
  const favoritosSet = new Set(idsFavoritados);
  const listaServicos = comEstat.map((s) => ({
    ...s,
    proximoHorario: proximosHorarios[s.id] ?? null,
    favoritoInicial: favoritosSet.has(s.id),
  }));

  return <ServicosClient servicos={listaServicos} categorias={listaCategorias} />;
}
