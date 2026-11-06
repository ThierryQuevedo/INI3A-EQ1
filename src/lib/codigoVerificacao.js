// Códigos de uso único para confirmar ações sensíveis (ex.: excluir um serviço).
//
// Ficam na memória do servidor, sem tabela nova: o app roda em um único processo
// (pm2 em modo fork) e um código perdido num reinício só precisa ser pedido de
// novo. Se um dia houver mais de um processo, isto precisa ir para o banco.
// O `globalThis` mantém os códigos quando o `next dev` recarrega este módulo.
import crypto from 'crypto';

const VALIDADE_MS = 10 * 60 * 1000;
const INTERVALO_REENVIO_MS = 60 * 1000;
const MAXIMO_TENTATIVAS = 5;

const codigos = (globalThis.__marcaaiCodigosVerificacao ??= new Map());

// Guarda só o resumo: o código em si existe apenas no e-mail enviado.
function resumir(chave, codigo) {
  return crypto.createHash('sha256').update(`${chave}:${codigo}`).digest();
}

function removerExpirados(agora) {
  for (const [chave, registro] of codigos) {
    if (registro.expiraEm <= agora) codigos.delete(chave);
  }
}

/** Gera um código de 6 dígitos. Devolve `{ codigo }` ou `{ aguardarSegundos }` se foi pedido há pouco. */
export function criarCodigo(chave) {
  const agora = Date.now();
  removerExpirados(agora);

  const atual = codigos.get(chave);
  if (atual && agora - atual.criadoEm < INTERVALO_REENVIO_MS) {
    return { aguardarSegundos: Math.ceil((atual.criadoEm + INTERVALO_REENVIO_MS - agora) / 1000) };
  }

  const codigo = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  codigos.set(chave, {
    resumo: resumir(chave, codigo),
    criadoEm: agora,
    expiraEm: agora + VALIDADE_MS,
    tentativas: 0,
  });
  return { codigo };
}

/** Descarta o código sem usar (ex.: o e-mail não pôde ser enviado). */
export function descartarCodigo(chave) {
  codigos.delete(chave);
}

/** Confere o código, que só vale uma vez. Devolve `{ valido: true }` ou `{ erro }`. */
export function conferirCodigo(chave, codigo) {
  const registro = codigos.get(chave);

  if (!registro || registro.expiraEm <= Date.now()) {
    codigos.delete(chave);
    return { erro: 'Este código expirou. Peça um novo.' };
  }

  const correto = crypto.timingSafeEqual(registro.resumo, resumir(chave, String(codigo ?? '').trim()));
  if (correto) {
    codigos.delete(chave);
    return { valido: true };
  }

  registro.tentativas += 1;
  if (registro.tentativas >= MAXIMO_TENTATIVAS) {
    codigos.delete(chave);
    return { erro: 'Muitas tentativas erradas. Peça um novo código.' };
  }
  return { erro: 'Código incorreto. Confira o e-mail e tente de novo.' };
}
