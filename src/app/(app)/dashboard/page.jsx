import Link from "next/link";
import { CalendarClock, Plus, DollarSign, Star, Users, CalendarX2 } from "lucide-react";
import { requireSession } from "@/app/actions/auth.actions";
import BotaoAcaoAgendamento from "@/app/components/features/agendamentos/BotaoAcaoAgendamento";
import DashboardCliente from "@/app/components/features/dashboard/DashboardCliente";
import { Button } from "@/app/components/ui/button";
import { formatarPreco } from "@/app/components/ui/PriceTag";
import PageContainer, { PageHeader } from "@/app/components/ui/PageContainer";
import { Card } from "@/app/components/ui/card";
import EmptyState from "@/app/components/ui/EmptyState";
import { rotuloStatus, statusBadgeClass } from "@/lib/statusAgendamento";
import { db } from "@/db";
import { agendamentos, servicos, usuarios } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { buscarDashboardCliente } from "@/app/actions/clientes.actions";
import { buscarPerfilPrestador } from "@/app/actions/prestadores.actions";

export const dynamic = 'force-dynamic';

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

  function formatarHora(data) {
    const d = new Date(data);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', {
      weekday: 'short', day: 'numeric', month: 'short'
    });
  }

  function CardAgendamento({ ag }) {
    const podeConfirmar = ag.status === 'pendente';
    const podeConcluir  = ag.status === 'confirmado';
    const podeCancelar  = ag.status !== 'cancelado' && ag.status !== 'concluido';

    return (
      <Card padding="sm" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-6 items-center flex-1">
          <div className="text-center min-w-20">
            <span className="text-primary font-bold text-body block">{formatarHora(ag.dataHora)}</span>
            <span className="text-muted-foreground text-caption">{formatarData(ag.dataHora)}</span>
          </div>
          <div>
            <p className="font-bold text-foreground">{ag.clienteNome}</p>
            <p className="text-body-sm text-muted-foreground">{ag.servicoNome} • {ag.duracaoEstimada} min</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`${statusBadgeClass(ag.status)} px-3 h-8 inline-flex items-center rounded-full text-caption font-bold`}>
            {rotuloStatus(ag.status)}
          </span>

          {podeConfirmar && (
            <BotaoAcaoAgendamento
              agendamentoId={ag.id}
              novoStatus="confirmado"
              label="Confirmar"
              titulo="Confirmar agendamento?"
              descricao={`Deseja confirmar o agendamento de ${ag.clienteNome} para ${ag.servicoNome}?`}
              className="bg-success hover:bg-success/90 text-success-foreground text-caption font-bold px-4 h-9 rounded-full transition-colors duration-fast cursor-pointer"
            />
          )}

          {podeConcluir && (
            <BotaoAcaoAgendamento
              agendamentoId={ag.id}
              novoStatus="concluido"
              label="Concluir"
              titulo="Concluir agendamento?"
              descricao={`Deseja marcar como concluído o agendamento de ${ag.clienteNome}?`}
              className="bg-primary hover:bg-primary-hover text-primary-foreground text-caption font-bold px-4 h-9 rounded-full transition-colors duration-fast cursor-pointer"
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
              className="bg-destructive/10 hover:bg-destructive/20 text-destructive text-caption font-bold px-4 h-9 rounded-full transition-colors duration-fast cursor-pointer"
            />
          )}
        </div>
      </Card>
    );
  }

  return (
    <PageContainer size="2xl" className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Painel do prestador"
        title={nome}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/prestador/${usuario.slug || usuario.id}`}>Ver perfil público</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/disponibilidades">
                <CalendarClock size={16} aria-hidden="true" /> Disponibilidade
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/servicos/novo">
                <Plus size={16} aria-hidden="true" /> Novo serviço
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Card padding="default">
          <CalendarClock size={20} className="text-primary mb-2" aria-hidden="true" />
          <h3 className="text-h5 font-bold text-foreground">{agendamentosHoje.length}</h3>
          <p className="text-muted-foreground text-caption">Agendamentos hoje</p>
        </Card>
        <Card padding="default">
          <DollarSign size={20} className="text-primary mb-2" aria-hidden="true" />
          <h3 className="text-h5 font-bold text-foreground">{formatarPreco(faturamentoTotal)}</h3>
          <p className="text-muted-foreground text-caption">Faturamento do mês</p>
        </Card>
        <Card padding="default">
          <Star size={20} className="text-primary mb-2" aria-hidden="true" />
          <h3 className="text-h5 font-bold text-foreground">
            {perfilPrestador?.avaliacaoMedia > 0 ? perfilPrestador.avaliacaoMedia.toFixed(1) : '—'}
          </h3>
          <p className="text-muted-foreground text-caption">{perfilPrestador?.totalAvaliacoes ?? 0} avaliações</p>
        </Card>
        <Card padding="default">
          <Users size={20} className="text-primary mb-2" aria-hidden="true" />
          <h3 className="text-h5 font-bold text-foreground">{perfilPrestador?.totalClientesAtendidos ?? 0}</h3>
          <p className="text-muted-foreground text-caption">Clientes atendidos</p>
        </Card>
      </div>

      <section className="mb-10">
        <h2 className="text-h6 font-bold mb-4 text-foreground">Agenda de hoje</h2>
        <div className="space-y-3">
          {agendamentosHoje.length === 0 ? (
            <Card dashed padding="default" className="shadow-none">
              <EmptyState icon={CalendarClock} title="Nenhum agendamento para hoje" />
            </Card>
          ) : (
            agendamentosHoje.map((ag) => <CardAgendamento key={ag.id} ag={ag} />)
          )}
        </div>
      </section>

      <section>
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
            <Card dashed padding="default" className="shadow-none">
              <EmptyState icon={CalendarX2} title="Nenhum agendamento futuro" />
            </Card>
          ) : (
            agendamentosFuturos.map((ag) => <CardAgendamento key={ag.id} ag={ag} />)
          )}
        </div>
      </section>
    </PageContainer>
  );
}
