// cliente da api v2 da abacatepay so no servidor
import crypto from 'node:crypto';

const URL_PADRAO = 'https://api.abacatepay.com/v2';
const TEMPO_LIMITE_MS = 20000;

// chave publica para validar a assinatura do webhook
// https://docs.abacatepay.com/pages/webhooks/security
const CHAVE_ASSINATURA_WEBHOOK =
  't9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9';

const METODO_NA_API = { pix: 'PIX', boleto: 'BOLETO', cartao: 'CARD' };

// incerto quer dizer que a cobranca pode ter sido criada
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

  // a doc manda olhar success
  if (resposta.ok && json?.success && json.data) return json.data;

  throw new ErroAbacatePay(json?.error || `Resposta HTTP ${resposta.status}`, {
    status: resposta.status,
    incerto: resposta.status >= 500 || !json,
  });
}

// cliente opcional no pix e token so no cartao
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

// pix tem rota propria de consulta
export function consultarCobranca(provedorId) {
  const id = encodeURIComponent(provedorId);
  return chamar(provedorId.startsWith('pix_') ? `/transparents/check?id=${id}` : `/transparents/get?id=${id}`);
}

// so reembolso total
export function reembolsarCobranca(provedorId, motivo) {
  return chamar('/transparents/refund', {
    method: 'POST',
    corpo: { id: provedorId, ...(motivo ? { reason: motivo.slice(0, 500) } : {}) },
  });
}

// so com chave de teste
export function simularPagamentoPix(provedorId) {
  return chamar(`/transparents/simulate-payment?id=${encodeURIComponent(provedorId)}`, { method: 'POST' });
}

function iguaisEmTempoConstante(a, b) {
  // hash iguala os tamanhos para o timingsafeequal
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// secret da url prova a origem
export function segredoWebhookConfere(recebido, esperado) {
  return Boolean(recebido && esperado) && iguaisEmTempoConstante(recebido, esperado);
}

// assinatura prova que o corpo nao mudou
export function assinaturaWebhookConfere(corpoBruto, assinatura) {
  if (!assinatura) return false;
  const esperada = crypto
    .createHmac('sha256', CHAVE_ASSINATURA_WEBHOOK)
    .update(Buffer.from(corpoBruto, 'utf8'))
    .digest('base64');
  return iguaisEmTempoConstante(esperada, assinatura);
}
