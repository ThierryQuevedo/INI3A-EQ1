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

    // Busca agendamentos do prestador via join com serviços
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