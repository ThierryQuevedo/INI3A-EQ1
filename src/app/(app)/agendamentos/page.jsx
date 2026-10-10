import Link from 'next/link';
import { CalendarClock, CheckCircle2, CalendarPlus, CalendarX2, Star } from 'lucide-react';
import { requireSession } from '@/app/actions/auth.actions';
import { listarMeusAgendamentos } from '@/app/actions/agendamentos.actions';
import AvaliacaoServico from '@/app/components/features/agendamentos/AvaliacaoServico';
import BotaoAcaoAgendamento from '@/app/components/features/agendamentos/BotaoAcaoAgendamento';
import { formatarPreco } from '@/app/components/ui/PriceTag';
import { rotuloStatus, statusBadgeClass, STATUS_AGENDAMENTO } from '@/lib/statusAgendamento';
import PageContainer, { PageHeader } from '@/app/components/ui/PageContainer';
import { Card } from '@/app/components/ui/card';
import EmptyState from '@/app/components/ui/EmptyState';
import { Button } from '@/app/components/ui/button';

const STATUS_CANCELAVEL = ['pendente', 'confirmado'];

export const dynamic = 'force-dynamic';

function formatarData(data) {
  const d = new Date(data);
  const hoje = new Date();
  const amanha = new Date();
  amanha.setDate(hoje.getDate() + 1);

  const mesmodia = (a, b) => a.toDateString() === b.toDateString();

  if (mesmodia(d, hoje)) return 'Hoje';
  if (mesmodia(d, amanha)) return 'Amanhã';

  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

function formatarHora(data) {
  return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Card individual de agendamento
function CardAgendamento({ item, usuarioLogado }) {
  const { Icon = CalendarPlus } = STATUS_AGENDAMENTO[item.status?.toLowerCase()] || {};
  const dataLabel = formatarData(item.dataHora);
  const destaque = dataLabel === 'Hoje' || dataLabel === 'Amanhã';
  const dataTag = destaque
    ? dataLabel
    : new Date(item.dataHora).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

  return (
    <Card padding="default" interactive>
      <div className="flex items-center gap-5">
        <div className={`w-16 h-16 shrink-0 flex items-center justify-center rounded-xl ${destaque ? 'bg-info/15' : 'bg-secondary'}`}>
          <p className={`text-body-sm font-bold ${destaque ? 'text-info' : 'text-primary'}`}>
            {formatarHora(item.dataHora)}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-body-lg font-bold text-foreground truncate">{item.servicoNome}</h3>
            <span className={`px-2 h-5 inline-flex items-center rounded-full text-[10px] font-bold uppercase shrink-0 ${destaque ? 'bg-info/15 text-info' : 'bg-muted text-muted-foreground'}`}>
              {dataTag}
            </span>
          </div>
          {usuarioLogado.tipo === 'cliente' ? (
            <p className="text-body-sm text-muted-foreground truncate mt-1">
              {item.prestadorNome} · <span className="text-success font-semibold">{formatarPreco(item.servicoPreco)}</span>
            </p>
          ) : (
            <p className="text-body-sm text-muted-foreground truncate mt-1">
              {item.clienteNome}{item.clienteTelefone ? ` · ${item.clienteTelefone}` : ''}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`px-3 h-8 inline-flex items-center gap-1.5 rounded-full text-caption font-semibold ${statusBadgeClass(item.status)}`}>
            <Icon size={13} aria-hidden="true" />
            {rotuloStatus(item.status)}
          </span>
          {usuarioLogado.tipo === 'prestador' && item.status === 'confirmado' && (
            <BotaoAcaoAgendamento
              agendamentoId={item.id}
              novoStatus="concluido"
              label="Concluir"
              titulo="Concluir agendamento?"
              descricao="Confirma que o serviço foi realizado?"
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-primary-foreground text-caption font-bold px-4 h-9 rounded-full transition-colors duration-fast cursor-pointer"
            />
          )}
          {STATUS_CANCELAVEL.includes(item.status) && (
            <BotaoAcaoAgendamento
              agendamentoId={item.id}
              novoStatus="cancelado"
              label="Cancelar"
              titulo="Cancelar agendamento?"
              descricao="Essa ação não pode ser desfeita."
              variant="destructive"
              className="inline-flex items-center gap-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive text-caption font-bold px-4 h-9 rounded-full transition-colors duration-fast cursor-pointer"
            />
          )}
        </div>
      </div>

      {usuarioLogado.tipo === 'cliente' && item.status === 'concluido' && (
        <div className="mt-4 pt-4 border-t border-border">
          <AvaliacaoServico
            agendamentoId={item.id}
            avaliacaoExistente={
              item.avaliacaoNota
                ? { nota: item.avaliacaoNota, comentario: item.avaliacaoComentario }
                : null
            }
          />
          <Link
            href={`/avaliar/${item.id}`}
            className="mt-3 inline-flex items-center gap-1.5 h-11 px-4 rounded-full border border-border bg-card hover:bg-muted text-body-sm font-semibold text-foreground transition-colors duration-fast"
          >
            <Star size={15} aria-hidden="true" />
            {item.avaliacaoNota ? 'Ver avaliação' : 'Abrir página de avaliação'}
          </Link>
        </div>
      )}
    </Card>
  );
}

// Cartão de contagem por status, no resumo do topo
function CardResumo({ label, valor, Icon, cor }) {
  return (
    <Card padding="sm" className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cor}`}>
        <Icon size={18} aria-hidden="true" />
      </div>
      <div>
        <p className="text-h6 font-extrabold text-foreground leading-none">{valor}</p>
        <p className="text-caption text-muted-foreground mt-1">{label}</p>
      </div>
    </Card>
  );
}

export default async function AgendamentosPage() {
  const usuarioLogado = await requireSession();
  const meusAgendamentos = await listarMeusAgendamentos();

  const agora = new Date();

  const proximos = meusAgendamentos
    .filter((item) => new Date(item.dataHora) >= agora && item.status !== 'cancelado')
    .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

  const historico = meusAgendamentos
    .filter((item) => new Date(item.dataHora) < agora || item.status === 'cancelado')
    .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

  const contagem = {
    proximos: proximos.length,
    concluidos: meusAgendamentos.filter((i) => i.status === 'concluido').length,
    cancelados: meusAgendamentos.filter((i) => i.status === 'cancelado').length,
  };

  return (
    <PageContainer size="xl" className="py-6 sm:py-8">
      <PageHeader
        title="Sua Agenda"
        description={<>Olá, <span className="font-semibold text-foreground">{usuarioLogado.nome}</span>. Aqui estão seus agendamentos.</>}
        actions={usuarioLogado.tipo === 'cliente' && (
          <Button asChild variant="accent">
            <Link href="/servicos">Agendar novo horário</Link>
          </Button>
        )}
      />

      {meusAgendamentos.length === 0 ? (
        <Card dashed padding="default" className="shadow-none">
          <EmptyState
            icon={CalendarPlus}
            title="Nenhum agendamento por aqui ainda"
            description={
              usuarioLogado.tipo === 'cliente'
                ? 'Que tal escolher um serviço e marcar seu primeiro horário?'
                : 'Assim que um cliente agendar um horário com você, ele aparece aqui.'
            }
            actionLabel={usuarioLogado.tipo === 'cliente' ? 'Ver serviços disponíveis' : undefined}
            actionHref={usuarioLogado.tipo === 'cliente' ? '/servicos' : undefined}
          />
        </Card>
      ) : (
        <>
          {/* Resumo rápido */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <CardResumo
              label="Próximos"
              valor={contagem.proximos}
              Icon={CalendarClock}
              cor="bg-primary/10 text-primary"
            />
            <CardResumo
              label="Concluídos"
              valor={contagem.concluidos}
              Icon={CheckCircle2}
              cor="bg-success/15 text-success"
            />
            <CardResumo
              label="Cancelados"
              valor={contagem.cancelados}
              Icon={CalendarX2}
              cor="bg-destructive/10 text-destructive"
            />
          </div>

          {/* Próximos agendamentos */}
          <section className="mb-8">
            <h2 className="text-body-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <CalendarClock size={19} className="text-primary" aria-hidden="true" />
              Próximos
              {proximos.length > 0 && (
                <span className="text-caption font-medium text-muted-foreground">· {proximos.length}</span>
              )}
            </h2>
            {proximos.length === 0 ? (
              <Card dashed padding="default" className="shadow-none text-center">
                <p className="text-muted-foreground text-body-sm">Nenhum agendamento futuro no momento.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {proximos.map((item) => (
                  <CardAgendamento key={item.id} item={item} usuarioLogado={usuarioLogado} />
                ))}
              </div>
            )}
          </section>

          {/* Histórico */}
          {historico.length > 0 && (
            <section>
              <h2 className="text-body-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 size={19} className="text-muted-foreground" aria-hidden="true" />
                Histórico
                <span className="text-caption font-medium text-muted-foreground">· {historico.length}</span>
              </h2>
              <div className="grid gap-4 opacity-90">
                {historico.map((item) => (
                  <CardAgendamento key={item.id} item={item} usuarioLogado={usuarioLogado} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </PageContainer>
  );
}
