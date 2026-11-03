'use server';

import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { eq, and, gte, asc, ne } from 'drizzle-orm';
import { db } from '@/db';
import { agendamentos, servicos, usuarios, avaliacoes, categorias, disponibilidades } from '@/db/schema';
import { getSession } from './auth.actions';
import {
  notificarAgendamentoCancelado,
  notificarAgendamentoConfirmado,
  notificarNovoAgendamento,
  notificarServicoConcluido,
} from '@/lib/notificacoes';

export async function criarAgendamento({
  clienteId,
  servicoId,
  dataHora,
}: {
  clienteId: number;
  servicoId: number;
  dataHora: string;
}) {
  const [novo] = await db
    .insert(agendamentos)
    .values({
      clienteId,
      servicoId,
      dataHora: new Date(dataHora),
      status: 'pendente',
    })
    .returning();

  return novo;
}

/**
 * Cria o pedido de agendamento (nasce `pendente`; o prestador confirma depois).
 *
 * Repetir o envio é seguro: se o horário já tem um pedido ativo DESTE cliente
 * para ESTE serviço (ex.: o primeiro envio chegou ao servidor mas a resposta
 * se perdeu no 4G), devolve sucesso com esse pedido em vez de "horário já
 * preenchido". `codigo: 'ocupado'` só sai quando outra pessoa marcou antes.
 */
