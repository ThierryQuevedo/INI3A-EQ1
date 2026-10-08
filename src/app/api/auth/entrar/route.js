import { NextResponse } from 'next/server';
import { PROXIMO_COOKIE, caminhoInternoSeguro } from '@/lib/session';
import { linkApp } from '@/lib/emails/templates';

// Guarda o destino pós-login num cookie e manda para o /login sem query string.
// Existe porque um Server Component não pode escrever cookie.
export async function GET(request) {
  const proximo = caminhoInternoSeguro(request.nextUrl.searchParams.get('proximo'));

  // Atrás do proxy o host da requisição é o interno; SITE_URL tem o público.
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
      maxAge: 600,
      path: '/',
    });
  }

  return res;
}
