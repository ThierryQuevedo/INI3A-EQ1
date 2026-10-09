import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function mesmoDiaCalendario(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "Hoje às 14h", "Amanhã às 9h" ou "12 de dez às 9h" — recebe o ISO de calcularProximosHorariosLivres. */
export default function AvailabilityBadge({ proximoHorario, className }) {
  if (!proximoHorario) return null;
  const data = new Date(proximoHorario);
  if (Number.isNaN(data.getTime())) return null;

  const hora = `${String(data.getHours()).padStart(2, "0")}:${String(data.getMinutes()).padStart(2, "0")}`;
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  let texto;
  if (mesmoDiaCalendario(data, hoje)) texto = `Hoje às ${hora}`;
  else if (mesmoDiaCalendario(data, amanha)) texto = `Amanhã às ${hora}`;
  else texto = `${data.getDate()} de ${MESES[data.getMonth()]} às ${hora}`;

  return (
    <span className={cn("inline-flex items-center gap-1 text-caption font-semibold text-success", className)}>
      <Clock size={13} aria-hidden="true" />
      {texto}
    </span>
  );
}
