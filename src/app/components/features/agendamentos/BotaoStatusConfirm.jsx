"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function BotaoStatusConfirm({
  action,
  textoBotao,
  classeBotao,
  tituloModal,
  mensagemModal,
  classeConfirmar = "bg-accent text-accent-foreground hover:bg-accent-hover",
}) {
  const [aberto, setAberto] = useState(false);
  const [pendente, setPendente] = useState(false);

  async function handleConfirmar() {
    setPendente(true);
    try {
      await action();
    } finally {
      setPendente(false);
      setAberto(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className={classeBotao}
      >
        {textoBotao}
      </button>

      {aberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={tituloModal}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        >
          <div className="bg-card rounded-2xl p-6 shadow-elevated max-w-sm w-full border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-body font-bold text-foreground">
                {tituloModal}
              </h3>
              <button
                type="button"
                onClick={() => setAberto(false)}
                disabled={pendente}
                aria-label="Fechar modal"
                className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <p className="text-body-sm text-muted-foreground mb-6">
              {mensagemModal}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAberto(false)}
                disabled={pendente}
                className="flex-1 rounded-full h-10 text-body-sm font-bold text-foreground bg-muted hover:bg-muted/70 transition-colors disabled:opacity-60 cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmar}
                disabled={pendente}
                className={`flex-1 rounded-full h-10 text-body-sm font-bold transition-colors disabled:opacity-60 cursor-pointer ${classeConfirmar}`}
              >
                {pendente ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
