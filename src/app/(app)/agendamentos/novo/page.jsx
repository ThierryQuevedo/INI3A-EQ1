'use client';
import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { confirmarAgendamentoAction, listarAgendamentosPorPrestador } from '@/app/actions/agendamentos.actions';
import { buscarServico } from '@/app/actions/servicos.actions';
import { listarDisponibilidades } from '@/app/actions/disponibilidades.actions';
import Calendario from '@/app/components/features/agendamentos/Calendario';

function gerarSlots(horaInicio, horaFim, duracaoMin) {
  const slots = [];
  const [hIni, mIni] = horaInicio.split(':').map(Number);
  const [hFim, mFim] = horaFim.split(':').map(Number);
  let atual = hIni * 60 + mIni;
  const fim = hFim * 60 + mFim;
  while (atual + duracaoMin <= fim) {
    const h = String(Math.floor(atual / 60)).padStart(2, '0');
    const m = String(atual % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
    atual += duracaoMin;
  }
  return slots;
}

// Agrupa os horários livres em períodos do dia, pra facilitar a escolha visual
function agruparPorPeriodo(slots) {
  const grupos = { manha: [], tarde: [], noite: [] };
  for (const s of slots) {
    const hora = Number(s.split(':')[0]);
    if (hora < 12) grupos.manha.push(s);
    else if (hora < 18) grupos.tarde.push(s);
    else grupos.noite.push(s);
  }
  return grupos;
}

const IconSun = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
);
const IconCloudSun = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}><path d="M12 2v2M4.93 4.93l1.41 1.41" /><path d="M20 12a4 4 0 0 0-4-4 4.5 4.5 0 0 0-8.6 1.53A4 4 0 0 0 8 17h9a3 3 0 0 0 0-6" /></svg>
);
const IconMoon = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
);

const PERIODOS = [
  { chave: 'manha', label: 'Manhã', Icon: IconSun },
  { chave: 'tarde', label: 'Tarde', Icon: IconCloudSun },
  { chave: 'noite', label: 'Noite', Icon: IconMoon },
];

