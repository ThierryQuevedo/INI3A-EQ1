import { db } from '../db/index.js';
import { disponibilidades, agendamentos, servicos } from '../db/schema.js';
import { eq, and, gte } from 'drizzle-orm';

export async function listarDisponibilidades(req, res) {
  try {
    const { prestadorId } = req.params;
    const { servicoId } = req.query;

    const filtros = [eq(disponibilidades.prestadorId, Number(prestadorId))];

    // Se veio servicoId na query, filtra só os blocos daquele serviço.
    // Sem isso, a agenda de todos os serviços do prestador aparecia junta
    // (por isso os horários pareciam "iguais" entre serviços diferentes).
    if (servicoId) {
      filtros.push(eq(disponibilidades.servicoId, Number(servicoId)));
    }

    const lista = await db.select()
      .from(disponibilidades)
      .where(and(...filtros));
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
    const { diaSemana, horaInicio, horaFim, servicoId } = req.body;

    // 1. Validações básicas de formato/range
    if (diaSemana < 0 || diaSemana > 6) {
      return res.status(400).json({ error: 'diaSemana deve ser entre 0 (dom) e 6 (sáb).' });
    }
    if (!horaInicio || !horaFim || horaInicio >= horaFim) {
      return res.status(400).json({ error: 'Horários inválidos (horaInicio deve ser menor que horaFim).' });
    }
    if (!servicoId) {
      return res.status(400).json({ error: 'servicoId é obrigatório.' });
    }

    // 2. Busca as disponibilidades cadastradas para ESSE serviço nesse dia
    //    (antes checava todas as do prestador, o que misturava a agenda
    //    de serviços diferentes)
    const disponibilidadesDoDia = await db.select()
      .from(disponibilidades)
      .where(
        and(
          eq(disponibilidades.prestadorId, prestadorId),
          eq(disponibilidades.servicoId, Number(servicoId)),
          eq(disponibilidades.diaSemana, Number(diaSemana))
        )
      );

    // 3. Checa conflitos de sobreposição de horários (dentro do mesmo serviço)
    const temConflito = disponibilidadesDoDia.some((d) => {
      return horaInicio < d.horaFim && horaFim > d.horaInicio;
    });

    if (temConflito) {
      return res.status(409).json({ 
        error: 'Já existe um horário cadastrado que conflita com este intervalo.' 
      });
    }

    // 4. Insere o novo bloco, já vinculado ao serviço
    const [nova] = await db.insert(disponibilidades)
      .values({
        prestadorId,
        servicoId: Number(servicoId),
        diaSemana: Number(diaSemana),
        horaInicio,
        horaFim,
      })
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