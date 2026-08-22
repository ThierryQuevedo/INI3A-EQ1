"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { Pencil, X } from "lucide-react";
import { atualizarSenha } from "@/app/actions/auth.actions";

const estadoInicial = { erro: null };

function ModalSenha({ label, icon, onClose }) {
  const [state, formAction, isPending] = useActionState(atualizarSenha, estadoInicial);

  useEffect(() => {
    if (state?.sucesso) {
      onClose();
    }
  }, [state, onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-4">
      <div className="bg-white rounded-2xl p-6 shadow-lg max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-base font-extrabold text-tcc-neutro-700">
              Editar {label}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-3">
          <input
            type="password"
            name="senhaAtual"
            placeholder="Senha atual"
            autoFocus
            className="w-full bg-gray-50 border border-tcc-neutro-300 rounded-md py-3 px-3 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-tcc-laranja focus:border-transparent transition-all"
          />
          <input
            type="password"
            name="novaSenha"
            placeholder="Nova senha"
            className="w-full bg-gray-50 border border-tcc-neutro-300 rounded-md py-3 px-3 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-tcc-laranja focus:border-transparent transition-all"
          />
          <input
            type="password"
            name="confirmarSenha"
            placeholder="Confirmar nova senha"
            className="w-full bg-gray-50 border border-tcc-neutro-300 rounded-md py-3 px-3 text-gray-800 text-sm outline-none focus:ring-2 focus:ring-tcc-laranja focus:border-transparent transition-all"
          />

          {state?.erro && (
            <p className="text-red-600 text-xs">{state.erro}</p>
          )}

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-xl py-3 text-sm font-bold text-tcc-neutro-700 bg-tcc-neutro-100/40 hover:bg-tcc-neutro-100/70 transition-colors disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl py-3 text-sm font-bold text-white bg-tcc-laranja hover:bg-tcc-laranja-dark transition-colors disabled:opacity-60"
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
    <div className="flex flex-col sm:flex-row sm:items-end w-full gap-2 group">
      <div className="flex items-center gap-2 min-w-[160px]">
        {icon}
        <span className="text-gray-500 font-semibold text-sm tracking-wide uppercase">
          {label}
        </span>
      </div>

      <div className="hidden sm:block flex-grow border-b-2 border-dashed border-gray-200 mb-1 opacity-70 group-hover:border-gray-300 transition-colors"></div>

      <div className="flex items-center justify-between sm:justify-end gap-3 mt-1 sm:mt-0">
        <span className="text-base font-medium text-gray-800">••••••••••••</span>

        <button
          onClick={() => setEditando(true)}
          className="bg-gray-50 hover:bg-tcc-laranja hover:text-white p-2 rounded-lg text-gray-500 shadow-sm border border-gray-200 cursor-pointer transition-all duration-200 flex items-center justify-center"
          title={`Editar ${label}`}
        >
          <Pencil size={14} />
        </button>
      </div>

      {editando && (
        <ModalSenha label={label} icon={icon} onClose={() => setEditando(false)} />
      )}
    </div>
  );
}
