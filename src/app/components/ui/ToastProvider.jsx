"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import Toast from "./Toast";

const ToastContext = createContext(null);

let proximoId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const fechar = useCallback((id) => {
    setToasts((lista) => lista.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const mostrar = useCallback((mensagem, tipo = "info") => {
    const id = ++proximoId;
    setToasts((lista) => [...lista, { id, mensagem, tipo }]);
    const timer = setTimeout(() => fechar(id), 4000);
    timers.current.set(id, timer);
    return id;
  }, [fechar]);

  const toast = {
    show: mostrar,
    success: (mensagem) => mostrar(mensagem, "success"),
    error: (mensagem) => mostrar(mensagem, "error"),
    info: (mensagem) => mostrar(mensagem, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="fixed z-[60] flex flex-col gap-2 top-4 inset-x-4 md:top-auto md:inset-x-auto md:bottom-20 md:right-4 md:left-auto"
      >
        {toasts.map((t) => (
          <Toast key={t.id} tipo={t.tipo} mensagem={t.mensagem} onFechar={() => fechar(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return ctx;
}
