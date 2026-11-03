"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

/**
 * Modal de confirmação único para todo o app (substitui window.confirm e os
 * modais reimplementados em BotaoStatusConfirm/BotaoExcluirConfirm/MenuPerfilDropdown).
 * Totalmente controlado: o chamador guarda o estado `open` e renderiza seu próprio gatilho.
 *
 * G-01: usa o <dialog> nativo com showModal() — foco preso, Esc, ::backdrop
 * e devolução do foco ao gatilho vêm do navegador — e entra/sai por CSS
 * (.dialogo em globals.css, com @starting-style). Assim o framer-motion
 * deixa de ir para o bundle de toda página (o Header importa este arquivo
 * via MenuPerfilDropdown).
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
  const refDialogo = useRef(null);
  const idTitulo = useId();
  const idDescricao = useId();

  useEffect(() => {
    const dialogo = refDialogo.current;
    if (!dialogo) return;
    if (open && !dialogo.open) dialogo.showModal();
    else if (!open && dialogo.open) dialogo.close();
  }, [open]);

  function fechar() {
    if (!pendente) onOpenChange?.(false);
  }

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
    <dialog
      ref={refDialogo}
      role={variant === "destructive" ? "alertdialog" : undefined}
      aria-labelledby={idTitulo}
      aria-describedby={description ? idDescricao : undefined}
      className="dialogo"
      // Esc: o navegador fecharia sozinho; quem manda no estado é o chamador.
      onCancel={(e) => {
        e.preventDefault();
        fechar();
      }}
      // Clique no fundo (::backdrop) cai no próprio <dialog>.
      onClick={(e) => {
        if (e.target === refDialogo.current) fechar();
      }}
    >
      <div className="bg-card text-card-foreground rounded-xl p-6 shadow-elevated border border-border">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 id={idTitulo} className="font-sans text-body font-bold text-foreground tracking-normal">
            {title}
          </h2>
          <button
            type="button"
            onClick={fechar}
            disabled={pendente}
            aria-label="Fechar"
            className="h-toque w-toque -mr-2 shrink-0 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.97] transition duracao-rapida cursor-pointer"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {description && (
          <p id={idDescricao} className="text-body-sm text-muted-foreground mb-6">
            {description}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={fechar} disabled={pendente}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            className="flex-1"
            onClick={handleConfirmar}
            disabled={pendente}
          >
            {pendente ? "Salvando..." : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
