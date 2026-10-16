'use server';

import { revalidatePath } from 'next/cache';
import { eq, and, isNotNull, inArray, avg, count } from 'drizzle-orm';
import { db } from '@/db';
import { favoritos, servicos, usuarios, categorias, prestadores, avaliacoes, agendamentos } from '@/db/schema';
import { getSession } from './auth.actions';
import { comEstatisticas } from '@/lib/avaliacoes';

/** ids favoritados do usuário logado — usado para marcar o coração preenchido nos cards. */
export async function listarIdsFavoritos() {
  const usuario = await getSession();
  if (!usuario) return { servicos: [], prestadores: [] };

  const linhas = await db
    .select({ servicoId: favoritos.servicoId, prestadorId: favoritos.prestadorId })
    .from(favoritos)
    .where(eq(favoritos.usuarioId, usuario.id));

  return {
    servicos: linhas.filter((l) => l.servicoId != null).map((l) => l.servicoId),
    prestadores: linhas.filter((l) => l.prestadorId != null).map((l) => l.prestadorId),
  };
}

async function alternarFavorito(coluna: 'servicoId' | 'prestadorId', alvoId: number) {
  const usuario = await getSession();
  if (!usuario) return { erro: 'nao_autenticado' };

  const id = Number(alvoId);
  if (!Number.isInteger(id) || id <= 0) return { erro: 'invalido' };

  const condicaoAlvo = coluna === 'servicoId' ? eq(favoritos.servicoId, id) : eq(favoritos.prestadorId, id);

  const [existente] = await db
    .select({ id: favoritos.id })
    .from(favoritos)
    .where(and(eq(favoritos.usuarioId, usuario.id), condicaoAlvo))
    .limit(1);

  if (existente) {
    await db.delete(favoritos).where(eq(favoritos.id, existente.id));
    revalidatePath('/favoritos');
    revalidatePath('/servicos');
    return { erro: null, favoritado: false };
  }

  await db.insert(favoritos).values({
    usuarioId: usuario.id,
    [coluna]: id,
  });

  revalidatePath('/favoritos');
  revalidatePath('/servicos');
  return { erro: null, favoritado: true };
}

export async function alternarFavoritoServico(servicoId: number) {
  return alternarFavorito('servicoId', servicoId);
}

export async function alternarFavoritoPrestador(prestadorId: number) {
  return alternarFavorito('prestadorId', prestadorId);
}

async function estatisticasPorPrestador(prestadorIds: number[]) {
  if (prestadorIds.length === 0) return new Map();

  const linhas = await db
    .select({
      prestadorId: servicos.prestadorId,
      media: avg(avaliacoes.notaParaPrestador),
      total: count(avaliacoes.id),
    })
    .from(avaliacoes)
    .innerJoin(agendamentos, eq(avaliacoes.agendamentoId, agendamentos.id))
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .where(and(isNotNull(avaliacoes.notaParaPrestador), inArray(servicos.prestadorId, prestadorIds)))
    .groupBy(servicos.prestadorId);

  return new Map(linhas.map((l) => [l.prestadorId, { media: Number(l.media) || 0, total: Number(l.total) || 0 }]));
}

/** Serviços e prestadores favoritados pelo usuário logado, com os dados prontos pra exibir. */
export async function listarFavoritos() {
  const usuario = await getSession();
  if (!usuario) return { servicos: [], prestadores: [] };

  const favoritosServico = await db
    .select({
      id: servicos.id,
      slug: servicos.slug,
      nomeServico: servicos.nome,
      preco: servicos.preco,
      urlImagem: servicos.urlImagem,
      duracaoEstimada: servicos.duracaoEstimada,
      categoriaId: servicos.categoriaId,
      nomeCategoria: categorias.nome,
      nomeProfissional: usuarios.nome,
    })
    .from(favoritos)
    .innerJoin(servicos, eq(favoritos.servicoId, servicos.id))
    .leftJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .leftJoin(categorias, eq(servicos.categoriaId, categorias.id))
    .where(and(eq(favoritos.usuarioId, usuario.id), isNotNull(favoritos.servicoId)));

  const servicosComEstat = await comEstatisticas(favoritosServico);
  const servicosFavoritados = servicosComEstat.map((s) => ({ ...s, favoritoInicial: true }));

  const favoritosPrestador = await db
    .select({
      id: usuarios.id,
      slug: usuarios.slug,
      nome: usuarios.nome,
      urlImagem: usuarios.urlImagem,
      biografia: prestadores.biografia,
      enderecoTexto: prestadores.enderecoTexto,
    })
    .from(favoritos)
    .innerJoin(usuarios, eq(favoritos.prestadorId, usuarios.id))
    .leftJoin(prestadores, eq(prestadores.usuarioId, usuarios.id))
    .where(and(eq(favoritos.usuarioId, usuario.id), isNotNull(favoritos.prestadorId)));

  const estatPrestadores = await estatisticasPorPrestador(favoritosPrestador.map((p) => p.id));
  const prestadoresFavoritados = favoritosPrestador.map((p) => {
    const estat = estatPrestadores.get(p.id);
    return { ...p, avaliacaoMedia: estat?.media ?? 0, totalAvaliacoes: estat?.total ?? 0 };
  });

  return { servicos: servicosFavoritados, prestadores: prestadoresFavoritados };
}
