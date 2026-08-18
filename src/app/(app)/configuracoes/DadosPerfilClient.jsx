"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { User, Mail, Phone, ShieldCheck, Pencil, X, Eye, EyeOff } from "lucide-react";
import {
  atualizarNome,
  atualizarEmail,
  atualizarTelefone,
  atualizarSenha,
} from "@/app/actions/auth.actions";

const estadoInicial = { erro: null };

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-inter text-sm outline-none focus:border-tcc-azul focus:ring-4 focus:ring-tcc-azul-lightest transition-all disabled:opacity-60";

export default function DadosPerfilClient({ usuario }) {
  const [campoAberto, setCampoAberto] = useState(null);
  const fechar = () => setCampoAberto(null);

  return (
    <>
      <div className="space-y-6 flex-1">
        <LinhaPontilhada
          label="Nome completo"
          valor={usuario.nome}
          icon={<User size={18} className="text-gray-400" />}
          onEditar={() => setCampoAberto("nome")}
        />
        <LinhaPontilhada
          label="E-mail principal"
          valor={usuario.email}
          icon={<Mail size={18} className="text-gray-400" />}
          onEditar={() => setCampoAberto("email")}
        />
        <LinhaPontilhada
          label="Senha de acesso"
          valor="••••••••••••"
          icon={<ShieldCheck size={18} className="text-gray-400" />}
          onEditar={() => setCampoAberto("senha")}
        />
        <LinhaPontilhada
          label="Telefone / WhatsApp"
          valor={usuario.telefone || "Não cadastrado"}
          icon={<Phone size={18} className="text-gray-400" />}
          onEditar={() => setCampoAberto("telefone")}
        />
        <LinhaPontilhada
          label="Nível de Acesso"
          valor={usuario.tipo === "prestador" ? "Prestador de Serviços" : "Cliente da Plataforma"}
          icon={<ShieldCheck size={18} className="text-gray-400" />}
        />
      </div>

      {campoAberto === "nome" && (
        <EditarCampoModal titulo="Editar nome completo" action={atualizarNome} onFechar={fechar}>
          {(disabled) => (
            <input
              type="text"
              name="nome"
              defaultValue={usuario.nome}
              required
              disabled={disabled}
              autoFocus
              className={inputClass}
            />
          )}
        </EditarCampoModal>
      )}

      {campoAberto === "email" && (
        <EditarCampoModal titulo="Editar e-mail principal" action={atualizarEmail} onFechar={fechar}>
          {(disabled) => (
            <input
              type="email"
              name="email"
              defaultValue={usuario.email}
              required
              disabled={disabled}
              autoFocus
              className={inputClass}
            />
          )}
        </EditarCampoModal>
      )}

      {campoAberto === "telefone" && (
        <EditarCampoModal titulo="Editar telefone / WhatsApp" action={atualizarTelefone} onFechar={fechar}>
          {(disabled) => (
            <input
              type="tel"
              name="telefone"
              defaultValue={usuario.telefone || ""}
              required
              disabled={disabled}
              autoFocus
              className={inputClass}
            />
          )}
        </EditarCampoModal>
      )}

      {campoAberto === "senha" && <EditarSenhaModal onFechar={fechar} />}
    </>
  );
}

function LinhaPontilhada({ label, valor, icon, onEditar }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end w-full gap-2 group">
      <div className="flex items-center gap-2 min-w-[160px]">
        {icon}
        <span className="text-gray-500 font-semibold text-sm tracking-wide uppercase">{label}</span>
      </div>

      <div className="hidden sm:block flex-grow border-b-2 border-dashed border-gray-200 mb-1 opacity-70 group-hover:border-gray-300 transition-colors"></div>

      <div className="flex items-center justify-between sm:justify-end gap-3 mt-1 sm:mt-0">
        <span className={`text-base font-medium ${valor === "Não cadastrado" ? "text-gray-400 italic" : "text-gray-800"}`}>
          {valor}
        </span>

        {onEditar && (
          <button
            onClick={onEditar}
            className="bg-gray-50 hover:bg-tcc-laranja hover:text-white p-2 rounded-lg text-gray-500 shadow-sm border border-gray-200 cursor-pointer transition-all duration-200 flex items-center justify-center"
            title={`Editar ${label}`}
          >
            <Pencil size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function ModalShell({ titulo, onFechar, erro, children }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onFechar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800 font-urbanist">{titulo}</h3>
          <button
            onClick={onFechar}
            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {erro && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded-md text-center">
            {erro}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

function EditarCampoModal({ titulo, action, onFechar, children }) {
  const [state, formAction, isPending] = useActionState(action, estadoInicial);

  useEffect(() => {
    if (state?.sucesso) {
      onFechar();
    }
  }, [state, onFechar]);

  return (
    <ModalShell titulo={titulo} onFechar={onFechar} erro={state?.erro}>
      <form action={formAction} className="space-y-4">
        {children(isPending)}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-tcc-laranja hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </ModalShell>
  );
}

function EditarSenhaModal({ onFechar }) {
  const [state, formAction, isPending] = useActionState(atualizarSenha, estadoInicial);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  useEffect(() => {
    if (state?.sucesso) {
      onFechar();
    }
  }, [state, onFechar]);

  return (
    <ModalShell titulo="Alterar senha de acesso" onFechar={onFechar} erro={state?.erro}>
      <form action={formAction} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-600">Senha atual</label>
          <input
            type={mostrarSenha ? "text" : "password"}
            name="senhaAtual"
            required
            disabled={isPending}
            autoFocus
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-600">Nova senha</label>
          <input
            type={mostrarSenha ? "text" : "password"}
            name="novaSenha"
            required
            minLength={6}
            disabled={isPending}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-600">Confirmar nova senha</label>
          <input
            type={mostrarSenha ? "text" : "password"}
            name="confirmarSenha"
            required
            minLength={6}
            disabled={isPending}
            className={inputClass}
          />
        </div>

        <button
          type="button"
          onClick={() => setMostrarSenha((v) => !v)}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 cursor-pointer select-none"
        >
          {mostrarSenha ? <EyeOff size={14} /> : <Eye size={14} />}
          {mostrarSenha ? "Ocultar senhas" : "Mostrar senhas"}
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-tcc-laranja hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </ModalShell>
  );
}
