"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Image as ImageIcon, Trash2, Loader2, CheckCircle2, AlertCircle, X, UploadCloud } from "lucide-react";
import { validarArquivo, fazerUploadImagem } from "@/lib/uploadService";
import { salvarBannerPerfil } from "@/app/actions/imagem.actions";
import ImageCropperModal from "../../../components/ImageCropperModal";

export default function UserBannerUpload({
  usuario,
  initialUrl = null,
  onSave = null,
  onRemove = null,
  className = "",
}) {
  const [urlCustomizada, setUrlCustomizada] = useState(null);
  const bannerUrl = urlCustomizada !== null ? urlCustomizada : (initialUrl || usuario?.urlBanner || null);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);


  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  function abrirSeletor() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }


  function processarArquivo(file) {
    if (!file) return;

    if (!file.type || !file.type.startsWith("image/")) {
      setToast({ tipo: "erro", mensagem: "Apenas arquivos de imagem são permitidos." });
      return;
    }

    const validacao = validarArquivo(file);
    if (!validacao.valido) {
      setToast({ tipo: "erro", mensagem: validacao.erro });
      return;
    }

    const url = URL.createObjectURL(file);
    setCropImageSrc(url);
    setCropModalOpen(true);
  }

  function handleCropCancel() {
    setCropModalOpen(false);
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
  }

  async function handleCropConfirm(arquivoRecortado) {
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropModalOpen(false);
    setCropImageSrc(null);

    const preview = URL.createObjectURL(arquivoRecortado);
    setPreviewUrl(preview);
    setIsUploading(true);

    try {
      const resultado = await fazerUploadImagem(arquivoRecortado, {
        tipo: "banner",
        salvarNoBanco: true,
      });

      await salvarBannerPerfil(resultado.url);

      setUrlCustomizada(resultado.url);
      setPreviewUrl(null);
      setToast({
        tipo: "sucesso",
        mensagem: "Capa do perfil salva com sucesso!",
      });

      if (typeof onSave === "function") {
        onSave(resultado.url);
      }
    } catch (error) {
      console.error("Erro no upload do banner:", error);
      setPreviewUrl(null);
      setToast({
        tipo: "erro",
        mensagem: error.message || "Erro ao enviar capa. Tente novamente.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      processarArquivo(file);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processarArquivo(file);
    }
  }

  async function handleRemoverCapa(e) {
    e.stopPropagation();
    try {
      await salvarBannerPerfil(null);
      setUrlCustomizada("");
      setPreviewUrl(null);
      setToast({ tipo: "sucesso", mensagem: "Capa do perfil removida." });

      if (typeof onSave === "function") {
        onSave(null);
      }
      if (typeof onRemove === "function") {
        onRemove();
      }
    } catch (err) {
      console.error("Erro ao remover capa do banner:", err);
      setToast({ tipo: "erro", mensagem: "Erro ao remover a capa." });
    }
  }

  const imagemExibida = previewUrl || (bannerUrl ? bannerUrl : null);

  return (
    <div className={`relative w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload de capa do perfil"
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`absolute top-3 right-3 z-30 max-w-sm flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-elevated border text-body-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
            toast.tipo === "sucesso"
              ? "bg-card text-foreground border-emerald-500/30 dark:border-emerald-500/40 shadow-emerald-500/10"
              : "bg-card text-foreground border-destructive/30 dark:border-destructive/40 shadow-destructive/10"
          }`}
        >
          {toast.tipo === "sucesso" ? (
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle size={18} className="text-destructive shrink-0" aria-hidden="true" />
          )}
          <span className="font-medium text-caption sm:text-body-sm">{toast.mensagem}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-auto text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
            aria-label="Fechar notificação"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={abrirSeletor}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrirSeletor();
          }
        }}
        aria-label="Capa do perfil. Clique ou arraste para alterar"
        className={`w-full h-44 sm:h-52 md:h-60 rounded-3xl overflow-hidden relative group cursor-pointer border transition-all duration-200 select-none ${
          isDragging
            ? "border-primary ring-4 ring-primary/20 bg-primary/5 scale-[1.005]"
            : "border-border hover:border-primary/50 bg-muted/40"
        }`}
      >
        {imagemExibida ? (

          <img
            src={imagemExibida}
            alt="Capa do perfil"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isUploading ? "opacity-60" : "opacity-100"
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-card/80 to-muted/80">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
              <ImageIcon size={28} aria-hidden="true" />
            </div>
            <p className="font-medium text-foreground text-body-sm">
              Adicione uma capa ao seu perfil
            </p>
            <p className="text-caption text-muted-foreground mt-1">
              Arraste uma imagem ou clique para selecionar (proporção recomendada 3:1)
            </p>
          </div>
        )}

        {isDragging && (
          <div className="absolute inset-0 bg-primary/90 text-primary-foreground backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20 transition-all">
            <UploadCloud size={40} className="animate-bounce" aria-hidden="true" />
            <p className="font-bold text-body-lg">Solte a foto aqui para definir a capa</p>
            <span className="text-caption opacity-90">PNG, JPG ou WEBP</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 z-20 text-white">
            <Loader2 size={36} className="animate-spin text-white" aria-hidden="true" />
            <span className="text-body-sm font-semibold tracking-wide">Salvando capa no banco...</span>
          </div>
        )}

        <div
          className="absolute bottom-3 right-3 z-10 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {imagemExibida && !isUploading && (
            <button
              type="button"
              onClick={handleRemoverCapa}
              title="Remover capa"
              aria-label="Remover capa do perfil"
              className="px-3 py-2 rounded-xl bg-black/60 hover:bg-destructive text-white backdrop-blur-md text-caption font-medium flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Trash2 size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Remover</span>
            </button>
          )}

          <button
            type="button"
            onClick={abrirSeletor}
            title="Alterar capa"
            aria-label="Alterar capa do perfil"
            className="px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/85 text-white backdrop-blur-md text-caption font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Camera size={16} aria-hidden="true" />
            <span>{imagemExibida ? "Alterar capa" : "Adicionar capa"}</span>
          </button>
        </div>
      </div>

      <ImageCropperModal
        open={cropModalOpen}
        imageSrc={cropImageSrc}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
        isSaving={isUploading}
        aspect={3} // 1200x400
        shape="rect"
        outputWidth={1200}
        outputHeight={400}
      />
    </div>
  );
}