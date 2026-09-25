"use client";

import { useState, useRef } from "react";
import { UploadCloud, Trash2, RefreshCw, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { validarArquivo, gerarPreviewLocal, fazerUploadImagem } from "@/lib/uploadService";

export default function ServiceImageUpload({
  name = "urlImagem",
  initialUrl = "",
  onChange = null,
  maxSizeMB = 5,
  label = "Foto do serviço",
  required = false,
  className = "",
}) {
  const [urlCustomizada, setUrlCustomizada] = useState(null);
  const imageUrl = urlCustomizada !== null ? urlCustomizada : (initialUrl || "");

  const [previewUrl, setPreviewUrl] = useState("");
  const [fileMeta, setFileMeta] = useState(null); // { nome, tamanhoFormatado }
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [erroValidacao, setErroValidacao] = useState(null);
  const fileInputRef = useRef(null);

  function abrirSeletor() {
    setErroValidacao(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }

  function formatarTamanho(bytes) {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  }

  async function processarArquivo(file) {
    if (!file) return;

    // 1. Validação visualmente clara
    const validacao = validarArquivo(file, maxSizeMB);
    if (!validacao.valido) {
      setErroValidacao(validacao.erro);
      return;
    }

    setErroValidacao(null);
    const preview = gerarPreviewLocal(file);
    setPreviewUrl(preview);
    setFileMeta({
      nome: file.name,
      tamanhoFormatado: formatarTamanho(file.size),
    });
    setIsUploading(true);

    try {
      // 2. Simulação de upload (leve, sem banco de dados)
      const resultado = await fazerUploadImagem(file, { limiteMB: maxSizeMB });
      setUrlCustomizada(resultado.url);
      setPreviewUrl("");

      if (typeof onChange === "function") {
        onChange(resultado.url, file);
      }
    } catch (err) {
      console.error("Erro no upload da foto do serviço:", err);
      setPreviewUrl("");
      setErroValidacao(err.message || "Erro ao processar o upload do arquivo.");
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

  // Remoção
  function handleRemover(e) {
    e.stopPropagation();
    setUrlCustomizada("");
    setPreviewUrl("");
    setFileMeta(null);
    setErroValidacao(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (typeof onChange === "function") {
      onChange("", null);
    }
  }

  const imagemAtual = previewUrl || (imageUrl ? imageUrl : null);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label e indicador de opcional/obrigatório */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-inter font-medium text-foreground">
          {label} {required && <span className="text-tcc-laranja-dark">*</span>}
        </label>
        <span className="text-caption text-tcc-neutro-400 font-inter">
          {required ? "Obrigatório" : "Opcional"}
        </span>
      </div>

      {/* Input oculto para submissão no formulário */}
      <input type="hidden" name={name} value={imageUrl || ""} />

      {/* Input de arquivo invisível */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload de imagem do serviço"
      />

      {/* Validações Visualmente Claras (Mensagem intuitiva de erro) */}
      {erroValidacao && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-body-sm flex items-start gap-3 transition-all animate-in fade-in"
        >
          <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-semibold text-caption uppercase tracking-wider">Atenção no upload</p>
            <p className="text-body-sm mt-0.5">{erroValidacao}</p>
          </div>
          <button
            type="button"
            onClick={() => setErroValidacao(null)}
            className="text-destructive/70 hover:text-destructive p-1 rounded-md transition-colors"
            aria-label="Fechar erro"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Exibição condicional: Dropzone OU Card de Pré-visualização */}
      {!imagemAtual ? (
        /* ÁREA DE SOLTURA AMIGÁVEL (DROPZONE) */
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
          aria-label="Arraste uma foto do serviço ou clique para selecionar"
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 select-none ${
            isDragging
              ? "border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.01]"
              : "border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40"
          }`}
        >
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-200 ${
              isDragging ? "scale-110 bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
            }`}
          >
            <UploadCloud size={32} aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-foreground text-body font-inter">
              Arraste uma foto do serviço ou clique para selecionar
            </p>
            <p className="text-caption text-muted-foreground font-inter">
              Formatos aceitos: PNG, JPG ou WEBP (limite de até {maxSizeMB}MB)
            </p>
          </div>

          <span className="mt-1 px-4 py-2 rounded-xl bg-card border border-border text-foreground text-caption font-semibold shadow-soft hover:bg-muted transition-colors">
            Selecionar arquivo
          </span>
        </div>
      ) : (
        /* CARD DE PRÉ-VISUALIZAÇÃO COMPLETO */
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Thumbnail com suporte a loading */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-border bg-muted shrink-0 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagemAtual}
                alt="Prévia do serviço"
                className={`w-full h-full object-cover transition-opacity duration-200 ${
                  isUploading ? "opacity-40" : "opacity-100"
                }`}
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                  <Loader2 size={24} className="animate-spin" aria-hidden="true" />
                </div>
              )}
            </div>

            {/* Metadados e Status */}
            <div className="flex flex-col min-w-0">
              <p className="font-semibold text-foreground text-body-sm truncate max-w-[180px] sm:max-w-xs">
                {fileMeta?.nome || "Foto do serviço anexada"}
              </p>
              {fileMeta?.tamanhoFormatado && (
                <p className="text-caption text-muted-foreground mt-0.5">
                  Tamanho: {fileMeta.tamanhoFormatado}
                </p>
              )}

              {/* Badge de status */}
              <div className="mt-2 flex items-center gap-1.5 text-caption font-medium">
                {isUploading ? (
                  <span className="inline-flex items-center gap-1 text-primary">
                    <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                    Enviando foto...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={14} aria-hidden="true" />
                    Foto pronta para o anúncio
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botões de Ação: Trocar ou Apagar */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
            <button
              type="button"
              onClick={abrirSeletor}
              disabled={isUploading}
              title="Trocar foto"
              aria-label="Trocar foto do serviço"
              className="px-3.5 py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground border border-border text-caption font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} aria-hidden="true" />
              <span>Trocar</span>
            </button>

            <button
              type="button"
              onClick={handleRemover}
              disabled={isUploading}
              title="Remover foto"
              aria-label="Remover foto do serviço"
              className="p-2 rounded-xl bg-destructive/10 hover:bg-destructive text-destructive hover:text-white border border-destructive/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
