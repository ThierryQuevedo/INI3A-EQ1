'use server';

import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { avaliacoes, agendamentos, servicos } from '@/db/schema';
import { getSession } from './auth.actions';
import { notificarNovaAvaliacao } from '@/lib/notificacoes';
import { verificarPodeAvaliar } from '@/lib/avaliacoes';

const ERROS_AVALIACAO = {
  nao_encontrado: 'Agendamento não encontrado.',
  nao_autorizado: 'Não autorizado.',
  nao_concluido: 'Este serviço ainda não foi concluído.',
};

export async function avaliarServico({
  agendamentoId,
  nota,
  comentario,
}: {
  agendamentoId: number;
  nota: number;
  comentario?: string;
}) {
  const usuario = await getSession();
  if (!usuario) return { erro: 'Não autenticado.' };

  const notaNumero = Number(nota);
  if (!Number.isInteger(notaNumero) || notaNumero < 1 || notaNumero > 5) {
    return { erro: 'A nota deve ser um número inteiro entre 1 e 5.' };
  }

  // 'ja_avaliado' não bloqueia: reenviar atualiza a avaliação existente.
  const { motivo } = await verificarPodeAvaliar(agendamentoId, usuario.id);
  if (motivo && motivo !== 'ja_avaliado') return { erro: ERROS_AVALIACAO[motivo] };

  const comentarioNormalizado = comentario?.trim() || null;

  const [existente] = await db
    .select({ id: avaliacoes.id })
    .from(avaliacoes)
    .where(eq(avaliacoes.agendamentoId, Number(agendamentoId)))
    .limit(1);

  if (existente) {
    await db
      .update(avaliacoes)
      .set({ notaParaPrestador: notaNumero, comentarioPrestador: comentarioNormalizado })
      .where(eq(avaliacoes.agendamentoId, Number(agendamentoId)));
  } else {
    await db.insert(avaliacoes).values({
      agendamentoId: Number(agendamentoId),
      notaParaPrestador: notaNumero,
      comentarioPrestador: comentarioNormalizado,
    });
  }

  // Vale tanto para uma avaliação nova quanto para uma edição.
  after(() =>
    notificarNovaAvaliacao(Number(agendamentoId), {
      nota: notaNumero,
      comentario: comentarioNormalizado,
    })
  );

  revalidatePath('/agendamentos');
  revalidatePath('/avaliar/[agendamentoId]', 'page');
  revalidatePath('/servicos/[slug]', 'page');
  revalidatePath('/prestador/[slug]', 'page');
  revalidatePath('/servicos');
  revalidatePath('/');
  return { erro: null, sucesso: true };
}

export async function avaliarCliente({
  agendamentoId,
  nota,
  comentario,
}: {
  agendamentoId: number;
  nota: number;
  comentario?: string;
}) {
  const usuario = await getSession();
  if (!usuario) return { erro: 'Não autenticado.' };

  const notaNumero = Number(nota);
  if (!Number.isInteger(notaNumero) || notaNumero < 1 || notaNumero > 5) {
    return { erro: 'A nota deve ser um número inteiro entre 1 e 5.' };
  }

  const [agendamento] = await db
    .select({
      id: agendamentos.id,
      clienteId: agendamentos.clienteId,
      status: agendamentos.status,
      prestadorId: servicos.prestadorId,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .where(eq(agendamentos.id, Number(agendamentoId)))
    .limit(1);

  if (!agendamento) return { erro: 'Agendamento não encontrado.' };
  if (agendamento.prestadorId !== usuario.id) return { erro: 'Não autorizado.' };
  if (agendamento.status !== 'concluido') {
    return { erro: 'Este serviço ainda não foi concluído.' };
  }

  const comentarioNormalizado = comentario?.trim() || null;

  const [existente] = await db
    .select({ id: avaliacoes.id })
    .from(avaliacoes)
    .where(eq(avaliacoes.agendamentoId, Number(agendamentoId)))
    .limit(1);

  if (existente) {
    await db
      .update(avaliacoes)
      .set({ notaParaCliente: notaNumero, comentarioCliente: comentarioNormalizado })
      .where(eq(avaliacoes.agendamentoId, Number(agendamentoId)));
  } else {
    await db.insert(avaliacoes).values({
      agendamentoId: Number(agendamentoId),
      notaParaCliente: notaNumero,
      comentarioCliente: comentarioNormalizado,
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/agendamentos');
  return { erro: null, sucesso: true };
}
