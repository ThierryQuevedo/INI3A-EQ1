"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, Check, Loader2 } from "lucide-react";

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
  const VL = 320; // largura do viewport exibido no modal (px)
  const VA = Math.round(VL / aspect); // altura do viewport, respeitando a proporção
  const SL = outputWidth; // largura de saída
  const SA = outputHeight || Math.round(outputWidth / aspect); // altura de saída

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const dragState = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (!open || !imageSrc) return;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setPronto(false);

    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setPronto(true);
    };
    img.src = imageSrc;
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
    dragState.current = { startX: e.clientX, startY: e.clientY, origem: offset };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    const novo = {
      x: dragState.current.origem.x + dx,
      y: dragState.current.origem.y + dy,
    };
    setOffset(limitarOffset(novo, zoom));
  }

  function handlePointerUp() {
    dragState.current = null;
  }

  function handleZoomChange(e) {
    const novoZoom = Number(e.target.value);
    setZoom(novoZoom);
    setOffset((prev) => limitarOffset(prev, novoZoom));
  }

  async function handleConfirmar() {
    const img = imgRef.current;
    if (!img) return;

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
        if (!blob) return;
        const file = new File([blob], "imagem.webp", { type: "image/webp" });
        onConfirm(file);
      },
      "image/webp",
      0.85
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-elevated w-full max-w-sm p-5 flex flex-col items-center gap-4">
        <div className="flex items-center justify-between w-full">
          <h3 className="font-display font-semibold text-lg">Ajustar imagem</h3>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground p-1"
            aria-label="Cancelar"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className={`overflow-hidden touch-none cursor-grab active:cursor-grabbing border-2 border-border ${
            shape === "circle" ? "rounded-full" : "rounded-xl"
          }`}
          style={{ width: VL, height: VA }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {!pronto && (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={VL}
            height={VA}
            className={pronto ? "block" : "hidden"}
          />
        </div>

        <div className="flex items-center gap-2 w-full">
          <ZoomIn size={16} className="text-muted-foreground shrink-0" />
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={handleZoomChange}
            className="w-full accent-primary"
          />
        </div>

        <div className="flex gap-2 w-full">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary/40 transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={isSaving || !pronto}
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            {isSaving ? "Salvando..." : "Usar imagem"}
          </button>
        </div>
      </div>
    </div>
  );
}