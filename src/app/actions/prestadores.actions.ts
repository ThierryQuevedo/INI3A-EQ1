'use server';

import { eq, and, avg, count, countDistinct, desc, isNotNull } from 'drizzle-orm';
import { db } from '@/db';
import {
  usuarios,
  prestadores,
  servicos,
  categorias,
  agendamentos,
  avaliacoes,
} from '@/db/schema';

export async function buscarPerfilPrestador(usuarioId: number) {
  const id = Number(usuarioId);
  const [dadosUsuario] = await db
    .select({
      id: usuarios.id,
      nome: usuarios.nome,
      email: usuarios.email,
      telefone: usuarios.telefone,
      urlImagem: usuarios.urlImagem,
      urlBanner: usuarios.urlBanner,
      criadoEm: usuarios.criadoEm,
      biografia: prestadores.biografia,
      raioAtendimentoKm: prestadores.raioAtendimentoKm,
    })
    .from(usuarios)
    .innerJoin(prestadores, eq(prestadores.usuarioId, usuarios.id))
    .where(eq(usuarios.id, id))
    .limit(1);

  if (!dadosUsuario) return null;


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
    .where(eq(servicos.prestadorId, id));

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
        eq(servicos.prestadorId, id),
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
      and(eq(servicos.prestadorId, id), eq(agendamentos.status, 'concluido'))
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
        eq(servicos.prestadorId, id),
        isNotNull(avaliacoes.notaParaPrestador)
      )
    )
    .orderBy(desc(agendamentos.dataHora))
    .limit(10);

  return {
    usuario: dadosUsuario,
    servicos: servicosDoPrestador,
    avaliacaoMedia: estatAvaliacoes?.media ? Number(estatAvaliacoes.media) : 0,
    totalAvaliacoes: estatAvaliacoes?.total ?? 0,
    totalClientesAtendidos: estatClientes?.totalClientes ?? 0,
    totalAtendimentos: estatClientes?.totalAtendimentos ?? 0,
    avaliacoes: ultimasAvaliacoes,
  };
}