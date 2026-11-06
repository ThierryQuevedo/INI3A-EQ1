'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, inArray, lt } from 'drizzle-orm';
import { db } from '@/db';
import { agendamentos, cobrancas, servicos } from '@/db/schema';
import { getSession } from './auth.actions';
import { criarCobranca, ErroAbacatePay, simularPagamentoPix } from '@/lib/abacatepay';
import { documentoValido, somenteDigitos } from '@/lib/documentoFiscal';
import { hojeNoFuso, somarDias } from '@/lib/formatoData';
import {
  aplicarStatusDoProvedor,
  pagamentoRelevanteDoAgendamento,
  precoEmCentavos,
  repetirReembolso,
  sincronizarPagamento,
} from '@/lib/pagamentos';
import { boletoDisponivelPara } from '@/lib/statusPagamento';

const METODOS = ['pix', 'boleto', 'cartao'];
const VALOR_MINIMO_CENTAVOS = 100; // Limite da AbacatePay.
const PIX_EXPIRA_EM_SEGUNDOS = 60 * 60;
const DIAS_VENCIMENTO_BOLETO = 3;
// Depois disso, uma tentativa sem resposta deixa de bloquear novas tentativas.
const CRIACAO_TRAVADA_MS = 10 * 60 * 1000;

const SESSAO_EXPIRADA = { erro: 'Sua sessão expirou. Entre de novo para continuar.', codigo: 'sessao' };

/** O que pode ir para o navegador. Nunca envia taxa, erro interno ou id de pagamento. */
function paraTela(p) {
  if (!p) return null;
  return {
    status: p.status,
    metodo: p.metodo,
    valorCentavos: p.valorCentavos,
    pixCopiaECola: p.pixCopiaECola,
    pixQrCode: p.pixQrCode,
    boletoLinhaDigitavel: p.boletoLinhaDigitavel,
    boletoUrl: p.boletoUrl,
    comprovanteUrl: p.comprovanteUrl,
    cartaoBandeira: p.cartaoBandeira,
    cartaoFinal: p.cartaoFinal,
    modoTeste: Boolean(p.modoTeste),
    expiraEm: p.expiraEm?.toISOString() ?? null,
  };
}

function revalidarTelas(agendamentoId) {
  revalidatePath('/agendamentos');
  revalidatePath(`/agendamentos/${agendamentoId}/pagamento`);
}

async function buscarAgendamento(agendamentoId) {
  const id = Number(agendamentoId);
  if (!Number.isInteger(id) || id <= 0) return null;

  const [agendamento] = await db
    .select({
      id: agendamentos.id,
      clienteId: agendamentos.clienteId,
      status: agendamentos.status,
      dataHora: agendamentos.dataHora,
      servicoNome: servicos.nome,
      preco: servicos.preco,
      prestadorId: servicos.prestadorId,
    })
    .from(agendamentos)
    .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
    .where(eq(agendamentos.id, id))
    .limit(1);

  return agendamento ?? null;
}

/** Monta o `customer`. O CPF só atravessa esta função: não é gravado no banco. */
function montarPagador(metodo, usuario, pagador) {
  if (metodo === 'pix') return { cliente: undefined };

  const documento = somenteDigitos(pagador?.documento);
  if (!documentoValido(documento)) return { erro: 'Confira o CPF ou CNPJ informado.' };

  const cliente = { name: usuario.nome, email: usuario.email, taxId: documento };

  const celular = somenteDigitos(pagador?.celular || usuario.telefone);
  if (metodo === 'cartao' && (celular.length < 10 || celular.length > 11)) {
    return { erro: 'Informe um celular com DDD.' };
  }
  if (celular.length >= 10) cliente.cellphone = celular;

  return { cliente };
}

function dadosDaCobranca(cobranca) {
  return {
    provedorId: cobranca.id,
    taxaCentavos: cobranca.platformFee ?? null,
    pixCopiaECola: cobranca.brCode ?? null,
    pixQrCode: cobranca.brCodeBase64 ?? null,
    boletoLinhaDigitavel: cobranca.barCode ?? null,
    boletoUrl: cobranca.url ?? null,
    comprovanteUrl: cobranca.receiptUrl ?? null,
    cartaoBandeira: cobranca.brand ?? null,
    cartaoFinal: cobranca.lastFour ?? null,
    modoTeste: Boolean(cobranca.devMode),
    expiraEm: cobranca.expiresAt ? new Date(cobranca.expiresAt) : null,
    atualizadoEm: new Date(),
  };
}

/**
 * Inicia o pagamento de um agendamento confirmado. O valor vem sempre do banco,
 * nunca do navegador. A tentativa é reservada antes de chamar a AbacatePay:
 * o índice único impede abrir duas cobranças com dois cliques ou duas abas.
 */
