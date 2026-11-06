"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import { Button } from "@/app/components/ui/button";
import FormField from "@/app/components/ui/FormField";
import { atualizarStatusAgendamento } from "@/app/actions/agendamentos.actions";
import { useToast } from "@/app/components/ui/ToastProvider";

/**
 * Botão único para confirmar/concluir/cancelar um agendamento — substitui
 * BotaoStatusConfirm e BotaoCancelarAgendamento (3 padrões de confirmação
 * diferentes que coexistiam no app).
 *
 * `aparencia` escolhe o estilo pelo primitivo Button: "principal" para a ação
 * esperada (confirmar/concluir), "perigo" para cancelar (discreto, sem fundo).
 *
 * `pedirMotivo` mostra um campo de texto no modal; com `motivoObrigatorio`, a
 * ação só libera depois de preenchido. O motivo vai para o chat e para o aviso.
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
  pedirMotivo = false,
  motivoObrigatorio = false,
  className,
}) {
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const idMotivo = useId();
  const router = useRouter();
  const toast = useToast();

  async function confirmar() {
    try {
      const resultado = await atualizarStatusAgendamento(agendamentoId, novoStatus, motivo);
      if (resultado?.erro) {
        toast.error(resultado.erro);
      } else {
        setMotivo("");
        toast.success("Agendamento atualizado.");
      }
    } catch {
      toast.error("Não foi possível atualizar agora. Tente de novo em instantes.");
    }
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
        cancelLabel="Voltar"
        variant={variant}
        onConfirm={confirmar}
        confirmDesabilitado={motivoObrigatorio && !motivo.trim()}
      >
        {pedirMotivo && (
          <FormField
            id={idMotivo}
            label="Motivo do cancelamento"
            required={motivoObrigatorio}
            hint={motivoObrigatorio ? undefined : "Opcional."}
          >
            <textarea
              id={idMotivo}
              rows={3}
              maxLength={500}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex.: surgiu um imprevisto nesse horário."
              className="w-full min-h-24 bg-background border border-input rounded-lg px-4 py-3 text-body text-foreground placeholder:text-muted-foreground outline-none transition resize-y focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent"
            />
          </FormField>
        )}
      </ConfirmDialog>
    </>
  );
}
