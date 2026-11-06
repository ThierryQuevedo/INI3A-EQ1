"use client";

import { useId, useState } from "react";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import FormField from "@/app/components/ui/FormField";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/components/ui/ToastProvider";
import { excluirServico, solicitarCodigoExclusaoServico } from "@/app/actions/servicos.actions";
import { CAMINHO_BASE } from "@/lib/caminhoBase";

/**
 * Exclusão em duas etapas: a pessoa pede um código, recebe no e-mail da conta e
 * digita aqui. Só então o serviço é apagado; a regra inteira fica no servidor.
 */
export default function ExcluirServicoButton({ servicoId, servicoNome, emailMascarado, className }) {
  const [aberto, setAberto] = useState(false);
  const [etapa, setEtapa] = useState("pedir");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [reenviando, setReenviando] = useState(false);
  const idCodigo = useId();
  const toast = useToast();

  function mudarAberto(valor) {
    setAberto(valor);
    if (!valor) {
      setEtapa("pedir");
      setCodigo("");
      setErro(null);
      setAviso(null);
    }
  }

  // Abrir de novo logo depois de fechar cai no intervalo de reenvio: o código
  // anterior continua valendo, então a pessoa segue para a etapa de digitar.
  async function pedirCodigo() {
    const resultado = await solicitarCodigoExclusaoServico(servicoId);
    if (resultado.erro && !resultado.aguardando) {
      toast.error(resultado.erro);
      return true;
    }
    setAviso(resultado.erro ?? `Enviamos um código para ${emailMascarado}.`);
    setEtapa("digitar");
    return false;
  }

  async function reenviar() {
    setReenviando(true);
    setErro(null);
    try {
      const resultado = await solicitarCodigoExclusaoServico(servicoId);
      setAviso(resultado.erro ?? `Enviamos um novo código para ${emailMascarado}.`);
    } catch {
      setAviso("Não foi possível reenviar agora. Tente de novo em instantes.");
    } finally {
      setReenviando(false);
    }
  }

  async function confirmarExclusao() {
    const resultado = await excluirServico(servicoId, codigo);
    if (resultado.erro) {
      setErro(resultado.erro);
      setCodigo("");
      return false;
    }
    toast.success("Serviço excluído.");
    window.location.replace(`${CAMINHO_BASE}${resultado.destino}`);
    return false;
  }

  async function aoConfirmar() {
    try {
      return await (etapa === "pedir" ? pedirCodigo() : confirmarExclusao());
    } catch {
      toast.error("Não foi possível continuar agora. Tente de novo em instantes.");
      return true;
    }
  }

  const naEtapaPedir = etapa === "pedir";

  return (
    <>
      <Button
        type="button"
        variant="ghost-destructive"
        size="lg"
        onClick={() => setAberto(true)}
        className={className}
      >
        <Trash2 aria-hidden="true" /> Excluir serviço
      </Button>
      <ConfirmDialog
        open={aberto}
        onOpenChange={mudarAberto}
        title={naEtapaPedir ? "Excluir este serviço?" : "Digite o código"}
        description={
          naEtapaPedir
            ? `"${servicoNome}" será apagado, com seus horários, e isso não pode ser desfeito. Para confirmar, enviaremos um código para ${emailMascarado}.`
            : aviso
        }
        confirmLabel={naEtapaPedir ? "Enviar código" : "Excluir serviço"}
        confirmPendenteLabel={naEtapaPedir ? "Enviando..." : "Excluindo..."}
        cancelLabel="Voltar"
        variant="destructive"
        confirmDesabilitado={!naEtapaPedir && codigo.length !== 6}
        onConfirm={aoConfirmar}
      >
        {!naEtapaPedir && (
          <>
            <FormField id={idCodigo} label="Código de 6 dígitos" required error={erro}>
              <Input
                id={idCodigo}
                value={codigo}
                onChange={(e) => {
                  setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setErro(null);
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                aria-invalid={!!erro}
                className="tabular-nums tracking-widest"
              />
            </FormField>
            <button
              type="button"
              onClick={reenviar}
              disabled={reenviando}
              className="relative area-toque mt-3 text-body-sm font-semibold text-primary underline underline-offset-4 hover:text-primary-hover cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              {reenviando ? "Reenviando..." : "Reenviar código"}
            </button>
          </>
        )}
      </ConfirmDialog>
    </>
  );
}
