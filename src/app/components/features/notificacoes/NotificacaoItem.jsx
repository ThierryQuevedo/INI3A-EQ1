"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatarTempoRelativo } from "@/lib/tempo";
import { marcarNotificacaoLida } from "@/app/actions/notificacoes.actions";
import { Card } from "@/app/components/ui/card";

export default function NotificacaoItem({ notificacao }) {
  const [lida, setLida] = useState(!!notificacao.lidaEm);

  function marcar() {
    if (lida) return;
    setLida(true);
    marcarNotificacaoLida(notificacao.id);
  }

  const conteudo = (
    <Card
      padding="sm"
      interactive={!!notificacao.link}
      className={cn("flex gap-3", !lida && "border-primary/30 bg-primary/5")}
    >
      <span className={cn("mt-1.5 size-2 rounded-full shrink-0", lida ? "bg-transparent" : "bg-accent")} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-bold text-foreground">{notificacao.titulo}</p>
        <p className="text-body-sm text-muted-foreground mt-0.5">{notificacao.mensagem}</p>
        <p className="text-caption text-muted-foreground mt-1.5">{formatarTempoRelativo(notificacao.criadoEm)}</p>
      </div>
    </Card>
  );

  if (notificacao.link) {
    return (
      <Link href={notificacao.link} onClick={marcar} className="block">
        {conteudo}
      </Link>
    );
  }

  return (
    <button type="button" onClick={marcar} className="block w-full text-left cursor-pointer">
      {conteudo}
    </button>
  );
}
