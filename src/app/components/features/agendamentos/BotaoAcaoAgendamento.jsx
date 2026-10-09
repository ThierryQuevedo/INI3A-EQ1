"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import { atualizarStatusAgendamento } from "@/app/actions/agendamentos.actions";
import { useToast } from "@/app/components/ui/ToastProvider";

/**
 * Botão único para confirmar/concluir/cancelar um agendamento — substitui
 * BotaoStatusConfirm e BotaoCancelarAgendamento (3 padrões de confirmação
 * diferentes que coexistiam no app).
 */
export default function BotaoAcaoAgendamento({
  agendamentoId,
  novoStatus,
  label,
  titulo,
  descricao,
  variant = "default",
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
      <button type="button" onClick={() => setAberto(true)} className={className}>
        {label}
      </button>
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
