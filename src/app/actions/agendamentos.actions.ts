'use server';

import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { eq, and, gte, asc, isNull, ne, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '@/db';
import { agendamentos, servicos, usuarios, avaliacoes, categorias, disponibilidades, mensagens } from '@/db/schema';
import { getSession } from './auth.actions';
import {
  notificarAgendamentoCancelado,
  notificarAgendamentoConfirmado,
  notificarNovoAgendamento,
  notificarServicoConcluido,
} from '@/lib/notificacoes';
import { buscarMotivosCancelamento, textoDoMotivo } from '@/lib/motivoCancelamento';
import { calcularSlotsLivresDoDia } from '@/lib/disponibilidade';
import { instanteNoFuso, partesNoFuso } from '@/lib/formatoData';

// `usuarios` entra duas vezes no join (cliente e prestador).
const prestadorUsuarios = alias(usuarios, 'prestador_usuarios_agenda');

const TRANSICOES_PERMITIDAS = {
  pendente: ['confirmado', 'cancelado'],
  confirmado: ['concluido', 'cancelado'],
};

const TAMANHO_MAXIMO_MOTIVO = 500;

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
    .select({ id: servicos.id, prestadorId: servicos.prestadorId, duracaoEstimada: servicos.duracaoEstimada })
    .from(servicos)
    .where(and(eq(servicos.id, Number(servicoId)), isNull(servicos.desativadoEm)))
    .limit(1);

  if (!servicoExistente) {
    return { erro: 'Este serviço não está mais disponível.', codigo: 'servico' };
  }

  // Sem isto o prestador marcava o próprio serviço, concluía e se dava nota 5.
  if (servicoExistente.prestadorId === usuario.id) {
    return { erro: 'Você não pode agendar um serviço seu.', codigo: 'invalido' };
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

  // A tela só oferece horários livres, mas a action é um endpoint público: o
  // horário precisa cair numa disponibilidade do serviço e não pode se
  // sobrepor (pela duração) a outro atendimento do prestador. Mesma função
  // de slots da tela de agendar (lib/disponibilidade.js).
  const { dia, hora } = partesNoFuso(agendamentoDate);
  const [dispsDoServico, ocupacao] = await Promise.all([
    db
      .select({
        diaSemana: disponibilidades.diaSemana,
        horaInicio: disponibilidades.horaInicio,
        horaFim: disponibilidades.horaFim,
      })
      .from(disponibilidades)
      .where(
        and(
          eq(disponibilidades.prestadorId, servicoExistente.prestadorId),
          eq(disponibilidades.servicoId, servicoExistente.id)
        )
      ),
    listarOcupacaoDoPrestador(servicoExistente.prestadorId),
  ]);
  // lib/disponibilidade.js é JS: os defaults dos parâmetros confundem o TS, daí o `as any`.
  const slotsLivres = calcularSlotsLivresDoDia({
    dia,
    duracaoEstimada: servicoExistente.duracaoEstimada,
    disponibilidades: dispsDoServico,
    agendados: ocupacao,
  } as any);
  const instanteExato = instanteNoFuso(dia, hora).getTime() === agendamentoDate.getTime();
  if (!instanteExato || !slotsLivres.includes(hora)) {
    return { erro: 'Este horário não está mais disponível. Escolha outro.', codigo: 'ocupado' };
  }

  const [novo] = await db
    .insert(agendamentos)
    .values({
      clienteId: usuario.id,
      servicoId: servicoExistente.id,
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
    .where(and(eq(servicos.id, id), isNull(servicos.desativadoEm)))
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

/**
 * Muda o status de um agendamento e devolve `{ erro }` para a tela explicar
 * quando não deu. As regras ficam aqui, não só no botão: concluir exige que o
 * horário já tenha começado, e cancelar algo já confirmado exige um motivo. O
 * motivo vai para o chat do agendamento e para o aviso enviado ao outro lado.
 */
export async function atualizarStatusAgendamento(id: number, status: string, motivo?: string) {
  const usuario = await getSession();
  if (!usuario) return { erro: 'Sua sessão expirou. Entre de novo para continuar.' };

  const agendamentoId = Number(id);

  const [atual] = await db
    .select({
      status: agendamentos.status,
      dataHora: agendamentos.dataHora,
      clienteId: agendamentos.clienteId,
      prestadorId: servicos.prestadorId,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .where(eq(agendamentos.id, agendamentoId))
    .limit(1);

  if (!atual) return { erro: 'Agendamento não encontrado.' };

  const ehPrestador = atual.prestadorId === usuario.id;
  const ehCliente = atual.clienteId === usuario.id;
  const permitido = status === 'cancelado' ? ehPrestador || ehCliente : ehPrestador;
  if (!permitido) return { erro: 'Você não pode alterar este agendamento.' };

  if (atual.status === status) return { erro: null, sucesso: true };

  if (!TRANSICOES_PERMITIDAS[atual.status]?.includes(status)) {
    return { erro: 'Este agendamento já foi encerrado.' };
  }

  if (status === 'concluido' && atual.dataHora > new Date()) {
    return { erro: 'Só é possível concluir depois que o horário agendado começar.' };
  }

  const motivoLimpo = status === 'cancelado' ? String(motivo ?? '').trim().slice(0, TAMANHO_MAXIMO_MOTIVO) : '';

  if (status === 'cancelado' && atual.status === 'confirmado' && !motivoLimpo) {
    return { erro: 'Conte o motivo para cancelar um agendamento já confirmado.' };
  }

  // A condição no status evita que dois cliques (ou os dois lados ao mesmo
  // tempo) apliquem a mudança e disparem o aviso duas vezes.
  const atualizou = await db.transaction(async (tx) => {
    const linhas = await tx
      .update(agendamentos)
      .set({ status })
      .where(and(eq(agendamentos.id, agendamentoId), eq(agendamentos.status, atual.status)))
      .returning({ id: agendamentos.id });

    if (linhas.length === 0) return false;

    if (motivoLimpo) {
      await tx.insert(mensagens).values({
        agendamentoId,
        remetenteId: usuario.id,
        texto: textoDoMotivo(motivoLimpo),
      });
    }

    return true;
  });

  if (!atualizou) return { erro: 'Este agendamento acabou de mudar. Atualize a página e confira.' };

  switch (status) {
    case 'confirmado':
      after(() => notificarAgendamentoConfirmado(agendamentoId));
      break;
    case 'cancelado':
      after(() =>
        notificarAgendamentoCancelado(agendamentoId, { canceladoPorId: usuario.id, motivo: motivoLimpo })
      );
      break;
    case 'concluido':
      after(() => notificarServicoConcluido(agendamentoId));
      break;
  }

  revalidatePath('/dashboard');
  revalidatePath('/agendamentos');
  revalidatePath('/mensagens');
  return { erro: null, sucesso: true };
}

/**
 * Agenda do usuário logado, nos dois papéis: uma conta de prestador também pode
 * agendar serviços de outros profissionais. `papel` diz de que lado ele está em
 * cada item, e o telefone do cliente só sai para quem atende.
 */
export async function listarMeusAgendamentos() {
  const usuario = await getSession();
  if (!usuario) return [];

  const linhas = await db
    .select({
      id: agendamentos.id,
      dataHora: agendamentos.dataHora,
      status: agendamentos.status,
      clienteId: agendamentos.clienteId,
      servicoNome: servicos.nome,
      servicoPreco: servicos.preco,
      clienteNome: usuarios.nome,
      clienteTelefone: usuarios.telefone,
      prestadorNome: prestadorUsuarios.nome,
      avaliacaoNota: avaliacoes.notaParaPrestador,
      avaliacaoComentario: avaliacoes.comentarioPrestador,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .innerJoin(usuarios, eq(agendamentos.clienteId, usuarios.id))
    .innerJoin(prestadorUsuarios, eq(servicos.prestadorId, prestadorUsuarios.id))
    .leftJoin(avaliacoes, eq(avaliacoes.agendamentoId, agendamentos.id))
    .where(or(eq(servicos.prestadorId, usuario.id), eq(agendamentos.clienteId, usuario.id)))
    .orderBy(asc(agendamentos.dataHora));

  const motivos = await buscarMotivosCancelamento(
    linhas.filter((l) => l.status === 'cancelado').map((l) => l.id)
  );

  return linhas.map(({ clienteId, clienteTelefone, ...item }) => {
    const papel = clienteId === usuario.id ? 'cliente' : 'prestador';
    const cancelamento = motivos.get(item.id);
    return {
      ...item,
      papel,
      clienteTelefone: papel === 'prestador' ? clienteTelefone : null,
      motivoCancelamento: cancelamento?.motivo ?? null,
      motivoFoiMeu: cancelamento?.remetenteId === usuario.id,
    };
  });
}
