"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Loader2, CheckCircle2, AlertCircle, X, Trash2 } from "lucide-react";
import { validarArquivo, fazerUploadImagem } from "@/lib/uploadService";
import { salvarFotoPerfil } from "@/app/actions/imagem.actions";
import ImageCropperModal from "../../../components/ImageCropperModal";

export default function ProfileAvatar({
  usuario,
  initialUrl = null,
  inicialNome = null,
  tamanho = "w-28 h-28 sm:w-32 sm:h-32",
  onSave = null,
  className = "",
}) {
  const [urlCustomizada, setUrlCustomizada] = useState(null);
  const avatarUrl = urlCustomizada !== null ? urlCustomizada : (initialUrl || usuario?.urlImagem || null);

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
        tipo: "avatar",
        salvarNoBanco: true,
      });

      await salvarFotoPerfil(resultado.url);

      setUrlCustomizada(resultado.url);
      setPreviewUrl(null);
      setToast({
        tipo: "sucesso",
        mensagem: "Foto de perfil salva com sucesso!",
      });

      if (typeof onSave === "function") {
        onSave(resultado.url);
      }
    } catch (error) {
      console.error("Erro no upload do avatar:", error);
      setPreviewUrl(null);
      setToast({
        tipo: "erro",
        mensagem: error.message || "Erro ao atualizar a foto. Tente novamente.",
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

  // Drag & Drop
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

  async function handleRemoverFoto(e) {
    e.stopPropagation();
    try {
      await salvarFotoPerfil(null);
      setUrlCustomizada("");
      setPreviewUrl(null);
      setToast({ tipo: "sucesso", mensagem: "Foto de perfil removida." });

      if (typeof onSave === "function") {
        onSave(null);
      }
    } catch (err) {
      console.error("Erro ao remover foto do perfil:", err);
      setToast({ tipo: "erro", mensagem: "Erro ao remover a foto." });
    }
  }

  const imagemExibida = previewUrl || (avatarUrl ? avatarUrl : null);
  const letraFallback =
    inicialNome ||
    (usuario?.nome ? usuario.nome.trim().charAt(0).toUpperCase() : "U");

  return (
    <div className={`flex flex-col items-center relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload de foto de perfil"
      />

      <div className="relative group inline-block">
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
          aria-label="Foto de perfil. Clique ou arraste para alterar"
          className={`${tamanho} rounded-full overflow-hidden border-4 border-background bg-card shadow-elevated flex items-center justify-center relative transition-all duration-200 cursor-pointer select-none ${
            isDragging
              ? "ring-4 ring-primary ring-offset-2 ring-offset-background scale-105"
              : "group-hover:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/30"
          }`}
        >
          {imagemExibida ? (
            <img
              src={imagemExibida}
              alt={usuario?.nome ? `Foto de ${usuario.nome}` : "Foto de perfil"}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                isUploading ? "opacity-40" : "opacity-100"
              }`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/20 to-primary/20 flex items-center justify-center text-primary font-bold text-3xl sm:text-4xl font-display">
              {letraFallback}
            </div>
          )}

          {!isUploading && (
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-1 z-10">
              <Camera size={24} className="stroke-[2.2]" aria-hidden="true" />
              <span className="text-[11px] font-semibold tracking-wide uppercase">
                Alterar
              </span>
            </div>
          )}

          {isDragging && (
            <div className="absolute inset-0 bg-primary/90 text-primary-foreground backdrop-blur-sm flex flex-col items-center justify-center gap-1 z-20">
              <Camera size={26} className="animate-bounce" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Solte aqui
              </span>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1.5 z-20 text-white">
              <Loader2 size={30} className="animate-spin text-white" aria-hidden="true" />
              <span className="text-[11px] font-semibold">Salvando foto...</span>
            </div>
          )}
        </div>

        {imagemExibida && !isUploading && (
          <button
            type="button"
            onClick={handleRemoverFoto}
            title="Remover foto de perfil"
            aria-label="Remover foto de perfil"
            className="absolute -bottom-1 -right-1 z-20 w-8 h-8 rounded-full bg-card hover:bg-destructive hover:text-white text-muted-foreground border border-border shadow-soft flex items-center justify-center transition-colors cursor-pointer"
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-caption font-medium border shadow-soft transition-all duration-200 animate-in fade-in slide-in-from-top-1 ${
            toast.tipo === "sucesso"
              ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800"
              : "bg-red-50 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-200 dark:border-red-800"
          }`}
        >
          {toast.tipo === "sucesso" ? (
            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle size={15} className="text-red-600 dark:text-red-400 shrink-0" aria-hidden="true" />
          )}
          <span>{toast.mensagem}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-muted-foreground hover:text-foreground ml-1 p-0.5"
            aria-label="Fechar aviso"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </div>
      )}

      <ImageCropperModal
        open={cropModalOpen}
        imageSrc={cropImageSrc}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
        isSaving={isUploading}
        aspect={1}
        shape="circle"
        outputWidth={512}/>
    </div>
  );
}