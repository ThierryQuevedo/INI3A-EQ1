// Regras de pagamento do Marca Aí. Webhook, consulta periódica e cancelamento
// passam todos por aqui, então o resultado não depende de quem chegou primeiro.
//
// Toda mudança de status é condicional ao status anterior: um webhook repetido
// ou uma corrida com a consulta periódica não produzem efeito duas vezes. Isso
// cobre também o reenvio manual pelo painel da AbacatePay, que gera outro `id`
// de evento e por isso escaparia de um controle baseado só nesse `id`.
import { after } from 'next/server';
import { and, desc, eq, inArray, isNull, lt, ne, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { agendamentos, cobrancas } from '@/db/schema';
import { consultarCobranca, reembolsarCobranca } from './abacatepay.js';
import { notificarPagamentoConfirmado, notificarPagamentoReembolsado } from './notificacoes.js';

const STATUS_DO_PROVEDOR = {
  PENDING: 'pendente',
  PAID: 'pago',
  APPROVED: 'pago',
  EXPIRED: 'expirado',
  CANCELLED: 'cancelado',
  FAILED: 'falhou',
  REFUNDED: 'reembolsado',
  UNDER_DISPUTE: 'em_disputa',
};

// Já houve dinheiro nestes estados: um novo aviso de pagamento não altera nada.
const STATUS_LIQUIDADOS = ['pago', 'reembolsando', 'reembolsado', 'reembolso_falhou', 'em_disputa'];

const INTERVALO_SINCRONIA_MS = 5000;
const REEMBOLSO_TRAVADO_MS = 5 * 60 * 1000;

/** Prioridade para escolher a tentativa que representa o agendamento na tela. */
const PRIORIDADE = ['em_disputa', 'reembolso_falhou', 'reembolsando', 'pago', 'reembolsado', 'pendente', 'criando'];

export function precoEmCentavos(preco) {
  return Math.round(Number(preco) * 100);
}

async function buscarPorId(id) {
  const [linha] = await db.select().from(cobrancas).where(eq(cobrancas.id, id)).limit(1);
  return linha ?? null;
}

export async function listarPagamentosDoAgendamento(agendamentoId) {
  return db
    .select()
    .from(cobrancas)
    .where(eq(cobrancas.agendamentoId, Number(agendamentoId)))
    .orderBy(desc(cobrancas.id));
}

function maisRelevante(linhas) {
  for (const status of PRIORIDADE) {
    const achado = linhas.find((l) => l.status === status);
    if (achado) return achado;
  }
  return null;
}

/** A tentativa que representa o agendamento, ou null se nenhuma estiver em aberto ou paga. */
export async function pagamentoRelevanteDoAgendamento(agendamentoId) {
  return maisRelevante(await listarPagamentosDoAgendamento(agendamentoId));
}

/** Status de pagamento de vários agendamentos, para a agenda. Sem QR Code ou dados da cobrança. */
export async function resumirPagamentos(agendamentoIds) {
  const resumo = new Map();
  if (agendamentoIds.length === 0) return resumo;

  const linhas = await db
    .select({
      id: cobrancas.id,
      agendamentoId: cobrancas.agendamentoId,
      status: cobrancas.status,
      metodo: cobrancas.metodo,
      comprovanteUrl: cobrancas.comprovanteUrl,
    })
    .from(cobrancas)
    .where(inArray(cobrancas.agendamentoId, agendamentoIds))
    .orderBy(desc(cobrancas.id));

  const porAgendamento = new Map();
  for (const linha of linhas) {
    if (!porAgendamento.has(linha.agendamentoId)) porAgendamento.set(linha.agendamentoId, []);
    porAgendamento.get(linha.agendamentoId).push(linha);
  }
  for (const [agendamentoId, doAgendamento] of porAgendamento) {
    const relevante = maisRelevante(doAgendamento);
    if (relevante) resumo.set(agendamentoId, relevante);
  }
  return resumo;
}

/**
 * Registra o pagamento. O primeiro a pagar vale. Se o agendamento já foi
 * cancelado, ou se outra cobrança dele já foi paga (ex.: o cliente abriu um PIX,
 * trocou para boleto e pagou os dois), o valor volta automaticamente.
 *
 * Trava a linha do agendamento para não correr junto com um cancelamento.
 */
export async function confirmarPagamento(pagamentoId, { comprovanteUrl } = {}) {
  const resultado = await db.transaction(async (tx) => {
    const [atual] = await tx
      .select({ status: cobrancas.status, agendamentoId: cobrancas.agendamentoId })
      .from(cobrancas)
      .where(eq(cobrancas.id, pagamentoId))
      .limit(1);
    if (!atual || STATUS_LIQUIDADOS.includes(atual.status)) return null;

    const [agendamento] = await tx
      .select({ status: agendamentos.status })
      .from(agendamentos)
      .where(eq(agendamentos.id, atual.agendamentoId))
      .for('update');

    const [outroPago] = await tx
      .select({ id: cobrancas.id })
      .from(cobrancas)
      .where(
        and(
          eq(cobrancas.agendamentoId, atual.agendamentoId),
          ne(cobrancas.id, pagamentoId),
          inArray(cobrancas.status, ['pago', 'em_disputa'])
        )
      )
      .limit(1);

    const agora = new Date();
    const dados = { pagoEm: agora, atualizadoEm: agora, erro: null, ...(comprovanteUrl ? { comprovanteUrl } : {}) };

    if (agendamento?.status === 'cancelado' || outroPago) {
      await tx.update(cobrancas).set({ ...dados, status: 'reembolsando' }).where(eq(cobrancas.id, pagamentoId));
      return {
        acao: 'devolver',
        motivo: outroPago ? 'Pagamento em duplicidade.' : 'Agendamento já estava cancelado.',
      };
    }

    // Libera o índice de "um ativo por agendamento" antes de marcar como pago.
    await tx
      .update(cobrancas)
      .set({ status: 'cancelado', atualizadoEm: agora })
      .where(
        and(
          eq(cobrancas.agendamentoId, atual.agendamentoId),
          ne(cobrancas.id, pagamentoId),
          inArray(cobrancas.status, ['criando', 'pendente'])
        )
      );
    await tx.update(cobrancas).set({ ...dados, status: 'pago' }).where(eq(cobrancas.id, pagamentoId));
    return { acao: 'confirmar', agendamentoId: atual.agendamentoId };
  });

  if (resultado?.acao === 'confirmar') {
    after(() => notificarPagamentoConfirmado(resultado.agendamentoId));
  } else if (resultado?.acao === 'devolver') {
    await executarReembolso(pagamentoId, resultado.motivo);
  }
}

/** Fala com a AbacatePay. Quem chama já deixou a linha em `reembolsando`. */
async function executarReembolso(pagamentoId, motivo) {
  const pagamento = await buscarPorId(pagamentoId);
  if (!pagamento) return false;

  const falhar = async (erro) => {
    console.error(`[pagamentos] reembolso do pagamento ${pagamentoId} falhou: ${erro}`);
    await db
      .update(cobrancas)
      .set({ status: 'reembolso_falhou', erro: String(erro).slice(0, 500), atualizadoEm: new Date() })
      .where(and(eq(cobrancas.id, pagamentoId), eq(cobrancas.status, 'reembolsando')));
    return false;
  };

  if (pagamento.metodo === 'boleto') {
    return falhar('Boleto não pode ser reembolsado pela API: devolver pelo painel da AbacatePay.');
  }
  if (!pagamento.provedorId) return falhar('Cobrança sem identificador na AbacatePay.');

  try {
    await reembolsarCobranca(pagamento.provedorId, motivo);
  } catch (erro) {
    // Repetir um reembolso que já saiu responde 400 com esta mensagem.
    if (!/j[aá] foi reembolsada/i.test(erro?.message ?? '')) return falhar(erro?.message ?? erro);
  }

  await marcarReembolsado(pagamentoId);
  return true;
}

async function marcarReembolsado(pagamentoId) {
  const agora = new Date();
  const linhas = await db
    .update(cobrancas)
    .set({ status: 'reembolsado', reembolsadoEm: agora, atualizadoEm: agora, erro: null })
    .where(and(eq(cobrancas.id, pagamentoId), ne(cobrancas.status, 'reembolsado')))
    .returning({ agendamentoId: cobrancas.agendamentoId });

  if (linhas.length > 0) after(() => notificarPagamentoReembolsado(linhas[0].agendamentoId));
}

/** Atualiza a linha conforme o status informado pela AbacatePay (webhook ou consulta). */
export async function aplicarStatusDoProvedor(pagamento, statusProvedor, { comprovanteUrl } = {}) {
  const novo = STATUS_DO_PROVEDOR[statusProvedor];
  if (!novo) {
    console.warn(`[pagamentos] status desconhecido da AbacatePay: ${statusProvedor}`);
    return;
  }

  const agora = new Date();
  switch (novo) {
    case 'pago':
      await confirmarPagamento(pagamento.id, { comprovanteUrl });
      break;
    case 'reembolsado':
      await marcarReembolsado(pagamento.id);
      break;
    case 'em_disputa':
      await db
        .update(cobrancas)
        .set({ status: 'em_disputa', atualizadoEm: agora })
        .where(and(eq(cobrancas.id, pagamento.id), inArray(cobrancas.status, ['pago', 'reembolsando', 'reembolso_falhou'])));
      break;
    case 'expirado':
    case 'cancelado':
    case 'falhou':
      await db
        .update(cobrancas)
        .set({ status: novo, atualizadoEm: agora })
        .where(and(eq(cobrancas.id, pagamento.id), inArray(cobrancas.status, ['criando', 'pendente'])));
      break;
    default:
      break;
  }
}

/**
 * Pergunta à AbacatePay como está a cobrança. É a reserva para o webhook não
 * entregue, e o caminho em desenvolvimento, onde o webhook não alcança o localhost.
 * Uma falha aqui só adia a resposta: a próxima consulta tenta de novo.
 */
export async function sincronizarPagamento(pagamento) {
  if (!pagamento.provedorId || !['pendente', 'criando'].includes(pagamento.status)) return pagamento;

  const ultima = pagamento.sincronizadoEm?.getTime() ?? 0;
  if (Date.now() - ultima < INTERVALO_SINCRONIA_MS) return pagamento;

  await db.update(cobrancas).set({ sincronizadoEm: new Date() }).where(eq(cobrancas.id, pagamento.id));

  try {
    const cobranca = await consultarCobranca(pagamento.provedorId);
    await aplicarStatusDoProvedor(pagamento, cobranca.status, { comprovanteUrl: cobranca.receiptUrl });
  } catch (erro) {
    console.warn(`[pagamentos] consulta do pagamento ${pagamento.id} falhou: ${erro?.message ?? erro}`);
  }
  return (await buscarPorId(pagamento.id)) ?? pagamento;
}

/**
 * Chamado depois que o agendamento vira `cancelado`: encerra cobranças abertas e
 * devolve o que já foi pago. Se um pagamento chegar depois disto,
 * `confirmarPagamento` enxerga o cancelamento e devolve também.
 *
 * Devolve `'reembolsado'`, `'reembolso_falhou'` ou null quando não havia pagamento.
 */
export async function encerrarPagamentosDoAgendamento(agendamentoId, motivo) {
  const agora = new Date();
  await db
    .update(cobrancas)
    .set({ status: 'cancelado', atualizadoEm: agora })
    .where(and(eq(cobrancas.agendamentoId, agendamentoId), inArray(cobrancas.status, ['criando', 'pendente'])));

  const pagos = await db
    .update(cobrancas)
    .set({ status: 'reembolsando', atualizadoEm: agora })
    .where(and(eq(cobrancas.agendamentoId, agendamentoId), eq(cobrancas.status, 'pago')))
    .returning({ id: cobrancas.id });

  if (pagos.length === 0) return null;

  const resultados = await Promise.all(
    pagos.map((p) => executarReembolso(p.id, motivo || 'Agendamento cancelado.'))
  );
  return resultados.every(Boolean) ? 'reembolsado' : 'reembolso_falhou';
}

/** Versão para a tela de cancelamento: nunca lança e devolve o texto a mostrar. */
export async function encerrarPagamentosComAviso(agendamentoId, motivo) {
  let reembolso;
  try {
    reembolso = await encerrarPagamentosDoAgendamento(agendamentoId, motivo);
  } catch (erro) {
    console.error(`[pagamentos] falha ao encerrar pagamentos do agendamento ${agendamentoId}:`, erro);
    reembolso = 'reembolso_falhou';
  }

  if (reembolso === 'reembolsado') {
    return { aviso: 'Agendamento cancelado e pagamento reembolsado.', reembolsoFalhou: false };
  }
  if (reembolso === 'reembolso_falhou') {
    return {
      aviso: 'Agendamento cancelado, mas o reembolso ainda não saiu. Acompanhe na sua agenda.',
      reembolsoFalhou: true,
    };
  }
  return { aviso: null, reembolsoFalhou: false };
}

/** Nova tentativa de uma devolução que falhou ou ficou travada por uma queda do servidor. */
export async function repetirReembolso(agendamentoId) {
  const limite = new Date(Date.now() - REEMBOLSO_TRAVADO_MS);
  const linhas = await db
    .update(cobrancas)
    .set({ status: 'reembolsando', atualizadoEm: new Date() })
    .where(
      and(
        eq(cobrancas.agendamentoId, agendamentoId),
        ne(cobrancas.metodo, 'boleto'),
        or(
          eq(cobrancas.status, 'reembolso_falhou'),
          and(eq(cobrancas.status, 'reembolsando'), lt(cobrancas.atualizadoEm, limite))
        )
      )
    )
    .returning({ id: cobrancas.id });

  if (linhas.length === 0) return null;
  const resultados = await Promise.all(linhas.map((p) => executarReembolso(p.id, 'Agendamento cancelado.')));
  return resultados.every(Boolean) ? 'reembolsado' : 'reembolso_falhou';
}

const EVENTOS_TRATADOS = ['transparent.completed', 'transparent.refunded', 'transparent.disputed'];

/**
 * Processa um evento já autenticado pela rota. Valor e ambiente são conferidos
 * contra o que foi gravado na criação: um evento de teste não quita cobrança real.
 * Só lança em falha temporária (banco fora do ar), para a AbacatePay reenviar.
 */
export async function processarEventoWebhook(evento) {
  if (!EVENTOS_TRATADOS.includes(evento?.event)) return;

  const cobranca = evento.data?.transparent;
  if (!cobranca?.id) {
    console.warn('[pagamentos] webhook sem data.transparent.id');
    return;
  }

  const pagamento = await localizarPagamentoDoEvento(cobranca);
  if (!pagamento) {
    console.warn(`[pagamentos] webhook ${evento.id} de cobrança desconhecida: ${cobranca.id}`);
    return;
  }

  const modoTeste = Boolean(evento.devMode);
  if (pagamento.modoTeste !== null && pagamento.modoTeste !== modoTeste) {
    console.warn(`[pagamentos] webhook ${evento.id} de outro ambiente ignorado (pagamento ${pagamento.id}).`);
    return;
  }
  if (Number(cobranca.amount) !== pagamento.valorCentavos) {
    console.error(
      `[pagamentos] webhook ${evento.id} com valor divergente: ${cobranca.amount} em vez de ${pagamento.valorCentavos} (pagamento ${pagamento.id}).`
    );
    return;
  }

  await aplicarStatusDoProvedor(pagamento, cobranca.status, { comprovanteUrl: cobranca.receiptUrl });
}

/**
 * Procura pelo id da cobrança e, se não achar, pela metadata: o cartão pode ser
 * aprovado e avisar antes de a resposta da criação ser gravada, e um timeout na
 * criação deixa a linha sem id. Nesse caso o id é preenchido aqui.
 */
async function localizarPagamentoDoEvento(cobranca) {
  const [porId] = await db.select().from(cobrancas).where(eq(cobrancas.provedorId, cobranca.id)).limit(1);
  if (porId) return porId;

  const pagamentoId = Number(cobranca.metadata?.pagamentoId);
  if (!Number.isInteger(pagamentoId) || pagamentoId <= 0) return null;

  const [vinculado] = await db
    .update(cobrancas)
    .set({ provedorId: cobranca.id, modoTeste: sql`coalesce(${cobrancas.modoTeste}, ${Boolean(cobranca.devMode)})` })
    .where(and(eq(cobrancas.id, pagamentoId), isNull(cobrancas.provedorId)))
    .returning();
  return vinculado ?? null;
}
