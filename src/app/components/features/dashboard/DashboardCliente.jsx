'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarClock,
  Star,
  RotateCcw,
  Sparkles,
  Search,
  User,
  ArrowRight,
  Clock3,
} from 'lucide-react';
import AvaliacaoServico from '@/app/components/features/agendamentos/AvaliacaoServico';
import { formatarPreco } from '@/app/components/ui/PriceTag';
import { rotuloStatus, statusBadgeClass } from '@/lib/statusAgendamento';
import PageContainer from '@/app/components/ui/PageContainer';
import { Card } from '@/app/components/ui/card';
import EmptyState from '@/app/components/ui/EmptyState';
import { Button } from '@/app/components/ui/button';

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
    <PageContainer size="2xl" className="py-6 sm:py-8 space-y-10">

      {/* Top Header */}
      <Card padding="default" className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-h4 font-bold text-foreground">
            Olá, {usuario.nome?.split(' ')[0]}
          </h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Acompanhe seus agendamentos, avalie serviços e peça novamente com agilidade.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="secondary">
            <Link href={`/cliente/${usuario.slug || usuario.id}`}>
              <User size={16} aria-hidden="true" />
              Meu Perfil Público
            </Link>
          </Button>
          <Button asChild variant="accent" className="shadow-elevated">
            <Link href="/servicos">
              <Search size={16} aria-hidden="true" />
              Explorar Serviços
            </Link>
          </Button>
        </div>
      </Card>

      {/* Alerta de Avaliações Pendentes */}
      {avaliacoesPendentes.length > 0 && (
        <Card padding="default" className="bg-warning/10 border-warning/30 shadow-none">
          <div className="flex items-center gap-2 text-warning font-bold mb-3">
            <Sparkles size={20} aria-hidden="true" />
            <h2 className="text-body-lg">Avaliações Pendentes</h2>
            <span className="bg-warning/20 text-caption px-2 py-0.5 rounded-full">
              {avaliacoesPendentes.length} pendente{avaliacoesPendentes.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-body-sm text-muted-foreground mb-4">
            Seu feedback ajuda os profissionais a crescerem e mantém a comunidade segura e confiável.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {avaliacoesPendentes.map((item) => (
              <Card key={item.agendamentoId} padding="default">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-bold text-foreground">{item.servicoNome}</h3>
                    <p className="text-caption text-muted-foreground">
                      Prestador:{' '}
                      <Link
                        href={`/prestador/${item.prestadorSlug || ''}`}
                        className="font-semibold text-primary hover:underline"
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
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Métricas e Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="default">
          <p className="text-caption text-muted-foreground">Em andamento</p>
          <h3 className="text-h4 font-bold text-foreground mt-1">{metricas.ativos}</h3>
        </Card>
        <Card padding="default">
          <p className="text-caption text-muted-foreground">Concluídos</p>
          <h3 className="text-h4 font-bold text-foreground mt-1">{metricas.concluidos}</h3>
        </Card>
        <Card padding="default">
          <p className="text-caption text-muted-foreground">Sua reputação</p>
          <h3 className="text-h4 font-bold text-foreground mt-1 flex items-center gap-1">
            {reputacao.media > 0 ? reputacao.media.toFixed(1) : '—'}
            <Star size={18} className="fill-warning stroke-warning" />
          </h3>
          <p className="text-caption text-muted-foreground mt-0.5">({reputacao.total} avaliações)</p>
        </Card>
        <Card padding="default">
          <p className="text-caption text-muted-foreground">Total de agendamentos</p>
          <h3 className="text-h4 font-bold text-foreground mt-1">{metricas.total}</h3>
        </Card>
      </div>

      {/* Próximos Agendamentos */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h6 font-bold text-foreground flex items-center gap-2">
            <CalendarClock size={20} className="text-primary" aria-hidden="true" />
            Próximos Horários Agendados
          </h2>
          <Link href="/agendamentos" className="text-body-sm font-medium text-primary hover:underline flex items-center gap-1">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {proximos.length === 0 ? (
          <Card dashed padding="default" className="shadow-none">
            <EmptyState
              icon={CalendarClock}
              title="Nenhum serviço agendado para os próximos dias"
              description="Precisa de algum serviço? Escolha entre profissionais bem avaliados e agende agora mesmo."
              actionLabel="Buscar serviços"
              actionHref="/servicos"
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proximos.map((ag) => (
              <Card key={ag.id} padding="default" className="flex flex-col justify-between gap-4">
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
                          className="font-semibold text-primary hover:underline"
                        >
                          {ag.prestadorNome}
                        </Link>
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-caption font-bold shrink-0 ${statusBadgeClass(ag.status)}`}>
                    {rotuloStatus(ag.status)}
                  </span>
                </div>

                <div className="bg-muted/40 p-3 rounded-xl flex items-center justify-between text-body-sm">
                  <div className="flex items-center gap-2">
                    <Clock3 size={16} className="text-muted-foreground" />
                    <span className="font-bold">{formatarData(ag.dataHora)}</span>
                    <span>às {formatarHora(ag.dataHora)}</span>
                  </div>
                  <span className="font-bold text-primary">{formatarPreco(ag.servicoPreco)}</span>
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
                    className="bg-secondary hover:bg-muted text-caption font-bold text-foreground px-4 py-2 rounded-full transition-colors duration-fast"
                  >
                    Gerenciar Agendamento
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Histórico Recente & "Pedir Novamente" */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h6 font-bold text-foreground flex items-center gap-2">
            <RotateCcw size={20} className="text-success" aria-hidden="true" />
            Histórico Recente / Pedir Novamente
          </h2>
        </div>

        {historico.length === 0 ? (
          <Card dashed padding="default" className="shadow-none">
            <EmptyState icon={RotateCcw} title="Você ainda não possui histórico de serviços realizados" />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {historico.map((item) => (
              <Card key={item.id} padding="default" className="flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-caption font-bold ${statusBadgeClass(item.status)}`}>
                      {rotuloStatus(item.status)}
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
                      className="font-medium text-primary hover:underline"
                    >
                      {item.prestadorNome}
                    </Link>
                  </p>
                  <p className="font-bold text-body-sm text-foreground mt-2">{formatarPreco(item.servicoPreco)}</p>
                </div>

                <Button asChild variant="accent" className="w-full">
                  <Link href={`/agendamentos/novo?servico=${item.servicoId}`}>
                    <RotateCcw size={16} aria-hidden="true" />
                    Agendar Novamente
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

    </PageContainer>
  );
}