export async function iniciarPagamentoAction({ agendamentoId, metodo, pagador, token }) {
  const usuario = await getSession();
  if (!usuario) return SESSAO_EXPIRADA;

  if (!METODOS.includes(metodo)) return { erro: 'Escolha uma forma de pagamento.' };

  const agendamento = await buscarAgendamento(agendamentoId);
  if (!agendamento || agendamento.clienteId !== usuario.id) return { erro: 'Agendamento não encontrado.' };
  if (agendamento.status !== 'confirmado') {
    return { erro: 'O pagamento só fica disponível enquanto o agendamento está confirmado.' };
  }

  const valorCentavos = precoEmCentavos(agendamento.preco);
  if (!(valorCentavos >= VALOR_MINIMO_CENTAVOS)) {
    return { erro: 'Este serviço não pode ser pago pelo app: o valor mínimo é R$ 1,00.' };
  }

  if (metodo === 'boleto' && !boletoDisponivelPara(agendamento.dataHora)) {
    return { erro: 'Boleto não fica disponível tão perto do horário. Use PIX ou cartão.' };
  }
  if (metodo === 'cartao' && !token) return { erro: 'Confira os dados do cartão.' };

  const { cliente, erro: erroPagador } = montarPagador(metodo, usuario, pagador);
  if (erroPagador) return { erro: erroPagador };

  // Trata uma tentativa que já exista antes de abrir outra.
  await db
    .update(cobrancas)
    .set({ status: 'falhou', erro: 'Criação sem resposta.', atualizadoEm: new Date() })
    .where(
      and(
        eq(cobrancas.agendamentoId, agendamento.id),
        eq(cobrancas.status, 'criando'),
        lt(cobrancas.criadoEm, new Date(Date.now() - CRIACAO_TRAVADA_MS))
      )
    );

  let atual = await pagamentoRelevanteDoAgendamento(agendamento.id);
  if (atual) atual = await sincronizarPagamento(atual);

  if (atual) {
    if (atual.status === 'pago') return { erro: null, sucesso: true, pagamento: paraTela(atual) };
    if (atual.status === 'criando') {
      return { erro: 'Já estamos processando um pagamento deste agendamento. Aguarde alguns minutos antes de tentar de novo.' };
    }
    if (atual.status === 'pendente') {
      if (atual.metodo === 'cartao') {
        return { erro: 'O pagamento no cartão está em análise. Aguarde a resposta antes de tentar de novo.' };
      }
      const venceu = atual.expiraEm && atual.expiraEm <= new Date();
      if (atual.metodo === metodo && !venceu) return { erro: null, sucesso: true, pagamento: paraTela(atual) };

      // Troca de método ou cobrança vencida. Se a antiga ainda for paga, o valor é devolvido.
      await db
        .update(cobrancas)
        .set({ status: 'cancelado', atualizadoEm: new Date() })
        .where(and(eq(cobrancas.id, atual.id), eq(cobrancas.status, 'pendente')));
    } else if (['reembolsando', 'reembolsado', 'reembolso_falhou', 'em_disputa'].includes(atual.status)) {
      return { erro: 'Este agendamento já teve um pagamento encerrado. Fale com o suporte.' };
    }
  }

  // Data vinda daqui, não do defaultNow(): a coluna não tem fuso, e o defaultNow()
  // grava a hora local do banco. Comparada com um Date, ela pareceria horas mais
  // velha, a trava de 10 minutos cairia e um cartão sem resposta poderia ser cobrado de novo.
  const agora = new Date();
  const [reserva] = await db
    .insert(cobrancas)
    .values({ agendamentoId: agendamento.id, metodo, valorCentavos, status: 'criando', criadoEm: agora, atualizadoEm: agora })
    .onConflictDoNothing()
    .returning();

  if (!reserva) return { erro: 'Já estamos processando um pagamento deste agendamento. Atualize a página.' };

  let cobranca;
  try {
    cobranca = await criarCobranca({
      metodo,
      valorCentavos,
      descricao: `Marca Aí: ${agendamento.servicoNome}`,
      externalId: `marcaai-pagamento-${reserva.id}`,
      metadata: { pagamentoId: String(reserva.id), agendamentoId: String(agendamento.id) },
      cliente,
      token: metodo === 'cartao' ? token : undefined,
      expiraEmSegundos: metodo === 'pix' ? PIX_EXPIRA_EM_SEGUNDOS : undefined,
      vencimento: metodo === 'boleto' ? somarDias(hojeNoFuso(), DIAS_VENCIMENTO_BOLETO) : undefined,
    });
  } catch (erro) {
    console.error(`[pagamentos] criação do pagamento ${reserva.id} falhou: ${erro?.message ?? erro}`);

    // Cartão sem resposta pode ter sido aprovado: a linha continua em `criando`,
    // o que bloqueia uma segunda cobrança até o webhook responder (via metadata).
    if (metodo === 'cartao' && erro instanceof ErroAbacatePay && erro.incerto) {
      return {
        erro: 'Não recebemos a resposta da operadora. Não pague de novo agora: confira seu extrato ou volte em alguns minutos.',
        codigo: 'incerto',
      };
    }

    await db
      .update(cobrancas)
      .set({ status: 'falhou', erro: String(erro?.message ?? erro).slice(0, 500), atualizadoEm: new Date() })
      .where(eq(cobrancas.id, reserva.id));

    return {
      erro:
        metodo === 'cartao'
          ? 'Não foi possível processar o pagamento com este cartão. Confira os dados ou use outra forma de pagamento.'
          : 'Não foi possível gerar a cobrança agora. Tente de novo em instantes.',
    };
  }

  // Só sai de `criando` se ninguém mexeu na linha enquanto a API respondia (ex.:
  // agendamento cancelado). Os dados são gravados de qualquer forma, para um
  // pagamento tardio ainda ser reconhecido e devolvido.
  await db.update(cobrancas).set(dadosDaCobranca(cobranca)).where(eq(cobrancas.id, reserva.id));
  await db
    .update(cobrancas)
    .set({ status: 'pendente' })
    .where(and(eq(cobrancas.id, reserva.id), eq(cobrancas.status, 'criando')));

  await aplicarStatusDoProvedor(reserva, cobranca.status, { comprovanteUrl: cobranca.receiptUrl });

  const [final] = await db.select().from(cobrancas).where(eq(cobrancas.id, reserva.id)).limit(1);

  revalidarTelas(agendamento.id);

  if (final.status === 'falhou') {
    return { erro: 'Não foi possível processar o pagamento com este cartão. Confira os dados ou use outra forma de pagamento.' };
  }
  return { erro: null, sucesso: true, pagamento: paraTela(final) };
}

