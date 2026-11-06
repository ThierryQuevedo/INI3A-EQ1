import { and, asc, inArray, like } from 'drizzle-orm';
import { db } from '@/db';
import { mensagens } from '@/db/schema';

// O motivo é gravado como mensagem no chat do agendamento, sem coluna própria.
// Este prefixo é o que permite encontrá-lo de novo para mostrar na agenda.
const PREFIXO = 'Cancelei este agendamento. Motivo: ';

export function textoDoMotivo(motivo) {
  return `${PREFIXO}${motivo}`;
}

/** Devolve um Map de agendamentoId → { motivo, remetenteId }. */
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

  // Em ordem de envio: se houver mais de uma, fica a última.
  for (const { agendamentoId, remetenteId, texto } of linhas) {
    motivos.set(agendamentoId, { motivo: texto.slice(PREFIXO.length), remetenteId });
  }

  return motivos;
}
