import Link from "next/link";
import { Search, CalendarDays, Clock, Star } from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { servicos, usuarios, categorias, prestadores } from "@/db/schema";
import CatalogoGrid from "@/app/components/features/servicos/CatalogoGrid";
import CategoryPill from "@/app/components/features/servicos/CategoryPill";
import ServiceCard from "@/app/components/features/servicos/ServiceCard";
import SecaoPertoDeVoce from "@/app/components/features/home/SecaoPertoDeVoce";
import { comEstatisticas } from "@/lib/avaliacoes";
import { getSession } from "@/app/actions/auth.actions";
import { listarCategorias } from "@/app/actions/servicos.actions";
import { buscarDashboardCliente } from "@/app/actions/clientes.actions";
import { calcularProximosHorariosLivres } from "@/app/actions/disponibilidades.actions";
import { ehHoje } from "@/lib/disponibilidade";

export const dynamic = "force-dynamic";

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
    <div className="min-h-screen bg-background text-foreground">
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-8">
        <h1 className="text-h4 sm:text-h3 font-black font-display tracking-tight text-foreground mb-2">
          Encontre um profissional e agende na hora.
        </h1>
        <p className="text-muted-foreground text-body mb-6">
          Veja os horários livres na agenda de quem você procura e marque sem sair do app.
        </p>

        <form action="/servicos" method="GET" className="flex items-center gap-2 bg-card border border-border rounded-full shadow-soft px-2 py-2 max-w-xl">
          <Search size={18} className="text-muted-foreground ml-2 shrink-0" aria-hidden="true" />
          <label htmlFor="busca-home" className="sr-only">Buscar por serviço, prestador ou categoria</label>
          <input
            id="busca-home"
            type="search"
            name="q"
            placeholder="Corte de cabelo, manicure, aula de inglês..."
            className="flex-1 bg-transparent outline-none text-body placeholder:text-muted-foreground min-w-0"
          />
          <button
            type="submit"
            className="bg-accent hover:bg-accent-hover text-accent-foreground font-bold px-5 h-11 rounded-full transition-colors duration-200 cursor-pointer shrink-0"
          >
            Buscar
          </button>
        </form>
      </section>

      {agendamentoProximo && (
        <section className="max-w-6xl mx-auto px-6 pb-8">
          <Link
            href="/agendamentos"
            className="flex items-center gap-4 bg-secondary text-secondary-foreground rounded-2xl p-4 sm:p-5 hover:bg-secondary/80 transition-colors"
          >
            <div className="h-11 w-11 rounded-full bg-card/60 flex items-center justify-center shrink-0">
              <CalendarDays size={20} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-caption font-bold uppercase tracking-wide opacity-80">Seu próximo agendamento</p>
              <p className="text-body font-semibold truncate">
                {agendamentoProximo.servicoNome} com {agendamentoProximo.prestadorNome} ·{" "}
                {new Date(agendamentoProximo.dataHora).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}{" "}
                às{" "}
                {new Date(agendamentoProximo.dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </Link>
        </section>
      )}

      {listaCategorias.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-8 border-t border-border">
          <div className="mb-5">
            <p className="text-h6 font-bold text-foreground">O que você está procurando hoje?</p>
          </div>
          <nav
            className="flex flex-nowrap gap-3 overflow-x-auto no-scrollbar -mx-6 px-6 pb-1"
            aria-label="Categorias de serviço"
          >
            {listaCategorias.map((categoria) => (
              <CategoryPill key={categoria.id} id={categoria.id} nome={categoria.nome} />
            ))}
          </nav>
        </section>
      )}

      <SecaoPertoDeVoce catalogo={catalogoComHorario} />

      {comHorarioHoje.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-10 border-t border-border">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={18} className="text-primary" aria-hidden="true" />
            <p className="text-h6 font-bold text-foreground">Com horário hoje</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {comHorarioHoje.map((servico) => (
              <ServiceCard key={servico.id} servico={servico} />
            ))}
          </div>
        </section>
      )}

      {maisBemAvaliados.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-10 border-t border-border">
          <div className="flex items-center gap-2 mb-6">
            <Star size={18} className="text-primary" aria-hidden="true" />
            <p className="text-h6 font-bold text-foreground">Mais bem avaliados</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {maisBemAvaliados.map((servico) => (
              <ServiceCard key={servico.id} servico={servico} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-6 py-10 border-t border-border">
        <div className="flex items-center justify-between mb-6">
          <p className="text-h6 font-bold text-foreground">Catálogo completo</p>
          <Link href="/servicos" className="text-body-sm font-medium text-primary hover:underline shrink-0">
            Ver tudo
          </Link>
        </div>
        <CatalogoGrid catalogo={catalogoComHorario} />
      </section>
    </div>
  );
}
