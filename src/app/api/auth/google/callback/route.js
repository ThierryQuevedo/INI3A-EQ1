import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { getGoogleOAuthClient } from '@/lib/google-oauth';
import { criarSessao } from '@/lib/session';

const STATE_COOKIE = 'google_oauth_state';

function redirecionarComErro(request) {
  return NextResponse.redirect(new URL('/login?erro=google', request.url));
}

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const erroGoogle = searchParams.get('error');

  const cookieStore = await cookies();
  const stateEsperado = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (erroGoogle || !code || !state || !stateEsperado || state !== stateEsperado) {
    return redirecionarComErro(request);
  }

  try {
    const client = getGoogleOAuthClient();

    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) {
      return redirecionarComErro(request);
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload?.email;
    if (!email || payload.email_verified === false) {
      return redirecionarComErro(request);
    }

    const nome = payload.name || email;
    const urlImagem = payload.picture || null;

    const [existente] = await db
      .select({ id: usuarios.id, tipo: usuarios.tipo })
      .from(usuarios)
      .where(eq(usuarios.email, email))
      .limit(1);

    let usuario = existente;

    if (!usuario) {
      const senhaAleatoria = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

      const [novo] = await db
        .insert(usuarios)
        .values({
          nome,
          email,
          senha: senhaAleatoria,
          tipo: 'cliente',
          urlImagem,
        })
        .returning({ id: usuarios.id, tipo: usuarios.tipo });

      usuario = novo;
    }

    if (!usuario) {
      return redirecionarComErro(request);
    }

    await criarSessao(usuario.id);
    revalidatePath('/', 'layout');

    const destino = usuario.tipo === 'prestador' ? '/dashboard' : '/';
    return NextResponse.redirect(new URL(destino, request.url));
  } catch (error) {
    console.error('Erro no callback do Google:', error);
    return redirecionarComErro(request);
  }
}
