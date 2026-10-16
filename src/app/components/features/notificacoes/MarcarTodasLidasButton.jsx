"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { marcarTodasNotificacoesLidas } from "@/app/actions/notificacoes.actions";

export default function MarcarTodasLidasButton() {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function marcar() {
    setPending(true);
    await marcarTodasNotificacoesLidas();
    router.refresh();
    setPending(false);
  }

  return (
    <Button variant="outline" onClick={marcar} disabled={pending}>
      <CheckCheck size={16} aria-hidden="true" />
      Marcar todas como lidas
    </Button>
  );
}
