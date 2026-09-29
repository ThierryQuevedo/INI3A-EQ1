'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarClock,
  CalendarCheck2,
  CalendarX2,
  Star,
  RotateCcw,
  Sparkles,
  Search,
  User,
  ArrowRight,
  Clock3,
} from 'lucide-react';
import AvaliacaoServico from '@/app/components/features/agendamentos/AvaliacaoServico';

export default function DashboardCliente({ usuario, dados }) {
  const { proximos, historico, avaliacoesPendentes, reputacao, metricas } = dados;

  function formatarData(data) {
    const d = new Date(data);
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);

    const mesmodia = (a, b) => a.toDateString() === b.toDateString();
    if (mesmodia(d, hoje)) return 'Hoje';
    if (mesmodia(d, amanha)) return 'Amanhã';

    return d.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  }

  function formatarHora(data) {
    return new Date(data).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="p-6 sm:p-8 max-w-7xl mx-auto space-y-10">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-card border border-border p-6 rounded-3xl shadow-soft">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-accent/15 text-accent-foreground px-3 py-0.5 rounded-full text-caption font-bold uppercase">
                Painel do Cliente
              </span>
              <span className="text-caption text-muted-foreground">· Modo Consumidor</span>
            </div>
            <h1 className="text-h4 font-bold text-foreground">
              Olá, {usuario.nome?.split(' ')[0]} 👋
            </h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Acompanhe seus agendamentos, avalie serviços e peça novamente com agilidade.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/cliente/${usuario.slug || usuario.id}`}
              className="bg-secondary hover:bg-muted text-foreground border border-border text-body-sm font-bold px-5 h-11 rounded-full transition-colors flex items-center gap-2"
            >
              <User size={16} aria-hidden="true" />
              Meu Perfil Público
            </Link>
            <Link
              href="/servicos"
              className="bg-accent hover:bg-accent-hover text-accent-foreground text-body-sm font-bold px-6 h-11 rounded-full transition-all flex items-center gap-2 shadow-elevated"
            >
              <Search size={16} aria-hidden="true" />
              Explorar Serviços
            </Link>
          </div>
        </div>

        {/* Alerta de Avaliações Pendentes estilo iFood */}
        {avaliacoesPendentes.length > 0 && (
          <section className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-3xl">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold mb-3">
              <Sparkles size={20} aria-hidden="true" />
              <h2 className="text-body-lg">Avaliações Pendentes</h2>
              <span className="bg-amber-500/20 text-caption px-2 py-0.5 rounded-full">
                {avaliacoesPendentes.length} pendente{avaliacoesPendentes.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-body-sm text-muted-foreground mb-4">
              Seu feedback ajuda os profissionais a crescerem e mantém a comunidade segura e confiável.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {avaliacoesPendentes.map((item) => (
                <div key={item.agendamentoId} className="bg-card p-5 rounded-2xl border border-border shadow-soft">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-foreground">{item.servicoNome}</h3>
                      <p className="text-caption text-muted-foreground">
                        Prestador:{' '}
                        <Link
                          href={`/prestador/${item.prestadorSlug || ''}`}
                          className="font-semibold text-tcc-azul hover:underline"
                        >
                          {item.prestadorNome}
                        </Link>
                      </p>
                    </div>
                    <span className="text-caption text-muted-foreground">
                      {formatarData(item.dataHora)}
                    </span>
                  </div>

                  <AvaliacaoServico agendamentoId={item.agendamentoId} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Métricas e Resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card p-5 rounded-2xl border-l-4 border-tcc-azul shadow-soft">
            <p className="text-caption text-muted-foreground">Em andamento</p>
            <h3 className="text-h4 font-bold text-tcc-azul mt-1">{metricas.ativos}</h3>
          </div>
          <div className="bg-card p-5 rounded-2xl border-l-4 border-success shadow-soft">
            <p className="text-caption text-muted-foreground">Concluídos</p>
            <h3 className="text-h4 font-bold text-success mt-1">{metricas.concluidos}</h3>
          </div>
          <div className="bg-card p-5 rounded-2xl border-l-4 border-tcc-laranja shadow-soft">
            <p className="text-caption text-muted-foreground">Reputação como Cliente</p>
            <h3 className="text-h4 font-bold text-tcc-laranja mt-1 flex items-center gap-1">
              {reputacao.media > 0 ? reputacao.media.toFixed(1) : '—'}
              <Star size={18} className="fill-amber-400 stroke-amber-400" />
            </h3>
            <p className="text-caption text-muted-foreground mt-0.5">({reputacao.total} avaliações)</p>
          </div>
          <div className="bg-card p-5 rounded-2xl border-l-4 border-foreground shadow-soft">
            <p className="text-caption text-muted-foreground">Total de Pedidos</p>
            <h3 className="text-h4 font-bold text-foreground mt-1">{metricas.total}</h3>
          </div>
        </div>

        {/* Próximos Agendamentos */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h6 font-bold text-foreground flex items-center gap-2">
              <CalendarClock size={20} className="text-tcc-azul" aria-hidden="true" />
              Próximos Horários Agendados
            </h2>
            <Link href="/agendamentos" className="text-body-sm font-medium text-tcc-azul hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          {proximos.length === 0 ? (
            <div className="bg-card p-8 rounded-3xl border border-dashed border-border text-center flex flex-col items-center gap-3">
              <CalendarClock size={36} className="text-muted-foreground" />
              <p className="font-bold text-foreground">Nenhum serviço agendado para os próximos dias.</p>
              <p className="text-body-sm text-muted-foreground max-w-sm">
                Precisa de algum serviço? Escolha entre profissionais bem avaliados e agende agora mesmo.
              </p>
              <Link
                href="/servicos"
                className="mt-2 bg-accent hover:bg-accent-hover text-accent-foreground font-bold px-6 h-11 rounded-full inline-flex items-center gap-2"
              >
                Buscar serviços
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proximos.map((ag) => (
                <div key={ag.id} className="bg-card p-5 rounded-2xl border border-border shadow-soft flex flex-col justify-between gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 rounded-xl overflow-hidden bg-muted shrink-0">
                        {ag.servicoImagem ? (
                          <Image src={ag.servicoImagem} alt="" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground">
                            {ag.servicoNome?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-body">{ag.servicoNome}</h3>
                        <p className="text-caption text-muted-foreground">
                          Prestador:{' '}
                          <Link
                            href={`/prestador/${ag.prestadorSlug || ''}`}
                            className="font-semibold text-tcc-azul hover:underline"
                          >
                            {ag.prestadorNome}
                          </Link>
                        </p>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-caption font-bold uppercase shrink-0 ${
                      ag.status === 'confirmado' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                    }`}>
                      {ag.status}
                    </span>
                  </div>

                  <div className="bg-muted/40 p-3 rounded-xl flex items-center justify-between text-body-sm">
                    <div className="flex items-center gap-2">
                      <Clock3 size={16} className="text-muted-foreground" />
                      <span className="font-bold">{formatarData(ag.dataHora)}</span>
                      <span>às {formatarHora(ag.dataHora)}</span>
                    </div>
                    <span className="font-bold text-tcc-laranja">
                      R$ {Number(ag.servicoPreco).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                    <Link
                      href={`/servicos/${ag.servicoSlug || ag.servicoId}`}
                      className="text-caption font-bold text-muted-foreground hover:text-foreground px-3 py-1.5"
                    >
                      Detalhes do Serviço
                    </Link>
                    <Link
                      href="/agendamentos"
                      className="bg-secondary hover:bg-muted text-caption font-bold text-foreground px-4 py-2 rounded-full transition-colors"
                    >
                      Gerenciar Agendamento
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Histórico Recente & "Pedir Novamente" estilo iFood */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h6 font-bold text-foreground flex items-center gap-2">
              <RotateCcw size={20} className="text-success" aria-hidden="true" />
              Histórico Recente / Pedir Novamente
            </h2>
          </div>

          {historico.length === 0 ? (
            <div className="bg-card p-6 rounded-2xl border border-border text-center text-muted-foreground text-body-sm">
              Você ainda não possui histórico de serviços realizados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historico.map((item) => (
                <div key={item.id} className="bg-card p-5 rounded-2xl border border-border shadow-soft flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-caption font-bold uppercase ${
                        item.status === 'concluido' ? 'bg-success/15 text-success' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-caption text-muted-foreground">
                        {new Date(item.dataHora).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <h3 className="font-bold text-foreground text-body">{item.servicoNome}</h3>
                    <p className="text-caption text-muted-foreground mt-0.5">
                      Por{' '}
                      <Link
                        href={`/prestador/${item.prestadorSlug || ''}`}
                        className="font-medium text-tcc-azul hover:underline"
                      >
                        {item.prestadorNome}
                      </Link>
                    </p>
                    <p className="font-bold text-body-sm text-foreground mt-2">
                      R$ {Number(item.servicoPreco).toFixed(2).replace('.', ',')}
                    </p>
                  </div>

                  <Link
                    href={`/agendamentos/novo?servico=${item.servicoId}`}
                    className="w-full bg-accent hover:bg-accent-hover text-accent-foreground text-body-sm font-bold py-2.5 px-4 rounded-full flex items-center justify-center gap-2 transition-colors duration-200"
                  >
                    <RotateCcw size={16} aria-hidden="true" />
                    Agendar Novamente
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
