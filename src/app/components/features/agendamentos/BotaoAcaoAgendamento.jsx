"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import { Button } from "@/app/components/ui/button";
import { atualizarStatusAgendamento } from "@/app/actions/agendamentos.actions";
import { useToast } from "@/app/components/ui/ToastProvider";

/**
 * Botão único para confirmar/concluir/cancelar um agendamento — substitui
 * BotaoStatusConfirm e BotaoCancelarAgendamento (3 padrões de confirmação
 * diferentes que coexistiam no app).
 *
 * `aparencia` escolhe o estilo pelo primitivo Button: "principal" para a ação
 * esperada (confirmar/concluir), "perigo" para cancelar (discreto, sem fundo).
 */
const APARENCIAS = {
  principal: { variant: "default" },
  perigo: { variant: "ghost-destructive" },
};

export default function BotaoAcaoAgendamento({
  agendamentoId,
  novoStatus,
  label,
  titulo,
  descricao,
  variant = "default",
  aparencia = "principal",
  className,
}) {
  const [aberto, setAberto] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function confirmar() {
    await atualizarStatusAgendamento(agendamentoId, novoStatus);
    toast.success("Agendamento atualizado.");
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        size="compacto"
        variant={APARENCIAS[aparencia]?.variant}
        onClick={() => setAberto(true)}
        className={className}
      >
        {label}
      </Button>
      <ConfirmDialog
        open={aberto}
        onOpenChange={setAberto}
        title={titulo}
        description={descricao}
        confirmLabel={label}
        variant={variant}
        onConfirm={confirmar}
      />
    </>
  );
}
