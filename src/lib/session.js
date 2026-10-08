import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from '@/db';
import { sessoes } from '@/db/schema';

export const SESSION_COOKIE = 'marcaai_session';
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24;

export async function criarSessao(usuarioId) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiraEm = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessoes).values({
    id: sessionId,
    usuarioId,
    expiraEm,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiraEm,
    path: '/',
  });

  return sessionId;
}

// routing pós login
export const PROXIMO_COOKIE = 'marcaai_proximo';

export function caminhoInternoSeguro(valor) {
  if (typeof valor !== 'string') return null;
  if (!valor.startsWith('/') || valor.startsWith('//') || valor.startsWith('/\\')) return null;
  return valor;
}


export async function consumirProximo() {
  const cookieStore = await cookies();
  const valor = cookieStore.get(PROXIMO_COOKIE)?.value;
  if (valor === undefined) return null;

  cookieStore.delete(PROXIMO_COOKIE);
  return caminhoInternoSeguro(valor);
}
