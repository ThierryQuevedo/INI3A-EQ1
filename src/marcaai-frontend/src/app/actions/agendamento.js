'use server'

import { db } from '../../db/index.js';
import { agendamentos } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function atualizarStatusAgendamento(id, status) {
  await db.update(agendamentos)
    .set({ status })
    .where(eq(agendamentos.id, id));

  revalidatePath('/dashboard');
}

export async function confirmarAgendamentoAction({ servicoId, dataHora }) {
  const { getSession, decodeJwtPayload } = await import('./auth.js');

  const cookie = await getSession();
  const usuario = await decodeJwtPayload(cookie);

  if (!usuario?.id) return { erro: 'Não autenticado.' };

  const [novo] = await db.insert(agendamentos).values({
    clienteId: usuario.id,
    servicoId,
    dataHora: new Date(dataHora),
    status: 'pendente',
  }).returning();

  revalidatePath('/agenda');
  return novo;
}