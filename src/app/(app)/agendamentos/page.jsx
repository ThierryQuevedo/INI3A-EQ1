import Link from 'next/link';
import { CalendarClock, CalendarCheck2, Clock3, CheckCircle2, XCircle, User, DollarSign, Phone, CalendarPlus, CalendarX2 } from 'lucide-react';
import { requireSession } from '@/app/actions/auth.actions';
import { listarMeusAgendamentos } from '@/app/actions/agendamentos.actions';
import AvaliacaoServico from '@/app/components/features/agendamentos/AvaliacaoServico';

export const dynamic = 'force-dynamic';

const STATUS_CONFIG = {
  pendente: { estilo: 'bg-warning/15 text-warning', Icon: Clock3, label: 'Pendente' },
  confirmado: { estilo: 'bg-success/15 text-success', Icon: CalendarCheck2, label: 'Confirmado' },
  concluido: { estilo: 'bg-tcc-azul/10 text-tcc-azul', Icon: CheckCircle2, label: 'Concluído' },
  cancelado: { estilo: 'bg-destructive/10 text-destructive', Icon: XCircle, label: 'Cancelado' },
};

function getStatusConfig(status) {
  return STATUS_CONFIG[status?.toLowerCase()] || { estilo: 'bg-muted text-muted-foreground', Icon: Clock3, label: status };
}

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
  const { estilo, Icon, label } = getStatusConfig(item.status);
  const dataLabel = formatarData(item.dataHora);
  const destaque = dataLabel === 'Hoje' || dataLabel === 'Amanhã';
  const dataTag = destaque
    ? dataLabel
    : new Date(item.dataHora).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-card transition-shadow duration-200">
      <div className="flex items-center gap-5">
        <div className={`w-16 h-16 shrink-0 flex items-center justify-center rounded-xl ${destaque ? 'bg-accent/15' : 'bg-secondary'}`}>
          <p className={`text-body-sm font-bold ${destaque ? 'text-tcc-laranja' : 'text-tcc-azul-dark dark:text-tcc-azul-light'}`}>
            {formatarHora(item.dataHora)}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-body-lg font-bold text-foreground truncate">{item.servicoNome}</h3>
            <span className={`px-2 h-5 inline-flex items-center rounded-full text-[10px] font-bold uppercase shrink-0 ${destaque ? 'bg-tcc-laranja/15 text-tcc-laranja' : 'bg-muted text-muted-foreground'}`}>
              {dataTag}
            </span>
          </div>
          {usuarioLogado.tipo === 'cliente' ? (
            <p className="text-body-sm text-muted-foreground truncate mt-1">
              {item.prestadorNome} · <span className="text-success font-semibold">R$ {Number(item.servicoPreco).toFixed(2)}</span>
            </p>
          ) : (
            <p className="text-body-sm text-muted-foreground truncate mt-1">
              {item.clienteNome}{item.clienteTelefone ? ` · ${item.clienteTelefone}` : ''}
            </p>
          )}
        </div>

        <span className={`px-3 h-8 inline-flex items-center gap-1.5 rounded-full text-caption font-semibold shrink-0 ${estilo}`}>
          <Icon size={13} aria-hidden="true" />
          {label}
        </span>
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
        </div>
      )}
    </div>
  );
}

// Cartão de contagem por status, no resumo do topo
function CardResumo({ label, valor, Icon, cor }) {
  return (
    <div className="bg-card rounded-2xl border border-border px-4 py-3.5 flex items-center gap-3 shadow-soft">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cor}`}>
        <Icon size={18} aria-hidden="true" />
      </div>
      <div>
        <p className="text-h6 font-extrabold text-foreground leading-none">{valor}</p>
        <p className="text-caption text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
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
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 sm:p-8 font-sans">

        <div className="border-b border-border pb-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-h4 font-bold text-foreground">Sua Agenda</h1>
            <p className="text-muted-foreground mt-1 text-body-sm">
              Olá, <span className="font-semibold text-foreground">{usuarioLogado.nome}</span>.
              Modo visualização: <span className="text-tcc-azul font-medium uppercase text-caption bg-secondary px-2.5 py-1 rounded-full">{usuarioLogado.tipo}</span>
            </p>
          </div>
          {usuarioLogado.tipo === 'cliente' && (
            <Link
              href="/servicos"
              className="bg-accent hover:bg-accent-hover text-accent-foreground text-body-sm font-bold px-4 h-11 inline-flex items-center rounded-full transition-colors duration-200 w-fit"
            >
              Agendar novo horário
            </Link>
          )}
        </div>

        {meusAgendamentos.length === 0 ? (
          <div className="text-center py-16 px-6 border-2 border-dashed border-border rounded-2xl bg-card flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
              <CalendarPlus size={28} className="text-tcc-azul-dark dark:text-tcc-azul-light" aria-hidden="true" />
            </div>
            <p className="text-foreground text-body-lg font-semibold">Nenhum agendamento por aqui ainda</p>
            <p className="text-muted-foreground text-body-sm max-w-xs">
              {usuarioLogado.tipo === 'cliente'
                ? 'Que tal escolher um serviço e marcar seu primeiro horário?'
                : 'Assim que um cliente agendar um horário com você, ele aparece aqui.'}
            </p>
            {usuarioLogado.tipo === 'cliente' && (
              <Link
                href="/servicos"
                className="mt-2 bg-accent hover:bg-accent-hover text-accent-foreground text-body-sm font-bold px-5 h-11 inline-flex items-center rounded-full transition-colors duration-200"
              >
                Ver serviços disponíveis
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Resumo rápido */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <CardResumo
                label="Próximos"
                valor={contagem.proximos}
                Icon={CalendarClock}
                cor="bg-tcc-azul/10 text-tcc-azul-dark dark:text-tcc-azul-light"
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
                <CalendarClock size={19} className="text-tcc-azul-dark dark:text-tcc-azul-light" aria-hidden="true" />
                Próximos
                {proximos.length > 0 && (
                  <span className="text-caption font-medium text-muted-foreground">· {proximos.length}</span>
                )}
              </h2>
              {proximos.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-2xl bg-card">
                  <p className="text-muted-foreground text-body-sm">Nenhum agendamento futuro no momento.</p>
                </div>
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
      </div>
    </div>
  );
}