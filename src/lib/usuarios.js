import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { gerarSlug } from './slug.js';

// email sem diferenciar maiusculas
export function normalizarEmail(valor) {
  return String(valor ?? '').trim().toLowerCase();
}

export function filtroEmail(email) {
  return sql`lower(${usuarios.email}) = ${normalizarEmail(email)}`;
}

// slug livre
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

// destino padrao apos entrar
export function destinoPadrao(tipo) {
  return tipo === 'prestador' ? '/dashboard' : '/';
}
