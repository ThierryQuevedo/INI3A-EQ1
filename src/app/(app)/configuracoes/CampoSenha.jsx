"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { X } from "lucide-react";
import { atualizarSenha } from "@/app/actions/auth.actions";
import LinhaCampo from "./LinhaCampo";

const estadoInicial = { erro: null };

function ModalSenha({ label, icon, onClose }) {
  const [state, formAction, isPending] = useActionState(atualizarSenha, estadoInicial);

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
            className="h-11 w-11 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-3">
          <div>
            <label htmlFor="senhaAtual" className="sr-only-status">Senha atual</label>
            <input
              id="senhaAtual"
              type="password"
              name="senhaAtual"
              placeholder="Senha atual"
              required
              autoFocus
              className="w-full h-12 bg-background border border-input rounded-xl px-4 text-foreground text-body outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="novaSenha" className="sr-only-status">Nova senha</label>
            <input
              id="novaSenha"
              type="password"
              name="novaSenha"
              placeholder="Nova senha"
              required
              minLength={6}
              className="w-full h-12 bg-background border border-input rounded-xl px-4 text-foreground text-body outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="confirmarSenha" className="sr-only-status">Confirmar nova senha</label>
            <input
              id="confirmarSenha"
              type="password"
              name="confirmarSenha"
              placeholder="Confirmar nova senha"
              required
              minLength={6}
              className="w-full h-12 bg-background border border-input rounded-xl px-4 text-foreground text-body outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all duration-200"
            />
          </div>

          {state?.erro && (
            <p role="alert" className="text-destructive text-body-sm">{state.erro}</p>
          )}

          <div className="flex gap-3 mt-1">
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

export default function CampoSenha({ label, icon }) {
  const [editando, setEditando] = useState(false);

  return (
    <>
      <LinhaCampo icon={icon} label={label} valor="••••••••••••" onEditar={() => setEditando(true)} />

      {editando && (
        <ModalSenha label={label} icon={icon} onClose={() => setEditando(false)} />
      )}
    </>
  );
}
