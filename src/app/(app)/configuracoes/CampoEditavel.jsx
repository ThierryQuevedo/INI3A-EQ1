"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { X } from "lucide-react";
import { formatarTelefone } from "@/lib/formatarTelefone";
import LinhaCampo from "./LinhaCampo";

const estadoInicial = { erro: null };

function ModalEdicao({ label, name, valor, icon, action, type, onClose }) {
  const [state, formAction, isPending] = useActionState(action, estadoInicial);
  const [campoValor, setCampoValor] = useState(
    name === "telefone" ? formatarTelefone(valor) : (valor || "")
  );

  useEffect(() => {
    if (state?.sucesso) {
      onClose();
    }
  }, [state, onClose]);

  function handleKeyDown(e) {
    if (name === "telefone") {
      const permitidas = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End", "Enter"];
      if (permitidas.includes(e.key) || e.ctrlKey || e.metaKey) return;
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
      }
    }
  }

  function handleChange(e) {
    if (name === "telefone") {
      setCampoValor(formatarTelefone(e.target.value));
    } else {
      setCampoValor(e.target.value);
    }
  }

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
            className="h-11 w-11 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <label htmlFor={`campo-${name}`} className="sr-only-status">{label}</label>
          <input
            id={`campo-${name}`}
            type={name === "telefone" ? "tel" : type}
            name={name}
            value={campoValor}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            inputMode={name === "telefone" ? "numeric" : undefined}
            maxLength={name === "telefone" ? 15 : undefined}
            placeholder={name === "telefone" ? "(11) 91234-5678" : undefined}
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
              className="flex-1 rounded-full h-11 text-body-sm font-bold text-accent-foreground bg-accent hover:bg-accent-hover transition-colors disabled:opacity-60 cursor-pointer"
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
    <>
      <LinhaCampo
        icon={icon}
        label={label}
        valor={valor || "Não cadastrado"}
        vazio={!valor}
        onEditar={() => setEditando(true)}
      />

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
    </>
  );
}
