import Link from "next/link";
import { CalendarClock, Plus, DollarSign, Star, Users, CalendarX2, ChevronRight, ExternalLink, Briefcase, Pencil } from "lucide-react";
import { requireSession } from "@/app/actions/auth.actions";
import BotaoAcaoAgendamento from "@/app/components/features/agendamentos/BotaoAcaoAgendamento";
import DashboardCliente from "@/app/components/features/dashboard/DashboardCliente";
import Estatistica from "@/app/components/features/dashboard/Estatistica";
import { Button } from "@/app/components/ui/button";
import { formatarPreco } from "@/app/components/ui/PriceTag";
import { formatarDuracao } from "@/app/components/ui/DurationTag";
import ToastDeRetorno from "@/app/components/ui/ToastDeRetorno";
import PageContainer, { PageHeader } from "@/app/components/ui/PageContainer";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { rotuloStatus } from "@/lib/statusAgendamento";
import { FUSO, hojeNoFuso, instanteNoFuso, partesNoFuso, somarDias } from "@/lib/formatoData";
import { db } from "@/db";
import { agendamentos, servicos, usuarios } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { buscarDashboardCliente } from "@/app/actions/clientes.actions";
import { listarPagamentosAFazer } from "@/app/actions/pagamentos.actions";
import { buscarPerfilPrestador } from "@/app/actions/prestadores.actions";
import { buscarMotivosCancelamento } from "@/lib/motivoCancelamento";
import { resumirPagamentos } from "@/lib/pagamentos";
import { STATUS_PAGAMENTO } from "@/lib/statusPagamento";

export const metadata = { title: 'Painel' };

export const dynamic = 'force-dynamic';

const LIMITE_PROXIMOS = 8;

// Fuso fixo de Brasília (lib/formatoData.js): o servidor pode rodar em UTC.
function formatarHora(data) {
  return partesNoFuso(data).hora;
}

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: FUSO });
}