/** Consulta periódica da tela de pagamento. Só fala com a AbacatePay se ainda estiver em aberto. */
export async function consultarPagamentoAction(agendamentoId) {
  const usuario = await getSession();
  if (!usuario) return SESSAO_EXPIRADA;

  const agendamento = await buscarAgendamento(agendamentoId);
  if (!agendamento || agendamento.clienteId !== usuario.id) return { erro: 'Agendamento não encontrado.' };

  const atual = await pagamentoRelevanteDoAgendamento(agendamento.id);
  if (!atual) return { erro: null, pagamento: null };

  const novo = await sincronizarPagamento(atual);
  if (novo.status !== atual.status) revalidarTelas(agendamento.id);

  return { erro: null, pagamento: paraTela(novo) };
}

/** Botão de teste: só aparece e só funciona em cobrança criada com chave de sandbox. */
export async function simularPagamentoAction(agendamentoId) {
  const usuario = await getSession();
  if (!usuario) return SESSAO_EXPIRADA;

  const agendamento = await buscarAgendamento(agendamentoId);
  if (!agendamento || agendamento.clienteId !== usuario.id) return { erro: 'Agendamento não encontrado.' };

  const [cobranca] = await db
    .select()
    .from(cobrancas)
    .where(
      and(
        eq(cobrancas.agendamentoId, agendamento.id),
        eq(cobrancas.metodo, 'pix'),
        eq(cobrancas.status, 'pendente'),
        eq(cobrancas.modoTeste, true)
      )
    )
    .limit(1);
  if (!cobranca?.provedorId) return { erro: 'Não há PIX de teste em aberto.' };

  try {
    await simularPagamentoPix(cobranca.provedorId);
  } catch (erro) {
    console.error(`[pagamentos] simulação falhou: ${erro?.message ?? erro}`);
    return { erro: 'A simulação não funcionou agora. Tente de novo.' };
  }
  return { erro: null, sucesso: true };
}

/** Nova tentativa de devolução, disponível para os dois lados do agendamento e para o admin. */
export async function tentarReembolsoAction(agendamentoId) {
  const usuario = await getSession();
  if (!usuario) return SESSAO_EXPIRADA;

  const agendamento = await buscarAgendamento(agendamentoId);
  const participa =
    agendamento && (agendamento.clienteId === usuario.id || agendamento.prestadorId === usuario.id || usuario.admin);
  if (!participa) return { erro: 'Agendamento não encontrado.' };

  const resultado = await repetirReembolso(agendamento.id);
  revalidarTelas(agendamento.id);

  if (resultado === 'reembolsado') return { erro: null, sucesso: true };
  return { erro: 'O reembolso ainda não saiu. Tente de novo mais tarde ou fale com o suporte.' };
}

/** Dados iniciais da tela de pagamento. Quem chama já conferiu a sessão. */
export async function carregarTelaDePagamento(agendamentoId) {
  const usuario = await getSession();
  if (!usuario) return null;

  const agendamento = await buscarAgendamento(agendamentoId);
  if (!agendamento || agendamento.clienteId !== usuario.id) return null;

  const atual = await pagamentoRelevanteDoAgendamento(agendamento.id);

  return {
    agendamento: {
      id: agendamento.id,
      status: agendamento.status,
      dataHora: agendamento.dataHora.toISOString(),
      servicoNome: agendamento.servicoNome,
      valorCentavos: precoEmCentavos(agendamento.preco),
    },
    pagamento: paraTela(atual ? await sincronizarPagamento(atual) : null),
    pagador: { nome: usuario.nome, email: usuario.email, telefone: usuario.telefone ?? '' },
    boletoDisponivel: boletoDisponivelPara(agendamento.dataHora),
    // Só existe quando a loja tem cartão liberado. Sem ela, a opção não aparece.
    chavePublicaCartao: process.env.ABACATEPAY_PUBLIC_KEY || null,
  };
}
