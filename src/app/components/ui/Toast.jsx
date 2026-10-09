"use client";

import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONES = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const CORES = {
  success: "text-success",
  error: "text-destructive",
  info: "text-primary",
};

export default function Toast({ tipo = "info", mensagem, onFechar }) {
  const Icon = ICONES[tipo] ?? Info;

  return (
    <div
      role="status"
      className="flex items-start gap-3 bg-card border border-border shadow-elevated rounded-xl px-4 py-3 w-full max-w-sm"
    >
      <Icon size={20} className={cn("shrink-0 mt-0.5", CORES[tipo])} aria-hidden="true" />
      <p className="text-body-sm text-foreground flex-1">{mensagem}</p>
      <button
        type="button"
        onClick={onFechar}
        aria-label="Fechar notificação"
        className="shrink-0 h-6 w-6 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
