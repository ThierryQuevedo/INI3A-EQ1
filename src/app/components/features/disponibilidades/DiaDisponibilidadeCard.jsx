"use client";

import { Plus, Trash2, Loader2 } from "lucide-react";
import Switch from "@/app/components/ui/Switch";

const CAMPO_HORA_CLASSE =
  "h-10 rounded-xl border border-input bg-card px-3 text-body-sm font-semibold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed";

export default function DiaDisponibilidadeCard({
  dia,
  ehHoje = false,
  ranges = [],
  processando = false,
  erro = null,
  onToggleDia,
  onAdicionarHorario,
  onAlterarHorario,
  onPedirRemoverHorario,
}) {
  const temHorarios = ranges.length > 0;

  return (
    <div
      className={`bg-card rounded-2xl border overflow-hidden transition-colors ${
        ehHoje ? "border-primary/30" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <Switch
            checked={temHorarios}
            onChange={(novoEstado) => onToggleDia(dia, novoEstado)}
            disabled={processando}
            label={`${temHorarios ? "Desativar" : "Ativar"} atendimento em ${dia.nome}`}
          />
          <span className="font-semibold text-foreground text-body-sm truncate">{dia.nome}</span>
          {ehHoje && (
            <span className="shrink-0 text-caption font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5">
              Hoje
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {processando && <Loader2 size={16} className="animate-spin text-muted-foreground" aria-hidden="true" />}
          {!temHorarios && <span className="text-caption text-muted-foreground">Indisponível</span>}
        </div>
      </div>

      {temHorarios && (
        <div className="border-t border-border divide-y divide-border">
          {ranges.map((r) => (
            <div key={r.id} className="flex items-center gap-2 sm:gap-3 px-5 py-3 flex-wrap">
              <label className="sr-only-status" htmlFor={`inicio-${r.id}`}>Início em {dia.nome}</label>
              <input
                id={`inicio-${r.id}`}
                type="time"
                value={r.horaInicio}
                disabled={processando}
                onChange={(e) => onAlterarHorario(dia, r, "horaInicio", e.target.value)}
                className={CAMPO_HORA_CLASSE}
              />
              <span className="text-muted-foreground text-body-sm" aria-hidden="true">até</span>
              <label className="sr-only-status" htmlFor={`fim-${r.id}`}>Fim em {dia.nome}</label>
              <input
                id={`fim-${r.id}`}
                type="time"
                value={r.horaFim}
                disabled={processando}
                onChange={(e) => onAlterarHorario(dia, r, "horaFim", e.target.value)}
                className={CAMPO_HORA_CLASSE}
              />

              <button
                type="button"
                onClick={() => onPedirRemoverHorario(dia, r)}
                disabled={processando}
                aria-label={`Remover horário de ${r.horaInicio} às ${r.horaFim} em ${dia.nome}`}
                title="Remover horário"
                className="ml-auto h-10 w-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      {erro && (
        <p role="alert" className="px-5 py-2.5 text-caption font-medium text-destructive bg-destructive/5 border-t border-destructive/20">
          {erro}
        </p>
      )}

      {temHorarios && (
        <div className="border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={() => onAdicionarHorario(dia)}
            disabled={processando}
            className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-primary hover:bg-primary/10 rounded-full px-3 py-1.5 -ml-3 transition-colors duration-fast cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={15} aria-hidden="true" />
            Adicionar horário
          </button>
        </div>
      )}
    </div>
  );
}
