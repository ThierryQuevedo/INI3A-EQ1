'use server';

import { revalidatePath } from 'next/cache';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { notificacoes } from '@/db/schema';
import { getSession } from './auth.actions';

const LIMITE_PADRAO = 20;

/** Notificações do usuário logado, mais recentes primeiro. */
export async function listarMinhasNotificacoes(limite: number = LIMITE_PADRAO) {
  const usuario = await getSession();
  if (!usuario) return [];

  return await db
    .select()
    .from(notificacoes)
    .where(eq(notificacoes.usuarioId, usuario.id))
    .orderBy(desc(notificacoes.criadoEm))
    .limit(limite);
}

/** Total de notificações não lidas do usuário logado — usado no badge do sino. */
export async function contarNotificacoesNaoLidas() {
  const usuario = await getSession();
  if (!usuario) return 0;

  const [resultado] = await db
    .select({ total: sql<number>`count(*)`.mapWith(Number) })
    .from(notificacoes)
    .where(and(eq(notificacoes.usuarioId, usuario.id), isNull(notificacoes.lidaEm)));

  return resultado?.total ?? 0;
}

export async function marcarNotificacaoLida(id: number) {
  const usuario = await getSession();
  if (!usuario) return;

  await db
    .update(notificacoes)
    .set({ lidaEm: new Date() })
    .where(
      and(eq(notificacoes.id, Number(id)), eq(notificacoes.usuarioId, usuario.id), isNull(notificacoes.lidaEm))
    );

  revalidatePath('/notificacoes');
}

export async function marcarTodasNotificacoesLidas() {
  const usuario = await getSession();
  if (!usuario) return;

  await db
    .update(notificacoes)
    .set({ lidaEm: new Date() })
    .where(and(eq(notificacoes.usuarioId, usuario.id), isNull(notificacoes.lidaEm)));

  revalidatePath('/notificacoes');
}
