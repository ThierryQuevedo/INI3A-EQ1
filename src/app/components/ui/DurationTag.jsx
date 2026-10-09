export function formatarDuracao(minutos) {
  const min = Number(minutos) || 0;
  if (min < 60) return `${min} min`;
  const horas = Math.floor(min / 60);
  const resto = min % 60;
  return resto === 0 ? `${horas}h` : `${horas}h ${resto}min`;
}

export default function DurationTag({ minutos, className }) {
  return <span className={className}>{formatarDuracao(minutos)}</span>;
}
