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
