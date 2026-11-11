import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { agendamentos } from '@/db/schema';

// servico com agendamento nao e excluido
export async function servicoTemAgendamentos(servicoId) {
  const [agendamento] = await db
    .select({ id: agendamentos.id })
    .from(agendamentos)
    .where(eq(agendamentos.servicoId, Number(servicoId)))
    .limit(1);

  return !!agendamento;
}

// mascara o email
export function mascararEmail(email) {
  const [local, dominio] = String(email ?? '').split('@');
  return dominio ? `${local.charAt(0)}***@${dominio}` : '';
}
