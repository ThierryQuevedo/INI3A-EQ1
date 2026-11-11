import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { getGoogleOAuthClient } from '@/lib/google-oauth';
import { COMPLETAR_CADASTRO_COOKIE, criarSessao, consumirProximo } from '@/lib/session';
import { destinoPadrao, filtroEmail, gerarSlugUnicoDeUsuario, normalizarEmail } from '@/lib/usuarios';
import { CAMINHO_BASE } from '@/lib/caminhoBase';

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
  // site_url pode vir com ou sem basepath
  const origem = (process.env.SITE_URL || request.nextUrl.origin).replace(/\/+$/, '');
  const baseUrl = origem.endsWith(CAMINHO_BASE) ? origem : `${origem}${CAMINHO_BASE}`;

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

    const email = normalizarEmail(payload?.email);
    if (!email || payload.email_verified === false) {
      return redirecionarComErro(baseUrl);
    }

    const nome = payload.name || email;
    const urlImagem = payload.picture || null;

    const [existente] = await db
      .select({ id: usuarios.id, tipo: usuarios.tipo })
      .from(usuarios)
      .where(filtroEmail(email))
      .limit(1);

    // email existente faz login e novo faz cadastro
    if (existente) {
      await criarSessao(existente.id);
      revalidatePath('/', 'layout');

      const proximo = await consumirProximo();
      return NextResponse.redirect(buildUrl(proximo ?? destinoPadrao(existente.tipo), baseUrl));
    }

    const senhaAleatoria = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

    const [novo] = await db
      .insert(usuarios)
      .values({
        nome,
        slug: await gerarSlugUnicoDeUsuario(nome),
        email,
        senha: senhaAleatoria,
        tipo: 'cliente',
        urlImagem,
      })
      .returning({ id: usuarios.id });

    if (!novo) {
      return redirecionarComErro(baseUrl);
    }

    await criarSessao(novo.id);
    revalidatePath('/', 'layout');

    // destino so e consumido depois da escolha
    cookieStore.set(COMPLETAR_CADASTRO_COOKIE, '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600,
      path: '/',
    });

    return NextResponse.redirect(buildUrl('/cadastro/completar/', baseUrl));
  } catch (error) {
    console.error('Erro no callback do Google:', error);
    return redirecionarComErro(baseUrl);
  }
}