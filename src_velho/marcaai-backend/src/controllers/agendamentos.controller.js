import { db } from '../db/index.js';
import { agendamentos } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function criarAgendamento(req, res) {
  try 
  {
    const { clienteId, servicoId, dataHora } = req.body;
    const [novo] = await db.insert(agendamentos).values({
      clienteId,
      servicoId,
      dataHora: new Date(dataHora),
      status: 'pending',
    }).returning();

    return res.status(201).json(novo);
  } 
  catch (err) 
  {
    console.log(err);
    return res.status(500).json({ error: 'Erro ao criar agendamento.' });
  }
}

export async function listarAgendamentos(req, res) {
  try 
  {
    const todos = await db.select().from(agendamentos);
    return res.json(todos);
  } 
  catch (err) 
  {
    return res.status(500).json({ error: 'Erro ao listar agendamentos.' });
  }
}

export async function buscarAgendamento(req, res) {
  try 
  {
    const { id } = req.params;

    const [agendamento] = await db.select()
      .from(agendamentos)
      .where(eq(agendamentos.id, Number(id)))
      .limit(1);

    if (!agendamento) return res.status(404).json({ error: 'agendamento não encontrado.' });

    return res.json(agendamento);
  } 
  catch (err) 
  {
    return res.status(500).json({ error: 'Erro ao buscar agendamento.' });
  }
}

export async function atualizarAgendamento(req, res) {
  try 
  {
    const { id } = req.params;
    const { status, dataHora } = req.body;

    const [atualizado] = await db.update(agendamentos)
      .set({
        ...(status && { status }),
        ...(dataHora && { dataHora: new Date(dataHora) }),
      })
      .where(eq(agendamentos.id, Number(id)))
      .returning();

    if (!atualizado) return res.status(404).json({ error: 'agendamento não encontrado.' });

    return res.json(atualizado);
  } 
  catch (err) 
  {
    return res.status(500).json({ error: 'Erro ao atualizar agendamento.' });
  }
}

export async function deletarAgendamento(req, res) {
  try 
  {
    const { id } = req.params;

    const [deletado] = await db.delete(agendamentos)
      .where(eq(agendamentos.id, Number(id)))
      .returning();

    if (!deletado) return res.status(404).json({ error: 'agendamento não encontrado.' });

    return res.json({ mensagem: 'agendamento deletado com sucesso.' });
  } 
  catch (err) 
  {
    return res.status(500).json({ error: 'Erro ao deletar agendamento.' });
  }
}