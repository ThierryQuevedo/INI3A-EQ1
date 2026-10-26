"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ServiceCard from "@/app/components/features/servicos/ServiceCard";

/**
 * Faixa horizontal de ServiceCards com scroll-snap nativo: arrasta no toque,
 * rola com trackpad/teclado e ganha setas no desktop. Sem biblioteca de
 * carrossel — o navegador já faz o trabalho pesado.
 */
export default function CarrosselServicos({ servicos, rotulo }) {
  const trilhoRef = useRef(null);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);

  useEffect(() => {
    const trilho = trilhoRef.current;
    if (!trilho) return;

    function atualizar() {
      setPodeVoltar(trilho.scrollLeft > 4);
      setPodeAvancar(trilho.scrollLeft + trilho.clientWidth < trilho.scrollWidth - 4);
    }

    atualizar();
    trilho.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    return () => {
      trilho.removeEventListener("scroll", atualizar);
      window.removeEventListener("resize", atualizar);
    };
  }, []);

  function rolar(direcao) {
    const trilho = trilhoRef.current;
    if (!trilho) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    trilho.scrollBy({ left: direcao * trilho.clientWidth * 0.85, behavior: reduzir ? "auto" : "smooth" });
  }

  const classeSeta =
    "max-md:hidden absolute top-1/3 z-10 size-10 inline-flex items-center justify-center rounded-full bg-card text-foreground border border-border shadow-card hover:bg-muted transition-colors cursor-pointer";

  return (
    <div className="relative">
      {podeVoltar && (
        <button type="button" onClick={() => rolar(-1)} className={`${classeSeta} -left-4`} aria-label={`Voltar em ${rotulo}`}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
      )}

      <ul
        ref={trilhoRef}
        aria-label={rotulo}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-px-4 sm:scroll-px-6 lg:scroll-px-0 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 pb-2"
      >
        {servicos.map((servico) => (
          <li key={servico.id} className="snap-start shrink-0 w-[11.5rem] sm:w-[13.5rem]">
            <ServiceCard servico={servico} />
          </li>
        ))}
      </ul>

      {podeAvancar && (
        <button type="button" onClick={() => rolar(1)} className={`${classeSeta} -right-4`} aria-label={`Avançar em ${rotulo}`}>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
