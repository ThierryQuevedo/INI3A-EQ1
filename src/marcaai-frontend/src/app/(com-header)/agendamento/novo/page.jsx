'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { confirmarAgendamentoAction } from '../../../actions/agendamento';

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

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

function proximosDias(diaSemana, quantidade = 4) {
  const dias = [];
  const hoje = new Date();
  for (let i = 1; i <= 60 && dias.length < quantidade; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    if (d.getDay() === diaSemana) dias.push(new Date(d));
  }
  return dias;
}

export default function AgendarPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const servicoId = searchParams.get('servico');

  const [servico, setServico] = useState(null);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [agendados, setAgendados] = useState([]);
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

  const opcoesDias = disponibilidades.flatMap((disp) =>
    proximosDias(disp.diaSemana).map((data) => ({
      data,
      diaSemana: disp.diaSemana,
      horaInicio: disp.horaInicio,
      horaFim: disp.horaFim,
    }))
  ).sort((a, b) => a.data - b.data);

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

    return slots.filter((s) => !ocupados.includes(s));
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

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Dias disponíveis</h2>
          {opcoesDias.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum dia disponível encontrado.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {opcoesDias.map((diaObj, i) => {
                const selecionado = diaSelecionado?.data.toDateString() === diaObj.data.toDateString();
                const livres = slotsLivres(diaObj);
                return (
                  <button
                    key={i}
                    disabled={livres.length === 0}
                    onClick={() => { setDiaSelecionado(diaObj); setHorarioSelecionado(null); }}
                    className={`rounded-xl p-3 text-center border-2 transition-all
                      ${selecionado ? 'border-[#0B4F98] bg-[#0B4F98] text-white' : 'border-transparent bg-[#F7F8FC] text-[#1a1a2e] hover:border-[#0B4F98]/30'}
                      ${livres.length === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="text-xs font-bold uppercase">{DIAS_SEMANA[diaObj.data.getDay()]}</div>
                    <div className="text-lg font-extrabold">{diaObj.data.getDate()}</div>
                    <div className="text-[10px] opacity-70">
                      {diaObj.data.toLocaleDateString('pt-BR', { month: 'short' })}
                    </div>
                    <div className={`text-[10px] mt-1 font-semibold ${selecionado ? 'text-white/80' : 'text-[#0B4F98]'}`}>
                      {livres.length} horário{livres.length !== 1 ? 's' : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
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