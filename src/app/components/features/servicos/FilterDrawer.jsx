"use client";

import { useId, useState } from "react";
import { SlidersHorizontal, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import BottomSheet from "@/app/components/ui/BottomSheet";
import { formatarPreco } from "@/app/components/ui/PriceTag";
import { cn } from "@/lib/utils";

export const FILTROS_PADRAO = {
  categoriaId: "",
  precoMax: null,
  avaliacaoMin: 0,
  comHorarioHoje: false,
  ordenacao: "relevancia",
};

export function filtrosAtivos(filtros, precoMaximo) {
  return (
    !!filtros.categoriaId ||
    (filtros.precoMax != null && filtros.precoMax < precoMaximo) ||
    filtros.avaliacaoMin > 0 ||
    filtros.comHorarioHoje ||
    filtros.ordenacao !== "relevancia"
  );
}

function Pill({ ativo, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "px-3.5 h-9 rounded-full text-body-sm font-medium border transition-colors cursor-pointer",
        ativo
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-foreground border-border hover:bg-muted"
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function CamposFiltro({ filtros, onChange, categorias, precoMaximo }) {
  const idPreco = useId();
  const idOrdenacao = useId();
  const avaliacoes = [0, 3, 4, 4.5];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-semibold text-body-sm text-foreground mb-2.5">Categoria</p>
        <div className="flex flex-wrap gap-2">
          <Pill ativo={!filtros.categoriaId} onClick={() => onChange({ ...filtros, categoriaId: "" })}>
            Todas
          </Pill>
          {categorias.map((categoria) => (
            <Pill
              key={categoria.id}
              ativo={filtros.categoriaId === String(categoria.id)}
              onClick={() => onChange({ ...filtros, categoriaId: String(categoria.id) })}
            >
              {categoria.nome}
            </Pill>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor={idPreco} className="font-semibold text-body-sm text-foreground mb-2.5 block">
          Preço até {formatarPreco(filtros.precoMax ?? precoMaximo)}
        </label>
        <input
          id={idPreco}
          type="range"
          min={0}
          max={precoMaximo}
          step={Math.max(1, Math.round(precoMaximo / 50))}
          value={filtros.precoMax ?? precoMaximo}
          onChange={(e) => onChange({ ...filtros, precoMax: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>

      <div>
        <p className="font-semibold text-body-sm text-foreground mb-2.5">Avaliação mínima</p>
        <div className="flex flex-wrap gap-2">
          {avaliacoes.map((valor) => (
            <Pill
              key={valor}
              ativo={filtros.avaliacaoMin === valor}
              onClick={() => onChange({ ...filtros, avaliacaoMin: valor })}
            >
              {valor === 0 ? "Qualquer" : `${valor}+`}
            </Pill>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer group py-1">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={filtros.comHorarioHoje}
          onChange={(e) => onChange({ ...filtros, comHorarioHoje: e.target.checked })}
        />
        <span className="size-6 shrink-0 border-2 border-input rounded-md flex items-center justify-center peer-checked:bg-accent peer-checked:border-accent peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 transition-colors">
          <Check size={14} className="text-accent-foreground opacity-0 peer-checked:opacity-100" strokeWidth={3} aria-hidden="true" />
        </span>
        <span className="text-foreground text-body-sm font-medium">Com horário hoje</span>
      </label>

      <div>
        <label htmlFor={idOrdenacao} className="font-semibold text-body-sm text-foreground mb-2.5 block">
          Ordenar por
        </label>
        <select
          id={idOrdenacao}
          value={filtros.ordenacao}
          onChange={(e) => onChange({ ...filtros, ordenacao: e.target.value })}
          className="w-full h-11 bg-background border border-input rounded-xl px-3 text-foreground text-body-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="relevancia">Relevância</option>
          <option value="avaliacao">Melhor avaliados</option>
          <option value="preco_asc">Menor preço</option>
          <option value="preco_desc">Maior preço</option>
        </select>
      </div>
    </div>
  );
}

/** Sheet no mobile, sidebar fixa no desktop — substitui MenuFiltros.jsx. */
export default function FilterDrawer({ filtros, onChange, categorias, precoMaximo }) {
  const [abertoMobile, setAbertoMobile] = useState(false);
  const ativo = filtrosAtivos(filtros, precoMaximo);

  return (
    <>
      <div className="max-md:block md:hidden">
        <Button variant="outline" onClick={() => setAbertoMobile(true)} className="relative">
          <SlidersHorizontal size={16} aria-hidden="true" />
          Filtros
          {ativo && <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-accent" aria-hidden="true" />}
        </Button>
        <BottomSheet open={abertoMobile} onClose={() => setAbertoMobile(false)} title="Filtros">
          <CamposFiltro filtros={filtros} onChange={onChange} categorias={categorias} precoMaximo={precoMaximo} />
          <div className="flex gap-3 mt-8 pb-2">
            <Button variant="outline" className="flex-1" onClick={() => onChange(FILTROS_PADRAO)}>
              Limpar
            </Button>
            <Button variant="accent" className="flex-1" onClick={() => setAbertoMobile(false)}>
              Ver resultados
            </Button>
          </div>
        </BottomSheet>
      </div>

      <aside className="max-md:hidden md:block w-72 shrink-0 bg-card border border-border rounded-2xl p-5 h-fit">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-body-lg text-foreground">Filtros</h2>
          {ativo && (
            <button
              type="button"
              onClick={() => onChange(FILTROS_PADRAO)}
              className="text-primary text-body-sm font-medium hover:underline cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>
        <CamposFiltro filtros={filtros} onChange={onChange} categorias={categorias} precoMaximo={precoMaximo} />
      </aside>
    </>
  );
}
