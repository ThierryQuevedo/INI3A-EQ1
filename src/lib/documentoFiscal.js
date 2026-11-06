// Validação de CPF e CNPJ pelos dígitos verificadores.

export function somenteDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

function digitoVerificador(digitos, pesos) {
  const soma = pesos.reduce((total, peso, i) => total + Number(digitos[i]) * peso, 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function cpfValido(valor) {
  const d = somenteDigitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const pesos1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [11, ...pesos1];
  return digitoVerificador(d, pesos1) === Number(d[9]) && digitoVerificador(d, pesos2) === Number(d[10]);
}

export function cnpjValido(valor) {
  const d = somenteDigitos(valor);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, ...pesos1];
  return digitoVerificador(d, pesos1) === Number(d[12]) && digitoVerificador(d, pesos2) === Number(d[13]);
}

export function documentoValido(valor) {
  return somenteDigitos(valor).length > 11 ? cnpjValido(valor) : cpfValido(valor);
}

/** Máscara progressiva: CPF até 11 dígitos, CNPJ a partir do 12º. */
export function formatarDocumento(valor) {
  const d = somenteDigitos(valor).slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
  }
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}
