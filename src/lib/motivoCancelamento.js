import { and, asc, inArray, like } from 'drizzle-orm';
import { db } from '@/db';
import { mensagens } from '@/db/schema';

// motivo fica como mensagem com prefixo
const PREFIXO = 'Cancelei este agendamento. Motivo: ';

export function textoDoMotivo(motivo) {
  return `${PREFIXO}${motivo}`;
}

// mapa de agendamento para motivo
export async function buscarMotivosCancelamento(agendamentoIds) {
  const motivos = new Map();
  if (agendamentoIds.length === 0) return motivos;

  const linhas = await db
    .select({
      agendamentoId: mensagens.agendamentoId,
      remetenteId: mensagens.remetenteId,
      texto: mensagens.texto,
    })
    .from(mensagens)
    .where(and(inArray(mensagens.agendamentoId, agendamentoIds), like(mensagens.texto, `${PREFIXO}%`)))
    .orderBy(asc(mensagens.id));

  // fica o ultimo
  for (const { agendamentoId, remetenteId, texto } of linhas) {
    motivos.set(agendamentoId, { motivo: texto.slice(PREFIXO.length), remetenteId });
  }

  return motivos;
}
