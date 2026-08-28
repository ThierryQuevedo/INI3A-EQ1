import Link from "next/link";
import { requireSession } from "@/app/actions/auth.actions";
import BotaoCancelarAgendamento from "@/app/components/features/agendamentos/BotaoCancelarAgendamento";
import CardServicoDestaque from "@/app/components/features/servicos/CardServicoDestaque";
import { db } from "@/db";
import { agendamentos, servicos, usuarios, categorias } from "@/db/schema";
import { eq, and, gte, lt, desc } from "drizzle-orm";
import { atualizarStatusAgendamento } from "@/app/actions/agendamentos.actions";

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const usuario = await requireSession();
  const nome = usuario.nome;
  const prestadorId = usuario.id;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);

  const camposAgendamento = {
    id: agendamentos.id,
    dataHora: agendamentos.dataHora,
    status: agendamentos.status,
    clienteNome: usuarios.nome,
    servicoNome: servicos.nome,
    duracaoEstimada: servicos.duracaoEstimada,
  };

  const [agendamentosHoje, agendamentosFuturos, servicosDestaque] = await Promise.all([
    db.select(camposAgendamento)
      .from(agendamentos)
      .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
      .innerJoin(usuarios, eq(agendamentos.clienteId, usuarios.id))
      .where(and(
        eq(servicos.prestadorId, prestadorId),
        gte(agendamentos.dataHora, hoje),
        lt(agendamentos.dataHora, amanha)
      ))
      .orderBy(agendamentos.dataHora),

    db.select(camposAgendamento)
      .from(agendamentos)
      .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
      .innerJoin(usuarios, eq(agendamentos.clienteId, usuarios.id))
      .where(and(
        eq(servicos.prestadorId, prestadorId),
        gte(agendamentos.dataHora, amanha)
      ))
      .orderBy(agendamentos.dataHora),

    db.select({
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
      .limit(8),
  ]);

  function formatarHora(data) {
    const d = new Date(data);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', {
      weekday: 'short', day: 'numeric', month: 'short'
    });
  }

  function statusLabel(status) {
    const map = {
      pendente:   { label: 'Pendente',   bg: 'bg-warning/15', text: 'text-warning' },
      confirmado: { label: 'Confirmado', bg: 'bg-tcc-azul/10', text: 'text-tcc-azul' },
      concluido:  { label: 'Feito',      bg: 'bg-success/15', text: 'text-success' },
      cancelado:  { label: 'Cancelado',  bg: 'bg-destructive/10', text: 'text-destructive' },
    };
    return map[status] ?? { label: status, bg: 'bg-muted', text: 'text-muted-foreground' };
  }

  function CardAgendamento({ ag }) {
    const { label, bg, text } = statusLabel(ag.status);
    const podeConfirmar = ag.status === 'pendente';
    const podeConcluir  = ag.status === 'confirmado';
    const podeCancelar  = ag.status !== 'cancelado' && ag.status !== 'concluido';

    return (
      <div className="bg-card p-4 rounded-2xl shadow-soft border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-6 items-center flex-1">
          <div className="text-center min-w-[52px]">
            <span className="text-tcc-azul font-bold text-body block">{formatarHora(ag.dataHora)}</span>
            <span className="text-muted-foreground text-caption">{formatarData(ag.dataHora)}</span>
          </div>
          <div>
            <p className="font-bold text-foreground">{ag.clienteNome}</p>
            <p className="text-body-sm text-muted-foreground">{ag.servicoNome} • {ag.duracaoEstimada} min</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`${bg} ${text} px-3 h-8 inline-flex items-center rounded-full text-caption font-bold uppercase`}>
            {label}
          </span>

          {podeConfirmar && (
            <form action={atualizarStatusAgendamento.bind(null, ag.id, 'confirmado')}>
              <button type="submit" className="bg-success hover:bg-success/90 text-white text-caption font-bold px-4 h-9 rounded-full transition-colors duration-200 cursor-pointer">
                Confirmar
              </button>
            </form>
          )}

          {podeConcluir && (
            <form action={atualizarStatusAgendamento.bind(null, ag.id, 'concluido')}>
              <button type="submit" className="bg-tcc-azul hover:bg-tcc-azul-dark text-white text-caption font-bold px-4 h-9 rounded-full transition-colors duration-200 cursor-pointer">
                Concluir
              </button>
            </form>
          )}

          {podeCancelar && (
            <BotaoCancelarAgendamento action={atualizarStatusAgendamento.bind(null, ag.id, 'cancelado')} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-6 sm:p-8 max-w-7xl mx-auto">

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <p className="text-muted-foreground text-body-sm">Painel do prestador</p>
            <h1 className="text-h4 font-bold text-tcc-azul-dark dark:text-tcc-azul-light">{nome}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/disponibilidades"
              className="bg-card hover:bg-muted text-tcc-azul-dark dark:text-tcc-azul-light border border-tcc-azul-dark/20 text-body-sm font-bold px-4 h-11 rounded-full transition-colors duration-200 flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Disponibilidade
            </Link>
            <Link
              href="/servicos/novo"
              className="bg-tcc-azul-dark hover:bg-tcc-azul-darker text-white text-body-sm font-bold px-4 h-11 rounded-full transition-colors duration-200 flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Novo serviço
            </Link>
            <span className="bg-tcc-laranja text-white px-4 h-11 rounded-full text-body-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" aria-hidden="true"></span> Online
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-card p-6 rounded-2xl border-l-4 border-tcc-azul shadow-soft">
            <h3 className="text-tcc-azul text-h4 font-bold">{agendamentosHoje.length}</h3>
            <p className="text-muted-foreground">agendamentos hoje</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border-l-4 border-tcc-laranja shadow-soft">
            <h3 className="text-tcc-laranja text-h4 font-bold">R$ —</h3>
            <p className="text-muted-foreground">este mês</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border-l-4 border-success shadow-soft">
            <p className="text-success font-semibold text-body-sm">Avaliação</p>
            <h3 className="text-success text-h4 font-bold">— <span className="text-h6">★</span></h3>
            <p className="text-muted-foreground">— avaliações</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border-l-4 border-foreground shadow-soft">
            <h3 className="text-foreground text-h4 font-bold">—</h3>
            <p className="text-muted-foreground">Clientes atendidos</p>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-h6 font-bold mb-4 text-foreground">Agenda de hoje</h2>
          <div className="space-y-3">
            {agendamentosHoje.length === 0 ? (
              <div className="bg-card p-6 rounded-2xl shadow-soft border border-border text-center text-muted-foreground text-body-sm">
                Nenhum agendamento para hoje.
              </div>
            ) : (
              agendamentosHoje.map((ag) => <CardAgendamento key={ag.id} ag={ag} />)
            )}
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h6 font-bold text-foreground">Próximos agendamentos</h2>
            {agendamentosFuturos.length > 0 && (
              <span className="bg-secondary text-secondary-foreground text-caption font-bold px-3 h-7 inline-flex items-center rounded-full">
                {agendamentosFuturos.length} agendamento{agendamentosFuturos.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {agendamentosFuturos.length === 0 ? (
              <div className="bg-card p-6 rounded-2xl shadow-soft border border-border text-center text-muted-foreground text-body-sm">
                Nenhum agendamento futuro.
              </div>
            ) : (
              agendamentosFuturos.map((ag) => <CardAgendamento key={ag.id} ag={ag} />)
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h6 font-bold text-foreground">Destaques da comunidade</h2>
            <Link href="/servicos" className="text-body-sm font-medium text-tcc-azul hover:underline">
              Ver catálogo completo
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {servicosDestaque.map((servico) => (
              <Link
                key={servico.id}
                href={`/servicos/${servico.slug || servico.id}`}
                className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <CardServicoDestaque servico={servico} />
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
