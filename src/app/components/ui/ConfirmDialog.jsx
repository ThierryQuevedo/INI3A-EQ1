"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

/**
 * Modal de confirmação único para todo o app (substitui window.confirm e os
 * modais reimplementados em BotaoStatusConfirm/BotaoExcluirConfirm/MenuPerfilDropdown).
 * Totalmente controlado: o chamador guarda o estado `open` e renderiza seu próprio gatilho.
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  variant = "default",
}) {
  const [pendente, setPendente] = useState(false);

  if (!open) return null;

  async function handleConfirmar() {
    setPendente(true);
    try {
      await onConfirm?.();
    } finally {
      setPendente(false);
      onOpenChange?.(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-titulo"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={() => !pendente && onOpenChange?.(false)}
    >
      <div
        className="bg-card rounded-2xl p-6 shadow-elevated max-w-sm w-full border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 id="confirm-dialog-titulo" className="text-body font-bold text-foreground">
            {title}
          </h3>
          <button
            type="button"
            onClick={() => onOpenChange?.(false)}
            disabled={pendente}
            aria-label="Fechar"
            className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {description && (
          <p className="text-body-sm text-muted-foreground mb-6">{description}</p>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange?.(false)}
            disabled={pendente}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "accent"}
            className="flex-1"
            onClick={handleConfirmar}
            disabled={pendente}
          >
            {pendente ? "Salvando..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
