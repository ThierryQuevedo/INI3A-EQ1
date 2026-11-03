import Link from "next/link";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { partesNoFuso, formatarDiaCurto, formatarHora, formatarQuandoFalado } from "@/lib/formatoData";

/** Link do atalho: abre a tela de agendar já com dia e hora marcados (A-03). */
export function hrefAtalhoHorario(servicoId, proximoHorario) {
  const { dia, hora } = partesNoFuso(proximoHorario);
  const params = new URLSearchParams({ servico: String(servicoId), data: dia, hora });
  return `/agendamentos/novo/?${params}`;
}

/**
 * Próximo horário livre do serviço (ISO de calcularProximosHorariosLivres),
 * no fuso de Brasília: "Hoje, 14h30" / "Sex, 30 de out, 9h".
 *
 * Com `servicoId` vira o ATALHO (A-03 / C-10 / G-07): um link de 48px que
 * abre a tela de agendar com dia e horário já marcados — só falta "Marcar
 * horário". Hora e dia nunca quebram no meio (G-09). Sem `servicoId`,
 * mostra só o texto.
 */
export default function AvailabilityBadge({ proximoHorario, servicoId, nomeServico, className }) {
  if (!proximoHorario) return null;
  const data = new Date(proximoHorario);
  if (Number.isNaN(data.getTime())) return null;

  const { dia, hora } = partesNoFuso(data);
  const textoDia = formatarDiaCurto(dia);
  const textoHora = formatarHora(hora);

  if (!servicoId) {
    return (
      <span className={cn("inline-flex flex-wrap items-center gap-x-1 text-caption font-semibold text-foreground", className)}>
        <Clock size={14} className="shrink-0 text-primary" aria-hidden="true" />
        <span className="whitespace-nowrap">{textoDia},</span>
        <span className="whitespace-nowrap tabular-nums">{textoHora}</span>
      </span>
    );
  }

  return (
    <Link
      href={hrefAtalhoHorario(servicoId, data)}
      aria-label={`Marcar ${nomeServico || "este serviço"} ${formatarQuandoFalado(data)}`}
      className={cn(
        "relative z-10 flex min-h-12 w-full flex-wrap items-center gap-x-1.5 gap-y-0 rounded-lg border border-input bg-card px-3 py-1.5 text-left",
        "text-body-sm text-foreground hover:bg-secondary active:scale-[0.97] transition duracao-rapida",
        className
      )}
    >
      <Clock size={16} className="shrink-0 text-primary" aria-hidden="true" />
      <span className="whitespace-nowrap">{textoDia},</span>
      <time dateTime={data.toISOString()} className="whitespace-nowrap font-bold tabular-nums text-body">
        {textoHora}
      </time>
    </Link>
  );
}
