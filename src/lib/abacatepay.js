// Cliente da API v2 da AbacatePay (checkout transparente). Só roda no servidor:
// a chave de API nunca pode chegar ao navegador.
// O ambiente (teste ou produção) é decidido pela chave, não pela URL.
import crypto from 'node:crypto';

const URL_PADRAO = 'https://api.abacatepay.com/v2';
const TEMPO_LIMITE_MS = 20000;

// Chave publicada pela AbacatePay para validar X-Webhook-Signature. É pública e
// igual para todas as contas: https://docs.abacatepay.com/pages/webhooks/security
const CHAVE_ASSINATURA_WEBHOOK =
  't9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9';

const METODO_NA_API = { pix: 'PIX', boleto: 'BOLETO', cartao: 'CARD' };

/**
 * `incerto` indica que a cobrança pode ter sido criada mesmo com a falha
 * (timeout, queda de rede, erro 5xx). A documentação avisa: timeout não é recusa.
 */
export class ErroAbacatePay extends Error {
  constructor(mensagem, { status = null, incerto = false } = {}) {
    super(mensagem);
    this.name = 'ErroAbacatePay';
    this.status = status;
    this.incerto = incerto;
  }
}

async function chamar(caminho, { method = 'GET', corpo } = {}) {
  const chave = process.env.API_KEY_ABACATEPAY;
  if (!chave) throw new ErroAbacatePay('API_KEY_ABACATEPAY não configurada.');

  const base = (process.env.ABACATEPAY_API_URL || URL_PADRAO).replace(/\/+$/, '');

  let resposta;
  try {
    resposta = await fetch(`${base}${caminho}`, {
      method,
      headers: {
        Authorization: `Bearer ${chave}`,
        ...(corpo ? { 'Content-Type': 'application/json' } : {}),
      },
      body: corpo ? JSON.stringify(corpo) : undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    });
  } catch (erro) {
    throw new ErroAbacatePay(`Falha de rede: ${erro?.message ?? erro}`, { incerto: true });
  }

  const json = await resposta.json().catch(() => null);

  // A documentação manda olhar `success`, não só o status HTTP.
  if (resposta.ok && json?.success && json.data) return json.data;

  throw new ErroAbacatePay(json?.error || `Resposta HTTP ${resposta.status}`, {
    status: resposta.status,
    incerto: resposta.status >= 500 || !json,
  });
}

/** Cria a cobrança. `cliente` é opcional só no PIX; `token` é exclusivo do cartão. */
export function criarCobranca({ metodo, valorCentavos, descricao, externalId, metadata, cliente, token, expiraEmSegundos, vencimento }) {
  const data = { amount: valorCentavos, metadata };
  if (descricao) data.description = descricao.slice(0, 500);
  if (externalId) data.externalId = externalId;
  if (cliente) data.customer = cliente;
  if (token) data.token = token;
  if (expiraEmSegundos) data.expiresIn = expiraEmSegundos;
  if (vencimento) data.dueDate = vencimento;

  return chamar('/transparents/create', {
    method: 'POST',
    corpo: { method: METODO_NA_API[metodo], data },
  });
}

/** O PIX tem rota própria de consulta; boleto e cartão usam /transparents/get. */
export function consultarCobranca(provedorId) {
  const id = encodeURIComponent(provedorId);
  return chamar(provedorId.startsWith('pix_') ? `/transparents/check?id=${id}` : `/transparents/get?id=${id}`);
}

/** Só existe reembolso total. Boleto não pode ser reembolsado pela API. */
export function reembolsarCobranca(provedorId, motivo) {
  return chamar('/transparents/refund', {
    method: 'POST',
    corpo: { id: provedorId, ...(motivo ? { reason: motivo.slice(0, 500) } : {}) },
  });
}

/** Só funciona com chave de teste: a própria API recusa em produção. */
export function simularPagamentoPix(provedorId) {
  return chamar(`/transparents/simulate-payment?id=${encodeURIComponent(provedorId)}`, { method: 'POST' });
}

function iguaisEmTempoConstante(a, b) {
  // O hash iguala os tamanhos, exigência do timingSafeEqual.
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/** O secret da URL prova que o evento veio da AbacatePay. */
export function segredoWebhookConfere(recebido, esperado) {
  return Boolean(recebido && esperado) && iguaisEmTempoConstante(recebido, esperado);
}

/** A assinatura prova que o corpo não mudou. Precisa do corpo bruto, antes do JSON.parse. */
export function assinaturaWebhookConfere(corpoBruto, assinatura) {
  if (!assinatura) return false;
  const esperada = crypto
    .createHmac('sha256', CHAVE_ASSINATURA_WEBHOOK)
    .update(Buffer.from(corpoBruto, 'utf8'))
    .digest('base64');
  return iguaisEmTempoConstante(esperada, assinatura);
}
