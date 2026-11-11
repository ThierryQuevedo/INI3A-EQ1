export function desformatarTelefone(valor) {
  return String(valor || '').replace(/\D/g, '').slice(0, 11);
}

// mascara de telefone
export function formatarTelefone(valor) {
  const digitos = desformatarTelefone(valor);
  if (digitos.length === 0) return '';
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7, 11)}`;
}