export async function confirmarAgendamentoAction({
  servicoId,
  dataHora,
}: {
  servicoId: number;
  dataHora: string;
}) {
  const usuario = await getSession();
  if (!usuario) return { erro: 'Sua sessão expirou. Entre de novo para marcar.', codigo: 'sessao' };

  const agendamentoDate = new Date(dataHora);
  if (isNaN(agendamentoDate.getTime()) || agendamentoDate < new Date()) {
    return { erro: 'Esse horário já passou. Escolha outro.', codigo: 'invalido' };
  }

  const [servicoExistente] = await db
    .select({ id: servicos.id, prestadorId: servicos.prestadorId })
    .from(servicos)
    .where(eq(servicos.id, Number(servicoId)))
    .limit(1);

  if (!servicoExistente) {
    return { erro: 'Este serviço não está mais disponível.', codigo: 'servico' };
  }

  const [agendamentoExistente] = await db
    .select({
      id: agendamentos.id,
      dataHora: agendamentos.dataHora,
      clienteId: agendamentos.clienteId,
      servicoId: agendamentos.servicoId,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .where(
      and(
        eq(servicos.prestadorId, servicoExistente.prestadorId),
        eq(agendamentos.dataHora, agendamentoDate),
        ne(agendamentos.status, 'cancelado')
      )
    )
    .limit(1);

  if (agendamentoExistente) {
    const ehRepeticaoDoMesmoPedido =
      agendamentoExistente.clienteId === usuario.id &&
      agendamentoExistente.servicoId === Number(servicoId);

    if (ehRepeticaoDoMesmoPedido) {
      return {
        erro: null,
        sucesso: true,
        agendamento: { id: agendamentoExistente.id, dataHora: agendamentoExistente.dataHora.toISOString() },
      };
    }
    return { erro: 'Este horário acabou de ser preenchido. Escolha outro.', codigo: 'ocupado' };
  }

  const [novo] = await db
    .insert(agendamentos)
    .values({
      clienteId: usuario.id,
      servicoId,
      dataHora: agendamentoDate,
      status: 'pendente',
    })
    .returning();

  // `after` deixa o e-mail sair depois que a resposta já foi enviada: o cliente
  // não espera o SMTP e uma falha de envio não afeta o agendamento.
  after(() => notificarNovoAgendamento(novo.id));

  revalidatePath('/agendamentos');
  return {
    erro: null,
    sucesso: true,
    agendamento: { id: novo.id, dataHora: novo.dataHora.toISOString() },
  };
}

/**
 * Tudo o que a tela de agendar precisa, numa ida ao banco por etapa:
 * serviço + prestador + categoria (uma consulta com junção) e, em paralelo,
 * as disponibilidades do serviço e os agendamentos futuros do prestador
 * (de todos os serviços dele, com a duração de cada um).
 * Só sai o que a tela mostra: nada de e-mail ou telefone do prestador.
 * Datas viram ISO para atravessar a fronteira servidor → cliente.
 */
export async function carregarAgendaDoServico(servicoId: number) {
  const id = Number(servicoId);
  if (!Number.isInteger(id) || id <= 0) return null;

  const [servico] = await db
    .select({
      id: servicos.id,
      slug: servicos.slug,
      nome: servicos.nome,
      preco: servicos.preco,
      duracaoEstimada: servicos.duracaoEstimada,
      prestadorId: servicos.prestadorId,
      prestadorNome: usuarios.nome,
      prestadorSlug: usuarios.slug,
      categoriaId: servicos.categoriaId,
      categoriaNome: categorias.nome,
    })
    .from(servicos)
    .innerJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .leftJoin(categorias, eq(servicos.categoriaId, categorias.id))
    .where(eq(servicos.id, id))
    .limit(1);

  if (!servico) return null;

  const [listaDisponibilidades, agendados] = await Promise.all([
    db
      .select({
        diaSemana: disponibilidades.diaSemana,
        horaInicio: disponibilidades.horaInicio,
        horaFim: disponibilidades.horaFim,
      })
      .from(disponibilidades)
      .where(and(eq(disponibilidades.prestadorId, servico.prestadorId), eq(disponibilidades.servicoId, id))),
    listarOcupacaoDoPrestador(servico.prestadorId),
  ]);

  return {
    servico: { ...servico, preco: String(servico.preco) },
    disponibilidades: listaDisponibilidades,
    agendados,
  };
}

/** Agendamentos futuros do prestador como ocupação: só instante, status e duração. */
async function listarOcupacaoDoPrestador(prestadorId: number) {
  const linhas = await db
    .select({
      dataHora: agendamentos.dataHora,
      status: agendamentos.status,
      duracao: servicos.duracaoEstimada,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .where(
      and(
        eq(servicos.prestadorId, Number(prestadorId)),
        gte(agendamentos.dataHora, new Date()),
        ne(agendamentos.status, 'cancelado')
      )
    );

  return linhas.map((l) => ({ dataHora: l.dataHora.toISOString(), status: l.status, duracao: l.duracao }));
}

/** Recarrega só a ocupação (usado quando alguém marca o horário antes do cliente). */
export async function recarregarOcupacaoDoServico(servicoId: number) {
  const [servico] = await db
    .select({ prestadorId: servicos.prestadorId })
    .from(servicos)
    .where(eq(servicos.id, Number(servicoId)))
    .limit(1);
  if (!servico) return [];
  return listarOcupacaoDoPrestador(servico.prestadorId);
}

export async function atualizarStatusAgendamento(id: number, status: string) {
  const usuario = await getSession();
  if (!usuario) return;

  const [atual] = await db
    .select({
      status: agendamentos.status,
      clienteId: agendamentos.clienteId,
      prestadorId: servicos.prestadorId,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .where(eq(agendamentos.id, Number(id)))
    .limit(1);

  if (!atual) return;

  const ehPrestador = atual.prestadorId === usuario.id;
  const ehCliente = atual.clienteId === usuario.id;
  const permitido = status === 'cancelado' ? ehPrestador || ehCliente : ehPrestador;
  if (!permitido) return;

  if (atual.status === status) return;

  await db.update(agendamentos).set({ status }).where(eq(agendamentos.id, id));

  switch (status) {
    case 'confirmado':
      after(() => notificarAgendamentoConfirmado(id));
      break;
    case 'cancelado':
      after(() => notificarAgendamentoCancelado(id));
      break;
    case 'concluido':
      after(() => notificarServicoConcluido(id));
      break;
  }

  revalidatePath('/dashboard');
  revalidatePath('/agendamentos');
}

export async function listarAgendamentos() {
  return await db.select().from(agendamentos);
}

export async function listarMeusAgendamentos() {
  const usuario = await getSession();
  if (!usuario) return [];

  if (usuario.tipo === 'prestador') {
    return await db
      .select({
        id: agendamentos.id,
        dataHora: agendamentos.dataHora,
        status: agendamentos.status,
        servicoNome: servicos.nome,
        clienteNome: usuarios.nome,
        clienteTelefone: usuarios.telefone,
      })
      .from(agendamentos)
      .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
      .innerJoin(usuarios, eq(agendamentos.clienteId, usuarios.id))
      .where(eq(servicos.prestadorId, usuario.id))
      .orderBy(asc(agendamentos.dataHora));
  }

  return await db
    .select({
      id: agendamentos.id,
      dataHora: agendamentos.dataHora,
      status: agendamentos.status,
      servicoNome: servicos.nome,
      servicoPreco: servicos.preco,
      prestadorNome: usuarios.nome,
      avaliacaoNota: avaliacoes.notaParaPrestador,
      avaliacaoComentario: avaliacoes.comentarioPrestador,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .leftJoin(avaliacoes, eq(avaliacoes.agendamentoId, agendamentos.id))
    .where(eq(agendamentos.clienteId, usuario.id))
    .orderBy(asc(agendamentos.dataHora));
}

export async function listarAgendamentosPorPrestador(prestadorId: number) {
  return await db
    .select({
      dataHora: agendamentos.dataHora,
      status: agendamentos.status,
      servicoId: agendamentos.servicoId,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .where(
      and(
        eq(servicos.prestadorId, Number(prestadorId)),
        gte(agendamentos.dataHora, new Date())
      )
    );
}

export async function buscarAgendamento(id: number) {
  const [agendamento] = await db
    .select()
    .from(agendamentos)
    .where(eq(agendamentos.id, Number(id)))
    .limit(1);

  return agendamento ?? null;
}

export async function atualizarAgendamento(
  id: number,
  { status, dataHora }: { status?: string; dataHora?: string }
) {
  const [atualizado] = await db
    .update(agendamentos)
    .set({
      ...(status && { status }),
      ...(dataHora && { dataHora: new Date(dataHora) }),
    })
    .where(eq(agendamentos.id, Number(id)))
    .returning();

  return atualizado ?? null;
}

export async function deletarAgendamento(id: number) {
  const [deletado] = await db
    .delete(agendamentos)
    .where(eq(agendamentos.id, Number(id)))
    .returning();

  return deletado ?? null;
}
