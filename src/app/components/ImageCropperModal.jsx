"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { X, ZoomIn, Check, Loader2, ImageOff } from "lucide-react";
import { Button } from "@/app/components/ui/button";

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const PASSO_TECLADO = 10; // px por seta (Shift = 4x)

export default function ImageCropperModal({
  open,
  imageSrc,
  onCancel,
  onConfirm,
  isSaving = false,
  aspect = 1, // largura / altura do recorte final (1 = quadrado/círculo, 3 = banner 1200x400 etc.)
  shape = "circle", // "circle" | "rect"
  outputWidth = 512,
  outputHeight = null, // se omitido, é calculado a partir de `aspect`
}) {
  const VL = 320; // largura lógica do viewport de recorte (px do canvas)
  const VA = Math.round(VL / aspect); // altura do viewport, respeitando a proporção
  const SL = outputWidth; // largura de saída
  const SA = outputHeight || Math.round(outputWidth / aspect); // altura de saída

  const refDialogo = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const dragState = useRef(null);
  const idTitulo = useId();
  const idAjuda = useId();

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState(null);

  // Reinicia zoom/offset/pronto ao abrir com uma imagem nova — ajuste durante o
  // render (padrão recomendado pelo React para resetar estado quando uma prop
  // muda), não dentro do efeito, que fica só com a carga assíncrona da imagem.
  const chaveAtual = open ? imageSrc : null;
  const [chaveAnterior, setChaveAnterior] = useState(chaveAtual);
  if (chaveAtual !== chaveAnterior) {
    setChaveAnterior(chaveAtual);
    if (chaveAtual) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setPronto(false);
      setErro(null);
    }
  }

  // <dialog> nativo: foco preso, Esc e devolução do foco vêm do navegador
  // (mesmo padrão do ConfirmDialog — G-01).
  useEffect(() => {
    const dialogo = refDialogo.current;
    if (!dialogo) return;
    if (open && !dialogo.open) dialogo.showModal();
    else if (!open && dialogo.open) dialogo.close();
  }, [open]);

  useEffect(() => {
    if (!open || !imageSrc) return;
    let ativo = true;
    const img = new Image();
    img.onload = () => {
      if (!ativo) return;
      imgRef.current = img;
      setPronto(true);
    };
    img.onerror = () => {
      if (ativo) setErro("Não foi possível abrir esta imagem. Tente outro arquivo (JPG, PNG ou WebP).");
    };
    img.src = imageSrc;
    return () => {
      ativo = false;
    };
  }, [open, imageSrc]);

  const desenhar = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, VL, VA);

    const escalaBase = Math.max(VL / img.width, VA / img.height);
    const escala = escalaBase * zoom;
    const largura = img.width * escala;
    const altura = img.height * escala;

    const x = (VL - largura) / 2 + offset.x;
    const y = (VA - altura) / 2 + offset.y;

    ctx.drawImage(img, x, y, largura, altura);
  }, [zoom, offset, VL, VA]);

  useEffect(() => {
    if (pronto) desenhar();
  }, [pronto, desenhar]);

  // Se a janela perde o foco no meio do arrasto (troca de app, alerta do
  // sistema), o pointerup nunca chega: encerra o arrasto aqui.
  useEffect(() => {
    if (!open) return;
    function encerrar() {
      dragState.current = null;
    }
    window.addEventListener("blur", encerrar);
    return () => window.removeEventListener("blur", encerrar);
  }, [open]);

  function limitarOffset(novoOffset, escalaAtual) {
    const img = imgRef.current;
    if (!img) return novoOffset;
    const escalaBase = Math.max(VL / img.width, VA / img.height);
    const escala = escalaBase * escalaAtual;
    const largura = img.width * escala;
    const altura = img.height * escala;
    const maxX = Math.max(0, (largura - VL) / 2);
    const maxY = Math.max(0, (altura - VA) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, novoOffset.x)),
      y: Math.min(maxY, Math.max(-maxY, novoOffset.y)),
    };
  }

  function handlePointerDown(e) {
    // Um segundo dedo no meio do arrasto não "rouba" o gesto.
    if (!pronto || dragState.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origem: offset,
      // Em telas estreitas a área exibida é menor que o canvas lógico:
      // converte o deslocamento do dedo para px do canvas.
      fator: rect.width > 0 ? VL / rect.width : 1,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    const estado = dragState.current;
    if (!estado || e.pointerId !== estado.pointerId) return;
    const novo = {
      x: estado.origem.x + (e.clientX - estado.startX) * estado.fator,
      y: estado.origem.y + (e.clientY - estado.startY) * estado.fator,
    };
    setOffset(limitarOffset(novo, zoom));
  }

  // pointerup, pointercancel (o navegador assumiu o gesto) e
  // lostpointercapture: todos encerram o arrasto do mesmo jeito.
  function handlePointerFim(e) {
    if (dragState.current?.pointerId === e.pointerId) dragState.current = null;
  }

  function handleTecla(e) {
    if (!pronto) return;
    const passo = e.shiftKey ? PASSO_TECLADO * 4 : PASSO_TECLADO;
    const movimentos = {
      // A imagem anda no sentido da seta.
      ArrowLeft: [-passo, 0],
      ArrowRight: [passo, 0],
      ArrowUp: [0, -passo],
      ArrowDown: [0, passo],
    };
    if (movimentos[e.key]) {
      e.preventDefault();
      const [dx, dy] = movimentos[e.key];
      setOffset((prev) => limitarOffset({ x: prev.x + dx, y: prev.y + dy }, zoom));
    } else if (e.key === "+" || e.key === "=" || e.key === "-") {
      e.preventDefault();
      const delta = e.key === "-" ? -0.1 : 0.1;
      aplicarZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom + delta)));
    }
  }

  function aplicarZoom(novoZoom) {
    setZoom(novoZoom);
    setOffset((prev) => limitarOffset(prev, novoZoom));
  }

  function cancelar() {
    if (!isSaving) onCancel?.();
  }

  async function handleConfirmar() {
    const img = imgRef.current;
    if (!img) return;
    setErro(null);

    const canvasSaida = document.createElement("canvas");
    canvasSaida.width = SL;
    canvasSaida.height = SA;
    const ctx = canvasSaida.getContext("2d");

    const escalaBase = Math.max(VL / img.width, VA / img.height);
    const escala = escalaBase * zoom;
    const fatorSaida = SL / VL;

    const largura = img.width * escala * fatorSaida;
    const altura = img.height * escala * fatorSaida;
    const x = (SL - largura) / 2 + offset.x * fatorSaida;
    const y = (SA - altura) / 2 + offset.y * fatorSaida;

    ctx.drawImage(img, x, y, largura, altura);

    canvasSaida.toBlob(
      (blob) => {
        if (!blob) {
          setErro("Não foi possível gerar a imagem recortada. Tente de novo.");
          return;
        }
        const file = new File([blob], "imagem.webp", { type: "image/webp" });
        onConfirm(file);
      },
      "image/webp",
      0.85
    );
  }

  return (
    <dialog
      ref={refDialogo}
      aria-labelledby={idTitulo}
      className="dialogo"
      // Esc: o navegador fecharia sozinho; quem manda no estado é o chamador.
      // Durante o envio, o modal fica aberto.
      onCancel={(e) => {
        e.preventDefault();
        cancelar();
      }}
    >
      {/* Conteúdo sempre montado: o fade de saída do .dialogo mostra o recorte, não um quadro vazio. */}
      <div className="bg-card text-card-foreground rounded-xl shadow-elevated border border-border p-5 flex flex-col items-center gap-4">
          <div className="flex items-center justify-between gap-3 w-full">
            <h2 id={idTitulo} className="font-sans text-h6 font-bold text-foreground tracking-normal">
              Ajustar imagem
            </h2>
            <button
              type="button"
              onClick={cancelar}
              disabled={isSaving}
              aria-label="Cancelar e fechar"
              className="h-toque w-toque -mr-2 shrink-0 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div
            tabIndex={pronto ? 0 : -1}
            role="group"
            aria-label="Área de recorte"
            aria-describedby={idAjuda}
            className={`relative overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing border-2 border-input bg-muted ${
              shape === "circle" ? "rounded-full" : "rounded-lg"
            }`}
            style={{ width: VL, maxWidth: "100%", aspectRatio: `${VL} / ${VA}` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerFim}
            onPointerCancel={handlePointerFim}
            onLostPointerCapture={handlePointerFim}
            onKeyDown={handleTecla}
          >
            {!pronto && !erro && (
              <div className="absolute inset-0 flex items-center justify-center" role="status">
                <Loader2 size={24} className="animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Carregando imagem…</span>
              </div>
            )}
            {erro && !pronto && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground" aria-hidden="true">
                <ImageOff size={28} />
              </div>
            )}
            <canvas
              ref={canvasRef}
              width={VL}
              height={VA}
              className={pronto ? "block w-full h-full" : "hidden"}
            />
          </div>

          <p id={idAjuda} className="text-caption text-muted-foreground text-center">
            Arraste a imagem ou use as setas para posicionar.
          </p>

          <div className="flex items-center gap-3 w-full">
            <ZoomIn size={18} className="text-muted-foreground shrink-0" aria-hidden="true" />
            <input
              type="range"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step="0.01"
              value={zoom}
              onChange={(e) => aplicarZoom(Number(e.target.value))}
              disabled={!pronto}
              aria-label="Zoom"
              aria-valuetext={`${Math.round(zoom * 100)}%`}
              className="w-full h-toque accent-primary cursor-pointer disabled:cursor-not-allowed"
            />
          </div>

          {erro && (
            <p role="alert" className="w-full text-body-sm text-destructive">
              {erro}
            </p>
          )}

          <div className="flex gap-3 w-full">
            <Button type="button" variant="outline" className="flex-1" onClick={cancelar} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleConfirmar}
              disabled={isSaving || !pronto}
              aria-busy={isSaving}
            >
              {isSaving ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Check aria-hidden="true" />
              )}
              {isSaving ? "Salvando…" : "Usar imagem"}
            </Button>
          </div>
        </div>
    </dialog>
  );
}
