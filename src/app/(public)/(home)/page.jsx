import Link from "next/link";
import Form from "next/form";
import { Search, CalendarDays, Clock, Star, ArrowRight, ChevronRight } from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { servicos, usuarios, categorias, prestadores } from "@/db/schema";
import CategoryIcon from "@/app/components/features/servicos/CategoryIcon";
import CarrosselServicos from "@/app/components/features/home/CarrosselServicos";
import SecaoPertoDeVoce from "@/app/components/features/home/SecaoPertoDeVoce";
import { Button } from "@/app/components/ui/button";
import { comEstatisticas } from "@/lib/avaliacoes";
import { getSession } from "@/app/actions/auth.actions";
import { listarCategorias } from "@/app/actions/servicos.actions";
import { buscarDashboardCliente } from "@/app/actions/clientes.actions";
import { calcularProximosHorariosLivres } from "@/app/actions/disponibilidades.actions";
import { ehHoje } from "@/lib/disponibilidade";
import PageContainer from "@/app/components/ui/PageContainer";

export const dynamic = "force-dynamic";

function CabecalhoSecao({ Icon, titulo, href, rotuloLink = "Ver todos" }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <h2 className="flex items-center gap-2 text-h6 font-bold text-foreground">
        <Icon size={18} className="shrink-0 text-primary" aria-hidden="true" />
        {titulo}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-0.5 shrink-0 text-body-sm font-semibold text-primary hover:underline underline-offset-4"
        >
          {rotuloLink}
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export default async function Home() {
  const usuario = await getSession();

  const [catalogoBruto, listaCategorias, proximoAgendamento] = await Promise.all([
    db
      .select({
        id: servicos.id,
        slug: servicos.slug,
        nomeServico: servicos.nome,
        preco: servicos.preco,
        urlImagem: servicos.urlImagem,
        duracaoEstimada: servicos.duracaoEstimada,
        nomeProfissional: usuarios.nome,
        nomeCategoria: categorias.nome,
        prestadorLatitude: prestadores.latitude,
        prestadorLongitude: prestadores.longitude,
      })
      .from(servicos)
      .leftJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
      .leftJoin(categorias, eq(servicos.categoriaId, categorias.id))
      .leftJoin(prestadores, eq(servicos.prestadorId, prestadores.usuarioId))
      .orderBy(desc(servicos.id))
      .limit(24),
    listarCategorias(),
    usuario && usuario.tipo === "cliente" ? buscarDashboardCliente(usuario.id) : null,
  ]);

  const catalogo = await comEstatisticas(catalogoBruto);
  const proximosHorarios = await calcularProximosHorariosLivres(catalogo.map((s) => s.id));
  const catalogoComHorario = catalogo.map((s) => ({ ...s, proximoHorario: proximosHorarios[s.id] ?? null }));

  const maisBemAvaliados = [...catalogoComHorario]
    .filter((s) => s.totalAvaliacoes > 0)
    .sort((a, b) => b.avaliacaoMedia - a.avaliacaoMedia)
    .slice(0, 10);

  const comHorarioHoje = catalogoComHorario.filter((s) => ehHoje(s.proximoHorario)).slice(0, 10);

  const agendamentoProximo = proximoAgendamento?.proximos?.[0] ?? null;

  return (
    <PageContainer size="xl" className="pt-6 sm:pt-8 pb-12 space-y-10">
      {/* Topo compacto: título curto + busca enxuta, para os serviços
          aparecerem já na primeira dobra (a busca completa vive em /servicos). */}
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-h5 sm:text-h4 font-bold text-foreground">Encontre um profissional e agende na hora.</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Veja horários livres e marque sem sair do app.
          </p>
        </div>

        <Form action="/servicos/" className="relative w-full md:max-w-sm shrink-0">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <label htmlFor="busca-home" className="sr-only">Buscar por serviço, prestador ou categoria</label>
          <input
            id="busca-home"
            type="search"
            name="q"
            placeholder="Buscar serviço ou profissional"
            className="w-full h-11 rounded-lg border border-input bg-card pl-10 pr-4 text-body-sm text-foreground placeholder:text-muted-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent"
          />
        </Form>
      </section>

      {agendamentoProximo && (
        <Link
          href="/agendamentos"
          className="flex items-center gap-3 bg-secondary text-secondary-foreground rounded-xl p-3 sm:p-4 hover:bg-secondary/80 transition-colors"
        >
          <span className="size-10 rounded-full bg-card/60 inline-flex items-center justify-center shrink-0">
            <CalendarDays size={18} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-caption font-semibold opacity-80">Seu próximo agendamento</span>
            <span className="block text-body-sm font-semibold truncate">
              {agendamentoProximo.servicoNome} com {agendamentoProximo.prestadorNome} ·{" "}
              {new Date(agendamentoProximo.dataHora).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} às{" "}
              {new Date(agendamentoProximo.dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </span>
          <ChevronRight size={18} className="shrink-0 opacity-70" aria-hidden="true" />
        </Link>
      )}

      {listaCategorias.length > 0 && (
        <nav aria-label="Categorias de serviço">
          <ul className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 pb-1">
            {listaCategorias.map((categoria) => (
              <li key={categoria.id} className="shrink-0">
                <Link
                  href={`/servicos?categoria=${categoria.id}`}
                  className="group flex w-24 sm:w-28 flex-col items-center gap-2 rounded-lg p-2 text-center hover:bg-muted transition-colors"
                >
                  <span className="size-12 inline-flex items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <CategoryIcon nome={categoria.nome} size={22} className="shrink-0" />
                  </span>
                  <span className="text-caption font-medium text-foreground leading-tight line-clamp-2">{categoria.nome}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {comHorarioHoje.length > 0 && (
        <section>
          <CabecalhoSecao Icon={Clock} titulo="Com horário hoje" href="/servicos?hoje=1" />
          <CarrosselServicos servicos={comHorarioHoje} rotulo="Serviços com horário hoje" />
        </section>
      )}

      <SecaoPertoDeVoce catalogo={catalogoComHorario} />

      {maisBemAvaliados.length > 0 && (
        <section>
          <CabecalhoSecao Icon={Star} titulo="Mais bem avaliados" />
          <CarrosselServicos servicos={maisBemAvaliados} rotulo="Serviços mais bem avaliados" />
        </section>
      )}

      {/* O catálogo completo não fica na home: um CTA leva à página de catálogo. */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-primary text-primary-foreground p-6 sm:p-8">
        <div>
          <h2 className="text-h5 font-bold">Não achou o que procurava?</h2>
          <p className="text-body-sm opacity-90 mt-1">
            Explore todos os serviços, com filtros de categoria, preço, avaliação e horário.
          </p>
        </div>
        <Button asChild variant="accent" size="lg" className="shrink-0">
          <Link href="/servicos">
            Ver catálogo completo
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </PageContainer>
  );
}
