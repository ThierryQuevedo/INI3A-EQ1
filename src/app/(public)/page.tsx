import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { servicos, usuarios, categorias } from "@/db/schema";
import CardServicoCatalogo from "@/app/components/features/servicos/CardServicoCatalogo";

export const dynamic = "force-dynamic";

const CATEGORIAS_EM_ALTA = [
  "Barbearia & Cabelo",
  "Estética & Manicure",
  "Aulas Particulares",
  "Manutenção & Mecânica",
  "Saúde & Bem-estar",
  "Consultorias",
];

export default async function Home() {
  const catalogo = await db
    .select({
      id: servicos.id,
      slug: servicos.slug,
      nomeServico: servicos.nome,
      preco: servicos.preco,
      duracao: servicos.duracaoEstimada,
      nomeProfissional: usuarios.nome,
      nomeCategoria: categorias.nome,
    })
    .from(servicos)
    .leftJoin(usuarios, eq(servicos.prestadorId, usuarios.id))
    .leftJoin(categorias, eq(servicos.categoriaId, categorias.id))
    .orderBy(desc(servicos.id))
    .limit(10);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <header className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        <div className="lg:col-span-7 space-y-7 flex flex-col justify-center">

          <h1 className="text-h3 lg:text-h1 font-black font-display tracking-tight text-foreground">
            Não perca tempo esperando sua vez.
          </h1>

          <p className="text-muted-foreground text-body-lg max-w-xl leading-relaxed">
            Encontre profissionais locais, veja os horários livres na agenda deles e marque seu atendimento instantaneamente.
          </p>

          <div className="pt-2">
            <Link
              href="/servicos"
              className="w-full sm:w-auto bg-tcc-laranja hover:bg-tcc-laranja-dark text-white font-bold px-7 h-14 rounded-full transition-all duration-200 ease-apple active:scale-[0.98] flex items-center justify-center gap-2 text-body-lg shadow-elevated group cursor-pointer"
            >
              Ver profissionais disponíveis
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 bg-card backdrop-blur-sm p-8 rounded-2xl border border-border relative overflow-hidden h-fit shadow-card">
          <h3 className="text-foreground font-bold font-display text-h6 mb-3">Por que o Marca Aí?</h3>
          <p className="text-muted-foreground text-body-sm leading-relaxed">
            Centralizamos barbeiros, manicures, mecânicos e professores em um único ecossistema. Você escolhe, agenda e recebe notificações automáticas para não esquecer o compromisso.
          </p>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-border">
        <div className="mb-6">
          <h2 className="text-caption font-bold uppercase tracking-widest text-tcc-azul dark:text-tcc-azul-light font-display">Categorias em Alta</h2>
          <p className="text-h6 font-bold text-foreground mt-1">O que você está procurando hoje?</p>
        </div>

        <nav
          className="flex flex-nowrap gap-3 overflow-x-auto no-scrollbar -mx-6 px-6 pb-1"
          aria-label="Categorias de serviço"
        >
          {CATEGORIAS_EM_ALTA.map((category, idx) => (
            <Link href="/servicos"
              key={idx}
              className="shrink-0 whitespace-nowrap bg-muted hover:bg-tcc-laranja hover:text-white text-foreground font-medium text-body-sm px-5 h-11 inline-flex items-center rounded-full border border-border transition-all duration-200 ease-apple cursor-pointer"
            >
              {category}
            </Link>
          ))}
        </nav>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-caption font-bold uppercase tracking-widest text-tcc-azul dark:text-tcc-azul-light font-display">Catálogo</h2>
            <p className="text-h6 font-bold text-foreground mt-1">Profissionais em destaque</p>
          </div>
          <Link href="/servicos" className="text-body-sm font-medium text-tcc-azul dark:text-tcc-azul-light hover:underline shrink-0">
            Ver catálogo completo
          </Link>
        </div>

        {catalogo.length === 0 ? (
          <p className="text-muted-foreground text-body">Nenhum serviço cadastrado no momento.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {catalogo.map((servico) => (
              <Link
                key={servico.id}
                href={`/servicos/${servico.slug || servico.id}`}
                className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <CardServicoCatalogo servico={servico} avaliacao={4.3} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
