import { NextResponse } from 'next/server';
import { PROXIMO_COOKIE, caminhoInternoSeguro } from '@/lib/session';
import { linkApp } from '@/lib/emails/templates';

// guarda o destino pos login num cookie
export async function GET(request) {
  const proximo = caminhoInternoSeguro(request.nextUrl.searchParams.get('proximo'));

  // atras do proxy usa site_url
  let url;
  if (process.env.SITE_URL) {
    url = linkApp('/login/');
  } else {
    url = request.nextUrl.clone();
    url.pathname = '/login/';
    url.search = '';
  }

  const res = NextResponse.redirect(url);
  if (proximo) {
    res.cookies.set(PROXIMO_COOKIE, proximo, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      // 1 hora para concluir o login
      maxAge: 3600,
      path: '/',
    });
  }

  return res;
}
