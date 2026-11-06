import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { gerarSlug } from './slug.js';

/** E-mail é comparado sem diferenciar maiúsculas: "Ana@x.com" e "ana@x.com" são a mesma conta. */
export function normalizarEmail(valor) {
  return String(valor ?? '').trim().toLowerCase();
}

export function filtroEmail(email) {
  return sql`lower(${usuarios.email}) = ${normalizarEmail(email)}`;
}

/** Slug livre para a URL do perfil: `ana-silva`, `ana-silva-2`, `ana-silva-3`… */
export async function gerarSlugUnicoDeUsuario(nome) {
  const base = gerarSlug(String(nome ?? '')) || 'usuario';
  let candidato = base;

  for (let sufixo = 2; ; sufixo++) {
    const [existente] = await db
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(eq(usuarios.slug, candidato))
      .limit(1);
    if (!existente) return candidato;
    candidato = `${base}-${sufixo}`;
  }
}

/** Para onde vai quem acabou de entrar, quando não há um destino guardado. */
export function destinoPadrao(tipo) {
  return tipo === 'prestador' ? '/dashboard' : '/';
}
