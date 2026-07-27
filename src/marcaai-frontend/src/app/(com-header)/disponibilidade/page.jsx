'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, decodeJwtPayload } from '../../actions/auth';

const DIAS_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HORA_GRADE_INICIO = 0;
const HORA_GRADE_FIM = 23;
const ROW_HEIGHT = 22;
const PASSOS_DISPONIVEIS = [15, 30, 60];

function minutosParaHHMM(min) {
  if (min >= 1440) return '23:59';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function hhmmParaMinutos(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function normalizarBloco(b) {
  const cortar = (v) => (typeof v === 'string' ? v.slice(0, 5) : v);
  return { ...b, horaInicio: cortar(b.horaInicio), horaFim: cortar(b.horaFim) };
}

const IconChevronUp = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" {...props}><polyline points="18 15 12 9 6 15" /></svg>
);
const IconChevronDown = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" {...props}><polyline points="6 9 12 15 18 9" /></svg>
);
const IconArrowLeft = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" {...props}><polyline points="15 18 9 12 15 6" /></svg>
);
const IconArrowRight = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" {...props}><polyline points="9 18 15 12 9 6" /></svg>
);
const IconTrash = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);

export default function DisponibilidadePage() {
  const router = useRouter();
  const [prestadorId, setPrestadorId] = useState(null);
  const [disponibilidades, setDisponibilidades] = useState([]);

  const [passoModo, setPassoModo] = useState('30');
  const [passoCustom, setPassoCustom] = useState(45);
  const passo = passoModo === 'custom' ? Math.max(5, Number(passoCustom) || 15) : Number(passoModo);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [processando, setProcessando] = useState(false);

  const [blocoSelecionado, setBlocoSelecionado] = useState(null);

  const [arraste, setArraste] = useState(null);
  const arrasteRef = useRef(null);
  const arrastandoAgora = useRef(false);
  const disponibilidadesRef = useRef(disponibilidades);

  useEffect(() => {
    disponibilidadesRef.current = disponibilidades;
  }, [disponibilidades]);

  useEffect(() => {
    let montado = true;
    async function inicializar() {
      try {
        const token = await getSession();
        if (!token) {
          if (montado) router.push('/login');
          return;
        }

        const usuario = await decodeJwtPayload(token);
        const idValido = usuario?.id ?? usuario?.usuarioId ?? usuario?.sub ?? null;

        if (idValido == null) {
          if (montado) {
            setErro('ID do prestador não encontrado no token.');
            router.push('/login');
          }
          return;
        }

        if (montado) setPrestadorId(idValido);

        const res = await fetch(`http://localhost:5000/api/disponibilidades/prestador/${idValido}`);
        if (res.ok && montado) {
          const dados = await res.json();
          setDisponibilidades(Array.isArray(dados) ? dados.map(normalizarBloco) : []);
        }
      } catch {
        if (montado) setErro('Erro ao carregar disponibilidades.');
      } finally {
        if (montado) setLoading(false);
      }
    }
    inicializar();
    return () => { montado = false; };
  }, [router]);

  useEffect(() => {
    if (!erro) return;
    const t = setTimeout(() => setErro(null), 4000);
    return () => clearTimeout(t);
  }, [erro]);

  const totalMinutosGrade = (HORA_GRADE_FIM - HORA_GRADE_INICIO + 1) * 60;
  const totalLinhas = Math.floor(totalMinutosGrade / passo);
  const linhasPorHora = Math.max(1, Math.round(60 / passo));

  function linhaParaMinutos(linhaIndex) {
    return HORA_GRADE_INICIO * 60 + linhaIndex * passo;
  }

  async function resolverPrestadorId() {
    if (prestadorId != null) return prestadorId;
    const token = await getSession();
    const usuario = await decodeJwtPayload(token);
    return usuario?.id ?? usuario?.usuarioId ?? usuario?.sub ?? null;
  }

  async function criarBlocoBackend(diaSemana, horaInicio, horaFim) {
    const idParaEnvio = await resolverPrestadorId();
    if (idParaEnvio == null) throw new Error('Prestador ID inválido.');

    const res = await fetch(`http://localhost:5000/api/disponibilidades/prestador/${idParaEnvio}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diaSemana: Number(diaSemana), horaInicio, horaFim }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao salvar horário.');
    return normalizarBloco(data);
  }

  async function removerBlocoBackend(id) {
    const idParaEnvio = await resolverPrestadorId();
    if (idParaEnvio == null) return;
    await fetch(`http://localhost:5000/api/disponibilidades/prestador/${idParaEnvio}/${id}`, {
      method: 'DELETE',
    });
  }

  const blocosDoDiaRef = useCallback((dia) => {
    return disponibilidadesRef.current
      .filter((d) => Number(d.diaSemana) === Number(dia))
      .slice()
      .sort((a, b) => hhmmParaMinutos(a.horaInicio) - hhmmParaMinutos(b.horaInicio));
  }, []);

  const blocosPorDia = useMemo(() => {
    const grupos = Array.from({ length: 7 }, () => []);
    for (const d of disponibilidades) {
      const dia = Number(d.diaSemana);
      if (dia >= 0 && dia < 7) grupos[dia].push(d);
    }
    grupos.forEach((g) => g.sort((a, b) => hhmmParaMinutos(a.horaInicio) - hhmmParaMinutos(b.horaInicio)));
    return grupos;
  }, [disponibilidades]);

  const confirmarArraste = useCallback(async (dadosArraste) => {
    if (!dadosArraste) return;
    
    const { dia, inicioLinha, atualLinha } = dadosArraste;
    const minLinhaIndex = Math.min(inicioLinha, atualLinha);
    const maxLinhaIndex = Math.max(inicioLinha, atualLinha);

    let inicioMin = linhaParaMinutos(minLinhaIndex);
    let fimMin = linhaParaMinutos(maxLinhaIndex + 1);

    if (inicioMin < 0) inicioMin = 0;
    if (fimMin > 1440) fimMin = 1440;
    if (inicioMin >= fimMin) return;

    setProcessando(true);
    setErro(null);

    try {
      const blocosDia = blocosDoDiaRef(dia);

      const blocosParaFundir = blocosDia.filter((b) => {
        const bIni = hhmmParaMinutos(b.horaInicio);
        const bFim = hhmmParaMinutos(b.horaFim);
        return inicioMin <= bFim && fimMin >= bIni;
      });

      let menorInicio = inicioMin;
      let maiorFim = fimMin;

      blocosParaFundir.forEach((b) => {
        const bIni = hhmmParaMinutos(b.horaInicio);
        const bFim = hhmmParaMinutos(b.horaFim);
        if (bIni < menorInicio) menorInicio = bIni;
        if (bFim > maiorFim) maiorFim = bFim;
      });

      if (blocosParaFundir.length > 0) {
        await Promise.all(blocosParaFundir.map((b) => removerBlocoBackend(b.id)));
      }

      const unificado = await criarBlocoBackend(
        dia,
        minutosParaHHMM(menorInicio),
        minutosParaHHMM(maiorFim)
      );

      const idsRemovidos = new Set(blocosParaFundir.map((b) => b.id));
      setDisponibilidades((prev) => [...prev.filter((d) => !idsRemovidos.has(d.id)), unificado]);

    } catch (e) {
      setErro(e.message);
    } finally {
      setProcessando(false);
      setArraste(null);
      arrasteRef.current = null;
    }
  }, [prestadorId, passo]);

  useEffect(() => {
    function aoSoltar() {
      if (arrasteRef.current) {
        confirmarArraste(arrasteRef.current);
      }
      arrastandoAgora.current = false;
    }
    window.addEventListener('pointerup', aoSoltar);
    return () => window.removeEventListener('pointerup', aoSoltar);
  }, [confirmarArraste]);

  function iniciarArraste(e, dia, linha) {
    if (processando) return;
    e.preventDefault();
    setBlocoSelecionado(null);
    arrastandoAgora.current = true;
    const novo = { dia, inicioLinha: linha, atualLinha: linha };
    arrasteRef.current = novo;
    setArraste(novo);
  }

  function moverArraste(dia, linha) {
    if (!arrastandoAgora.current) return;
    setArraste((prev) => {
      if (!prev || prev.dia !== dia || prev.atualLinha === linha) return prev;
      return { ...prev, atualLinha: linha };
    });
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
    if (inicioMin < 0 || fimMin > 1440) return;

    setProcessando(true);
    setErro(null);
    try {
      await removerBlocoBackend(bloco.id);
      const atualizado = await criarBlocoBackend(bloco.diaSemana, minutosParaHHMM(inicioMin), minutosParaHHMM(fimMin));
      setDisponibilidades((prev) => [...prev.filter((d) => d.id !== bloco.id), atualizado]);
      setBlocoSelecionado(atualizado.id);
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
    const diaAlvo = (Number(bloco.diaSemana) + direcao + 7) % 7;

    const sobrepostos = blocosDoDiaRef(diaAlvo).filter((b) => {
      const bIni = hhmmParaMinutos(b.horaInicio);
      const bFim = hhmmParaMinutos(b.horaFim);
      return inicioMin <= bFim && fimMin >= bIni;
    });

    if (sobrepostos.length > 0) {
      setErro('O dia de destino já possui horários tocando neste intervalo.');
      return;
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
      setBlocoSelecionado(null);
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
        <span className="text-[#0B4F98] font-semibold text-sm">Carregando horários...</span>
      </div>
    </div>
  );

  const linhasHora = [];
  for (let l = 0; l <= totalLinhas; l += linhasPorHora) {
    const min = linhaParaMinutos(l);
    let label = minutosParaHHMM(min);
    if (l === totalLinhas && min === 1440) label = '23:59';
    linhasHora.push({ linha: l, label });
  }

  return (
    <div
      className="min-h-screen bg-[#F7F8FC] py-8 px-4 font-sans"
      onClick={() => setBlocoSelecionado(null)}
    >
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
            Arraste na grade para criar blocos contínuos. Clique no bloco para abrir o menu de exclusão e edição.
          </p>
        </div>

        {erro && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl px-4 py-3 shadow-sm">{erro}</div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex items-center gap-4 flex-wrap" onClick={(e) => e.stopPropagation()}>
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

        <div className="bg-white rounded-2xl p-3 shadow-sm overflow-x-auto touch-none select-none">
          <div className="flex min-w-[850px]">

            <div className="w-14 flex-shrink-0 relative pt-6" style={{ height: totalLinhas * ROW_HEIGHT + 24 }}>
              {linhasHora.map(({ linha, label }) => (
                <div
                  key={linha}
                  className="absolute right-2 text-[10px] text-gray-400 font-medium -translate-y-1/2"
                  style={{ top: 24 + linha * ROW_HEIGHT }}
                >
                  {label}
                </div>
              ))}
            </div>

            {DIAS_ABREV.map((nome, dia) => {
              const blocos = blocosPorDia[dia];
              const arrastandoAqui = arraste && arraste.dia === dia;
              const linhaMinArraste = arrastandoAqui ? Math.min(arraste.inicioLinha, arraste.atualLinha) : null;
              const linhaMaxArraste = arrastandoAqui ? Math.max(arraste.inicioLinha, arraste.atualLinha) : null;

              return (
                <div key={dia} className="flex-1 min-w-[110px] border-l border-gray-100 relative">
                  <div className="text-center text-[11px] font-semibold text-gray-500 py-1.5 border-b border-gray-100 sticky top-0 bg-white z-10">
                    {nome}
                  </div>
                  <div className="relative" style={{ height: totalLinhas * ROW_HEIGHT }}>

                    {linhasHora.map(({ linha }) => (
                      <div
                        key={`hora-${linha}`}
                        className="absolute left-0 right-0 border-t border-gray-100"
                        style={{ top: linha * ROW_HEIGHT }}
                      />
                    ))}

                    {Array.from({ length: totalLinhas }).map((_, linha) => (
                      <div
                        key={linha}
                        onPointerDown={(e) => iniciarArraste(e, dia, linha)}
                        onPointerEnter={() => moverArraste(dia, linha)}
                        className="absolute left-0 right-0 hover:bg-[#0B4F98]/10 cursor-pointer transition-colors"
                        style={{ top: linha * ROW_HEIGHT, height: ROW_HEIGHT }}
                      />
                    ))}

                    {arrastandoAqui && (
                      <div
                        className="absolute left-0.5 right-0.5 bg-[#0B4F98]/25 border-2 border-dashed border-[#0B4F98] rounded-md pointer-events-none z-20 flex items-center justify-center overflow-hidden"
                        style={{
                          top: linhaMinArraste * ROW_HEIGHT,
                          height: (linhaMaxArraste - linhaMinArraste + 1) * ROW_HEIGHT,
                        }}
                      >
                        <span className="text-[9px] font-bold text-[#0B4F98] bg-white/90 rounded px-1 whitespace-nowrap shadow-sm">
                          {minutosParaHHMM(linhaParaMinutos(linhaMinArraste))}–{minutosParaHHMM(linhaParaMinutos(linhaMaxArraste + 1))}
                        </span>
                      </div>
                    )}

                    {blocos.map((b) => {
                      const inicioMin = hhmmParaMinutos(b.horaInicio);
                      const fimMin = hhmmParaMinutos(b.horaFim);

                      const top = ((inicioMin - HORA_GRADE_INICIO * 60) / passo) * ROW_HEIGHT;
                      const altura = ((fimMin - inicioMin) / passo) * ROW_HEIGHT;
                      const isSelecionado = blocoSelecionado === b.id;

                      return (
                        <div
                          key={b.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setBlocoSelecionado(isSelecionado ? null : b.id);
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          className={`absolute left-0.5 right-0.5 text-white rounded-md cursor-pointer transition-all overflow-visible ${
                            isSelecionado
                              ? 'bg-[#0B4F98] ring-2 ring-[#FD953A] ring-offset-1 z-40 shadow-md'
                              : 'bg-[#0B4F98] z-30 hover:bg-[#093e77] shadow-sm'
                          }`}
                          style={{ top, height: Math.max(altura, 3) }}
                        >
                          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-[10px] font-extrabold tracking-tight text-center px-1 leading-tight pointer-events-none whitespace-nowrap">
                            {b.horaInicio}–{b.horaFim}
                          </span>

                          {isSelecionado && (
                            <div
                              className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 p-2 flex items-center gap-2.5 z-50 whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => replicarParaDia(b, -1)}
                                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[#FD953A] hover:bg-slate-700 transition-colors"
                                title="Copiar para dia anterior"
                              >
                                <IconArrowLeft />
                              </button>

                              <div className="flex flex-col gap-1 items-center bg-slate-800 rounded-lg p-1.5">
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase leading-none tracking-widest">Início</span>
                                <div className="flex gap-1.5">
                                  <button onClick={() => alterarTamanhoBloco(b, 'inicio', 'aumentar')} className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-sky-700 text-white rounded"><IconChevronUp /></button>
                                  <button onClick={() => alterarTamanhoBloco(b, 'inicio', 'diminuir')} className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-sky-700 text-white rounded"><IconChevronDown /></button>
                                </div>
                              </div>

                              <div className="flex flex-col gap-1 items-center bg-slate-800 rounded-lg p-1.5">
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase leading-none tracking-widest">Fim</span>
                                <div className="flex gap-1.5">
                                  <button onClick={() => alterarTamanhoBloco(b, 'fim', 'diminuir')} className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-sky-700 text-white rounded"><IconChevronUp /></button>
                                  <button onClick={() => alterarTamanhoBloco(b, 'fim', 'aumentar')} className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-sky-700 text-white rounded"><IconChevronDown /></button>
                                </div>
                              </div>

                              <button
                                onClick={() => replicarParaDia(b, 1)}
                                className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[#FD953A] hover:bg-slate-700 transition-colors"
                                title="Copiar para próximo dia"
                              >
                                <IconArrowRight />
                              </button>

                              <span className="w-px h-8 bg-slate-700 mx-0.5" />

                              <button
                                onClick={() => handleRemover(b.id)}
                                className="px-3 h-8 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                                title="Apagar este horário"
                              >
                                <IconTrash />
                                <span>Apagar</span>
                              </button>
                            </div>
                          )}
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