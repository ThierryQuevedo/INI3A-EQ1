"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Entrada suave a cada troca de rota, em CSS (.entrada-pagina em globals.css).
 *
 * - Não anima o primeiro carregamento: o conteúdo nasce visível e o LCP não
 *   espera fade nenhum.
 * - Sem animação de saída: a página nova aparece assim que chega.
 * - "Reduzir movimento" é respeitado pelo bloco global de prefers-reduced-motion.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [caminhoAnterior, setCaminhoAnterior] = useState(pathname);
  const [navegou, setNavegou] = useState(false);

  // Ajuste de estado durante o render (padrão do React para reagir a uma
  // prop que muda), sem efeito extra.
  if (pathname !== caminhoAnterior) {
    setCaminhoAnterior(pathname);
    setNavegou(true);
  }

  return (
    <div key={pathname} className={navegou ? "entrada-pagina" : undefined}>
      {children}
    </div>
  );
}
