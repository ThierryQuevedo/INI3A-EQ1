import { and, avg, count, eq, inArray, isNotNull } from 'drizzle-orm';
import { db } from '@/db';
import { agendamentos, avaliacoes, servicos, usuarios } from '@/db/schema';

/*
 ao_encontrado — o agendamento não existe;
 nao_autorizado' — o agendamento é de outro cliente;
 nao_concluido  — o serviço ainda não foi concluído;
ja_avaliado    — já existe nota para o prestador (vem em `avaliacaoExistente`).*/

export async function verificarPodeAvaliar(agendamentoId, usuarioId) {
  const id = Number(agendamentoId);
  if (!Number.isInteger(id) || id <= 0) {
    return { pode: false, motivo: 'nao_encontrado', agendamento: null, avaliacaoExistente: null };
  }

  const [agendamento] = await db
    .select({
      id: agendamentos.id,
      clienteId: agendamentos.clienteId,
      status: agendamentos.status,
      dataHora: agendamentos.dataHora,
      servicoId: servicos.id,
      servicoNome: servicos.nome,
      servicoSlug: servicos.slug,
      servicoImagem: servicos.urlImagem,
      prestadorNome: usuarios.nome,
      nota: avaliacoes.notaParaPrestador,
      comentario: avaliacoes.comentarioPrestador,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .leftJoin(avaliacoes, eq(avaliacoes.agendamentoId, agendamentos.id))
    .where(eq(agendamentos.id, id))
    .limit(1);

  if (!agendamento) {
    return { pode: false, motivo: 'nao_encontrado', agendamento: null, avaliacaoExistente: null };
  }

  const avaliacaoExistente =
    agendamento.nota != null ? { nota: agendamento.nota, comentario: agendamento.comentario } : null;

  let motivo = null;
  if (usuarioId != null && agendamento.clienteId !== Number(usuarioId)) motivo = 'nao_autorizado';
  else if (agendamento.status !== 'concluido') motivo = 'nao_concluido';
  else if (avaliacaoExistente) motivo = 'ja_avaliado';

  if (motivo === 'nao_autorizado') {
    return { pode: false, motivo, agendamento: null, avaliacaoExistente: null };
  }

  return { pode: motivo === null, motivo, agendamento, avaliacaoExistente };
}

export async function estatisticasPorServico(servicoIds) {
  if (Array.isArray(servicoIds) && servicoIds.length === 0) return new Map();

  const filtros = [isNotNull(avaliacoes.notaParaPrestador)];
  if (Array.isArray(servicoIds)) {
    filtros.push(inArray(agendamentos.servicoId, servicoIds.map(Number)));
  }

  const linhas = await db
    .select({
      servicoId: agendamentos.servicoId,
      media: avg(avaliacoes.notaParaPrestador),
      total: count(avaliacoes.id),
    })
    .from(avaliacoes)
    .innerJoin(agendamentos, eq(avaliacoes.agendamentoId, agendamentos.id))
    .where(and(...filtros))
    .groupBy(agendamentos.servicoId);

  return new Map(
    linhas.map((l) => [l.servicoId, { media: Number(l.media) || 0, total: Number(l.total) || 0 }])
  );
}

export async function comEstatisticas(lista) {
  const mapa = await estatisticasPorServico(lista.map((s) => s.id));
  return lista.map((s) => {
    const estat = mapa.get(s.id);
    return { ...s, avaliacaoMedia: estat?.media ?? 0, totalAvaliacoes: estat?.total ?? 0 };
  });
}
