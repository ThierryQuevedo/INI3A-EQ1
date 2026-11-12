"use client";

import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import { buscarFuzzy } from "@/lib/buscaFuzzy";
import { formatarPreco } from "@/app/components/ui/PriceTag";
import Avatar from "@/app/components/ui/Avatar";
import CategoryIcon from "@/app/components/features/servicos/CategoryIcon";

const CAMPOS_SERVICO = [
  { chave: "nome", peso: 1 },
  { chave: "categoria", peso: 0.75 },
  { chave: "prestadorNome", peso: 0.7 },
];

// destaca o que casou com a busca
function Realce({ texto, indices }) {
  if (!texto) return null;
  if (!indices?.length) return texto;
  const marcados = new Set(indices);
  const partes = [];
  let atual = "";
  let marcadoAtual = marcados.has(0);
  for (let i = 0; i < texto.length; i++) {
    const m = marcados.has(i);
    if (m !== marcadoAtual) {
      partes.push({ t: atual, m: marcadoAtual });
      atual = "";
      marcadoAtual = m;
    }
    atual += texto[i];
  }
  partes.push({ t: atual, m: marcadoAtual });
  return partes.map((p, i) =>
    p.m ? (
      <mark key={i} className="bg-transparent text-primary font-bold">
        {p.t}
      </mark>
    ) : (
      <span key={i}>{p.t}</span>
    )
  );
}

function TituloGrupo({ children }) {
  return (
    <li role="presentation" className="px-3 pt-3 pb-1 text-caption font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </li>
  );
}

