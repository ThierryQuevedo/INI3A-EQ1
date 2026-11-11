import { eq, or } from 'drizzle-orm';
import { db } from '@/db';
import { servicos, usuarios } from '@/db/schema';

// Consultas mínimas para o título da aba (generateMetadata) das páginas com slug.
// Devolvem null quando não acham: a página trata o 404, o título só cai no padrão.

export async function nomeDoServico(slug) {
  if (!slug) return null;
  const [linha] = await db.select({ nome: servicos.nome }).from(servicos).where(eq(servicos.slug, slug)).limit(1);
  return linha?.nome ?? null;
}

/** Perfis aceitam o slug ou o id numérico do usuário na URL. */
export async function nomeDoUsuario(slugOuId) {
  if (!slugOuId) return null;
  const id = /^\d+$/.test(slugOuId) ? Number(slugOuId) : null;
  const filtro = id ? or(eq(usuarios.slug, slugOuId), eq(usuarios.id, id)) : eq(usuarios.slug, slugOuId);
  const [linha] = await db.select({ nome: usuarios.nome }).from(usuarios).where(filtro).limit(1);
  return linha?.nome ?? null;
}
