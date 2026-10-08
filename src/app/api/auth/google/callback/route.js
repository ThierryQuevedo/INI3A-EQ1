import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { getGoogleOAuthClient } from '@/lib/google-oauth';
import { criarSessao, consumirProximo } from '@/lib/session';

const STATE_COOKIE = 'google_oauth_state';

function buildUrl(path, baseUrl) {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

function redirecionarComErro(baseUrl) {
  return NextResponse.redirect(buildUrl('/login?erro=google', baseUrl));
}

export async function GET(request) {
  const baseUrl = process.env.SITE_URL || `${request.nextUrl.origin}/26-marcaai`;
  
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const erroGoogle = searchParams.get('error');

  const cookieStore = await cookies();
  const stateEsperado = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (erroGoogle || !code || !state || !stateEsperado || state !== stateEsperado) {
    return redirecionarComErro(baseUrl);
  }

  try {
    const client = getGoogleOAuthClient();

    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) {
      return redirecionarComErro(baseUrl);
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload?.email;
    if (!email || payload.email_verified === false) {
      return redirecionarComErro(baseUrl);
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
      return redirecionarComErro(baseUrl);
    }

    await criarSessao(usuario.id);
    revalidatePath('/', 'layout');

    const proximo = await consumirProximo();
    const destino = proximo ?? (usuario.tipo === 'prestador' ? '/dashboard' : '/');
    return NextResponse.redirect(buildUrl(destino, baseUrl));
  } catch (error) {
    console.error('Erro no callback do Google:', error);
    return redirecionarComErro(baseUrl);
  }
}