"use client";

import { useId, useState } from "react";
import { SlidersHorizontal, Check, MapPin } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import dynamic from "next/dynamic";

// carrega o sheet sob demanda so no celular
const BottomSheet = dynamic(() => import("@/app/components/ui/BottomSheet"), { ssr: false });
import FaixaPreco from "./FaixaPreco";
import { cn } from "@/lib/utils";

export const FILTROS_PADRAO = {
  categoriaId: "",
  precoMin: null,
  precoMax: null,
  avaliacaoMin: 0,
  comHorarioHoje: false,
  pertoDeMim: false,
  ordenacao: "relevancia",
};

export function filtrosAtivos(filtros) {
  return (
    !!filtros.categoriaId ||
    filtros.precoMin != null ||
    filtros.precoMax != null ||
    filtros.avaliacaoMin > 0 ||
    filtros.comHorarioHoje ||
    filtros.pertoDeMim ||
    filtros.ordenacao !== "relevancia"
  );
}

function Pill({ ativo, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "px-3.5 h-9 pointer-coarse:h-11 rounded-md text-body-sm font-medium border transition-colors cursor-pointer",
        ativo
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-transparent text-foreground border-border hover:bg-muted"
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function CamposFiltro({
  filtros,
  onChange,
  categorias,
  statusLocalizacao,
  onAtivarPertoDeMim,
  onDesativarPertoDeMim,
}) {
  const idOrdenacao = useId();
  const avaliacoes = [0, 3, 4, 4.5];
  const localizando = statusLocalizacao === "buscando";

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
        <p className="font-semibold text-body-sm text-foreground mb-2.5">Localização</p>
        <button
          type="button"
          onClick={() => (filtros.pertoDeMim ? onDesativarPertoDeMim() : onAtivarPertoDeMim())}
          disabled={localizando}
          className={cn(
            "w-full flex items-center justify-center gap-2 h-11 rounded-lg text-body-sm font-semibold border transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait",
            filtros.pertoDeMim
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-transparent text-foreground border-border hover:bg-muted"
          )}
        >
          <MapPin size={16} aria-hidden="true" />
          {localizando ? "Localizando..." : filtros.pertoDeMim ? "Perto de mim ativado" : "Perto de mim"}
        </button>
        {statusLocalizacao === "erro" && (
          <p className="text-caption text-destructive mt-2">
            Não foi possível acessar sua localização. Verifique a permissão do navegador.
          </p>
        )}
      </div>

      <FaixaPreco
        min={filtros.precoMin}
        max={filtros.precoMax}
        onChange={({ min, max }) => onChange({ ...filtros, precoMin: min, precoMax: max })}
      />

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
        <span className="size-6 shrink-0 border-2 border-input rounded-md flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 transition-colors">
          <Check size={14} className="text-primary-foreground opacity-0 peer-checked:opacity-100" strokeWidth={3} aria-hidden="true" />
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
          className="w-full h-11 bg-background border border-input rounded-lg px-3 text-foreground text-body-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

// sheet no celular e sidebar no desktop
export default function FilterDrawer({
  filtros,
  onChange,
  categorias,
  statusLocalizacao,
  onAtivarPertoDeMim,
  onDesativarPertoDeMim,
}) {
  const [abertoMobile, setAbertoMobile] = useState(false);
  const ativo = filtrosAtivos(filtros);
  const propsCampos = {
    filtros,
    onChange,
    categorias,
    statusLocalizacao,
    onAtivarPertoDeMim,
    onDesativarPertoDeMim,
  };

  return (
    <>
      <div className="max-lg:block lg:hidden">
        <Button variant="outline" onClick={() => setAbertoMobile(true)} className="relative">
          <SlidersHorizontal size={16} aria-hidden="true" />
          Filtros
          {ativo && <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-primary" aria-hidden="true" />}
        </Button>
        <BottomSheet open={abertoMobile} onClose={() => setAbertoMobile(false)} title="Filtros">
          <CamposFiltro {...propsCampos} />
          <div className="flex gap-3 mt-8 pb-2">
            <Button variant="outline" className="flex-1" onClick={() => onChange(FILTROS_PADRAO)}>
              Limpar
            </Button>
            <Button className="flex-1" onClick={() => setAbertoMobile(false)}>
              Ver resultados
            </Button>
          </div>
        </BottomSheet>
      </div>

      {/* sticky abaixo do header */}
      <aside className="max-lg:hidden lg:block lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto w-72 shrink-0 bg-card border border-border rounded-xl p-5 h-fit">
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
        <CamposFiltro {...propsCampos} />
      </aside>
    </>
  );
}