// busca da home no padrao combobox
export default function BuscaHome({ servicos, categorias }) {
  const router = useRouter();
  const idBase = useId();
  const idLista = `${idBase}-lista`;
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const [termo, setTermo] = useState("");
  const [aberto, setAberto] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);
  const termoAdiado = useDeferredValue(termo);

  // profissionais unicos do indice
  const profissionais = useMemo(() => {
    const porId = new Map();
    for (const s of servicos) {
      if (!s.prestadorId || porId.has(s.prestadorId)) continue;
      porId.set(s.prestadorId, {
        id: s.prestadorId,
        nome: s.prestadorNome,
        slug: s.prestadorSlug,
        urlImagem: s.prestadorImagem,
        categorias: new Set(),
        totalServicos: 0,
      });
    }
    for (const s of servicos) {
      const p = porId.get(s.prestadorId);
      if (!p) continue;
      p.totalServicos++;
      if (s.categoria) p.categorias.add(s.categoria);
    }
    return [...porId.values()].map((p) => ({ ...p, categorias: [...p.categorias].join(", ") }));
  }, [servicos]);

  const resultados = useMemo(() => {
    const t = termoAdiado.trim();
    if (!t) return null;
    const achadosServicos = buscarFuzzy(servicos, t, CAMPOS_SERVICO, { limite: 5 });
    const achadosProfissionais = buscarFuzzy(profissionais, t, [{ chave: "nome" }], { limite: 3, notaMinima: 0.45 });
    const achadosCategorias = buscarFuzzy(categorias, t, [{ chave: "nome" }], { limite: 3, notaMinima: 0.45 });

    // lista na ordem visual
    const opcoes = [
      ...achadosServicos.map((r) => ({ tipo: "servico", ...r, href: `/servicos/${r.item.slug || r.item.id}` })),
      ...achadosProfissionais.map((r) => ({
        tipo: "profissional",
        ...r,
        href: `/prestador/${r.item.slug || r.item.id}`,
      })),
      ...achadosCategorias.map((r) => ({ tipo: "categoria", ...r, href: `/servicos?categoria=${r.item.id}` })),
    ].map((o, i) => ({ ...o, indice: i, id: `${idBase}-op-${i}` }));

    return { opcoes, total: opcoes.length };
  }, [termoAdiado, servicos, profissionais, categorias, idBase]);

  const opcoes = resultados?.opcoes ?? [];
  const mostrarPainel = aberto && termo.trim().length > 0 && resultados !== null;
  const idAtivo = mostrarPainel && opcoes[indiceAtivo] ? opcoes[indiceAtivo].id : undefined;

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setAberto(false);
    }
    document.addEventListener("pointerdown", aoClicarFora);
    return () => document.removeEventListener("pointerdown", aoClicarFora);
  }, [aberto]);

  // mantem a opcao ativa visivel
  useEffect(() => {
    if (!idAtivo) return;
    document.getElementById(idAtivo)?.scrollIntoView({ block: "nearest" });
  }, [idAtivo]);

  function irPara(opcao) {
    setAberto(false);
    router.push(opcao.href);
  }

  function aoTeclar(e) {
    if (e.key === "Escape") {
      if (mostrarPainel) {
        e.preventDefault();
        setAberto(false);
      }
      return;
    }
    if (!opcoes.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAberto(true);
      setIndiceAtivo((i) => (i + 1 >= opcoes.length ? 0 : i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAberto(true);
      setIndiceAtivo((i) => (i <= 0 ? opcoes.length - 1 : i - 1));
    } else if (e.key === "Enter" && mostrarPainel && opcoes[indiceAtivo]) {
      e.preventDefault();
      irPara(opcoes[indiceAtivo]);
    }
  }

  function limpar() {
    setTermo("");
    setAberto(false);
    inputRef.current?.focus();
  }

  const classeOpcao = (o) =>
    cn(
      "flex items-center gap-3 mx-1.5 px-2 py-2 min-h-11 rounded-lg cursor-pointer transition-colors",
      o.indice === indiceAtivo ? "bg-muted" : "hover:bg-muted/60"
    );

  function propsOpcao(o) {
    return {
      id: o.id,
      role: "option",
      "aria-selected": o.indice === indiceAtivo,
      className: classeOpcao(o),
      // evita perder o foco antes do clique
      onPointerDown: (e) => e.preventDefault(),
      onPointerMove: () => setIndiceAtivo(o.indice),
      onClick: () => irPara(o),
    };
  }

  const servicosAchados = opcoes.filter((o) => o.tipo === "servico");
  const profissionaisAchados = opcoes.filter((o) => o.tipo === "profissional");
  const categoriasAchadas = opcoes.filter((o) => o.tipo === "categoria");

  return (
    <div ref={containerRef} className="relative w-full md:max-w-sm shrink-0">
      <Form action="/servicos/" onSubmit={() => setAberto(false)} className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <label htmlFor="busca-home" className="sr-only">
          Buscar por serviço, prestador ou categoria
        </label>
        <input
          ref={inputRef}
          id="busca-home"
          type="search"
          name="q"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={mostrarPainel}
          aria-controls={idLista}
          aria-activedescendant={idAtivo}
          value={termo}
          onChange={(e) => {
            setTermo(e.target.value);
            // termo novo zera a opcao ativa
            setIndiceAtivo(-1);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          onKeyDown={aoTeclar}
          placeholder="Buscar serviço ou profissional"
          className={cn(
            "w-full h-12 rounded-lg border border-input bg-card pl-10 pr-11 text-body text-foreground placeholder:text-muted-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent [&::-webkit-search-cancel-button]:appearance-none",
            mostrarPainel && "shadow-card"
          )}
        />
        {termo && (
          <button
            type="button"
            onClick={limpar}
            aria-label="Limpar busca"
            className="absolute right-1 top-1/2 -translate-y-1/2 size-10 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </Form>

      {/* leitor de tela ouve o total */}
      <p className="sr-only" role="status" aria-live="polite">
        {mostrarPainel
          ? opcoes.length
            ? `${opcoes.length} sugest${opcoes.length === 1 ? "ão" : "ões"}. Use as setas para navegar.`
            : "Nenhuma sugestão."
          : ""}
      </p>

      {mostrarPainel && (
        <div className="entrada-suave absolute top-full right-0 left-0 md:left-auto md:w-[28rem] mt-2 z-50 rounded-xl border border-border bg-popover text-popover-foreground shadow-elevated overflow-hidden">
          {opcoes.length > 0 ? (
            <ul id={idLista} role="listbox" aria-label="Sugestões de busca" className="max-h-[min(26rem,60vh)] overflow-y-auto overscroll-contain pb-1.5">
              {servicosAchados.length > 0 && <TituloGrupo>Serviços</TituloGrupo>}
              {servicosAchados.map((o) => (
                <li key={o.id} {...propsOpcao(o)}>
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-lg">
                    {o.item.urlImagem ? (
                      <Image src={o.item.urlImagem} alt="" fill sizes="44px" className="object-cover" />
                    ) : (
                      <span className="size-full inline-flex items-center justify-center bg-secondary text-secondary-foreground">
                        <CategoryIcon nome={o.item.categoria} size={18} />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-sm font-semibold text-foreground">
                      <Realce texto={o.item.nome} indices={o.realces.nome} />
                    </span>
                    <span className="block truncate text-caption text-muted-foreground">
                      <Realce texto={o.item.prestadorNome} indices={o.realces.prestadorNome} />
                      {o.item.categoria && (
                        <>
                          {" · "}
                          <Realce texto={o.item.categoria} indices={o.realces.categoria} />
                        </>
                      )}
                    </span>
                  </span>
                  <span className="shrink-0 text-body-sm font-semibold text-foreground tabular-nums">
                    {formatarPreco(o.item.preco)}
                  </span>
                </li>
              ))}

              {profissionaisAchados.length > 0 && <TituloGrupo>Profissionais</TituloGrupo>}
              {profissionaisAchados.map((o) => (
                <li key={o.id} {...propsOpcao(o)}>
                  <Avatar nome={o.item.nome} urlImagem={o.item.urlImagem} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-sm font-semibold text-foreground">
                      <Realce texto={o.item.nome} indices={o.realces.nome} />
                    </span>
                    <span className="block truncate text-caption text-muted-foreground">
                      {o.item.totalServicos} serviço{o.item.totalServicos === 1 ? "" : "s"}
                      {o.item.categorias && ` · ${o.item.categorias}`}
                    </span>
                  </span>
                </li>
              ))}

              {categoriasAchadas.length > 0 && <TituloGrupo>Categorias</TituloGrupo>}
              {categoriasAchadas.map((o) => (
                <li key={o.id} {...propsOpcao(o)}>
                  <span className="size-8 shrink-0 inline-flex items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <CategoryIcon nome={o.item.nome} size={16} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-body-sm font-semibold text-foreground">
                    <Realce texto={o.item.nome} indices={o.realces.nome} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div id={idLista} className="flex flex-col items-center gap-2 px-6 py-6 text-center">
              <SearchX size={22} className="text-muted-foreground" aria-hidden="true" />
              <p className="text-body-sm text-foreground">
                Nada encontrado para <strong className="font-semibold">“{termo.trim()}”</strong>.
              </p>
              <p className="text-caption text-muted-foreground">Tente outra palavra ou veja o catálogo completo.</p>
            </div>
          )}

          <button
            type="button"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => {
              setAberto(false);
              router.push(`/servicos?q=${encodeURIComponent(termo.trim())}`);
            }}
            className="flex w-full items-center justify-between gap-2 border-t border-border px-4 min-h-11 text-body-sm font-semibold text-primary hover:bg-muted/60 transition-colors cursor-pointer"
          >
            <span className="truncate">Ver todos os resultados para “{termo.trim()}”</span>
            <ArrowRight size={16} className="shrink-0" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
