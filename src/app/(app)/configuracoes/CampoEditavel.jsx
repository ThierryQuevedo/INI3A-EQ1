"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { Pencil, X } from "lucide-react";

const estadoInicial = { erro: null };

function ModalEdicao({ label, name, valor, icon, action, type, onClose }) {
  const [state, formAction, isPending] = useActionState(action, estadoInicial);

  useEffect(() => {
    if (state?.sucesso) {
      onClose();
    }
  }, [state, onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Editar ${label}`} className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-4">
      <div className="bg-card rounded-2xl p-6 shadow-elevated max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-base font-extrabold text-foreground">
              Editar {label}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <label htmlFor={`campo-${name}`} className="sr-only-status">{label}</label>
          <input
            id={`campo-${name}`}
            type={type}
            name={name}
            defaultValue={valor}
            autoFocus
            className="w-full h-12 bg-background border border-input rounded-xl px-4 text-foreground text-body outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all duration-200"
          />

          {state?.erro && (
            <p role="alert" className="text-destructive text-body-sm">{state.erro}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-full h-11 text-body-sm font-bold text-foreground bg-muted hover:bg-muted/70 transition-colors disabled:opacity-60 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-full h-11 text-body-sm font-bold text-white bg-tcc-laranja hover:bg-tcc-laranja-dark transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CampoEditavel({ label, name, valor, icon, action, type = "text" }) {
  const [editando, setEditando] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-end w-full gap-2 group">
      <div className="flex items-center gap-2 min-w-[160px]">
        {icon}
        <span className="text-muted-foreground font-semibold text-body-sm tracking-wide uppercase">
          {label}
        </span>
      </div>

      <div className="hidden sm:block flex-grow border-b-2 border-dashed border-border mb-1 opacity-70 group-hover:border-tcc-neutro-300 transition-colors"></div>

      <div className="flex items-center justify-between sm:justify-end gap-3 mt-1 sm:mt-0">
        <span className={`text-body font-medium ${!valor ? "text-muted-foreground italic" : "text-foreground"}`}>
          {valor || "Não cadastrado"}
        </span>

        <button
          onClick={() => setEditando(true)}
          aria-label={`Editar ${label}`}
          className="h-11 w-11 bg-muted hover:bg-tcc-laranja hover:text-white rounded-full text-muted-foreground shadow-soft border border-border cursor-pointer transition-all duration-200 flex items-center justify-center"
        >
          <Pencil size={16} aria-hidden="true" />
        </button>
      </div>

      {editando && (
        <ModalEdicao
          label={label}
          name={name}
          valor={valor}
          icon={icon}
          action={action}
          type={type}
          onClose={() => setEditando(false)}
        />
      )}
    </div>
  );
}
