// codigos de uso unico em memoria pois roda num processo so
import crypto from 'crypto';

const VALIDADE_MS = 10 * 60 * 1000;
const INTERVALO_REENVIO_MS = 60 * 1000;
const MAXIMO_TENTATIVAS = 5;

const codigos = (globalThis.__marcaaiCodigosVerificacao ??= new Map());

// guarda so o hash
function resumir(chave, codigo) {
  return crypto.createHash('sha256').update(`${chave}:${codigo}`).digest();
}

function removerExpirados(agora) {
  for (const [chave, registro] of codigos) {
    if (registro.expiraEm <= agora) codigos.delete(chave);
  }
}

// codigo de 6 digitos
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

// descarta o codigo
export function descartarCodigo(chave) {
  codigos.delete(chave);
}

// vale uma vez so
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
