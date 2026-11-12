'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarSearch, LifeBuoy } from 'lucide-react';
import { confirmarAgendamentoAction, recarregarOcupacaoDoServico } from '@/app/actions/agendamentos.actions';
import Calendario from '@/app/components/features/agendamentos/Calendario';
import FaixaDias from '@/app/components/features/agendamentos/FaixaDias';
import GradeHorarios from '@/app/components/features/agendamentos/GradeHorarios';
import BarraRevisao from '@/app/components/features/agendamentos/BarraRevisao';
import PedidoEnviado from '@/app/components/features/agendamentos/PedidoEnviado';
import CategoryIcon from '@/app/components/features/servicos/CategoryIcon';
import AvisoConexao from '@/app/components/ui/AvisoConexao';
import BotaoVoltar from '@/app/components/ui/BotaoVoltar';
import PageContainer from '@/app/components/ui/PageContainer';
import { Button } from '@/app/components/ui/button';
import { formatarPreco } from '@/app/components/ui/PriceTag';
import { formatarDuracao } from '@/app/components/ui/DurationTag';
import { useConexao } from '@/lib/useConexao';
import { calcularSlotsLivresDoDia, calcularVagasPorDia, primeiraVaga } from '@/lib/disponibilidade';
import {
  hojeNoFuso,
  somarDias,
  instanteNoFuso,
  chaveDeDia,
  partesDaChave,
  formatarHora,
  formatarDiaCurto,
  formatarDiaExtenso,
} from '@/lib/formatoData';

const DIAS_NA_FAIXA = 14;
// limite de dias para buscar vaga
const HORIZONTE_BUSCA = 120;
// tempo ate avisar que esta demorando
const TEMPO_DEMORA_MS = 8000;

function prefereMovimentoReduzido() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

// comeca no dia e hora da url se livres senao no proximo dia com vaga
function escolherSelecaoInicial({ dataInicial, horaInicial, hoje, dadosAgenda, totalNaFaixa }) {
  const slotsDe = (dia) => calcularSlotsLivresDoDia({ dia, ...dadosAgenda });

  if (dataInicial && dataInicial >= hoje) {
    const slots = slotsDe(dataInicial);
    if (horaInicial && slots.includes(horaInicial)) {
      return { dia: dataInicial, hora: horaInicial, aviso: null };
    }
    if (horaInicial) {
      const textoPerdido = `O horário das ${formatarHora(horaInicial)} de ${formatarDiaCurto(dataInicial).toLowerCase()} acabou de ser preenchido.`;
      if (slots.length > 0) {
        return { dia: dataInicial, hora: null, aviso: `${textoPerdido} Estes ainda estão livres:` };
      }
      const outra = primeiraVaga({ apartirDe: dataInicial, horizonteDias: HORIZONTE_BUSCA, ...dadosAgenda });
      if (outra) {
        return { dia: outra.dia, hora: null, aviso: `${textoPerdido} O próximo dia com vaga é este:` };
      }
      return { dia: null, hora: null, aviso: null };
    }
    if (slots.length > 0) return { dia: dataInicial, hora: null, aviso: null };
  }

  const vaga = primeiraVaga({ apartirDe: hoje, horizonteDias: DIAS_NA_FAIXA - 1, ...dadosAgenda });
  if (!vaga) return { dia: null, hora: null, aviso: null };
  return { dia: vaga.dia, hora: totalNaFaixa === 1 ? vaga.hora : null, aviso: null };
}

