'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, decodeJwtPayload } from '../../actions/auth'; // ajuste o caminho

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function DisponibilidadePage() {
  const router = useRouter();
  const [prestadorId, setPrestadorId] = useState(null);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [diaSemana, setDiaSemana] = useState(1);
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFim, setHoraFim] = useState('18:00');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);

  useEffect(() => {
    async function inicializar() {
      try {
        const token = await getSession();
        const usuario = await decodeJwtPayload(token);

        if (!usuario?.id) {
          router.push('/login');
          return;
        }

        setPrestadorId(usuario.id);

        const res = await fetch(`http://localhost:5000/api/disponibilidades/prestador/${usuario.id}`);
        setDisponibilidades(await res.json());
      } catch {
        setErro('Erro ao carregar disponibilidades.');
      } finally {
        setLoading(false);
      }
    }
    inicializar();
  }, []);

  async function adicionar() {
    if (horaInicio >= horaFim) {
      setErro('Hora de início deve ser menor que hora de fim.');
      return;
    }
    setSalvando(true);
    setErro(null);
    setSucesso(null);
    try {
      const res = await fetch(`http://localhost:5000/api/disponibilidades/prestador/${prestadorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diaSemana, horaInicio, horaFim }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || 'Erro ao adicionar.');
        return;
      }
      setDisponibilidades((prev) => [...prev, data]);
      setSucesso('Disponibilidade adicionada!');
    } catch {
      setErro('Erro ao adicionar disponibilidade.');
    } finally {
      setSalvando(false);
    }
  }

  async function deletar(id) {
    try {
      await fetch(`http://localhost:5000/api/disponibilidades/prestador/${prestadorId}/${id}`, {
        method: 'DELETE',
      });
      setDisponibilidades((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setErro('Erro ao remover disponibilidade.');
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-[#0B4F98] border-t-transparent animate-spin" />
        <span className="text-[#0B4F98] font-semibold text-sm">Carregando...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FC] py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-[#0B4F98] font-semibold mb-4 hover:opacity-70 transition-opacity"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar
          </button>
          <h1 className="text-2xl font-extrabold text-[#1a1a2e]">Minha disponibilidade</h1>
          <p className="text-sm text-gray-500 mt-1">Defina os dias e horários que você atende toda semana.</p>
        </div>

        {erro && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {erro}
          </div>
        )}
        {sucesso && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
            {sucesso}
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Adicionar horário</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">Dia da semana</label>
              <select
                value={diaSemana}
                onChange={(e) => setDiaSemana(Number(e.target.value))}
                className="rounded-xl border border-gray-200 bg-[#F7F8FC] px-4 py-3 text-sm font-semibold text-[#1a1a2e] focus:outline-none focus:border-[#0B4F98]"
              >
                {DIAS.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Início</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-[#F7F8FC] px-4 py-3 text-sm font-semibold text-[#1a1a2e] focus:outline-none focus:border-[#0B4F98]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Fim</label>
                <input
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-[#F7F8FC] px-4 py-3 text-sm font-semibold text-[#1a1a2e] focus:outline-none focus:border-[#0B4F98]"
                />
              </div>
            </div>

            <button
              onClick={adicionar}
              disabled={salvando || !prestadorId}
              className="w-full bg-[#0B4F98] text-white rounded-xl py-4 text-sm font-bold shadow-lg shadow-[#0B4F98]/20 hover:bg-[#0B4F98]/90 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Adicionar disponibilidade'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Horários cadastrados</h2>
          {disponibilidades.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma disponibilidade cadastrada ainda.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {disponibilidades
                .sort((a, b) => a.diaSemana - b.diaSemana)
                .map((d) => (
                  <div key={d.id} className="flex items-center justify-between bg-[#F7F8FC] rounded-xl px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#1a1a2e]">{DIAS[d.diaSemana]}</span>
                      <span className="text-xs text-gray-500">{d.horaInicio} – {d.horaFim}</span>
                    </div>
                    <button
                      onClick={() => deletar(d.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}