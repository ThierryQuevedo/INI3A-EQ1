import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getGoogleOAuthClient } from '@/lib/google-oauth';

const STATE_COOKIE = 'google_oauth_state';

export async function GET() {
  const client = getGoogleOAuthClient();

  const state = crypto.randomBytes(16).toString('hex');

  const url = client.generateAuthUrl({
    access_type: 'online',
    prompt: 'select_account',
    scope: ['openid', 'email', 'profile'],
    state,
  });

  const res = NextResponse.redirect(url);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  return res;
}
