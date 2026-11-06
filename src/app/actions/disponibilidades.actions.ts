'use server';

import { eq, and, inArray, gte } from 'drizzle-orm';
import { db } from '@/db';
import { disponibilidades, servicos, agendamentos } from '@/db/schema';
import { proximoSlotLivre } from '@/lib/disponibilidade';
import { getSession } from './auth.actions';

const ERRO_SESSAO = 'Sua sessão expirou. Entre de novo para continuar.';

// O prestador vem sempre da sessão, nunca do cliente: server actions são
// endpoints públicos, e um id recebido por parâmetro pode ser forjado.
export async function listarDisponibilidades(servicoId?: number) {
  const usuario = await getSession();
  if (!usuario) return [];

  const filtros = [eq(disponibilidades.prestadorId, usuario.id)];

  // Sem o filtro de servicoId, a agenda de todos os serviços do prestador
  // aparecia junta (horários "iguais" entre serviços diferentes).
  if (servicoId) {
    filtros.push(eq(disponibilidades.servicoId, Number(servicoId)));
  }

  return await db
    .select()
    .from(disponibilidades)
    .where(and(...filtros));
}

export async function criarDisponibilidade(
  { diaSemana, horaInicio, horaFim, servicoId }: { diaSemana: number; horaInicio: string; horaFim: string; servicoId: number }
) {
  const usuario = await getSession();
  if (!usuario) return { erro: ERRO_SESSAO };
  const prestadorId = usuario.id;

  if (diaSemana < 0 || diaSemana > 6) {
    return { erro: 'diaSemana deve ser entre 0 (dom) e 6 (sáb).' };
  }
  if (!horaInicio || !horaFim || horaInicio >= horaFim) {
    return { erro: 'Horários inválidos (horaInicio deve ser menor que horaFim).' };
  }
  if (!servicoId) {
    return { erro: 'servicoId é obrigatório.' };
  }

  // Sem isto, um prestador poderia abrir horários no serviço de outro.
  const [servicoProprio] = await db
    .select({ id: servicos.id })
    .from(servicos)
    .where(and(eq(servicos.id, Number(servicoId)), eq(servicos.prestadorId, prestadorId)))
    .limit(1);
  if (!servicoProprio) {
    return { erro: 'Você não tem permissão para alterar este serviço.' };
  }

  // Checa apenas as disponibilidades cadastradas para ESSE serviço nesse dia
  // (checar todas as do prestador misturaria a agenda de serviços diferentes).
  const disponibilidadesDoDia = await db
    .select()
    .from(disponibilidades)
    .where(
      and(
        eq(disponibilidades.prestadorId, prestadorId),
        eq(disponibilidades.servicoId, Number(servicoId)),
        eq(disponibilidades.diaSemana, Number(diaSemana))
      )
    );

  const temConflito = disponibilidadesDoDia.some((d) => {
    return horaInicio < d.horaFim && horaFim > d.horaInicio;
  });

  if (temConflito) {
    return { erro: 'Já existe um horário cadastrado que conflita com este intervalo.' };
  }

  const [nova] = await db
    .insert(disponibilidades)
    .values({
      prestadorId,
      servicoId: Number(servicoId),
      diaSemana: Number(diaSemana),
      horaInicio,
      horaFim,
    })
    .returning();

  return nova;
}

export async function atualizarDisponibilidade(
  id: number,
  { horaInicio, horaFim }: { horaInicio: string; horaFim: string }
) {
  const usuario = await getSession();
  if (!usuario) return { erro: ERRO_SESSAO };
  const prestadorId = usuario.id;

  if (!horaInicio || !horaFim || horaInicio >= horaFim) {
    return { erro: 'Horários inválidos (horaInicio deve ser menor que horaFim).' };
  }

  const [atual] = await db
    .select()
    .from(disponibilidades)
    .where(
      and(
        eq(disponibilidades.id, Number(id)),
        eq(disponibilidades.prestadorId, Number(prestadorId))
      )
    );

  if (!atual) {
    return { erro: 'Horário não encontrado.' };
  }

  // Conflito checado apenas contra os OUTROS horários do mesmo serviço/dia —
  // excluir o próprio registro evita falso-positivo ao apenas ajustar o intervalo.
  const disponibilidadesDoDia = await db
    .select()
    .from(disponibilidades)
    .where(
      and(
        eq(disponibilidades.prestadorId, Number(prestadorId)),
        eq(disponibilidades.servicoId, atual.servicoId),
        eq(disponibilidades.diaSemana, atual.diaSemana)
      )
    );

  const temConflito = disponibilidadesDoDia.some((d) => {
    if (d.id === Number(id)) return false;
    return horaInicio < d.horaFim && horaFim > d.horaInicio;
  });

  if (temConflito) {
    return { erro: 'Já existe um horário cadastrado que conflita com este intervalo.' };
  }

  const [atualizada] = await db
    .update(disponibilidades)
    .set({ horaInicio, horaFim })
    .where(
      and(
        eq(disponibilidades.id, Number(id)),
        eq(disponibilidades.prestadorId, Number(prestadorId))
      )
    )
    .returning();

  return atualizada;
}

export async function deletarDisponibilidade(id: number) {
  const usuario = await getSession();
  if (!usuario) return { erro: ERRO_SESSAO };

  await db
    .delete(disponibilidades)
    .where(
      and(
        eq(disponibilidades.id, Number(id)),
        eq(disponibilidades.prestadorId, usuario.id)
      )
    );

  return { ok: true };
}

/**
 * Calcula o próximo horário livre de vários serviços de uma vez (sem N+1 query),
 * reaproveitando a mesma lógica de slots usada na tela de agendamento.
 * Os agendamentos considerados são os de TODOS os serviços do prestador — o
 * mesmo conjunto que a tela de agendar usa (carregarAgendaDoServico) —, para o
 * card nunca oferecer um horário que a tela seguinte mostra como ocupado.
 * Retorna { [servicoId]: isoString | null }.
 */
export async function calcularProximosHorariosLivres(servicoIds: number[]) {
  const ids = Array.from(new Set((servicoIds || []).map(Number))).filter((n) => !Number.isNaN(n));
  if (ids.length === 0) return {};

  const [servicosInfo, disp] = await Promise.all([
    db
      .select({ id: servicos.id, duracaoEstimada: servicos.duracaoEstimada, prestadorId: servicos.prestadorId })
      .from(servicos)
      .where(inArray(servicos.id, ids)),
    db
      .select()
      .from(disponibilidades)
      .where(inArray(disponibilidades.servicoId, ids)),
  ]);

  const prestadorIds = Array.from(new Set(servicosInfo.map((s) => s.prestadorId)));
  const agend = prestadorIds.length === 0
    ? []
    : await db
        .select({
          dataHora: agendamentos.dataHora,
          status: agendamentos.status,
          duracao: servicos.duracaoEstimada,
          prestadorId: servicos.prestadorId,
        })
        .from(agendamentos)
        .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
        .where(and(inArray(servicos.prestadorId, prestadorIds), gte(agendamentos.dataHora, new Date())));

  const resultado: Record<number, string | null> = {};
  for (const servico of servicosInfo) {
    const dispDoServico = disp.filter((d) => d.servicoId === servico.id);
    const agendDoPrestador = agend.filter((a) => a.prestadorId === servico.prestadorId);
    const proximo = proximoSlotLivre({
      disponibilidades: dispDoServico,
      agendados: agendDoPrestador,
      duracaoEstimada: servico.duracaoEstimada,
    });
    resultado[servico.id] = proximo ? proximo.toISOString() : null;
  }
  return resultado;
}