export default function AgendarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#0B4F98] border-t-transparent animate-spin" />
      </div>
    }>
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

  useEffect(() => {
    if (!servicoId) return;
    async function carregar() {
      try {
        const dadosServico = await buscarServico(Number(servicoId));
        setServico(dadosServico);

        const prestadorId = dadosServico.prestadorId;

        // A agenda é por serviço: cada serviço do prestador tem seus
        // próprios blocos de disponibilidade, então filtramos por servicoId.
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

  // Enquanto o usuário não clicar em nenhum dia, seleciona automaticamente o
  // dia de hoje (se ele tiver disponibilidade cadastrada), para que os
  // horários já apareçam na primeira abertura da página.
  const diaSelecionadoAuto = useMemo(() => {
    if (loading || !servico || disponibilidades.length === 0) return null;

    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const disp = disponibilidades.find((d) => d.diaSemana === diaSemana);
    if (!disp) return null;

    return {
      data: hoje,
      diaSemana,
      horaInicio: disp.horaInicio,
      horaFim: disp.horaFim,
    };
  }, [loading, servico, disponibilidades]);

  const diaSelecionado = diaSelecionadoManual ?? diaSelecionadoAuto;

  function slotsLivres(diaObj) {
    if (!servico) return [];
    const slots = gerarSlots(diaObj.horaInicio, diaObj.horaFim, servico.duracaoEstimada);
    const dataStr = diaObj.data.toDateString();

    const ocupados = agendados
      .filter((ag) => new Date(ag.dataHora).toDateString() === dataStr)
      .map((ag) => {
        const d = new Date(ag.dataHora);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      });

    let livres = slots.filter((s) => !ocupados.includes(s));

    // Se o dia em questão for hoje, remove os horários que já passaram
    const agora = new Date();
    if (dataStr === agora.toDateString()) {
      const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
      livres = livres.filter((s) => {
        const [h, m] = s.split(':').map(Number);
        return h * 60 + m > minutosAgora;
      });
    }

    return livres;
  }

  // Calcula, para cada dia do mês exibido, se há disponibilidade e quantas vagas
  function calcularDiasInfo() {
    if (!servico) return {};
    const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
    const info = {};

    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(anoAtual, mesAtual, dia);
      const diaSemana = data.getDay();
      const disp = disponibilidades.find((d) => d.diaSemana === diaSemana);

      if (!disp) {
        info[dia] = { disponivel: false, vagas: 0 };
        continue;
      }

      const livres = slotsLivres({ data, horaInicio: disp.horaInicio, horaFim: disp.horaFim });
      info[dia] = { disponivel: livres.length > 0, vagas: livres.length };
    }
    return info;
  }

  const diasInfo = calcularDiasInfo();

  // Quando o usuário clica num dia do calendário, monta o objeto que slotsLivres() espera
  function selecionarDia(data) {
    const diaSemana = data.getDay();
    const disp = disponibilidades.find((d) => d.diaSemana === diaSemana);
    if (!disp) return;
    setDiaSelecionadoManual({ data, diaSemana, horaInicio: disp.horaInicio, horaFim: disp.horaFim });
    setHorarioSelecionado(null);
  }

  async function confirmarAgendamento() {
    if (!diaSelecionado || !horarioSelecionado) return;
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

      setSucesso(true);
      setTimeout(() => router.push('/agendamentos'), 2000);
    } catch (e) {
      setErro('Erro ao confirmar agendamento.');
    } finally {
      setEnviando(false);
    }
  }

  const slotsDoDia = diaSelecionado ? slotsLivres(diaSelecionado) : [];
  const gruposPeriodo = useMemo(() => agruparPorPeriodo(slotsDoDia), [slotsDoDia]);

  if (loading) return (
    <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-[#0B4F98] border-t-transparent animate-spin" />
        <span className="text-[#0B4F98] font-semibold text-sm">Carregando disponibilidade...</span>
      </div>
    </div>
  );

  if (sucesso) return (
    <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-4 shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="text-xl font-bold text-[#1a1a2e]">Agendamento confirmado!</h2>
        <p className="text-sm text-gray-500">Redirecionando para sua agenda...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FC] py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#0B4F98] font-semibold mb-4 hover:opacity-70 transition-opacity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Voltar
          </button>
          <h1 className="text-2xl font-extrabold text-[#1a1a2e]">Escolha um horário</h1>
          {servico && (
            <p className="text-sm text-gray-500 mt-1">
              {servico.nome} · {servico.duracaoEstimada} min · <span className="text-[#0B4F98] font-semibold">R$ {Number(servico.preco).toFixed(2)}</span>
            </p>
          )}
        </div>

        {erro && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {erro}
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 flex justify-center">
          <Calendario
            mes={mesAtual}
            ano={anoAtual}
            diasInfo={diasInfo}
            diaSelecionado={diaSelecionado?.data ?? null}
            onSelectDia={selecionarDia}
            onMesChange={(novoMes, novoAno) => { setMesAtual(novoMes); setAnoAtual(novoAno); }}
          />
        </div>

        {diaSelecionado && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Horários — {diaSelecionado.data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            {slotsDoDia.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum horário disponível neste dia.</p>
            ) : (
              <div className="space-y-5">
                {PERIODOS.map(({ chave, label, Icon }) => {
                  const slotsPeriodo = gruposPeriodo[chave];
                  if (slotsPeriodo.length === 0) return null;
                  return (
                    <div key={chave}>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                        <Icon />
                        {label}
                        <span className="text-gray-300 font-medium normal-case tracking-normal">· {slotsPeriodo.length} horário{slotsPeriodo.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {slotsPeriodo.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setHorarioSelecionado(slot)}
                            className={`rounded-xl py-2.5 text-sm font-bold border-2 transition-all
                              ${horarioSelecionado === slot
                                ? 'border-[#FD953A] bg-[#FD953A] text-white shadow-sm scale-[1.02]'
                                : 'border-transparent bg-[#F7F8FC] text-[#1a1a2e] hover:border-[#FD953A]/40'}
                            `}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {diaSelecionado && horarioSelecionado && (
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky bottom-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Resumo</h2>
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Serviço</span>
                <span className="font-semibold text-[#1a1a2e]">{servico?.nome}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Data</span>
                <span className="font-semibold text-[#1a1a2e]">
                  {diaSelecionado.data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Horário</span>
                <span className="font-semibold text-[#1a1a2e]">{horarioSelecionado}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duração</span>
                <span className="font-semibold text-[#1a1a2e]">{servico?.duracaoEstimada} min</span>
              </div>
              <div className="h-px bg-gray-100 my-1" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-[#0B4F98] text-base">R$ {Number(servico?.preco).toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={confirmarAgendamento}
              disabled={enviando}
              className="w-full bg-[#0B4F98] text-white rounded-xl py-4 text-sm font-bold shadow-lg shadow-[#0B4F98]/20 hover:bg-[#0B4F98]/90 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {enviando ? 'Confirmando...' : 'Confirmar agendamento'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
