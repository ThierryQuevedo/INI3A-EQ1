import Link from "next/link";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { partesNoFuso, formatarDiaCurto, formatarHora } from "@/lib/formatoData";

// abre a tela de agendar com dia e hora
export function hrefAtalhoHorario(servicoId, proximoHorario) {
  const { dia, hora } = partesNoFuso(proximoHorario);
  const params = new URLSearchParams({ servico: String(servicoId), data: dia, hora });
  return `/agendamentos/novo/?${params}`;
}

// proximo horario livre no fuso de brasilia
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
    // sem aria label para o comando de voz achar o link
    <Link
      href={hrefAtalhoHorario(servicoId, data)}
      className={cn(
        "relative z-10 flex min-h-12 w-full flex-wrap items-center gap-x-1.5 gap-y-0 rounded-lg border border-input bg-card px-3 py-1.5 text-left",
        "text-body-sm text-foreground hover:bg-secondary active:scale-[0.97] transition duracao-rapida",
        className
      )}
    >
      <Clock size={16} className="shrink-0 text-primary" aria-hidden="true" />
      <span className="sr-only">Marcar {nomeServico || "este serviço"}: </span>
      <span className="whitespace-nowrap">{textoDia},</span>
      <time dateTime={data.toISOString()} className="whitespace-nowrap font-bold tabular-nums text-body">
        {textoHora}
      </time>
    </Link>
  );
}
