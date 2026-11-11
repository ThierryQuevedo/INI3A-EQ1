// Regras de validação dos dados da conta. As mesmas do formulário de cadastro
// (CadastroForm), para o servidor recusar o que a tela recusa: uma action pode
// ser chamada sem passar pela tela.
import { desformatarTelefone } from './formatarTelefone.js';

export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const SENHA_MINIMA = 6;

export function emailValido(email) {
  return REGEX_EMAIL.test(String(email ?? '').trim());
}

/** Fixo (10 dígitos) ou celular (11 dígitos), com DDD. */
export function telefoneValido(telefone) {
  const digitos = desformatarTelefone(telefone);
  return digitos.length === 10 || digitos.length === 11;
}
