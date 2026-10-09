const formatador = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarPreco(valor) {
  return formatador.format(Number(valor) || 0);
}

export default function PriceTag({ valor, className }) {
  return <span className={className}>{formatarPreco(valor)}</span>;
}
