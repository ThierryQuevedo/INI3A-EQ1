import { eq, or } from 'drizzle-orm';
import { db } from '@/db';
import { servicos, usuarios } from '@/db/schema';

// consultas minimas para o titulo da aba

export async function nomeDoServico(slug) {
  if (!slug) return null;
  const [linha] = await db.select({ nome: servicos.nome }).from(servicos).where(eq(servicos.slug, slug)).limit(1);
  return linha?.nome ?? null;
}

// aceita slug ou id
export async function nomeDoUsuario(slugOuId) {
  if (!slugOuId) return null;
  const id = /^\d+$/.test(slugOuId) ? Number(slugOuId) : null;
  const filtro = id ? or(eq(usuarios.slug, slugOuId), eq(usuarios.id, id)) : eq(usuarios.slug, slugOuId);
  const [linha] = await db.select({ nome: usuarios.nome }).from(usuarios).where(filtro).limit(1);
  return linha?.nome ?? null;
}
