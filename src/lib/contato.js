import { and, eq, or } from 'drizzle-orm';
import { db } from '@/db';
import { agendamentos, servicos } from '@/db/schema';

/**
 * O telefone de uma pessoa só aparece para ela mesma e para quem já tem
 * agendamento com ela, de qualquer um dos lados (cliente ↔ prestador).
 * Perfis públicos não expõem contato: com ids sequenciais, daria para
 * percorrer a base inteira e colher os telefones (LGPD).
 */
export async function podeVerContato(visitanteId, alvoId) {
  if (!visitanteId || !alvoId) return false;
  if (Number(visitanteId) === Number(alvoId)) return true;

  const visitante = Number(visitanteId);
  const alvo = Number(alvoId);

  const [vinculo] = await db
    .select({ id: agendamentos.id })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .where(
      or(
        and(eq(agendamentos.clienteId, visitante), eq(servicos.prestadorId, alvo)),
        and(eq(agendamentos.clienteId, alvo), eq(servicos.prestadorId, visitante))
      )
    )
    .limit(1);

  return !!vinculo;
}
