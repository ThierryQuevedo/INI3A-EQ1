// mesmas regras do cadastroform
import { desformatarTelefone } from './formatarTelefone.js';

export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const SENHA_MINIMA = 6;

export function emailValido(email) {
  return REGEX_EMAIL.test(String(email ?? '').trim());
}

// fixo ou celular com ddd
export function telefoneValido(telefone) {
  const digitos = desformatarTelefone(telefone);
  return digitos.length === 10 || digitos.length === 11;
}
