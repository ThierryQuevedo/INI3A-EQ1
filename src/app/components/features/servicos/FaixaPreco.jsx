"use client";

import { useId, useState } from "react";
import { formatarPreco } from "@/app/components/ui/PriceTag";

// no topo o maximo vira sem limite
export const PRECO_TETO = 5000;

// degraus progressivos para os precos comuns nao ficarem espremidos
function gerarDegraus() {
  const degraus = [];
  for (let v = 0; v < 200; v += 10) degraus.push(v);
  for (let v = 200; v < 1000; v += 50) degraus.push(v);
  for (let v = 1000; v <= PRECO_TETO; v += 250) degraus.push(v);
  return degraus;
}
const DEGRAUS = gerarDegraus();
const ULTIMO = DEGRAUS.length - 1;

// posicao de valor fora dos degraus
function indiceAbaixo(valor) {
  return Math.max(0, DEGRAUS.findLastIndex((d) => d <= valor));
}
function indiceAcima(valor) {
  const i = DEGRAUS.findIndex((d) => d >= valor);
  return i === -1 ? ULTIMO : i;
}

function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo);
}

// converte texto em numero ou null
function lerValor(texto) {
  const limpo = String(texto).replace(/[^\d,.]/g, "").replace(/\./g, "").replace(",", ".");
  if (!limpo) return null;
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : null;
}

// rascunho local que so aplica ao sair ou com enter
function CampoPreco({ id, rotulo, valor, placeholder, onConfirmar }) {
  const [rascunho, setRascunho] = useState(valor == null ? "" : String(valor));

  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="text-caption text-muted-foreground mb-1 block">
        {rotulo}
      </label>
      <div className="flex items-center h-11 rounded-lg border border-border bg-background px-3 gap-1.5 focus-within:ring-2 focus-within:ring-ring">
        <span className="text-body-sm text-muted-foreground" aria-hidden="true">R$</span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={rascunho}
          placeholder={placeholder}
          onChange={(e) => setRascunho(e.target.value)}
          onBlur={() => onConfirmar(lerValor(rascunho))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onConfirmar(lerValor(rascunho));
            }
          }}
          className="min-w-0 w-full bg-transparent text-body-sm text-foreground tabular-nums outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}

// faixa de preco de 0 a 5000
export default function FaixaPreco({ min, max, onChange }) {
  const id = useId();
  const valorMin = min ?? 0;
  const valorMax = max ?? PRECO_TETO;

  function alterarMin(novo) {
    const v = limitar(novo ?? 0, 0, valorMax);
    onChange({ min: v <= 0 ? null : v, max });
  }

  function alterarMax(novo) {
    const v = limitar(novo ?? PRECO_TETO, valorMin, PRECO_TETO);
    onChange({ min, max: v >= PRECO_TETO ? null : v });
  }

  const posMin = indiceAbaixo(valorMin);
  const posMax = indiceAcima(valorMax);
  const pct = (i) => (i / ULTIMO) * 100;
  const rotuloMax = max == null ? `${formatarPreco(PRECO_TETO)}+` : formatarPreco(valorMax);
  // minimo fica por cima para dar para puxar
  const minPorCima = posMin > ULTIMO / 2;

  return (
    <fieldset className="min-w-0">
      <legend className="font-semibold text-body-sm text-foreground mb-1">Preço</legend>
      <p className="text-body-sm text-muted-foreground tabular-nums mb-1" aria-live="polite">
        {formatarPreco(valorMin)} – {rotuloMax}
      </p>

      <div className="relative h-11">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-muted" aria-hidden="true" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-primary"
          style={{ left: `${pct(posMin)}%`, right: `${100 - pct(posMax)}%` }}
          aria-hidden="true"
        />
        <input
          type="range"
          min={0}
          max={ULTIMO}
          step={1}
          value={posMin}
          aria-label="Preço mínimo"
          aria-valuetext={formatarPreco(valorMin)}
          onChange={(e) => alterarMin(DEGRAUS[Number(e.target.value)])}
          className={`faixa-preco-controle absolute inset-0 w-full h-full ${minPorCima ? "z-20" : "z-10"}`}
        />
        <input
          type="range"
          min={0}
          max={ULTIMO}
          step={1}
          value={posMax}
          aria-label="Preço máximo"
          aria-valuetext={max == null ? `${formatarPreco(PRECO_TETO)} ou mais` : formatarPreco(valorMax)}
          onChange={(e) => alterarMax(DEGRAUS[Number(e.target.value)])}
          className="faixa-preco-controle absolute inset-0 w-full h-full z-10"
        />
      </div>

      <div className="flex gap-3 mt-1">
        <CampoPreco
          key={`min-${min ?? "vazio"}`}
          id={`${id}-min`}
          rotulo="Mínimo"
          valor={min}
          placeholder="0"
          onConfirmar={alterarMin}
        />
        <CampoPreco
          key={`max-${max ?? "vazio"}`}
          id={`${id}-max`}
          rotulo="Máximo"
          valor={max}
          placeholder="5.000+"
          onConfirmar={alterarMax}
        />
      </div>
    </fieldset>
  );
}
