import Link from "next/link";
import { CalendarClock, Plus, DollarSign, Star, Users, CalendarX2, ChevronRight, ExternalLink } from "lucide-react";
import { requireSession } from "@/app/actions/auth.actions";
import BotaoAcaoAgendamento from "@/app/components/features/agendamentos/BotaoAcaoAgendamento";
import DashboardCliente from "@/app/components/features/dashboard/DashboardCliente";
import Estatistica from "@/app/components/features/dashboard/Estatistica";
import { Button } from "@/app/components/ui/button";
import { formatarPreco } from "@/app/components/ui/PriceTag";
import PageContainer, { PageHeader } from "@/app/components/ui/PageContainer";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { rotuloStatus } from "@/lib/statusAgendamento";
import { db } from "@/db";
import { agendamentos, servicos, usuarios } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { buscarDashboardCliente } from "@/app/actions/clientes.actions";
import { buscarPerfilPrestador } from "@/app/actions/prestadores.actions";

export const dynamic = 'force-dynamic';

const LIMITE_PROXIMOS = 8;

function formatarHora(data) {
  const d = new Date(data);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

/** Uma linha por agendamento: hora | cliente e serviço | status + ações. */
function LinhaAgendamento({ ag, mostrarData }) {
  const podeConfirmar = ag.status === 'pendente';
  const podeConcluir = ag.status === 'confirmado';
  const podeCancelar = ag.status !== 'cancelado' && ag.status !== 'concluido';

  return (
    <li className="flex flex-col gap-2 px-4 py-3 @2xl:flex-row @2xl:items-center @2xl:gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-[5.5rem] shrink-0">
          <p className="text-body font-bold text-foreground tabular-nums leading-tight">{formatarHora(ag.dataHora)}</p>
          {mostrarData && <p className="text-caption text-muted-foreground leading-tight">{formatarData(ag.dataHora)}</p>}
        </div>
        <div className="min-w-0">
          <p className="text-body-sm font-semibold text-foreground truncate">{ag.clienteNome}</p>
          <p className="text-caption text-muted-foreground truncate">
            {ag.servicoNome} · {ag.duracaoEstimada} min
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap @2xl:flex-nowrap @2xl:justify-end @md:pl-[6.25rem] @2xl:pl-0">
        <Badge status={ag.status} size="sm" className="mr-1">
          {/* rótulo curto: na linha compacta "Aguardando confirmação" empurra as ações */}
          {ag.status === 'pendente' ? 'Pendente' : rotuloStatus(ag.status)}
        </Badge>
        {podeConfirmar && (
          <BotaoAcaoAgendamento
            agendamentoId={ag.id}
            novoStatus="confirmado"
            label="Confirmar"
            titulo="Confirmar agendamento?"
            descricao={`Deseja confirmar o agendamento de ${ag.clienteNome} para ${ag.servicoNome}?`}
          />
        )}
        {podeConcluir && (
          <BotaoAcaoAgendamento
            agendamentoId={ag.id}
            novoStatus="concluido"
            label="Concluir"
            titulo="Concluir agendamento?"
            descricao={`Deseja marcar como concluído o agendamento de ${ag.clienteNome}?`}
          />
        )}
        {podeCancelar && (
          <BotaoAcaoAgendamento
            agendamentoId={ag.id}
            novoStatus="cancelado"
            label="Cancelar"
            titulo="Cancelar agendamento?"
            descricao={`Tem certeza que deseja cancelar o agendamento de ${ag.clienteNome}? Esta ação não pode ser desfeita.`}
            variant="destructive"
            aparencia="perigo"
          />
        )}
      </div>
    </li>
  );
}

function ListaAgendamentos({ itens, mostrarData, IconeVazio, textoVazio }) {
  if (itens.length === 0) {
    return (
      <Card padding="sm" className="flex items-center gap-3 text-muted-foreground shadow-none">
        <IconeVazio size={18} className="shrink-0" aria-hidden="true" />
        <p className="text-body-sm">{textoVazio}</p>
      </Card>
    );
  }
  return (
    <Card padding="none" className="@container">
      <ul className="divide-y divide-border">
        {itens.map((ag) => <LinhaAgendamento key={ag.id} ag={ag} mostrarData={mostrarData} />)}
      </ul>
    </Card>
  );
}

export default async function Dashboard() {
  const usuario = await requireSession();

  if (usuario.tipo === 'cliente') {
    const dadosCliente = await buscarDashboardCliente(usuario.id);
    return <DashboardCliente usuario={usuario} dados={dadosCliente} />;
  }

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

  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const [agendamentosHoje, agendamentosFuturos, perfilPrestador, faturamento] = await Promise.all([
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

    buscarPerfilPrestador(prestadorId),

    db.select({
        preco: servicos.preco,
      })
      .from(agendamentos)
      .innerJoin(servicos, eq(agendamentos.servicoId, servicos.id))
      .where(and(
        eq(servicos.prestadorId, prestadorId),
        eq(agendamentos.status, 'concluido'),
        gte(agendamentos.dataHora, primeiroDiaMes)
      )),
  ]);

  const faturamentoTotal = faturamento.reduce((acc, curr) => acc + Number(curr.preco || 0), 0);

  const proximosVisiveis = agendamentosFuturos.slice(0, LIMITE_PROXIMOS);
  const primeiroNome = nome?.split(' ')[0] ?? '';

  return (
    <PageContainer size="2xl" className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Painel do prestador"
        title={`Olá, ${primeiroNome}`}
        className="mb-6"
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/prestador/${usuario.slug || usuario.id}`}>
                <ExternalLink aria-hidden="true" /> Perfil público
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/disponibilidades">
                <CalendarClock aria-hidden="true" /> Disponibilidade
              </Link>
            </Button>
            <Button asChild variant="accent" size="sm">
              <Link href="/servicos/novo">
                <Plus aria-hidden="true" /> Novo serviço
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Estatistica Icon={CalendarClock} valor={agendamentosHoje.length} rotulo="Agendamentos hoje" />
        <Estatistica Icon={DollarSign} valor={formatarPreco(faturamentoTotal)} rotulo="Faturamento do mês" />
        <Estatistica
          Icon={Star}
          valor={perfilPrestador?.avaliacaoMedia > 0 ? perfilPrestador.avaliacaoMedia.toFixed(1) : '—'}
          rotulo={`${perfilPrestador?.totalAvaliacoes ?? 0} avaliações`}
        />
        <Estatistica Icon={Users} valor={perfilPrestador?.totalClientesAtendidos ?? 0} rotulo="Clientes atendidos" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-6 items-start">
        <section aria-labelledby="titulo-hoje">
          <div className="flex items-center justify-between gap-3 mb-3 min-h-8">
            <h2 id="titulo-hoje" className="text-body-lg font-bold text-foreground">Agenda de hoje</h2>
            {agendamentosHoje.length > 0 && <Badge variant="secundario" size="sm">{agendamentosHoje.length}</Badge>}
          </div>
          <ListaAgendamentos
            itens={agendamentosHoje}
            IconeVazio={CalendarClock}
            textoVazio="Nenhum agendamento para hoje."
          />
        </section>

        <section aria-labelledby="titulo-proximos">
          <div className="flex items-center justify-between gap-3 mb-3 min-h-8">
            <h2 id="titulo-proximos" className="text-body-lg font-bold text-foreground">
              Próximos agendamentos
              {agendamentosFuturos.length > 0 && (
                <span className="text-muted-foreground font-medium"> ({agendamentosFuturos.length})</span>
              )}
            </h2>
            {agendamentosFuturos.length > LIMITE_PROXIMOS && (
              <Link
                href="/agendamentos"
                className="inline-flex items-center gap-0.5 shrink-0 text-body-sm font-semibold text-primary hover:underline underline-offset-4"
              >
                Ver todos <ChevronRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>
          <ListaAgendamentos
            itens={proximosVisiveis}
            mostrarData
            IconeVazio={CalendarX2}
            textoVazio="Nenhum agendamento futuro."
          />
        </section>
      </div>
    </PageContainer>
  );
}