/** Uma linha por agendamento: hora | cliente e serviço | status + ações. */
function LinhaAgendamento({ ag, mostrarData }) {
  const podeConfirmar = ag.status === 'pendente';
  const horarioComecou = new Date(ag.dataHora) <= new Date();
  const podeConcluir = ag.status === 'confirmado' && horarioComecou;
  const podeCancelar = ag.status !== 'cancelado' && ag.status !== 'concluido';
  const pagamento = STATUS_PAGAMENTO[ag.pagamentoStatus];
  const IconPagamento = pagamento?.Icon;

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
          {ag.motivoCancelamento && (
            <p className="text-caption text-muted-foreground mt-0.5 break-words">
              <span className="font-semibold">Motivo:</span> {ag.motivoCancelamento}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap @2xl:flex-nowrap @2xl:justify-end @md:pl-[6.25rem] @2xl:pl-0">
        <Badge status={ag.status} size="sm" className="mr-1">
          {/* rótulo curto: na linha compacta "Aguardando confirmação" empurra as ações */}
          {ag.status === 'pendente' ? 'Pendente' : rotuloStatus(ag.status)}
        </Badge>
        {pagamento && (
          <span className={`mr-1 px-2 h-6 inline-flex items-center gap-1 rounded-md text-caption font-semibold whitespace-nowrap ${pagamento.badge}`}>
            <IconPagamento size={13} aria-hidden="true" />
            {pagamento.label}
          </span>
        )}
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
        {ag.status === 'confirmado' && !horarioComecou && (
          <span className="text-caption text-muted-foreground">Concluir libera no horário marcado</span>
        )}
        {podeCancelar && (
          <BotaoAcaoAgendamento
            agendamentoId={ag.id}
            novoStatus="cancelado"
            label="Cancelar"
            titulo="Cancelar agendamento?"
            descricao={
              ag.status === 'confirmado'
                ? `Este horário de ${ag.clienteNome} já estava confirmado. O motivo será enviado para a outra pessoa. Esta ação não pode ser desfeita.`
                : `Tem certeza que deseja cancelar o agendamento de ${ag.clienteNome}? Esta ação não pode ser desfeita.`
            }
            pedirMotivo
            motivoObrigatorio={ag.status === 'confirmado'}
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

/** Atalho para os serviços do prestador: antes só dava para achá-los pelo perfil público. */
function MeusServicos({ itens }) {
  return (
    <section aria-labelledby="titulo-servicos" className="mt-8">
      <div className="flex items-center justify-between gap-3 mb-3 min-h-8">
        <h2 id="titulo-servicos" className="text-body-lg font-bold text-foreground">
          Meus serviços
          {itens.length > 0 && <span className="text-muted-foreground font-medium"> ({itens.length})</span>}
        </h2>
      </div>
      {itens.length === 0 ? (
        <Card padding="sm" className="flex flex-wrap items-center gap-3 text-muted-foreground shadow-none">
          <Briefcase size={18} className="shrink-0" aria-hidden="true" />
          <p className="text-body-sm flex-1 min-w-0">Você ainda não cadastrou nenhum serviço.</p>
          <Button asChild size="sm">
            <Link href="/servicos/novo"><Plus aria-hidden="true" /> Cadastrar serviço</Link>
          </Button>
        </Card>
      ) : (
        <Card padding="none">
          <ul className="divide-y divide-border">
            {itens.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/servicos/${s.slug || s.id}`}
                    className="relative area-toque block text-body-sm font-semibold text-foreground truncate hover:underline underline-offset-4"
                  >
                    {s.nome}
                  </Link>
                  <p className="text-caption text-muted-foreground tabular-nums">
                    {formatarPreco(s.preco)} · {formatarDuracao(s.duracaoEstimada)}
                  </p>
                </div>
                {s.desativadoEm && <Badge variant="neutro" size="sm">Desativado</Badge>}
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/servicos/${s.slug || s.id}/editar`} aria-label={`Editar ${s.nome}`}>
                    <Pencil aria-hidden="true" /> <span className="max-sm:hidden">Editar</span>
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}

export default async function Dashboard({ searchParams }) {
  const usuario = await requireSession();
  const { servico: retorno } = (await searchParams) ?? {};

  if (usuario.tipo === 'cliente') {
    const [dadosCliente, pagamentosAFazer] = await Promise.all([buscarDashboardCliente(), listarPagamentosAFazer()]);
    return <DashboardCliente usuario={usuario} dados={dadosCliente} pagamentosAFazer={pagamentosAFazer} />;
  }

  const nome = usuario.nome;
  const prestadorId = usuario.id;

  // Meia-noite de hoje e de amanhã em Brasília, como instantes: no fuso da
  // máquina, entre 21h e meia-noite o "hoje" já seria o dia seguinte.
  const diaHoje = hojeNoFuso();
  const hoje = instanteNoFuso(diaHoje, '00:00');
  const amanha = instanteNoFuso(somarDias(diaHoje, 1), '00:00');

  const camposAgendamento = {
    id: agendamentos.id,
    dataHora: agendamentos.dataHora,
    status: agendamentos.status,
    clienteNome: usuarios.nome,
    servicoNome: servicos.nome,
    duracaoEstimada: servicos.duracaoEstimada,
  };

  const primeiroDiaMes = instanteNoFuso(`${diaHoje.slice(0, 7)}-01`, '00:00');

  const [agendamentosHojeBrutos, agendamentosFuturosBrutos, perfilPrestador, faturamento, meusServicos] = await Promise.all([
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

    db.select({
        id: servicos.id,
        nome: servicos.nome,
        slug: servicos.slug,
        preco: servicos.preco,
        duracaoEstimada: servicos.duracaoEstimada,
        desativadoEm: servicos.desativadoEm,
      })
      .from(servicos)
      .where(eq(servicos.prestadorId, prestadorId))
      .orderBy(servicos.nome),
  ]);

  const todosAgendamentos = [...agendamentosHojeBrutos, ...agendamentosFuturosBrutos];
  const [motivos, resumoPagamentos] = await Promise.all([
    buscarMotivosCancelamento(todosAgendamentos.filter((a) => a.status === 'cancelado').map((a) => a.id)),
    resumirPagamentos(todosAgendamentos.map((a) => a.id)),
  ]);
  const comDetalhes = (a) => ({
    ...a,
    motivoCancelamento: motivos.get(a.id)?.motivo ?? null,
    pagamentoStatus: resumoPagamentos.get(a.id)?.status ?? null,
  });
  const agendamentosHoje = agendamentosHojeBrutos.map(comDetalhes);
  const agendamentosFuturos = agendamentosFuturosBrutos.map(comDetalhes);

  const faturamentoTotal = faturamento.reduce((acc, curr) => acc + Number(curr.preco || 0), 0);

  const proximosVisiveis = agendamentosFuturos.slice(0, LIMITE_PROXIMOS);
  const primeiroNome = nome?.split(' ')[0] ?? '';

  return (
    <PageContainer size="2xl" className="py-6 sm:py-8">
      <ToastDeRetorno mensagem={retorno === 'criado' ? 'Serviço cadastrado. Ele já aparece na busca.' : null} />
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
            <Button asChild size="sm">
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
          rotulo={`${perfilPrestador?.totalAvaliacoes ?? 0} ${perfilPrestador?.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}`}
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

      <MeusServicos itens={meusServicos} />
    </PageContainer>
  );
}
