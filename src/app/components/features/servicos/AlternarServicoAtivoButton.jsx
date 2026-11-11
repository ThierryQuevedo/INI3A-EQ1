"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, Eye } from "lucide-react";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/components/ui/ToastProvider";
import { alterarServicoAtivo } from "@/app/actions/servicos.actions";

// reversivel entao nao pede codigo
export default function AlternarServicoAtivoButton({ servicoId, desativado, className }) {
  const [aberto, setAberto] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function confirmar() {
    try {
      const resultado = await alterarServicoAtivo(servicoId, desativado);
      if (resultado?.erro) {
        toast.error(resultado.erro);
      } else {
        toast.success(desativado ? "Serviço reativado." : "Serviço desativado.");
      }
    } catch {
      toast.error("Não foi possível atualizar agora. Tente de novo em instantes.");
    }
    router.refresh();
  }

  const Icone = desativado ? Eye : EyeOff;
  const rotulo = desativado ? "Reativar serviço" : "Desativar serviço";

  return (
    <>
      <Button type="button" variant="outline" size="lg" onClick={() => setAberto(true)} className={className}>
        <Icone aria-hidden="true" /> {rotulo}
      </Button>
      <ConfirmDialog
        open={aberto}
        onOpenChange={setAberto}
        title={desativado ? "Reativar este serviço?" : "Desativar este serviço?"}
        description={
          desativado
            ? "Ele volta a aparecer na busca e a receber agendamentos."
            : "Ele sai da busca e não recebe novos agendamentos. Os agendamentos já feitos continuam valendo, e você pode reativar quando quiser."
        }
        confirmLabel={desativado ? "Reativar" : "Desativar"}
        cancelLabel="Voltar"
        onConfirm={confirmar}
      />
    </>
  );
}
