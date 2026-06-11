import { db } from '../db/index.js';
import { disponibilidades, agendamentos, servicos } from '../db/schema.js';
import { eq, and, gte, lt } from 'drizzle-orm';

export async function listarDisponibilidades(req, res) {
  try {
    const { prestadorId } = req.params;
    const lista = await db.select()
      .from(disponibilidades)
      .where(eq(disponibilidades.prestadorId, Number(prestadorId)));
    return res.json(lista);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Erro ao listar disponibilidades.' });
  }
}

export async function listarAgendamentosPorPrestador(req, res) {
  try {
    const { prestadorId } = req.params;

    const lista = await db
      .select({ dataHora: agendamentos.dataHora, status: agendamentos.status, servicoId: agendamentos.servicoId })
      .from(agendamentos)
      .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
      .where(
        and(
          eq(servicos.prestadorId, Number(prestadorId)),
          gte(agendamentos.dataHora, new Date())
        )
      );

    return res.json(lista);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Erro ao listar agendamentos do prestador.' });
  }
}


export async function criarDisponibilidade(req, res) {
  try {
    const prestadorId = Number(req.params.prestadorId);
    const { diaSemana, horaInicio, horaFim } = req.body;

    // Validações básicas
    if (diaSemana < 0 || diaSemana > 6) {
      return res.status(400).json({ error: 'diaSemana deve ser entre 0 (dom) e 6 (sáb).' });
    }
    if (!horaInicio || !horaFim || horaInicio >= horaFim) {
      return res.status(400).json({ error: 'Horários inválidos.' });
    }

    // Evita duplicata no mesmo dia
    const existente = await db.select()
      .from(disponibilidades)
      .where(
        and(
          eq(disponibilidades.prestadorId, prestadorId),
          eq(disponibilidades.diaSemana, diaSemana)
        )
      );

    if (existente.length > 0) {
      return res.status(409).json({ error: 'Já existe disponibilidade para este dia.' });
    }

    const [nova] = await db.insert(disponibilidades)
      .values({ prestadorId, diaSemana, horaInicio, horaFim })
      .returning();

    return res.status(201).json(nova);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Erro ao criar disponibilidade.' });
  }
}

export async function deletarDisponibilidade(req, res) {
  try {
    const { id, prestadorId } = req.params;

    await db.delete(disponibilidades)
      .where(
        and(
          eq(disponibilidades.id, Number(id)),
          eq(disponibilidades.prestadorId, Number(prestadorId)) 
        )
      );

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao deletar disponibilidade.' });
  }
}