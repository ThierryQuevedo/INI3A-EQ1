"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

const SELETOR_FOCAVEL =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Sheet genérico (mobile) com arrastar-para-fechar, via framer-motion.
 * Usado para filtros no mobile e outros fluxos que precisem de um painel inferior.
 *
 * Como é modal (aria-modal), ele mesmo cuida do foco: leva o foco para dentro
 * ao abrir, prende o Tab no painel e devolve o foco a quem abriu ao fechar.
 * O arrasto só começa pela alça — no corpo, o gesto vertical é da rolagem.
 */
export default function BottomSheet({ open, onClose, title, children }) {
  const refPainel = useRef(null);
  const refOnClose = useRef(onClose);
  const idTitulo = useId();
  const controlesArrasto = useDragControls();
  // Sem o MotionConfig global: o próprio sheet respeita "reduzir movimento".
  const reduzMovimento = useReducedMotion();

  useEffect(() => {
    refOnClose.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const focoAnterior = document.activeElement;
    const overflowAnterior = document.documentElement.style.overflow;
    // Trava a rolagem do fundo enquanto o sheet está aberto.
    document.documentElement.style.overflow = "hidden";
    refPainel.current?.focus();

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        refOnClose.current?.();
        return;
      }
      if (e.key !== "Tab" || !refPainel.current) return;

      const focaveis = [...refPainel.current.querySelectorAll(SELETOR_FOCAVEL)].filter(
        (el) => el.offsetParent !== null
      );
      if (focaveis.length === 0) {
        e.preventDefault();
        return;
      }
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      // Foco no próprio painel (logo após abrir) conta como "fora da lista".
      const dentro =
        refPainel.current.contains(document.activeElement) && document.activeElement !== refPainel.current;

      if (e.shiftKey && (document.activeElement === primeiro || !dentro)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (document.activeElement === ultimo || !dentro)) {
        e.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.documentElement.style.overflow = overflowAnterior;
      if (focoAnterior instanceof HTMLElement && focoAnterior.isConnected) focoAnterior.focus();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduzMovimento ? 0 : 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={refPainel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? idTitulo : undefined}
            aria-label={title ? undefined : "Painel"}
            tabIndex={-1}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-xl shadow-elevated max-h-[85dvh] flex flex-col focus:outline-none"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={reduzMovimento ? { duration: 0 } : { type: "spring", damping: 32, stiffness: 320 }}
            drag="y"
            dragListener={false}
            dragControls={controlesArrasto}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose?.();
            }}
          >
            {/* Alça: única área que inicia o arrasto. Alta o bastante para o polegar. */}
            <div
              className="flex justify-center items-center h-6 shrink-0 touch-none cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => controlesArrasto.start(e)}
              aria-hidden="true"
            >
              <div className="w-10 h-1.5 rounded-full bg-border" />
            </div>
            {title && (
              <div className="px-5 pb-3 shrink-0 flex items-center justify-between border-b border-border">
                <h2 id={idTitulo} className="text-body-lg font-bold text-foreground">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="h-toque w-toque -mr-2 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            )}
            <div className="overflow-y-auto overscroll-contain px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
