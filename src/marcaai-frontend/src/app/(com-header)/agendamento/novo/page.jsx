'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { confirmarAgendamentoAction } from '../../../actions/agendamento';
import Calendario from '../../../../components/calendario/Calendario'; // ajuste o caminho se necessário

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

export default function AgendarPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const servicoId = searchParams.get('servico');

  const [servico, setServico] = useState(null);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [agendados, setAgendados] = useState([]);
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!servicoId) return;
    async function carregar() {
      try {
        const resServico = await fetch(`http://localhost:5000/api/servicos/${servicoId}`);
        const dadosServico = await resServico.json();
        setServico(dadosServico);

        const prestadorId = dadosServico.prestadorId;

        const [resDisp, resAgend] = await Promise.all([
          fetch(`http://localhost:5000/api/disponibilidades/prestador/${prestadorId}`),
          fetch(`http://localhost:5000/api/disponibilidades/agendamentos/prestador/${prestadorId}`),
        ]);

        setDisponibilidades(await resDisp.json());
        setAgendados(await resAgend.json());
      } catch (e) {
        setErro('Erro ao carregar dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [servicoId]);

  // Assim que os dados carregarem, seleciona automaticamente o dia de hoje
  // (se ele tiver disponibilidade cadastrada), para que os horários já
  // apareçam na primeira abertura da página, sem precisar clicar no calendário.
  useEffect(() => {
    if (loading || diaSelecionado) return;
    if (!servico || disponibilidades.length === 0) return;

    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const disp = disponibilidades.find((d) => d.diaSemana === diaSemana);
    if (disp) {
      setDiaSelecionado({
        data: hoje,
        diaSemana,
        horaInicio: disp.horaInicio,
        horaFim: disp.horaFim,
      });
    }
  }, [loading, servico, disponibilidades, diaSelecionado]);

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
    setDiaSelecionado({ data, diaSemana, horaInicio: disp.horaInicio, horaFim: disp.horaFim });
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
      setTimeout(() => router.push('/agenda'), 2000);
    } catch (e) {
      setErro('Erro ao confirmar agendamento.');
    } finally {
      setEnviando(false);
    }
  }

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

  const slotsDoDia = diaSelecionado ? slotsLivres(diaSelecionado) : [];

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
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {slotsDoDia.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setHorarioSelecionado(slot)}
                    className={`rounded-xl py-2.5 text-sm font-bold border-2 transition-all
                      ${horarioSelecionado === slot
                        ? 'border-[#FD953A] bg-[#FD953A] text-white'
                        : 'border-transparent bg-[#F7F8FC] text-[#1a1a2e] hover:border-[#FD953A]/40'}
                    `}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {diaSelecionado && horarioSelecionado && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
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