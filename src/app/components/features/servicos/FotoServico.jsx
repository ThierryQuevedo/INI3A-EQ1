"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import PlaceholderImage from "@/app/components/ui/PlaceholderImage";
import ImageCropperModal from "@/app/components/ImageCropperModal";
import { useToast } from "@/app/components/ui/ToastProvider";
import { validarArquivo, fazerUploadImagem } from "@/lib/uploadService";
import { salvarImagemServico } from "@/app/actions/imagem.actions";
import { getCategoryIcon } from "./CategoryIcon";

/**
 * Imagem de destaque da página do serviço. Para o prestador dono do serviço,
 * mostra "Alterar foto": recorta em 1:1 (mesmo formato do cadastro), envia e
 * persiste via salvarImagemServico, que valida a posse no servidor.
 */
export default function FotoServico({ servicoId, urlImagem, nome, categoria, podeEditar = false }) {
  const [url, setUrl] = useState(urlImagem || "");
  const [cropSrc, setCropSrc] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const inputRef = useRef(null);
  const toast = useToast();
  const router = useRouter();

  function escolherArquivo(event) {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo) return;

    const validacao = validarArquivo(arquivo);
    if (!validacao.valido) {
      toast.error(validacao.erro);
      return;
    }
    setCropSrc(URL.createObjectURL(arquivo));
  }

  function fecharCorte() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  }

  async function confirmarCorte(arquivoRecortado) {
    setSalvando(true);
    try {
      const upload = await fazerUploadImagem(arquivoRecortado, { salvarNoBanco: false });
      const resultado = await salvarImagemServico(servicoId, upload.url);
      if (!resultado.sucesso) {
        toast.error(resultado.erro || "Não foi possível salvar a foto.");
        return;
      }
      setUrl(resultado.url || "");
      toast.success("Foto do serviço atualizada.");
      router.refresh();
    } catch (erro) {
      toast.error(erro?.message || "Erro ao enviar a imagem.");
    } finally {
      setSalvando(false);
      fecharCorte();
    }
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
      {url ? (
        <Image src={url} alt={nome} fill priority sizes="(max-width: 1024px) 100vw, 320px" className="object-cover" />
      ) : (
        <PlaceholderImage
          className="absolute inset-0"
          icon={getCategoryIcon(categoria)}
          label={categoria ? `Sem foto — ${categoria}` : "Sem foto"}
        />
      )}

      {podeEditar && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={escolherArquivo}
            className="hidden"
            aria-label="Escolher nova foto do serviço"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={salvando}
            className="absolute bottom-3 right-3 inline-flex items-center gap-2 h-10 px-3.5 rounded-lg bg-card/95 text-foreground text-body-sm font-semibold border border-border shadow-soft hover:bg-card transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-80"
          >
            {salvando ? (
              <Loader2 size={16} className="shrink-0 animate-spin" aria-hidden="true" />
            ) : (
              <Camera size={16} className="shrink-0" aria-hidden="true" />
            )}
            {url ? "Alterar foto" : "Adicionar foto"}
          </button>

          <ImageCropperModal
            open={!!cropSrc}
            imageSrc={cropSrc}
            onCancel={fecharCorte}
            onConfirm={confirmarCorte}
            isSaving={salvando}
            aspect={1}
            shape="rect"
            outputWidth={800}
          />
        </>
      )}
    </div>
  );
}
