'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, decodeJwtPayload } from '../../actions/auth';

const DIAS_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HORA_GRADE_INICIO = 0;  // 00:00 (Meia-noite)
const HORA_GRADE_FIM = 23;     // 23:00
const ROW_HEIGHT = 32;         // Aumentado para melhor visualização
const PASSOS_DISPONIVEIS = [15, 30, 60];

function minutosParaHHMM(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function hhmmParaMinutos(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export default function DisponibilidadePage() {
  const router = useRouter();
  const [prestadorId, setPrestadorId] = useState(null);
  const [disponibilidades, setDisponibilidades] = useState([]);
  
  // Controle de passo / incremento
  const [passoModo, setPassoModo] = useState('30'); // '15', '30', '60' ou 'custom'
  const [passoCustom, setPassoCustom] = useState(45);
  const passo = passoModo === 'custom' ? Math.max(5, Number(passoCustom) || 15) : Number(passoModo);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [processando, setProcessando] = useState(false);

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

  useEffect(() => {
    if (!sucesso) return;
    const t = setTimeout(() => setSucesso(null), 2500);
    return () => clearTimeout(t);
  }, [sucesso]);

  const totalMinutosGrade = (HORA_GRADE_FIM - HORA_GRADE_INICIO + 1) * 60;
  const totalLinhas = Math.floor(totalMinutosGrade / passo);

  async function criarBlocoBackend(diaSemana, horaInicio, horaFim) {
    const res = await fetch(`http://localhost:5000/api/disponibilidades/prestador/${prestadorId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diaSemana, horaInicio, horaFim }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao salvar horário.');
    return data;
  }

  async function removerBlocoBackend(id) {
    await fetch(`http://localhost:5000/api/disponibilidades/prestador/${prestadorId}/${id}`, {
      method: 'DELETE',
    });
  }

  function blocosDoDia(dia) {
    return disponibilidades
      .filter((d) => d.diaSemana === dia)
      .slice()
      .sort((a, b) => hhmmParaMinutos(a.horaInicio) - hhmmParaMinutos(b.horaInicio));
  }

  function buscarBlocosSobrepostos(dia, inicioMin, fimMin, ignorarId = null) {
    return blocosDoDia(dia).filter((b) => {
      if (b.id === ignorarId) return false;
      const bIni = hhmmParaMinutos(b.horaInicio);
      const bFim = hhmmParaMinutos(b.horaFim);
      return inicioMin < bFim && fimMin > bIni;
    });
  }

  async function handleCelulaClick(dia, linha) {
    if (processando) return;
    const inicioMin = HORA_GRADE_INICIO * 60 + linha * passo;
    const fimMin = inicioMin + passo;
    if (fimMin > (HORA_GRADE_FIM + 1) * 60) return;

    const sobrepostos = buscarBlocosSobrepostos(dia, inicioMin, fimMin);
    if (sobrepostos.length > 0) return;

    setProcessando(true);
    setErro(null);
    try {
      const novo = await criarBlocoBackend(dia, minutosParaHHMM(inicioMin), minutosParaHHMM(fimMin));
      setDisponibilidades((prev) => [...prev, novo]);
    } catch (e) {
      setErro(e.message);
    } finally {
      setProcessando(false);
    }
  }

  async function alterarTamanhoBloco(bloco, lado, operacao) {
    if (processando) return;

    let inicioMin = hhmmParaMinutos(bloco.horaInicio);
    let fimMin = hhmmParaMinutos(bloco.horaFim);

    if (lado === 'inicio') {
      inicioMin = operacao === 'aumentar' ? inicioMin - passo : inicioMin + passo;
    } else if (lado === 'fim') {
      fimMin = operacao === 'aumentar' ? fimMin + passo : fimMin - passo;
    }

    if (inicioMin >= fimMin) return;
    if (inicioMin < HORA_GRADE_INICIO * 60 || fimMin > (HORA_GRADE_FIM + 1) * 60) return;

    setProcessando(true);
    setErro(null);

    try {
      const sobrepostos = buscarBlocosSobrepostos(bloco.diaSemana, inicioMin, fimMin, bloco.id);

      if (sobrepostos.length > 0) {
        let novoInicioUnificado = inicioMin;
        let novoFimUnificado = fimMin;

        sobrepostos.forEach((s) => {
          const sIni = hhmmParaMinutos(s.horaInicio);
          const sFim = hhmmParaMinutos(s.horaFim);
          if (sIni < novoInicioUnificado) novoInicioUnificado = sIni;
          if (sFim > novoFimUnificado) novoFimUnificado = sFim;
        });

        await removerBlocoBackend(bloco.id);
        for (const s of sobrepostos) {
          await removerBlocoBackend(s.id);
        }

        const unificado = await criarBlocoBackend(
          bloco.diaSemana,
          minutosParaHHMM(novoInicioUnificado),
          minutosParaHHMM(novoFimUnificado)
        );

        const idsRemovidos = new Set([bloco.id, ...sobrepostos.map((s) => s.id)]);
        setDisponibilidades((prev) => [...prev.filter((d) => !idsRemovidos.has(d.id)), unificado]);
      } else {
        await removerBlocoBackend(bloco.id);
        const atualizado = await criarBlocoBackend(
          bloco.diaSemana,
          minutosParaHHMM(inicioMin),
          minutosParaHHMM(fimMin)
        );
        setDisponibilidades((prev) => prev.map((d) => (d.id === bloco.id ? atualizado : d)));
      }
    } catch (e) {
      setErro(e.message);
    } finally {
      setProcessando(false);
    }
  }

  async function replicarParaDia(bloco, direcao) {
    if (processando) return;
    const inicioMin = hhmmParaMinutos(bloco.horaInicio);
    const fimMin = hhmmParaMinutos(bloco.horaFim);
    const diaAlvo = (bloco.diaSemana + direcao + 7) % 7;

    if (buscarBlocosSobrepostos(diaAlvo, inicioMin, fimMin).length > 0) {
      return; // Ignora sem emitir mensagem de erro na tela
    }

    setProcessando(true);
    setErro(null);
    try {
      const novo = await criarBlocoBackend(diaAlvo, bloco.horaInicio, bloco.horaFim);
      setDisponibilidades((prev) => [...prev, novo]);
    } catch (e) {
      setErro(e.message);
    } finally {
      setProcessando(false);
    }
  }

  async function handleRemover(id) {
    setProcessando(true);
    setErro(null);
    try {
      await removerBlocoBackend(id);
      setDisponibilidades((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setErro('Erro ao remover disponibilidade.');
    } finally {
      setProcessando(false);
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

  const linhasHora = [];
  for (let l = 0; l <= totalLinhas; l++) {
    const min = HORA_GRADE_INICIO * 60 + l * passo;
    if (min % 60 === 0 && min <= (HORA_GRADE_FIM + 1) * 60) {
      linhasHora.push({ linha: l, label: minutosParaHHMM(min) });
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] py-8 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-[#0B4F98] font-semibold mb-3 hover:opacity-70 transition-opacity"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar
          </button>
          <h1 className="text-2xl font-extrabold text-[#1a1a2e]">Minha disponibilidade</h1>
          <p className="text-sm text-gray-500 mt-1">
            Grade completa de 00:00 às 23:00. Clique para adicionar blocos de horários contínuos ou segregados.
          </p>
        </div>

        {erro && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{erro}</div>
        )}

        {/* Seleção do Passo (Com Opção Customizada) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex items-center gap-4 flex-wrap">
          <label className="text-xs font-semibold text-gray-500">Duração do incremento</label>
          <select
            value={passoModo}
            onChange={(e) => setPassoModo(e.target.value)}
            className="rounded-xl border border-gray-200 bg-[#F7F8FC] px-3 py-2 text-sm font-semibold text-[#1a1a2e] focus:outline-none focus:border-[#0B4F98]"
          >
            {PASSOS_DISPONIVEIS.map((p) => (
              <option key={p} value={p}>{p} min</option>
            ))}
            <option value="custom">Customizado</option>
          </select>

          {passoModo === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="240"
                value={passoCustom}
                onChange={(e) => setPassoCustom(e.target.value)}
                className="w-20 rounded-xl border border-gray-200 bg-[#F7F8FC] px-3 py-2 text-sm font-semibold text-[#1a1a2e] focus:outline-none focus:border-[#0B4F98]"
              />
              <span className="text-xs font-semibold text-gray-500">minutos</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm overflow-x-auto">
          <div className="flex min-w-[840px]">
            {/* Coluna de marcação de horas */}
            <div className="w-16 flex-shrink-0 relative" style={{ height: totalLinhas * ROW_HEIGHT }}>
              {linhasHora.map(({ linha, label }) => (
                <div
                  key={linha}
                  className="absolute left-0 right-0 text-[11px] text-gray-400 font-bold -translate-y-1/2"
                  style={{ top: linha * ROW_HEIGHT }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Colunas dos dias da semana */}
            {DIAS_ABREV.map((nome, dia) => {
              const blocos = blocosDoDia(dia);
              return (
                <div key={dia} className="flex-1 min-w-[105px] border-l border-gray-100">
                  <div className="text-center text-xs font-bold text-gray-600 py-2 border-b border-gray-100 bg-gray-50/50">
                    {nome}
                  </div>
                  <div className="relative" style={{ height: totalLinhas * ROW_HEIGHT }}>
                    
                    {/* Linhas de fundo interativas */}
                    {Array.from({ length: totalLinhas }).map((_, linha) => (
                      <div
                        key={linha}
                        onClick={() => handleCelulaClick(dia, linha)}
                        className="absolute left-0 right-0 border-b border-gray-50 hover:bg-[#0B4F98]/10 cursor-pointer transition-colors"
                        style={{ top: linha * ROW_HEIGHT, height: ROW_HEIGHT }}
                      />
                    ))}

                    {/* Blocos em tela */}
                    {blocos.map((b) => {
                      const inicioMin = hhmmParaMinutos(b.horaInicio);
                      const fimMin = hhmmParaMinutos(b.horaFim);
                      const top = ((inicioMin - HORA_GRADE_INICIO * 60) / passo) * ROW_HEIGHT;
                      const altura = ((fimMin - inicioMin) / passo) * ROW_HEIGHT;

                      return (
                        <div
                          key={b.id}
                          className="absolute left-1 right-1 bg-[#0B4F98] text-white rounded-xl shadow-md flex flex-col items-center justify-center group z-10 hover:z-20 transition-all"
                          style={{ top, height: Math.max(altura, ROW_HEIGHT) }}
                        >
                          {/* BOTÃO REMOVER (Aumentado no Canto Superior Direito) */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemover(b.id); }}
                            className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-extrabold flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-30"
                            title="Remover"
                          >
                            ✕
                          </button>

                          {/* REPLICAR ESQUERDA */}
                          <button
                            onClick={(e) => { e.stopPropagation(); replicarParaDia(b, -1); }}
                            className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-[#FD953A] hover:bg-[#e07d28] text-white rounded-full text-xs font-bold flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            title="Copiar para dia anterior"
                          >
                            +
                          </button>

                          {/* REPLICAR DIREITA */}
                          <button
                            onClick={(e) => { e.stopPropagation(); replicarParaDia(b, 1); }}
                            className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-[#FD953A] hover:bg-[#e07d28] text-white rounded-full text-xs font-bold flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            title="Copiar para próximo dia"
                          >
                            +
                          </button>

                          {/* CONTROLES DO TOPO (Início) */}
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center bg-[#FD953A] rounded-full px-2 py-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity gap-1 z-20">
                            <button
                              onClick={(e) => { e.stopPropagation(); alterarTamanhoBloco(b, 'inicio', 'diminuir'); }}
                              className="text-white text-sm font-black px-1 hover:scale-110"
                              title="Subir início"
                            >
                              -
                            </button>
                            <span className="text-[10px] opacity-40">|</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); alterarTamanhoBloco(b, 'inicio', 'aumentar'); }}
                              className="text-white text-sm font-black px-1 hover:scale-110"
                              title="Descer início"
                            >
                              +
                            </button>
                          </div>

                          {/* TEXTO DO HORÁRIO (Aumentado) */}
                          <span className="text-xs font-black tracking-tight text-center px-1 select-none">
                            {b.horaInicio}–{b.horaFim}
                          </span>

                          {/* CONTROLES DA BASE (Fim) */}
                          <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 flex items-center bg-[#FD953A] rounded-full px-2 py-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity gap-1 z-20">
                            <button
                              onClick={(e) => { e.stopPropagation(); alterarTamanhoBloco(b, 'fim', 'aumentar'); }}
                              className="text-white text-sm font-black px-1 hover:scale-110"
                              title="Expandir fim"
                            >
                              +
                            </button>
                            <span className="text-[10px] opacity-40">|</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); alterarTamanhoBloco(b, 'fim', 'diminuir'); }}
                              className="text-white text-sm font-black px-1 hover:scale-110"
                              title="Recuar fim"
                            >
                              -
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}