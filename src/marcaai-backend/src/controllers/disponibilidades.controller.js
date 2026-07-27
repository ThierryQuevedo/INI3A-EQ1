import { db } from '../db/index.js';
import { disponibilidades, agendamentos, servicos } from '../db/schema.js';
import { eq, and, gte } from 'drizzle-orm';

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
      .select({ 
        dataHora: agendamentos.dataHora, 
        status: agendamentos.status, 
        servicoId: agendamentos.servicoId 
      })
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

    // 1. Validações básicas de formato/range
    if (diaSemana < 0 || diaSemana > 6) {
      return res.status(400).json({ error: 'diaSemana deve ser entre 0 (dom) e 6 (sáb).' });
    }
    if (!horaInicio || !horaFim || horaInicio >= horaFim) {
      return res.status(400).json({ error: 'Horários inválidos (horaInicio deve ser menor que horaFim).' });
    }

    // 2. Busca todas as disponibilidades cadastradas para o prestador nesse dia
    const disponibilidadesDoDia = await db.select()
      .from(disponibilidades)
      .where(
        and(
          eq(disponibilidades.prestadorId, prestadorId),
          eq(disponibilidades.diaSemana, Number(diaSemana)) // MEGA BRAIN: Garante que é número!
        )
      );

    // 3. Checa conflitos de sobreposição de horários
    const temConflito = disponibilidadesDoDia.some((d) => {
      return horaInicio < d.horaFim && horaFim > d.horaInicio;
    });

    if (temConflito) {
      // Se der conflito, a mensagem que vai aparecer na tela agora é essa aqui:
      return res.status(409).json({ 
        error: 'Já existe um horário cadastrado que conflita com este intervalo.' 
      });
    }

    // 4. Insere o novo bloco segregado
    const [nova] = await db.insert(disponibilidades)
      .values({ prestadorId, diaSemana: Number(diaSemana), horaInicio, horaFim }) // MEGA BRAIN: Garante que é número!
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
    console.log(err);
    return res.status(500).json({ error: 'Erro ao deletar disponibilidade.' });
  }
}