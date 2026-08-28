'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { avaliacoes, agendamentos } from '@/db/schema';
import { getSession } from './auth.actions';

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

  const [agendamento] = await db
    .select()
    .from(agendamentos)
    .where(eq(agendamentos.id, Number(agendamentoId)))
    .limit(1);

  if (!agendamento) return { erro: 'Agendamento não encontrado.' };
  if (agendamento.clienteId !== usuario.id) return { erro: 'Não autorizado.' };
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
      .set({ notaParaPrestador: notaNumero, comentarioPrestador: comentarioNormalizado })
      .where(eq(avaliacoes.agendamentoId, Number(agendamentoId)));
  } else {
    await db.insert(avaliacoes).values({
      agendamentoId: Number(agendamentoId),
      notaParaPrestador: notaNumero,
      comentarioPrestador: comentarioNormalizado,
    });
  }

  revalidatePath('/agendamentos');
  return { erro: null, sucesso: true };
}
