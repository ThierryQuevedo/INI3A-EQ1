"use client";

import { useEffect, useState } from "react";
import { contarNaoLidas } from "@/app/actions/mensagens.actions";
import { cn } from "@/lib/utils";

const INTERVALO_MS = 15000;

/** Bolinha com a contagem de mensagens não lidas, atualizada por polling leve. */
export default function BadgeNaoLidas({ className }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function atualizar() {
      const valor = await contarNaoLidas();
      if (ativo) setTotal(valor);
    }

    atualizar();
    const id = setInterval(atualizar, INTERVALO_MS);
    return () => {
      ativo = false;
      clearInterval(id);
    };
  }, []);

  if (total === 0) return null;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute -top-1.5 -right-2 h-5 min-w-5 px-1 rounded-full bg-contador text-contador-foreground text-caption leading-none ring-2 ring-card font-bold flex items-center justify-center",
        className
      )}
    >
      {total > 9 ? "9+" : total}
    </span>
  );
}
