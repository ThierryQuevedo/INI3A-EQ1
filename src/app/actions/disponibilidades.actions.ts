'use server';

import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { disponibilidades } from '@/db/schema';

export async function listarDisponibilidades(prestadorId: number, servicoId?: number) {
  const filtros = [eq(disponibilidades.prestadorId, Number(prestadorId))];

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
  prestadorId: number,
  { diaSemana, horaInicio, horaFim, servicoId }: { diaSemana: number; horaInicio: string; horaFim: string; servicoId: number }
) {
  if (diaSemana < 0 || diaSemana > 6) {
    return { erro: 'diaSemana deve ser entre 0 (dom) e 6 (sáb).' };
  }
  if (!horaInicio || !horaFim || horaInicio >= horaFim) {
    return { erro: 'Horários inválidos (horaInicio deve ser menor que horaFim).' };
  }
  if (!servicoId) {
    return { erro: 'servicoId é obrigatório.' };
  }

  // Checa apenas as disponibilidades cadastradas para ESSE serviço nesse dia
  // (checar todas as do prestador misturaria a agenda de serviços diferentes).
  const disponibilidadesDoDia = await db
    .select()
    .from(disponibilidades)
    .where(
      and(
        eq(disponibilidades.prestadorId, Number(prestadorId)),
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
      prestadorId: Number(prestadorId),
      servicoId: Number(servicoId),
      diaSemana: Number(diaSemana),
      horaInicio,
      horaFim,
    })
    .returning();

  return nova;
}

export async function deletarDisponibilidade(prestadorId: number, id: number) {
  await db
    .delete(disponibilidades)
    .where(
      and(
        eq(disponibilidades.id, Number(id)),
        eq(disponibilidades.prestadorId, Number(prestadorId))
      )
    );

  return { ok: true };
}
