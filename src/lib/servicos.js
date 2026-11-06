import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { agendamentos } from '@/db/schema';

/**
 * Serviço com qualquer agendamento, de qualquer status, não pode ser excluído:
 * o histórico dos clientes e as avaliações dependem dele.
 */
export async function servicoTemAgendamentos(servicoId) {
  const [agendamento] = await db
    .select({ id: agendamentos.id })
    .from(agendamentos)
    .where(eq(agendamentos.servicoId, Number(servicoId)))
    .limit(1);

  return !!agendamento;
}

/** "maria@gmail.com" → "m***@gmail.com": mostra para onde o código vai sem expor o endereço. */
export function mascararEmail(email) {
  const [local, dominio] = String(email ?? '').split('@');
  return dominio ? `${local.charAt(0)}***@${dominio}` : '';
}
