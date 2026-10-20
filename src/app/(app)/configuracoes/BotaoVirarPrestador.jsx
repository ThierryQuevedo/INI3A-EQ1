"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import { tornarPrestadorAction } from "@/app/actions/prestadores.actions";

export default function BotaoVirarPrestador() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState(null);

  async function confirmar() {
    const resultado = await tornarPrestadorAction();
    if (resultado?.erro) {
      setErro(resultado.erro);
      return;
    }
    router.push("/dashboard/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="accent" onClick={() => { setErro(null); setAberto(true); }}>
        <Briefcase size={16} aria-hidden="true" /> Virar prestador
      </Button>
      {erro && (
        <p role="alert" className="text-body-sm text-destructive">{erro}</p>
      )}
      <ConfirmDialog
        open={aberto}
        onOpenChange={setAberto}
        title="Virar prestador?"
        description="Sua conta passará a ser de prestador de serviços: você poderá cadastrar serviços e receber agendamentos."
        confirmLabel="Sim, virar prestador"
        onConfirm={confirmar}
      />
    </div>
  );
}
