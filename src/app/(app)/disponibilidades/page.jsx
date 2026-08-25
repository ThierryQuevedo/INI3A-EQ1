'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/app/actions/auth.actions';
import { listarServicosPorPrestador } from '@/app/actions/servicos.actions';
import { listarDisponibilidades, criarDisponibilidade, deletarDisponibilidade } from '@/app/actions/disponibilidades.actions';

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
const IconBriefcase = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
);

export default function DisponibilidadePage() {
  const router = useRouter();
  const [prestadorId, setPrestadorId] = useState(null);
  const [disponibilidades, setDisponibilidades] = useState([]);

  const [servicos, setServicos] = useState([]);
  const [servicoSelecionadoId, setServicoSelecionadoId] = useState(null);
  const [carregandoServicos, setCarregandoServicos] = useState(true);

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

  const gridRefs = useRef({});

  useEffect(() => {
    disponibilidadesRef.current = disponibilidades;
  }, [disponibilidades]);

  // Carrega o prestador logado e a lista de serviços dele
  useEffect(() => {
    let montado = true;
    async function inicializar() {
      try {
        const usuario = await getSession();
        if (!usuario) {
          if (montado) router.push('/login');
          return;
        }

        if (montado) setPrestadorId(usuario.id);

        const listaServicos = await listarServicosPorPrestador(usuario.id);
        if (montado) {
          const lista = Array.isArray(listaServicos) ? listaServicos : [];
          setServicos(lista);
          if (lista.length > 0) {
            setServicoSelecionadoId(lista[0].id);
          } else {
            setLoading(false);
          }
        }
      } catch {
        if (montado) setErro('Erro ao carregar seus serviços.');
      } finally {
        if (montado) setCarregandoServicos(false);
      }
    }
    inicializar();
    return () => { montado = false; };
  }, [router]);

  // Sempre que o serviço selecionado mudar, recarrega a agenda daquele serviço
  useEffect(() => {
    if (prestadorId == null || servicoSelecionadoId == null) return;
    let montado = true;

    async function carregarDisponibilidades() {
      setLoading(true);
      setBlocoSelecionado(null);
      try {
        const dados = await listarDisponibilidades(prestadorId, servicoSelecionadoId);
        if (montado) {
          setDisponibilidades(Array.isArray(dados) ? dados.map(normalizarBloco) : []);
        }
      } catch {
        if (montado) setErro('Erro ao carregar disponibilidades.');
      } finally {
        if (montado) setLoading(false);
      }
    }

    carregarDisponibilidades();
    return () => { montado = false; };
  }, [prestadorId, servicoSelecionadoId]);

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
    const usuario = await getSession();
    return usuario?.id ?? null;
  }

  async function criarBlocoBackend(diaSemana, horaInicio, horaFim) {
    const idParaEnvio = await resolverPrestadorId();
    if (idParaEnvio == null) throw new Error('Prestador ID inválido.');
    if (servicoSelecionadoId == null) throw new Error('Selecione um serviço primeiro.');

    const resultado = await criarDisponibilidade(idParaEnvio, {
      diaSemana: Number(diaSemana),
      horaInicio,
      horaFim,
      servicoId: servicoSelecionadoId,
    });

    if (resultado?.erro) throw new Error(resultado.erro);
    return normalizarBloco(resultado);
  }

  async function removerBlocoBackend(id) {
    const idParaEnvio = await resolverPrestadorId();
    if (idParaEnvio == null) return;
    await deletarDisponibilidade(idParaEnvio, id);
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
  }, [prestadorId, passo, servicoSelecionadoId]);

  useEffect(() => {
    function aoSoltar() {
      if (arrasteRef.current) {
        confirmarArraste(arrasteRef.current);
      }
      arrastandoAgora.current = false;
    }
    window.addEventListener('pointerup', aoSoltar);
    window.addEventListener('pointercancel', aoSoltar);
    return () => {
      window.removeEventListener('pointerup', aoSoltar);
      window.removeEventListener('pointercancel', aoSoltar);
    };
  }, [confirmarArraste]);

  function iniciarArraste(e, dia, linha) {
    if (processando || servicoSelecionadoId == null) return;
    e.preventDefault();

    if (e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }

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
      const atualizado = { ...prev, atualLinha: linha };
      arrasteRef.current = atualizado;
      return atualizado;
    });
  }

  function handlePointerMoveNaColuna(e, dia) {
    if (!arrastandoAgora.current) return;
    const el = gridRefs.current[dia];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const y = e.clientY - rect.top;
    let linha = Math.floor(y / ROW_HEIGHT);
    if (linha < 0) linha = 0;
    if (linha >= totalLinhas) linha = totalLinhas - 1;
    moverArraste(dia, linha);
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

  if (carregandoServicos) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-tcc-azul-dark border-t-transparent animate-spin" role="status" aria-label="Carregando" />
        <span className="text-tcc-azul-dark font-semibold text-body-sm">Carregando seus serviços...</span>
      </div>
    </div>
  );

  // Prestador sem nenhum serviço cadastrado ainda
  if (servicos.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-2xl p-10 flex flex-col items-center gap-4 shadow-soft text-center max-w-sm">
          <div className="w-16 h-16 bg-tcc-azul-dark/10 rounded-full flex items-center justify-center text-tcc-azul-dark">
            <IconBriefcase width={28} height={28} aria-hidden="true" />
          </div>
          <h2 className="text-h6 font-bold text-foreground">Nenhum serviço cadastrado</h2>
          <p className="text-body-sm text-muted-foreground">Cadastre um serviço primeiro para poder configurar a disponibilidade dele.</p>
        </div>
      </div>
    );
  }

  const linhasHora = [];
  for (let l = 0; l <= totalLinhas; l += linhasPorHora) {
    const min = linhaParaMinutos(l);
    let label = minutosParaHHMM(min);
    if (l === totalLinhas && min === 1440) label = '23:59';
    linhasHora.push({ linha: l, label });
  }

  return (
    <div
      className="min-h-screen bg-background py-8 px-4 font-sans"
      onClick={() => setBlocoSelecionado(null)}
    >
      <div className="max-w-6xl mx-auto">

        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 h-9 -ml-2 px-2 rounded-full text-body-sm text-tcc-azul-dark font-semibold mb-3 hover:bg-muted transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar
          </button>
          <h1 className="text-h4 font-extrabold text-foreground">Minha disponibilidade</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Arraste na grade para criar blocos contínuos. Clique no bloco para abrir o menu de exclusão e edição.
          </p>
        </div>

        {erro && (
          <div role="alert" className="mb-4 bg-destructive/10 border border-destructive/30 text-destructive text-body-sm font-semibold rounded-xl px-4 py-3 shadow-soft">{erro}</div>
        )}

        {/* Seletor de serviço — cada serviço tem sua própria agenda */}
        <div className="bg-card rounded-2xl p-4 shadow-soft mb-4" onClick={(e) => e.stopPropagation()}>
          <label className="text-caption font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
            <IconBriefcase width={13} height={13} aria-hidden="true" /> Serviço
          </label>
          <div className="flex gap-2 flex-wrap">
            {servicos.map((s) => {
              const ativo = s.id === servicoSelecionadoId;
              return (
                <button
                  key={s.id}
                  onClick={() => setServicoSelecionadoId(s.id)}
                  aria-pressed={ativo}
                  className={`px-4 h-10 rounded-full text-body-sm font-bold transition-all duration-200 border-2 cursor-pointer ${
                    ativo
                      ? 'bg-tcc-azul-dark border-tcc-azul-dark text-white shadow-soft'
                      : 'bg-background border-transparent text-foreground hover:border-tcc-azul-dark/30'
                  }`}
                >
                  {s.nome}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-soft mb-4 flex items-center gap-4 flex-wrap" onClick={(e) => e.stopPropagation()}>
          <label htmlFor="passo-incremento" className="text-caption font-semibold text-muted-foreground">Duração do incremento</label>
          <select
            id="passo-incremento"
            value={passoModo}
            onChange={(e) => setPassoModo(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-body-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {PASSOS_DISPONIVEIS.map((p) => (
              <option key={p} value={p}>{p} min</option>
            ))}
            <option value="custom">Customizado</option>
          </select>

          {passoModo === 'custom' && (
            <div className="flex items-center gap-2">
              <label htmlFor="passo-custom" className="sr-only-status">Minutos personalizados</label>
              <input
                id="passo-custom"
                type="number"
                min="5"
                max="240"
                value={passoCustom}
                onChange={(e) => setPassoCustom(e.target.value)}
                className="w-20 h-10 rounded-xl border border-input bg-background px-3 text-body-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="text-caption font-semibold text-muted-foreground">minutos</span>
            </div>
          )}
        </div>

        <div className={`bg-card rounded-2xl p-3 shadow-soft overflow-x-auto touch-none select-none relative ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <div className="w-8 h-8 rounded-full border-4 border-tcc-azul-dark border-t-transparent animate-spin" role="status" aria-label="Carregando" />
            </div>
          )}
          <div className="flex min-w-[850px]">

            <div className="w-14 flex-shrink-0 relative pt-6" style={{ height: totalLinhas * ROW_HEIGHT + 24 }}>
              {linhasHora.map(({ linha, label }) => (
                <div
                  key={linha}
                  className="absolute right-2 text-[11px] text-muted-foreground font-medium -translate-y-1/2"
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
                <div key={dia} className="flex-1 min-w-[110px] border-l border-border relative">
                  <div className="text-center text-caption font-semibold text-muted-foreground py-1.5 border-b border-border sticky top-0 bg-card z-10">
                    {nome}
                  </div>
                  <div
                    ref={(el) => { gridRefs.current[dia] = el; }}
                    className="relative"
                    style={{ height: totalLinhas * ROW_HEIGHT }}
                    onPointerMove={(e) => handlePointerMoveNaColuna(e, dia)}
                  >

                    {linhasHora.map(({ linha }) => (
                      <div
                        key={`hora-${linha}`}
                        className="absolute left-0 right-0 border-t border-border"
                        style={{ top: linha * ROW_HEIGHT }}
                      />
                    ))}

                    {Array.from({ length: totalLinhas }).map((_, linha) => (
                      <div
                        key={linha}
                        onPointerDown={(e) => iniciarArraste(e, dia, linha)}
                        onPointerEnter={() => moverArraste(dia, linha)}
                        className="absolute left-0 right-0 hover:bg-tcc-azul-dark/10 cursor-pointer transition-colors duration-150"
                        style={{ top: linha * ROW_HEIGHT, height: ROW_HEIGHT, touchAction: 'none' }}
                      />
                    ))}

                    {arrastandoAqui && (
                      <div
                        className="absolute left-0.5 right-0.5 bg-tcc-azul-dark/25 border-2 border-dashed border-tcc-azul-dark rounded-md pointer-events-none z-20 flex items-center justify-center overflow-hidden"
                        style={{
                          top: linhaMinArraste * ROW_HEIGHT,
                          height: (linhaMaxArraste - linhaMinArraste + 1) * ROW_HEIGHT,
                        }}
                      >
                        <span className="text-[10px] font-bold text-tcc-azul-dark bg-white/90 rounded px-1 whitespace-nowrap shadow-soft">
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
                          role="button"
                          tabIndex={0}
                          aria-pressed={isSelecionado}
                          aria-label={`Bloco de ${b.horaInicio} às ${b.horaFim}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setBlocoSelecionado(isSelecionado ? null : b.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              setBlocoSelecionado(isSelecionado ? null : b.id);
                            }
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          className={`absolute left-0.5 right-0.5 text-white rounded-md cursor-pointer transition-all duration-150 overflow-visible ${
                            isSelecionado
                              ? 'bg-tcc-azul-dark ring-2 ring-tcc-laranja ring-offset-1 z-40 shadow-card'
                              : 'bg-tcc-azul-dark z-30 hover:bg-tcc-azul-darker shadow-soft'
                          }`}
                          style={{ top, height: Math.max(altura, 3) }}
                        >
                          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-[10px] font-extrabold tracking-tight text-center px-1 leading-tight pointer-events-none whitespace-nowrap">
                            {b.horaInicio}–{b.horaFim}
                          </span>

                          {isSelecionado && (
                            <div
                              className="absolute -top-16 left-1/2 -translate-x-1/2 bg-tcc-neutro-700 text-white rounded-xl shadow-elevated border border-tcc-neutro-600 p-2 flex items-center gap-2.5 z-50 whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => replicarParaDia(b, -1)}
                                aria-label="Copiar para dia anterior"
                                className="w-9 h-9 rounded-lg bg-tcc-neutro-600 flex items-center justify-center text-tcc-laranja hover:bg-tcc-neutro-500 transition-colors cursor-pointer"
                              >
                                <IconArrowLeft aria-hidden="true" />
                              </button>

                              <div className="flex flex-col gap-1 items-center bg-tcc-neutro-600 rounded-lg p-1.5">
                                <span className="text-[10px] font-extrabold text-tcc-neutro-300 uppercase leading-none tracking-widest">Início</span>
                                <div className="flex gap-1.5">
                                  <button onClick={() => alterarTamanhoBloco(b, 'inicio', 'aumentar')} aria-label="Antecipar início" className="w-7 h-7 flex items-center justify-center bg-tcc-neutro-500 hover:bg-tcc-azul-medium text-white rounded cursor-pointer"><IconChevronUp aria-hidden="true" /></button>
                                  <button onClick={() => alterarTamanhoBloco(b, 'inicio', 'diminuir')} aria-label="Atrasar início" className="w-7 h-7 flex items-center justify-center bg-tcc-neutro-500 hover:bg-tcc-azul-medium text-white rounded cursor-pointer"><IconChevronDown aria-hidden="true" /></button>
                                </div>
                              </div>

                              <div className="flex flex-col gap-1 items-center bg-tcc-neutro-600 rounded-lg p-1.5">
                                <span className="text-[10px] font-extrabold text-tcc-neutro-300 uppercase leading-none tracking-widest">Fim</span>
                                <div className="flex gap-1.5">
                                  <button onClick={() => alterarTamanhoBloco(b, 'fim', 'diminuir')} aria-label="Antecipar fim" className="w-7 h-7 flex items-center justify-center bg-tcc-neutro-500 hover:bg-tcc-azul-medium text-white rounded cursor-pointer"><IconChevronUp aria-hidden="true" /></button>
                                  <button onClick={() => alterarTamanhoBloco(b, 'fim', 'aumentar')} aria-label="Atrasar fim" className="w-7 h-7 flex items-center justify-center bg-tcc-neutro-500 hover:bg-tcc-azul-medium text-white rounded cursor-pointer"><IconChevronDown aria-hidden="true" /></button>
                                </div>
                              </div>

                              <button
                                onClick={() => replicarParaDia(b, 1)}
                                aria-label="Copiar para próximo dia"
                                className="w-9 h-9 rounded-lg bg-tcc-neutro-600 flex items-center justify-center text-tcc-laranja hover:bg-tcc-neutro-500 transition-colors cursor-pointer"
                              >
                                <IconArrowRight aria-hidden="true" />
                              </button>

                              <span className="w-px h-8 bg-tcc-neutro-600 mx-0.5" aria-hidden="true" />

                              <button
                                onClick={() => handleRemover(b.id)}
                                aria-label="Apagar este horário"
                                className="px-3 h-9 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive hover:text-white font-bold text-caption flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <IconTrash aria-hidden="true" />
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
