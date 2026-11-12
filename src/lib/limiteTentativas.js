// Limite simples de tentativas por chave (ex.: login por e-mail e por IP).
//
// Fica na memória do servidor, no mesmo esquema de lib/codigoVerificacao.js:
// o app roda num único processo (pm2 em modo fork). Um reinício zera os
// contadores, o que é aceitável para frear força bruta. Se um dia houver mais
// de um processo, isto precisa ir para o banco.
import { headers } from 'next/headers';

const registros = (globalThis.__marcaaiLimiteTentativas ??= new Map());

function limpar(agora) {
  for (const [chave, registro] of registros) {
    if (registro.expiraEm <= agora) registros.delete(chave);
  }
}

/**
 * Diz se a chave ainda pode tentar. Devolve `{ bloqueado: false }` ou
 * `{ bloqueado: true, aguardarMinutos }`.
 */
export function verificarLimite(chave, { maximo }) {
  const agora = Date.now();
  limpar(agora);
  const registro = registros.get(chave);
  if (registro && registro.falhas >= maximo) {
    return { bloqueado: true, aguardarMinutos: Math.ceil((registro.expiraEm - agora) / 60000) };
  }
  return { bloqueado: false };
}

/** Conta uma falha. A janela começa na primeira falha e dura `janelaMs`. */
export function registrarFalha(chave, { janelaMs }) {
  const agora = Date.now();
  const registro = registros.get(chave);
  if (!registro || registro.expiraEm <= agora) {
    registros.set(chave, { falhas: 1, expiraEm: agora + janelaMs });
    return;
  }
  registro.falhas += 1;
}

/** Zera a chave (ex.: login bem-sucedido). */
export function limparFalhas(chave) {
  registros.delete(chave);
}

/** IP de quem fez a requisição. Atrás do proxy Apache, vem no X-Forwarded-For. */
export async function ipDaRequisicao() {
  const h = await headers();
  const encaminhado = h.get('x-forwarded-for');
  if (encaminhado) return encaminhado.split(',')[0].trim();
  return h.get('x-real-ip') || 'desconhecido';
}
