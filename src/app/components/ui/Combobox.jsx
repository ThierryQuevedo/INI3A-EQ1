"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Combobox/select personalizado — o <select> nativo delega a lista de opções
 * ao SO, que nem sempre respeita o tema claro/escuro do app (opções quase
 * invisíveis em alguns navegadores). Este componente controla 100% do estilo.
 */
export default function Combobox({
  value,
  onChange,
  options,
  placeholder = "Selecione",
  className = "",
  id,
  "aria-label": ariaLabel,
}) {
  const [aberto, setAberto] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);
  const containerRef = useRef(null);

  const indiceSelecionado = options.findIndex((o) => String(o.value) === String(value));
  const selecionado = indiceSelecionado >= 0 ? options[indiceSelecionado] : null;

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAberto(false);
      }
    }
    function aoPressionarEscape(e) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoPressionarEscape);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoPressionarEscape);
    };
  }, [aberto]);

  function abrir() {
    setIndiceAtivo(indiceSelecionado >= 0 ? indiceSelecionado : 0);
    setAberto(true);
  }

  function escolher(opt) {
    onChange(opt.value);
    setAberto(false);
  }

  function aoTeclarNoGatilho(e) {
    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      abrir();
    }
  }

  function aoTeclarNaLista(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceAtivo((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceAtivo((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (options[indiceAtivo]) escolher(options[indiceAtivo]);
    } else if (e.key === "Tab") {
      setAberto(false);
    }
  }

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        id={id}
        onClick={() => (aberto ? setAberto(false) : abrir())}
        onKeyDown={aberto ? aoTeclarNaLista : aoTeclarNoGatilho}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-label={ariaLabel}
        className="h-10 w-full rounded-xl border border-input bg-white dark:bg-input px-3 text-body-sm font-semibold text-foreground flex items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer transition-colors"
      >
        <span className="truncate">{selecionado ? selecionado.label : placeholder}</span>
        <ChevronDown
          size={16}
          className={cn("shrink-0 text-muted-foreground transition-transform duration-200", aberto && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {aberto && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          tabIndex={-1}
          onKeyDown={aoTeclarNaLista}
          className="absolute left-0 top-full mt-2 w-max min-w-full max-w-[260px] bg-popover text-popover-foreground border border-border rounded-xl shadow-elevated overflow-hidden z-50 py-1"
        >
          {options.map((opt, idx) => {
            const ativo = idx === indiceAtivo;
            const marcado = String(opt.value) === String(value);
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={marcado}
                onMouseEnter={() => setIndiceAtivo(idx)}
                onClick={() => escolher(opt)}
                className={cn(
                  "flex items-center justify-between gap-3 px-3.5 py-2.5 text-body-sm font-medium cursor-pointer transition-colors",
                  ativo && "bg-muted",
                  marcado ? "text-primary font-semibold" : "text-popover-foreground"
                )}
              >
                {opt.label}
                {marcado && <Check size={14} className="text-primary shrink-0" aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
