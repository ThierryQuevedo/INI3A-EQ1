"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";

export default function ChatInput({ onEnviar, disabled }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const textareaRef = useRef(null);

  function ajustarAltura() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  async function enviar() {
    const valor = texto.trim();
    if (!valor || enviando) return;

    setEnviando(true);
    setTexto("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      await onEnviar(valor);
    } finally {
      setEnviando(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      enviar();
    }
  }

  if (disabled) {
    return (
      <div className="px-4 py-3 text-center text-caption text-muted-foreground bg-muted rounded-lg">
        Esta conversa foi encerrada.
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={texto}
        onChange={(event) => {
          setTexto(event.target.value);
          ajustarAltura();
        }}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Escreva uma mensagem..."
        className="flex-1 resize-none max-h-[120px] rounded-lg border border-input bg-background px-4 py-2.5 text-body-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <button
        type="button"
        onClick={enviar}
        disabled={!texto.trim() || enviando}
        aria-label="Enviar mensagem"
        className="h-11 w-11 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Send size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
