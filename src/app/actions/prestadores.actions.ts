'use server';

import { eq, or, and, avg, count, countDistinct, desc, isNotNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import {
  usuarios,
  prestadores,
  servicos,
  categorias,
  agendamentos,
  avaliacoes,
} from '@/db/schema';
import { comEstatisticas } from '@/lib/avaliacoes';
import { getSession } from '@/app/actions/auth.actions';

export async function buscarPerfilPrestador(identificador: string | number) {
  if (!identificador) return null;

  const isNumero = !isNaN(Number(identificador)) && Number(identificador) > 0;
  const condicao = isNumero
    ? or(eq(usuarios.id, Number(identificador)), eq(usuarios.slug, String(identificador)))
    : eq(usuarios.slug, String(identificador));

  const [dadosUsuario] = await db
    .select({
      id: usuarios.id,
      slug: usuarios.slug,
      nome: usuarios.nome,
      email: usuarios.email,
      telefone: usuarios.telefone,
      urlImagem: usuarios.urlImagem,
      urlBanner: usuarios.urlBanner,
      criadoEm: usuarios.criadoEm,
      biografia: prestadores.biografia,
      raioAtendimentoKm: prestadores.raioAtendimentoKm,
      latitude: prestadores.latitude,
      longitude: prestadores.longitude,
      enderecoTexto: prestadores.enderecoTexto,
    })
    .from(usuarios)
    .innerJoin(prestadores, eq(prestadores.usuarioId, usuarios.id))
    .where(condicao)
    .limit(1);

  if (!dadosUsuario) return null;

  const prestadorId = dadosUsuario.id;


  const servicosDoPrestador = await db
    .select({
      id: servicos.id,
      nome: servicos.nome,
      slug: servicos.slug,
      preco: servicos.preco,
      urlImagem: servicos.urlImagem,
      duracaoEstimada: servicos.duracaoEstimada,
      categoriaNome: categorias.nome,
    })
    .from(servicos)
    .leftJoin(categorias, eq(servicos.categoriaId, categorias.id))
    .where(eq(servicos.prestadorId, prestadorId));

  const [estatAvaliacoes] = await db
    .select({
      media: avg(avaliacoes.notaParaPrestador),
      total: count(avaliacoes.id),
    })
    .from(avaliacoes)
    .innerJoin(agendamentos, eq(avaliacoes.agendamentoId, agendamentos.id))
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .where(
      and(
        eq(servicos.prestadorId, prestadorId),
        isNotNull(avaliacoes.notaParaPrestador)
      )
    );


  const [estatClientes] = await db
    .select({
      totalClientes: countDistinct(agendamentos.clienteId),
      totalAtendimentos: count(agendamentos.id),
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .where(
      and(eq(servicos.prestadorId, prestadorId), eq(agendamentos.status, 'concluido'))
    );


  const ultimasAvaliacoes = await db
    .select({
      id: avaliacoes.id,
      nota: avaliacoes.notaParaPrestador,
      comentario: avaliacoes.comentarioPrestador,
      dataHora: agendamentos.dataHora,
      clienteNome: usuarios.nome,
      clienteImagem: usuarios.urlImagem,
      servicoNome: servicos.nome,
    })
    .from(avaliacoes)
    .innerJoin(agendamentos, eq(avaliacoes.agendamentoId, agendamentos.id))
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(agendamentos.clienteId, usuarios.id))
    .where(
      and(
        eq(servicos.prestadorId, prestadorId),
        isNotNull(avaliacoes.notaParaPrestador)
      )
    )
    .orderBy(desc(agendamentos.dataHora))
    .limit(10);

  return {
    usuario: dadosUsuario,
    servicos: await comEstatisticas(servicosDoPrestador),
    avaliacaoMedia: estatAvaliacoes?.media ? Number(estatAvaliacoes.media) : 0,
    totalAvaliacoes: estatAvaliacoes?.total ?? 0,
    totalClientesAtendidos: estatClientes?.totalClientes ?? 0,
    totalAtendimentos: estatClientes?.totalAtendimentos ?? 0,
    avaliacoes: ultimasAvaliacoes,
  };
}

export async function atualizarLocalizacaoPrestador(dados: {
  latitude?: number | null;
  longitude?: number | null;
  enderecoTexto?: string | null;
}) {
  const usuario = await getSession();
  if (!usuario || usuario.tipo !== 'prestador') {
    return { erro: 'Não autorizado.' };
  }

  const atualizacao: Record<string, number | string | null> = {};
  if ('latitude' in dados) atualizacao.latitude = dados.latitude ?? null;
  if ('longitude' in dados) atualizacao.longitude = dados.longitude ?? null;
  if ('enderecoTexto' in dados) atualizacao.enderecoTexto = dados.enderecoTexto?.trim() || null;

  if (Object.keys(atualizacao).length === 0) {
    return { erro: null, sucesso: true };
  }

  await db
    .update(prestadores)
    .set(atualizacao)
    .where(eq(prestadores.usuarioId, usuario.id));

  revalidatePath('/configuracoes');
  if (usuario.slug) revalidatePath(`/prestador/${usuario.slug}`);
  revalidatePath(`/prestador/${usuario.id}`);

  return { erro: null, sucesso: true };
}

/** Wrapper no formato useActionState (estadoAnterior, formData), usado por CampoEditavel em /configuracoes. */
export async function atualizarEnderecoTextoAction(estadoAnterior: unknown, formData: FormData) {
  const enderecoTexto = formData.get('enderecoTexto');
  return atualizarLocalizacaoPrestador({ enderecoTexto: enderecoTexto ? String(enderecoTexto) : null });
}