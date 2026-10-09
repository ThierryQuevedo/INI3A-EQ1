'use client';
import { Suspense, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock, CheckCircle2, Check, Pencil, Sun, CloudSun, Moon, CalendarPlus } from 'lucide-react';
import { confirmarAgendamentoAction, listarAgendamentosPorPrestador } from '@/app/actions/agendamentos.actions';
import { getSession } from '@/app/actions/auth.actions';
import { buscarServico } from '@/app/actions/servicos.actions';
import { listarDisponibilidades } from '@/app/actions/disponibilidades.actions';
import Calendario from '@/app/components/features/agendamentos/Calendario';
import Skeleton from '@/app/components/ui/Skeleton';
import { ehDataPassada, agruparPorPeriodo, calcularSlotsLivresDoDia } from '@/lib/disponibilidade';
import { formatarPreco } from '@/app/components/ui/PriceTag';

function capitalizarPrimeira(texto) {
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto;
}

function formatarDataICS(data) {
  return data.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function gerarLinkGoogleCalendar({ titulo, inicio, fim, detalhes }) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: titulo,
    dates: `${formatarDataICS(inicio)}/${formatarDataICS(fim)}`,
    details: detalhes || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function gerarIcsDataUri({ titulo, inicio, fim, detalhes }) {
  const conteudo = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:${inicio.getTime()}@marcaai`,
    `DTSTAMP:${formatarDataICS(new Date())}`,
    `DTSTART:${formatarDataICS(inicio)}`,
    `DTEND:${formatarDataICS(fim)}`,
    `SUMMARY:${titulo}`,
    `DESCRIPTION:${detalhes || ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(conteudo)}`;
}

const PERIODOS = [
  { chave: 'manha', label: 'Manhã', Icon: Sun },
  { chave: 'tarde', label: 'Tarde', Icon: CloudSun },
  { chave: 'noite', label: 'Noite', Icon: Moon },
];

function AgendarPageSkeleton() {
  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-8" />
        <Skeleton className="h-80 rounded-2xl mb-4" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    </div>
  );
}


function PassosProgresso({ passoAtual }) {
  const passos = [
    { numero: 1, label: 'Dia' },
    { numero: 2, label: 'Horário' },
    { numero: 3, label: 'Confirmação' },
  ];

  return (
    <ol className="flex items-center gap-2 mb-6" aria-label="Etapas do agendamento">
      {passos.map((passo, idx) => {
        const concluido = passo.numero < passoAtual;
        const atual = passo.numero === passoAtual;
        return (
          <li key={passo.numero} className="flex items-center gap-2 flex-1 last:flex-none">
            <div
              aria-current={atual ? 'step' : undefined}
              className={`flex items-center gap-2 shrink-0 ${atual ? '' : ''}`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-caption font-bold border-2 transition-colors ${
                  concluido
                    ? 'bg-tcc-azul-dark border-tcc-azul-dark text-white'
                    : atual
                    ? 'border-tcc-azul-dark text-tcc-azul-dark dark:text-tcc-azul-light dark:border-tcc-azul-light'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {concluido ? <Check size={14} aria-hidden="true" /> : passo.numero}
              </span>
              <span
                className={`text-caption font-semibold max-sm:hidden sm:inline ${
                  atual ? 'text-foreground' : concluido ? 'text-foreground/70' : 'text-muted-foreground'
                }`}
              >
                {passo.label}
              </span>
            </div>
            {idx < passos.length - 1 && (
              <div className={`h-0.5 flex-1 rounded-full ${concluido ? 'bg-tcc-azul-dark' : 'bg-border'}`} aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function AgendarPage() {
  return (
    <Suspense fallback={<AgendarPageSkeleton />}>
      <AgendarPageInner />
    </Suspense>
  );
}

function AgendarPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const servicoId = searchParams.get('servico');

  const [servico, setServico] = useState(null);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [agendados, setAgendados] = useState([]);
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [diaSelecionadoManual, setDiaSelecionadoManual] = useState(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [resumoConfirmado, setResumoConfirmado] = useState(null);

  const refHorarioHeading = useRef(null);
  const refConfirmacaoHeading = useRef(null);
  const refErro = useRef(null);
  const primeiroRender = useRef(true);
  const slotRefs = useRef(new Map());

  useEffect(() => {
    async function verificarSessao() {
      const usuario = await getSession();
      if (!usuario) router.push('/login');
    }
    verificarSessao();
  }, [router]);

  useEffect(() => {
    if (!servicoId) return;
    async function carregar() {
      try {
        const dadosServico = await buscarServico(Number(servicoId));
        setServico(dadosServico);

        const prestadorId = dadosServico.prestadorId;

        const [resDisp, resAgend] = await Promise.all([
          listarDisponibilidades(prestadorId, Number(servicoId)),
          listarAgendamentosPorPrestador(prestadorId),
        ]);

        setDisponibilidades(resDisp);
        setAgendados(resAgend);
      } catch (e) {
        setErro('Erro ao carregar dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [servicoId]);

  const slotsLivres = useCallback((diaObj) => {
    if (!servico || !diaObj) return [];
    const data = diaObj.data ? new Date(diaObj.data) : new Date(diaObj);
    return calcularSlotsLivresDoDia({
      data,
      duracaoEstimada: servico.duracaoEstimada,
      disponibilidades,
      agendados,
    });
  }, [servico, disponibilidades, agendados]);

  const diasInfo = useMemo(() => {
    if (!servico) return {};
    const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
    const info = {};

    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(anoAtual, mesAtual, dia);
      if (ehDataPassada(data)) {
        info[dia] = { disponivel: false, vagas: 0 };
        continue;
      }

      const livres = slotsLivres({ data });
      info[dia] = { disponivel: livres.length > 0, vagas: livres.length };
    }
    return info;
  }, [servico, anoAtual, mesAtual, slotsLivres]);

  const diaSelecionadoAuto = useMemo(() => {
    if (loading || !servico || disponibilidades.length === 0) return null;

    const hoje = new Date();
    // Bloqueia auto-seleção se o dia de hoje não tiver vagas abertas
    const livresHoje = slotsLivres({ data: hoje });
    if (livresHoje.length === 0) return null;

    return {
      data: hoje,
      diaSemana: hoje.getDay(),
    };
  }, [loading, servico, disponibilidades, slotsLivres]);

  const diaSelecionado = diaSelecionadoManual ?? diaSelecionadoAuto;

  function selecionarDia(data) {
    if (ehDataPassada(data)) return;
    const livres = slotsLivres({ data });
    // Bloqueia seleção caso o dia escolhido não possua vagas abertas
    if (livres.length === 0) return;

    setDiaSelecionadoManual({ data, diaSemana: data.getDay() });
    setHorarioSelecionado(null);
  }

  async function confirmarAgendamento() {
    if (!diaSelecionado || !horarioSelecionado) return;
    const livres = slotsLivres(diaSelecionado);
    if (!livres.includes(horarioSelecionado)) {
      setErro('O horário selecionado não está mais disponível.');
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      const [h, m] = horarioSelecionado.split(':').map(Number);
      const dataHora = new Date(diaSelecionado.data);
      dataHora.setHours(h, m, 0, 0);

      const resultado = await confirmarAgendamentoAction({
        servicoId: Number(servicoId),
        dataHora: dataHora.toISOString(),
      });

      if (resultado?.erro) {
        setErro(resultado.erro);
        return;
      }

      setResumoConfirmado({ dataHora, nome: servico.nome, duracaoEstimada: servico.duracaoEstimada });
      setSucesso(true);
    } catch (e) {
      setErro('Erro ao confirmar agendamento.');
    } finally {
      setEnviando(false);
    }
  }

  const slotsDoDia = useMemo(() => (diaSelecionado ? slotsLivres(diaSelecionado) : []), [diaSelecionado, slotsLivres]);
  const gruposPeriodo = useMemo(() => agruparPorPeriodo(slotsDoDia), [slotsDoDia]);
  const slotsFlat = useMemo(
    () => PERIODOS.flatMap(({ chave }) => gruposPeriodo[chave] || []),
    [gruposPeriodo]
  );

  const prefereMovimentoReduzido =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  function rolarEfocar(ref) {
    if (!ref?.current) return;
    ref.current.scrollIntoView({
      behavior: prefereMovimentoReduzido ? 'auto' : 'smooth',
      block: 'start',
    });
    ref.current.focus({ preventScroll: true });
  }

  useEffect(() => {
    if (primeiroRender.current) {
      primeiroRender.current = false;
      return;
    }
    if (diaSelecionadoManual) {
      const id = setTimeout(() => rolarEfocar(refHorarioHeading), 50);
      return () => clearTimeout(id);
    }
  }, [diaSelecionadoManual]);

  useEffect(() => {
    if (horarioSelecionado) {
      const id = setTimeout(() => rolarEfocar(refConfirmacaoHeading), 50);
      return () => clearTimeout(id);
    }
  }, [horarioSelecionado]);

  useEffect(() => {
    if (erro && refErro.current) {
      refErro.current.focus();
    }
  }, [erro]);

  const handleSlotKeyDown = useCallback(
    (e, slot) => {
      const idx = slotsFlat.indexOf(slot);
      if (idx === -1) return;

      let novoIdx = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') novoIdx = (idx + 1) % slotsFlat.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') novoIdx = (idx - 1 + slotsFlat.length) % slotsFlat.length;
      else if (e.key === 'Home') novoIdx = 0;
      else if (e.key === 'End') novoIdx = slotsFlat.length - 1;
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setHorarioSelecionado(slot);
        return;
      } else return;

      e.preventDefault();
      const proximoSlot = slotsFlat[novoIdx];
      setHorarioSelecionado(proximoSlot);
      slotRefs.current.get(proximoSlot)?.focus();
    },
    [slotsFlat]
  );

  const passoAtual = horarioSelecionado ? 3 : (diaSelecionado && slotsDoDia.length > 0) ? 2 : 1;

  if (loading) return <AgendarPageSkeleton />;

  if (sucesso && resumoConfirmado) {
    const fim = new Date(resumoConfirmado.dataHora.getTime() + resumoConfirmado.duracaoEstimada * 60000);
    const eventoCalendario = {
      titulo: resumoConfirmado.nome,
      inicio: resumoConfirmado.dataHora,
      fim,
      detalhes: 'Agendado pelo Marca Aí.',
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10" role="status">
        <div className="bg-card rounded-2xl p-8 sm:p-10 flex flex-col items-center gap-4 shadow-elevated text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-success/15 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} className="text-success" aria-hidden="true" />
          </div>
          <h2 className="text-h6 font-bold text-foreground">Agendamento confirmado!</h2>
          <p className="text-body text-muted-foreground">
            {resumoConfirmado.nome} em{' '}
            {capitalizarPrimeira(
              resumoConfirmado.dataHora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
            )}{' '}
            às {resumoConfirmado.dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>

          <div className="flex flex-col gap-2.5 w-full mt-2">
            <a
              href={gerarLinkGoogleCalendar(eventoCalendario)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full border border-input text-body-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <CalendarDays size={16} aria-hidden="true" /> Adicionar ao Google Calendar
            </a>
            <a
              href={gerarIcsDataUri(eventoCalendario)}
              download={`agendamento-${resumoConfirmado.nome.replace(/\s+/g, '-').toLowerCase()}.ics`}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full border border-input text-body-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <CalendarDays size={16} aria-hidden="true" /> Baixar arquivo (.ics)
            </a>
            <button
              type="button"
              onClick={() => router.push('/agendamentos')}
              className="w-full bg-tcc-azul-dark text-white rounded-full h-11 text-body-sm font-bold shadow-soft hover:bg-tcc-azul-darker transition-all duration-200 ease-apple active:scale-[0.98] cursor-pointer"
            >
              Ver meus agendamentos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className={`min-h-screen bg-background py-8 sm:py-10 px-4 ${diaSelecionado && horarioSelecionado ? 'pb-52 sm:pb-56' : ''}`}>
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 h-11 -ml-2 px-3 rounded-full text-body text-tcc-azul-dark dark:text-tcc-azul-light font-semibold mb-4 hover:bg-muted transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tcc-azul-dark">
            <ArrowLeft size={18} aria-hidden="true" />
            Voltar
          </button>
          <h1 className="text-h4 font-extrabold text-foreground">Escolha um horário</h1>
          {servico && (
            <p className="text-body-lg text-muted-foreground mt-1.5">
              {servico.nome} · {servico.duracaoEstimada} min · <span className="text-tcc-azul-dark dark:text-tcc-azul-light font-semibold">{formatarPreco(servico.preco)}</span>
            </p>
          )}
        </div>

        <PassosProgresso passoAtual={passoAtual} />

        {erro && (
          <div
            ref={refErro}
            role="alert"
            tabIndex={-1}
            className="mb-6 bg-destructive/10 border border-destructive/30 text-destructive text-body rounded-xl px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
          >
            {erro}
          </div>
        )}

        <section className="bg-card rounded-2xl p-5 sm:p-7 shadow-soft mb-6 flex flex-col items-center gap-4" aria-labelledby="titulo-passo-1">
          <h2 id="titulo-passo-1" className="flex items-center gap-2 text-body-lg font-bold text-foreground self-start">
            <CalendarDays size={20} className="text-tcc-azul-dark dark:text-tcc-azul-light" aria-hidden="true" />
            1. Escolha o dia
          </h2>
          <Calendario
            mes={mesAtual}
            ano={anoAtual}
            diasInfo={diasInfo}
            diaSelecionado={diaSelecionado?.data ?? null}
            onSelectDia={selecionarDia}
            onMesChange={(novoMes, novoAno) => { setMesAtual(novoMes); setAnoAtual(novoAno); }}
          />
        </section>

        {diaSelecionado && (
          <section className="bg-card rounded-2xl p-5 sm:p-7 shadow-soft mb-6" aria-labelledby="titulo-passo-2">
            <h2
              ref={refHorarioHeading}
              id="titulo-passo-2"
              tabIndex={-1}
              className="flex items-center gap-2 text-body-lg font-bold text-foreground mb-1 focus:outline-none"
            >
              <Clock size={20} className="text-tcc-azul-dark dark:text-tcc-azul-light" aria-hidden="true" />
              2. Escolha o horário
            </h2>
            <p className="text-body-sm text-muted-foreground mb-5">
              {capitalizarPrimeira(diaSelecionado.data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }))}
            </p>
            <p className="sr-only" aria-live="polite">
              {slotsDoDia.length === 0
                ? 'Nenhum horário disponível neste dia.'
                : `${slotsDoDia.length} horário${slotsDoDia.length > 1 ? 's' : ''} disponível${slotsDoDia.length > 1 ? 'is' : ''} neste dia.`}
            </p>
            {slotsDoDia.length === 0 ? (
              <p className="text-body text-muted-foreground">Nenhum horário disponível neste dia.</p>
            ) : (
              <div className="space-y-6">
                {PERIODOS.map(({ chave, label, Icon }) => {
                  const slotsPeriodo = gruposPeriodo[chave];
                  if (slotsPeriodo.length === 0) return null;
                  return (
                    <div key={chave}>
                      <h3 className="flex items-center gap-1.5 text-body-sm font-bold text-foreground mb-2.5">
                        <Icon aria-hidden="true" />
                        {label}
                        <span className="text-muted-foreground font-medium">· {slotsPeriodo.length} horário{slotsPeriodo.length > 1 ? 's' : ''}</span>
                      </h3>
                      <div
                        role="radiogroup"
                        aria-label={`Horários disponíveis no período da ${label.toLowerCase()}`}
                        className="grid grid-cols-3 sm:grid-cols-5 gap-2.5"
                      >
                        {slotsPeriodo.map((slot) => {
                          const selecionado = horarioSelecionado === slot;
                          // roving tabindex: só o item selecionado (ou o primeiro do dia, se nada selecionado) é alcançável via Tab
                          const ehFocoInicial = !horarioSelecionado && slotsFlat[0] === slot;
                          return (
                            <button
                              key={slot}
                              ref={(el) => {
                                if (el) slotRefs.current.set(slot, el);
                                else slotRefs.current.delete(slot);
                              }}
                              role="radio"
                              aria-checked={selecionado}
                              aria-label={`Selecionar horário ${slot}`}
                              tabIndex={selecionado || ehFocoInicial ? 0 : -1}
                              onClick={() => setHorarioSelecionado(slot)}
                              onKeyDown={(e) => handleSlotKeyDown(e, slot)}
                              className={`rounded-xl h-12 text-body font-bold border-2 transition-all duration-200 ease-apple cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tcc-azul-dark focus-visible:ring-offset-2
                                ${selecionado
                                  ? 'border-tcc-laranja bg-accent text-accent-foreground shadow-soft scale-[1.02]'
                                  : 'border-transparent bg-muted text-foreground hover:border-tcc-laranja/40'}
                              `}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {diaSelecionado && horarioSelecionado && (
          <div className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border shadow-elevated">
            <div className="max-w-2xl mx-auto p-3 sm:p-5 sm:p-6 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
              <h2
                ref={refConfirmacaoHeading}
                id="titulo-passo-3"
                tabIndex={-1}
                className="text-body font-bold text-foreground mb-2 sm:mb-3 focus:outline-none"
              >
                3. Confirme os dados
              </h2>
              <div className="flex flex-col gap-1.5 sm:gap-2 mb-3 sm:mb-4 text-body-sm sm:text-body">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground shrink-0">Serviço</span>
                  <span className="font-semibold text-foreground text-right truncate max-w-[55%]">{servico?.nome}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground shrink-0">Data</span>
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground text-right">
                      {capitalizarPrimeira(diaSelecionado.data.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }))}
                    </span>
                    <button
                      onClick={() => rolarEfocar(refHorarioHeading.current ? { current: document.getElementById('titulo-passo-1') } : null) || document.getElementById('titulo-passo-1')?.scrollIntoView({ behavior: 'smooth' })}
                      className="text-tcc-azul-dark dark:text-tcc-azul-light p-1 -m-1 rounded-full hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-tcc-azul-dark"
                      aria-label="Alterar dia"
                    >
                      <Pencil size={13} aria-hidden="true" />
                    </button>
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground shrink-0">Horário</span>
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">{horarioSelecionado}</span>
                    <button
                      onClick={() => document.getElementById('titulo-passo-2')?.scrollIntoView({ behavior: 'smooth' })}
                      className="text-tcc-azul-dark dark:text-tcc-azul-light p-1 -m-1 rounded-full hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-tcc-azul-dark"
                      aria-label="Alterar horário"
                    >
                      <Pencil size={13} aria-hidden="true" />
                    </button>
                  </span>
                </div>
                <div className="h-px bg-border my-0.5 sm:my-1" />
                <div className="flex justify-between text-body sm:text-body-lg">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-tcc-azul-dark dark:text-tcc-azul-light">{formatarPreco(servico?.preco)}</span>
                </div>
              </div>
              <button
                onClick={confirmarAgendamento}
                disabled={enviando}
                className="w-full bg-tcc-azul-dark text-white rounded-full h-11 sm:h-13 text-body font-bold shadow-elevated hover:bg-tcc-azul-darker transition-all duration-200 ease-apple active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {enviando ? 'Confirmando...' : 'Confirmar agendamento'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}