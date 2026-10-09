"use client";

import { Pencil } from "lucide-react";

/** Linha de dado + valor, com botão de editar opcional — label acima, valor abaixo, sem separador pontilhado. */
export default function LinhaCampo({ icon, label, valor, vazio = false, onEditar }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-muted-foreground text-caption font-medium mb-1">
          {icon}
          <span>{label}</span>
        </div>
        <p className={`text-body font-semibold truncate ${vazio ? "text-muted-foreground italic font-normal" : "text-foreground"}`}>
          {valor}
        </p>
      </div>

      {onEditar && (
        <button
          type="button"
          onClick={onEditar}
          aria-label={`Editar ${label}`}
          className="h-11 w-11 shrink-0 bg-muted hover:bg-accent hover:text-accent-foreground rounded-full text-muted-foreground transition-all duration-200 flex items-center justify-center cursor-pointer"
        >
          <Pencil size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