export default function AgendarCliente({ servico, disponibilidades, agendadosIniciais, dataInicial, horaInicial }) {
  const router = useRouter();
  const online = useConexao();
  const hoje = hojeNoFuso();

  const [agendados, setAgendados] = useState(agendadosIniciais);
  const dadosAgenda = useMemo(
    () => ({ duracaoEstimada: servico.duracaoEstimada, disponibilidades, agendados }),
    [servico.duracaoEstimada, disponibilidades, agendados]
  );

  const diasDaFaixa = useMemo(
    () => calcularVagasPorDia({ diaInicial: hoje, quantidade: DIAS_NA_FAIXA, ...dadosAgenda }),
    [hoje, dadosAgenda]
  );
  const totalNaFaixa = diasDaFaixa.reduce((soma, d) => soma + d.slots.length, 0);

  const [selecaoInicial] = useState(() =>
    escolherSelecaoInicial({ dataInicial, horaInicial, hoje, dadosAgenda, totalNaFaixa })
  );
  const [diaSelecionado, setDiaSelecionado] = useState(selecaoInicial.dia);
  const [horarioSelecionado, setHorarioSelecionado] = useState(selecaoInicial.hora);
  const [aviso, setAviso] = useState(selecaoInicial.aviso);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [demorando, setDemorando] = useState(false);
  const [pedido, setPedido] = useState(null);

  const diaForaDaFaixa = Boolean(diaSelecionado) && diaSelecionado > somarDias(hoje, DIAS_NA_FAIXA - 1);
  const [calendarioAberto, setCalendarioAberto] = useState(diaForaDaFaixa);
  const [mesCalendario, setMesCalendario] = useState(() => {
    const { ano, mes } = partesDaChave(selecaoInicial.dia ?? hoje);
    return { ano, mes };
  });

  const refFaixa = useRef(null);
  const refGrade = useRef(null);
  const enviandoRef = useRef(false);
  const ultimaEscolhaPorPonteiro = useRef(false);
  const [pedidoRolagem, setPedidoRolagem] = useState(0);
  const [pedidoFocoGrade, setPedidoFocoGrade] = useState(selecaoInicial.aviso ? 1 : 0);

  const slotsDoDia = useMemo(() => {
    if (!diaSelecionado) return [];
    const daFaixa = diasDaFaixa.find((d) => d.dia === diaSelecionado);
    return daFaixa ? daFaixa.slots : calcularSlotsLivresDoDia({ dia: diaSelecionado, ...dadosAgenda });
  }, [diaSelecionado, diasDaFaixa, dadosAgenda]);

  // sem vaga em 14 dias procura mais adiante
  const vagaDistante = useMemo(
    () =>
      totalNaFaixa > 0
        ? null
        : primeiraVaga({ apartirDe: somarDias(hoje, DIAS_NA_FAIXA), horizonteDias: HORIZONTE_BUSCA, ...dadosAgenda }),
    [totalNaFaixa, hoje, dadosAgenda]
  );

  // vagas por dia do mes aberto
  const diasInfoDoMes = useMemo(() => {
    if (!calendarioAberto) return {};
    const { ano, mes } = mesCalendario;
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const info = {};
    for (let d = 1; d <= diasNoMes; d++) {
      const dia = chaveDeDia(ano, mes, d);
      const vagas = dia < hoje ? 0 : calcularSlotsLivresDoDia({ dia, ...dadosAgenda }).length;
      info[d] = { disponivel: vagas > 0, vagas };
    }
    return info;
  }, [calendarioAberto, mesCalendario, hoje, dadosAgenda]);

  // rola ate os horarios so com mouse ou toque
  useEffect(() => {
    if (pedidoRolagem === 0) return;
    const grade = refGrade.current;
    if (!grade) return;
    const { top } = grade.getBoundingClientRect();
    if (top > window.innerHeight * 0.7) {
      grade.scrollIntoView({ block: 'start', behavior: prefereMovimentoReduzido() ? 'auto' : 'smooth' });
    }
  }, [pedidoRolagem]);

  // horario perdido leva o foco para a grade
  useEffect(() => {
    if (pedidoFocoGrade === 0) return;
    const grade = refGrade.current;
    if (!grade) return;
    grade.focus({ preventScroll: true });
    grade.scrollIntoView({ block: 'start', behavior: prefereMovimentoReduzido() ? 'auto' : 'smooth' });
  }, [pedidoFocoGrade]);

  function selecionarDia(dia, { rolar = ultimaEscolhaPorPonteiro.current } = {}) {
    if (!dia || dia < hoje) return;
    setDiaSelecionado(dia);
    setHorarioSelecionado(null);
    setAviso(null);
    setErro(null);
    const { ano, mes } = partesDaChave(dia);
    setMesCalendario({ ano, mes });
    if (rolar) setPedidoRolagem((n) => n + 1);
  }

  function selecionarHorario(hora) {
    setHorarioSelecionado(hora);
    setAviso(null);
    setErro(null);
  }

  function selecionarDoCalendario(data) {
    const dia = chaveDeDia(data.getFullYear(), data.getMonth(), data.getDate());
    selecionarDia(dia, { rolar: true });
  }

  function alternarCalendario() {
    setCalendarioAberto((aberto) => !aberto);
  }

  function irParaVagaDistante() {
    if (!vagaDistante) return;
    setCalendarioAberto(true);
    selecionarDia(vagaDistante.dia, { rolar: true });
  }

  // volta o foco ao dia marcado
  function alterarSelecao() {
    const faixa = refFaixa.current;
    if (!faixa) return;
    faixa.scrollIntoView({ block: 'start', behavior: prefereMovimentoReduzido() ? 'auto' : 'smooth' });
    const marcado = faixa.querySelector('input[name="dia"]:checked');
    (marcado ?? faixa).focus({ preventScroll: true });
  }

  async function marcarHorario() {
    if (enviandoRef.current || !diaSelecionado || !horarioSelecionado || !online) return;

    if (!slotsDoDia.includes(horarioSelecionado)) {
      setHorarioSelecionado(null);
      setAviso(`O horário das ${formatarHora(horarioSelecionado)} não está mais livre. Escolha outro:`);
      setPedidoFocoGrade((n) => n + 1);
      return;
    }

    enviandoRef.current = true;
    setEnviando(true);
    setErro(null);
    const relogioDemora = setTimeout(() => setDemorando(true), TEMPO_DEMORA_MS);

    try {
      const resultado = await confirmarAgendamentoAction({
        servicoId: servico.id,
        dataHora: instanteNoFuso(diaSelecionado, horarioSelecionado).toISOString(),
      });

      if (resultado?.sucesso) {
        setPedido(resultado.agendamento);
        window.scrollTo({ top: 0 });
        return;
      }

      if (resultado?.codigo === 'ocupado') {
        const horaPerdida = horarioSelecionado;
        try {
          const ocupacao = await recarregarOcupacaoDoServico(servico.id);
          setAgendados(ocupacao);
        } catch {
          // a grade ainda mostra o horario e o servidor recusa de novo
        }
        setHorarioSelecionado(null);
        setAviso(
          `Alguém marcou ${formatarDiaCurto(diaSelecionado).toLowerCase()} às ${formatarHora(horaPerdida)} agora há pouco. Escolha outro horário:`
        );
        setPedidoFocoGrade((n) => n + 1);
        return;
      }

      if (resultado?.codigo === 'sessao') {
        const destino = new URLSearchParams({ servico: String(servico.id), data: diaSelecionado, hora: horarioSelecionado });
        router.push(`/api/auth/entrar/?proximo=${encodeURIComponent(`/agendamentos/novo/?${destino}`)}`);
        return;
      }

      setErro(resultado?.erro ?? 'Não conseguimos marcar agora. Toque de novo em "Marcar horário".');
    } catch {
      // reenvio seguro devolve o mesmo pedido
      setErro(
        'Não conseguimos falar com o servidor. Confira a internet e toque de novo em "Marcar horário". Se o pedido já tiver chegado, ele não será duplicado.'
      );
    } finally {
      clearTimeout(relogioDemora);
      setDemorando(false);
      setEnviando(false);
      enviandoRef.current = false;
    }
  }

  if (pedido) {
    return <PedidoEnviado servico={servico} agendamento={pedido} />;
  }

  const hrefServico = `/servicos/${servico.slug || servico.id}`;
  const semVagasNaFaixa = totalNaFaixa === 0;

  return (
    <PageContainer size="lg" className="pt-4 pb-10 sm:pt-6 md:pb-16">
      <BotaoVoltar fallbackHref={hrefServico} className="mb-2" />

      <div className="md:grid md:grid-cols-12 md:gap-8 md:items-start">
        <div className="md:col-span-7 lg:col-span-8 min-w-0">
          <h1 className="text-h4 font-bold text-foreground">Escolha o horário</h1>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-card p-3 sm:p-4">
            <span className="size-12 shrink-0 rounded-lg bg-secondary text-secondary-foreground inline-flex items-center justify-center" aria-hidden="true">
              <CategoryIcon nome={servico.categoriaNome} size={24} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-h6 font-bold text-foreground leading-snug break-words">{servico.nome}</p>
              <p className="text-body-sm text-muted-foreground">
                <Link
                  href={`/prestador/${servico.prestadorSlug || servico.prestadorId}`}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {servico.prestadorNome}
                </Link>
                {' · '}
                <span className="whitespace-nowrap">{formatarDuracao(servico.duracaoEstimada)}</span>
                {' · '}
                <span className="whitespace-nowrap tabular-nums">{formatarPreco(servico.preco)}</span>
              </p>
            </div>
          </div>

          <p className="mt-2">
            <Link
              href="/suporte"
              className="inline-flex items-center gap-1.5 min-h-toque px-1 -ml-1 rounded-lg text-body-sm font-semibold text-primary hover:underline underline-offset-4"
            >
              <LifeBuoy size={16} aria-hidden="true" />
              Precisa de ajuda?
            </Link>
          </p>

          <AvisoConexao
            className="mt-2"
            mensagem="Você pode continuar escolhendo; para marcar, precisamos de conexão."
          />

          <div
            className="mt-4"
            onPointerDownCapture={() => {
              ultimaEscolhaPorPonteiro.current = true;
            }}
            onKeyDownCapture={() => {
              ultimaEscolhaPorPonteiro.current = false;
            }}
          >
            {semVagasNaFaixa ? (
              <section aria-labelledby="titulo-sem-vagas" className="rounded-xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <CalendarSearch size={24} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  <div className="min-w-0">
                    <h2 id="titulo-sem-vagas" className="text-h6 font-bold text-foreground">
                      Sem horário livre nos próximos 14 dias
                    </h2>
                    <p className="mt-1 text-body text-muted-foreground">
                      {vagaDistante
                        ? `${servico.prestadorNome} só tem vaga a partir de ${formatarDiaExtenso(vagaDistante.dia).toLowerCase()}.`
                        : `${servico.prestadorNome} ainda não abriu horários para este serviço.`}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                  {vagaDistante && (
                    <Button type="button" size="lg" onClick={irParaVagaDistante}>
                      Ver {formatarDiaCurto(vagaDistante.dia)}
                    </Button>
                  )}
                  <Button type="button" size="lg" variant="outline" onClick={alternarCalendario} aria-expanded={calendarioAberto} aria-controls="calendario-mes">
                    {calendarioAberto ? 'Fechar calendário' : 'Ver outro mês'}
                  </Button>
                  {servico.categoriaId && (
                    <Button asChild size="lg" variant="outline">
                      <Link href={`/servicos?categoria=${servico.categoriaId}`}>
                        Outros serviços{servico.categoriaNome ? ` de ${servico.categoriaNome}` : ''}
                      </Link>
                    </Button>
                  )}
                </div>
              </section>
            ) : (
              <div ref={refFaixa} tabIndex={-1} className="focus:outline-none">
                <FaixaDias
                  dias={diasDaFaixa}
                  diaSelecionado={diaSelecionado}
                  onSelecionar={(dia) => selecionarDia(dia)}
                  onVerOutroMes={alternarCalendario}
                  calendarioAberto={calendarioAberto}
                  idCalendario="calendario-mes"
                />
              </div>
            )}

            {calendarioAberto && (
              <section
                id="calendario-mes"
                aria-label="Calendário do mês"
                className="entrada-suave mt-4 rounded-xl border border-border bg-card p-4 sm:p-6"
              >
                <Calendario
                  mes={mesCalendario.mes}
                  ano={mesCalendario.ano}
                  diasInfo={diasInfoDoMes}
                  diaSelecionado={
                    diaSelecionado
                      ? new Date(partesDaChave(diaSelecionado).ano, partesDaChave(diaSelecionado).mes, partesDaChave(diaSelecionado).dia)
                      : null
                  }
                  onSelectDia={selecionarDoCalendario}
                  onMesChange={(mes, ano) => setMesCalendario({ ano, mes })}
                />
              </section>
            )}

            {diaSelecionado && (
              <div className="mt-6">
                {slotsDoDia.length > 0 ? (
                  <GradeHorarios
                    key={diaSelecionado}
                    refGrupo={refGrade}
                    dia={diaSelecionado}
                    slots={slotsDoDia}
                    horarioSelecionado={horarioSelecionado}
                    onSelecionar={selecionarHorario}
                    aviso={aviso}
                  />
                ) : (
                  <div ref={refGrade} tabIndex={-1} className="focus:outline-none">
                    <h2 className="text-h5 font-bold text-foreground">{formatarDiaExtenso(diaSelecionado, { relativo: true })}</h2>
                    <p className="mt-2 text-body text-muted-foreground">Não há horário livre neste dia. Escolha outro dia acima.</p>
                  </div>
                )}

                {!horarioSelecionado && slotsDoDia.length > 0 && (
                  <p className="md:hidden mt-5 text-body-sm text-muted-foreground">
                    Toque num horário para revisar e marcar.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-5 lg:col-span-4">
          <BarraRevisao
            servico={servico}
            dia={diaSelecionado}
            hora={horarioSelecionado}
            enviando={enviando}
            online={online}
            demorando={demorando}
            erro={erro}
            onMarcar={marcarHorario}
            onAlterar={alterarSelecao}
          />
        </div>
      </div>
    </PageContainer>
  );
}
