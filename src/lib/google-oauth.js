import { OAuth2Client } from 'google-auth-library';
//cliente com base no .env
export function getGoogleOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URL;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Credenciais do Google ausentes: defina GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REDIRECT_URL no .env',
    );
  }

  return new OAuth2Client({ clientId, clientSecret, redirectUri });
}
