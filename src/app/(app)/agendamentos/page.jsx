import Link from 'next/link';
import { CalendarClock, CheckCircle2, CalendarPlus, CalendarX2, Star } from 'lucide-react';
import { requireSession } from '@/app/actions/auth.actions';
import { listarMeusAgendamentos } from '@/app/actions/agendamentos.actions';
import AvaliacaoServico from '@/app/components/features/agendamentos/AvaliacaoServico';
import BotaoAcaoAgendamento from '@/app/components/features/agendamentos/BotaoAcaoAgendamento';
import BotaoRepetirReembolso from '@/app/components/features/pagamentos/BotaoRepetirReembolso';
import AvisoPagamentos from '@/app/components/features/pagamentos/AvisoPagamentos';
import { listarPagamentosAFazer } from '@/app/actions/pagamentos.actions';
import { STATUS_PAGAMENTO, aguardaPagamento } from '@/lib/statusPagamento';
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
  // O papel é de cada agendamento, não da conta: prestador também agenda serviços.
  const ehCliente = item.papel === 'cliente';
  const horarioComecou = new Date(item.dataHora) <= new Date();
  const pagamento = STATUS_PAGAMENTO[item.pagamentoStatus];
  const IconPagamento = pagamento?.Icon;
  const hrefPagamento = `/agendamentos/${item.id}/pagamento`;
  const podePagar =
    ehCliente &&
    !item.proprioServico &&
    aguardaPagamento({ statusAgendamento: item.status, statusPagamento: item.pagamentoStatus, preco: item.servicoPreco });
  const pago = item.pagamentoStatus === 'pago';

  return (
    <Card padding="default" interactive id={`pedido-${item.id}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className={`size-14 sm:size-16 shrink-0 flex items-center justify-center rounded-lg ${destaque ? 'bg-info/15' : 'bg-secondary'}`}>
          <p className={`text-body-sm font-bold ${destaque ? 'text-info' : 'text-primary'}`}>
            {formatarHora(item.dataHora)}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-body-lg font-bold text-foreground min-w-0 break-words">{item.servicoNome}</h3>
            <span className={`px-2 h-6 inline-flex items-center rounded-md text-caption font-semibold shrink-0 ${destaque ? 'bg-info/15 text-info' : 'bg-muted text-muted-foreground'}`}>
              {dataTag}
            </span>
            {usuarioLogado.tipo === 'prestador' && (
              <span className="px-2 h-6 inline-flex items-center rounded-md text-caption font-semibold shrink-0 bg-secondary text-secondary-foreground">
                {ehCliente ? 'Você agendou' : 'Você atende'}
              </span>
            )}
          </div>
          {ehCliente ? (
            <p className="text-body-sm text-muted-foreground truncate mt-1">
              {item.prestadorNome} · <span className="text-success font-semibold">{formatarPreco(item.servicoPreco)}</span>
            </p>
          ) : (
            <p className="text-body-sm text-muted-foreground truncate mt-1">
              {item.clienteNome}{item.clienteTelefone ? ` · ${item.clienteTelefone}` : ''}
            </p>
          )}
          {/* A-06: o selo "Aguardando confirmação" ganha o que acontece a seguir. */}
          {ehCliente && item.status === 'pendente' && (
            <p className="text-body-sm text-muted-foreground mt-1">
              O profissional ainda vai confirmar. Avisamos você aqui no app e por e-mail. Depois da confirmação, você poderá pagar aqui.
            </p>
          )}
          {item.pagamentoStatus === 'reembolso_falhou' && (
            <p className="text-body-sm text-foreground mt-1">
              {ehCliente
                ? 'O valor pago ainda não foi devolvido. Fale com o suporte se a nova tentativa não resolver.'
                : 'O valor pago pelo cliente ainda não foi devolvido.'}
            </p>
          )}
          {item.status === 'cancelado' && (
            <>
              {item.motivoCancelamento && (
                <p className="text-body-sm text-foreground mt-1 break-words whitespace-pre-line">
                  <span className="font-semibold">
                    {item.motivoFoiMeu
                      ? 'Motivo informado por você: '
                      : `Motivo informado por ${ehCliente ? item.prestadorNome : item.clienteNome}: `}
                  </span>
                  {item.motivoCancelamento}
                </p>
              )}
              <Link
                href={`/mensagens/${item.id}`}
                className="relative area-toque inline-block mt-1 text-body-sm font-semibold text-primary underline underline-offset-4 hover:text-primary-hover"
              >
                Ver conversa
              </Link>
            </>
          )}
        </div>

        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-col sm:items-end shrink-0">
          <span className={`px-3 h-8 inline-flex items-center gap-1.5 rounded-md text-caption font-semibold ${statusBadgeClass(item.status)}`}>
            <Icon size={13} aria-hidden="true" />
            {rotuloStatus(item.status)}
          </span>
          {pagamento && (
            <span className={`px-3 h-8 inline-flex items-center gap-1.5 rounded-md text-caption font-semibold ${pagamento.badge}`}>
              <IconPagamento size={13} aria-hidden="true" />
              {pagamento.label}
            </span>
          )}
          {ehCliente && pago && (
            <Link
              href={hrefPagamento}
              className="relative area-toque text-body-sm font-semibold text-primary underline underline-offset-4 hover:text-primary-hover"
            >
              Ver pagamento
            </Link>
          )}
          {item.pagamentoStatus === 'reembolso_falhou' && item.pagamentoMetodo !== 'boleto' && (
            <BotaoRepetirReembolso agendamentoId={item.id} />
          )}
          {!ehCliente && item.status === 'confirmado' && (
            horarioComecou ? (
              <BotaoAcaoAgendamento
                agendamentoId={item.id}
                novoStatus="concluido"
                label="Concluir"
                titulo="Concluir agendamento?"
                descricao="Confirma que o serviço foi realizado?"
              />
            ) : (
              <p className="text-caption text-muted-foreground sm:text-right">Concluir libera no horário marcado</p>
            )
          )}
          {STATUS_CANCELAVEL.includes(item.status) && (
            <BotaoAcaoAgendamento
              agendamentoId={item.id}
              novoStatus="cancelado"
              label="Cancelar"
              titulo="Cancelar agendamento?"
              descricao={
                item.status === 'confirmado'
                  ? `Este horário já estava confirmado. O motivo será enviado para a outra pessoa.${pago ? ' O valor pago será devolvido integralmente ao cliente.' : ''} Essa ação não pode ser desfeita.`
                  : 'Essa ação não pode ser desfeita.'
              }
              pedirMotivo
              motivoObrigatorio={item.status === 'confirmado'}
              variant="destructive"
              aparencia="perigo"
            />
          )}
        </div>
      </div>

      {podePagar && (
        <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-body font-semibold text-foreground">
            {item.pagamentoStatus === 'pendente' ? 'Pagamento em aberto: ' : 'Falta pagar: '}
            <span className="tabular-nums whitespace-nowrap">{formatarPreco(item.servicoPreco)}</span>
          </p>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={hrefPagamento}>{item.pagamentoStatus === 'pendente' ? 'Continuar pagamento' : 'Pagar agora'}</Link>
          </Button>
        </div>
      )}

      {ehCliente && item.status === 'concluido' && (
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
            className="mt-3 inline-flex items-center gap-1.5 h-11 px-4 rounded-lg border border-border bg-card hover:bg-muted text-body-sm font-semibold text-foreground transition-colors"
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
      <div className={`max-sm:hidden w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cor}`}>
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
  const [meusAgendamentos, pagamentosAFazer] = await Promise.all([listarMeusAgendamentos(), listarPagamentosAFazer()]);

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
        actions={
          <Button asChild>
            <Link href="/servicos">Agendar novo horário</Link>
          </Button>
        }
      />

      <AvisoPagamentos pagamentos={pagamentosAFazer} className="mb-6" />

      {meusAgendamentos.length === 0 ? (
        <Card dashed padding="default" className="shadow-none">
          <EmptyState
            icon={CalendarPlus}
            title="Nenhum agendamento por aqui ainda"
            description={
              usuarioLogado.tipo === 'cliente'
                ? 'Que tal escolher um serviço e marcar seu primeiro horário?'
                : 'Os horários que clientes marcarem com você e os que você marcar com outros profissionais aparecem aqui.'
            }
            actionLabel="Ver serviços disponíveis"
            actionHref="/servicos"
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
