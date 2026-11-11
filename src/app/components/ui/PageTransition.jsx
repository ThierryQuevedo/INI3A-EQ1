"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

// entrada suave a cada troca de rota
export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [caminhoAnterior, setCaminhoAnterior] = useState(pathname);
  const [navegou, setNavegou] = useState(false);

  // ajuste de estado no render
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
