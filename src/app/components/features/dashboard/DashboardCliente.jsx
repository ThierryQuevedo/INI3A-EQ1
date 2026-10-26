'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarClock,
  CalendarCheck,
  Star,
  RotateCcw,
  Sparkles,
  Search,
  User,
  ChevronRight,
  ListChecks,
} from 'lucide-react';
import AvaliacaoServico from '@/app/components/features/agendamentos/AvaliacaoServico';
import Estatistica from '@/app/components/features/dashboard/Estatistica';
import { formatarPreco } from '@/app/components/ui/PriceTag';
import { rotuloStatus } from '@/lib/statusAgendamento';
import PageContainer, { PageHeader } from '@/app/components/ui/PageContainer';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';

function formatarData(data) {
  const d = new Date(data);
  const hoje = new Date();
  const amanha = new Date();
  amanha.setDate(hoje.getDate() + 1);

  const mesmoDia = (a, b) => a.toDateString() === b.toDateString();
  if (mesmoDia(d, hoje)) return 'Hoje';
  if (mesmoDia(d, amanha)) return 'Amanhã';

  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

function formatarHora(data) {
  return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function Miniatura({ urlImagem, nome }) {
  return (
    <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted inline-flex items-center justify-center text-body-sm font-bold text-muted-foreground">
      {urlImagem ? <Image src={urlImagem} alt="" fill sizes="40px" className="object-cover" /> : nome?.charAt(0)}
    </span>
  );
}

function CabecalhoSecao({ id, Icon, titulo, href }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3 min-h-8">
      <h2 id={id} className="text-body-lg font-bold text-foreground flex items-center gap-2">
        <Icon size={18} className="shrink-0 text-primary" aria-hidden="true" />
        {titulo}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-0.5 shrink-0 text-body-sm font-semibold text-primary hover:underline underline-offset-4"
        >
          Ver todos <ChevronRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

function Vazio({ Icon, children }) {
  return (
    <Card padding="sm" className="flex items-center gap-3 text-muted-foreground shadow-none">
      <Icon size={18} className="shrink-0" aria-hidden="true" />
      <p className="text-body-sm">{children}</p>
    </Card>
  );
}

export default function DashboardCliente({ usuario, dados }) {
  const { proximos, historico, avaliacoesPendentes, reputacao, metricas } = dados;

  return (
    <PageContainer size="2xl" className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Seu painel"
        title={`Olá, ${usuario.nome?.split(' ')[0] ?? ''}`}
        description="Acompanhe seus agendamentos, avalie serviços e peça de novo."
        className="mb-6"
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/cliente/${usuario.slug || usuario.id}`}>
                <User aria-hidden="true" /> Perfil público
              </Link>
            </Button>
            <Button asChild variant="accent" size="sm">
              <Link href="/servicos">
                <Search aria-hidden="true" /> Explorar serviços
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Estatistica Icon={CalendarClock} valor={metricas.ativos} rotulo="Em andamento" />
        <Estatistica Icon={CalendarCheck} valor={metricas.concluidos} rotulo="Concluídos" />
        <Estatistica
          Icon={Star}
          valor={reputacao.media > 0 ? reputacao.media.toFixed(1) : '—'}
          rotulo={`Sua reputação (${reputacao.total})`}
        />
        <Estatistica Icon={ListChecks} valor={metricas.total} rotulo="Total de agendamentos" />
      </div>

      {avaliacoesPendentes.length > 0 && (
        <section aria-labelledby="titulo-pendentes" className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="shrink-0 text-warning" aria-hidden="true" />
            <h2 id="titulo-pendentes" className="text-body-lg font-bold text-foreground">Avaliações pendentes</h2>
            <Badge variant="aviso" size="sm">{avaliacoesPendentes.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {avaliacoesPendentes.map((item) => (
              <Card key={item.agendamentoId} padding="sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h3 className="text-body-sm font-semibold text-foreground truncate">{item.servicoNome}</h3>
                    <p className="text-caption text-muted-foreground truncate">
                      com{' '}
                      <Link href={`/prestador/${item.prestadorSlug || ''}`} className="font-semibold text-foreground hover:underline">
                        {item.prestadorNome}
                      </Link>
                    </p>
                  </div>
                  <span className="text-caption text-muted-foreground shrink-0">{formatarData(item.dataHora)}</span>
                </div>
                <AvaliacaoServico agendamentoId={item.agendamentoId} />
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-6 items-start">
        <section aria-labelledby="titulo-proximos">
          <CabecalhoSecao id="titulo-proximos" Icon={CalendarClock} titulo="Próximos horários" href="/agendamentos" />
          {proximos.length === 0 ? (
            <Vazio Icon={CalendarClock}>
              Nada agendado por enquanto.{' '}
              <Link href="/servicos" className="font-semibold text-primary underline underline-offset-4">Buscar serviços</Link>
            </Vazio>
          ) : (
            <Card padding="none">
              <ul className="divide-y divide-border">
                {proximos.map((ag) => (
                  <li key={ag.id} className="flex items-center gap-3 px-4 py-3">
                    <Miniatura urlImagem={ag.servicoImagem} nome={ag.servicoNome} />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/servicos/${ag.servicoSlug || ag.servicoId}`}
                        className="block text-body-sm font-semibold text-foreground truncate hover:underline"
                      >
                        {ag.servicoNome}
                      </Link>
                      <p className="text-caption text-muted-foreground truncate">
                        {formatarData(ag.dataHora)} às {formatarHora(ag.dataHora)} · {ag.prestadorNome}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge status={ag.status} size="sm">{rotuloStatus(ag.status)}</Badge>
                      <span className="text-caption font-semibold text-foreground">{formatarPreco(ag.servicoPreco)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>

        <section aria-labelledby="titulo-historico">
          <CabecalhoSecao id="titulo-historico" Icon={RotateCcw} titulo="Pedir novamente" />
          {historico.length === 0 ? (
            <Vazio Icon={RotateCcw}>Você ainda não tem serviços realizados.</Vazio>
          ) : (
            <Card padding="none">
              <ul className="divide-y divide-border">
                {historico.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-body-sm font-semibold text-foreground truncate">{item.servicoNome}</p>
                      <p className="text-caption text-muted-foreground truncate">
                        {new Date(item.dataHora).toLocaleDateString('pt-BR')} · {item.prestadorNome} · {formatarPreco(item.servicoPreco)}
                      </p>
                    </div>
                    <Badge status={item.status} size="sm" className="max-sm:hidden">{rotuloStatus(item.status)}</Badge>
                    <Button asChild variant="outline" size="compacto" className="shrink-0">
                      <Link href={`/agendamentos/novo?servico=${item.servicoId}`}>
                        <RotateCcw aria-hidden="true" /> Agendar
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
