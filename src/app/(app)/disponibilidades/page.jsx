'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/app/actions/auth.actions';
import { listarServicosPorPrestador } from '@/app/actions/servicos.actions';
import {
  listarDisponibilidades,
  criarDisponibilidade,
  atualizarDisponibilidade,
  deletarDisponibilidade,
} from '@/app/actions/disponibilidades.actions';
import Skeleton from '@/app/components/ui/Skeleton';
import ConfirmDialog from '@/app/components/ui/ConfirmDialog';
import DiaDisponibilidadeCard from '@/app/components/features/disponibilidades/DiaDisponibilidadeCard';
import { useToast } from '@/app/components/ui/ToastProvider';
import { ArrowLeft, Briefcase } from 'lucide-react';
import PageContainer from '@/app/components/ui/PageContainer';
import { Card } from '@/app/components/ui/card';
import EmptyState from '@/app/components/ui/EmptyState';

const DIAS = [
  { valor: 0, nome: 'Domingo' },
  { valor: 1, nome: 'Segunda-feira' },
  { valor: 2, nome: 'Terça-feira' },
  { valor: 3, nome: 'Quarta-feira' },
  { valor: 4, nome: 'Quinta-feira' },
  { valor: 5, nome: 'Sexta-feira' },
  { valor: 6, nome: 'Sábado' },
];

function normalizarBloco(b) {
  const cortar = (v) => (typeof v === 'string' ? v.slice(0, 5) : v);
  return { ...b, horaInicio: cortar(b.horaInicio), horaFim: cortar(b.horaFim) };
}

function hhmmParaMinutos(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutosParaHHMM(min) {
  const m = Math.max(0, Math.min(1439, min));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function haConflito(ranges, inicio, fim) {
  return ranges.some((r) => inicio < r.horaFim && fim > r.horaInicio);
}

export default function DisponibilidadePage() {
  const toast = useToast();
  const router = useRouter();
  const [prestadorId, setPrestadorId] = useState(null);
  const [disponibilidades, setDisponibilidades] = useState([]);

  const [servicos, setServicos] = useState([]);
  const [servicoSelecionadoId, setServicoSelecionadoId] = useState(null);
  const [carregandoServicos, setCarregandoServicos] = useState(true);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [diasProcessando, setDiasProcessando] = useState(() => new Set());
  const [errosPorDia, setErrosPorDia] = useState({});
  const [confirmacao, setConfirmacao] = useState(null); // { tipo: 'dia' | 'horario', dia, range?, ranges? }

  const disponibilidadesRef = useRef(disponibilidades);
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

  const blocosPorDia = useMemo(() => {
    const grupos = {};
    for (const d of DIAS) grupos[d.valor] = [];
    for (const d of disponibilidades) {
      const dia = Number(d.diaSemana);
      if (grupos[dia]) grupos[dia].push(d);
    }
    Object.values(grupos).forEach((lista) =>
      lista.sort((a, b) => hhmmParaMinutos(a.horaInicio) - hhmmParaMinutos(b.horaInicio))
    );
    return grupos;
  }, [disponibilidades]);

  async function resolverPrestadorId() {
    if (prestadorId != null) return prestadorId;
    const usuario = await getSession();
    return usuario?.id ?? null;
  }

  function marcarProcessando(diaValor, ativo) {
    setDiasProcessando((prev) => {
      const novo = new Set(prev);
      if (ativo) novo.add(diaValor);
      else novo.delete(diaValor);
      return novo;
    });
  }

  function definirErroDia(diaValor, mensagem) {
    setErrosPorDia((prev) => ({ ...prev, [diaValor]: mensagem }));
    if (mensagem) {
      setTimeout(() => {
        setErrosPorDia((prev) => (prev[diaValor] === mensagem ? { ...prev, [diaValor]: null } : prev));
      }, 5000);
    }
  }

  async function onAdicionarHorario(dia) {
    if (servicoSelecionadoId == null) return;
    const idPrestador = await resolverPrestadorId();
    if (idPrestador == null) return;

    const rangesDia = blocosPorDia[dia.valor] || [];
    let inicio = '09:00';
    let fim = '18:00';

    if (rangesDia.length > 0) {
      const ultimo = rangesDia[rangesDia.length - 1];
      const inicioMin = hhmmParaMinutos(ultimo.horaFim);
      if (inicioMin >= 1380) {
        definirErroDia(dia.valor, 'Não há mais espaço livre neste dia para adicionar outro horário.');
        return;
      }
      inicio = minutosParaHHMM(inicioMin);
      fim = minutosParaHHMM(Math.min(inicioMin + 60, 1439));
    }

    // Otimista: insere o intervalo já na UI (o Switch/linha aparecem e animam na hora)
    // e desfaz se o servidor recusar — evita que a animação só aconteça depois do round-trip.
    const idTemporario = `tmp-${Date.now()}`;
    const otimista = { id: idTemporario, diaSemana: dia.valor, servicoId: servicoSelecionadoId, horaInicio: inicio, horaFim: fim };

    marcarProcessando(dia.valor, true);
    setDisponibilidades((prev) => [...prev, otimista]);
    try {
      const resultado = await criarDisponibilidade(idPrestador, {
        diaSemana: dia.valor,
        horaInicio: inicio,
        horaFim: fim,
        servicoId: servicoSelecionadoId,
      });
      if (resultado?.erro) {
        setDisponibilidades((prev) => prev.filter((d) => d.id !== idTemporario));
        definirErroDia(dia.valor, resultado.erro);
        return;
      }
      setDisponibilidades((prev) => prev.map((d) => (d.id === idTemporario ? normalizarBloco(resultado) : d)));
      toast.success('Horário adicionado.');
    } catch {
      setDisponibilidades((prev) => prev.filter((d) => d.id !== idTemporario));
      definirErroDia(dia.valor, 'Erro ao adicionar horário.');
    } finally {
      marcarProcessando(dia.valor, false);
    }
  }

  function onToggleDia(dia, novoEstado) {
    if (novoEstado) {
      onAdicionarHorario(dia);
      return;
    }
    const rangesDia = blocosPorDia[dia.valor] || [];
    if (rangesDia.length === 0) return;
    setConfirmacao({ tipo: 'dia', dia, ranges: rangesDia });
  }

  function onPedirRemoverHorario(dia, range) {
    setConfirmacao({ tipo: 'horario', dia, range });
  }

  async function onAlterarHorario(dia, range, campo, novoValor) {
    if (!novoValor) return;
    const novoRange = { ...range, [campo]: novoValor };

    if (novoRange.horaInicio >= novoRange.horaFim) {
      definirErroDia(dia.valor, 'O horário de início precisa ser antes do horário de fim.');
      return;
    }

    const outrosRangesDia = (blocosPorDia[dia.valor] || []).filter((r) => r.id !== range.id);
    if (haConflito(outrosRangesDia, novoRange.horaInicio, novoRange.horaFim)) {
      definirErroDia(dia.valor, 'Esse horário conflita com outro já cadastrado neste dia.');
      return;
    }

    const idPrestador = await resolverPrestadorId();
    if (idPrestador == null) return;

    const anterior = disponibilidadesRef.current;
    setDisponibilidades((prev) => prev.map((d) => (d.id === range.id ? { ...d, [campo]: novoValor } : d)));

    marcarProcessando(dia.valor, true);
    try {
      const resultado = await atualizarDisponibilidade(idPrestador, range.id, {
        horaInicio: novoRange.horaInicio,
        horaFim: novoRange.horaFim,
      });
      if (resultado?.erro) {
        setDisponibilidades(anterior);
        definirErroDia(dia.valor, resultado.erro);
        return;
      }
      setDisponibilidades((prev) => prev.map((d) => (d.id === range.id ? normalizarBloco(resultado) : d)));
    } catch {
      setDisponibilidades(anterior);
      definirErroDia(dia.valor, 'Erro ao atualizar horário.');
    } finally {
      marcarProcessando(dia.valor, false);
    }
  }

  async function confirmarAcao() {
    if (!confirmacao) return;
    const { tipo, dia } = confirmacao;
    const idPrestador = await resolverPrestadorId();
    if (idPrestador == null) return;

    const ids = tipo === 'horario' ? [confirmacao.range.id] : confirmacao.ranges.map((r) => r.id);
    const mensagemSucesso = tipo === 'horario' ? 'Horário removido.' : `Horários de ${dia.nome} removidos.`;

    // Otimista: some da tela (e o Switch já anima pra desligado) assim que o usuário
    // confirma, em vez de só depois do round-trip — restaura se o servidor recusar.
    const removidos = disponibilidadesRef.current.filter((d) => ids.includes(d.id));

    marcarProcessando(dia.valor, true);
    setDisponibilidades((prev) => prev.filter((d) => !ids.includes(d.id)));
    try {
      await Promise.all(ids.map((id) => deletarDisponibilidade(idPrestador, id)));
      toast.success(mensagemSucesso);
    } catch {
      setDisponibilidades((prev) => [...prev, ...removidos]);
      definirErroDia(dia.valor, 'Erro ao remover horário.');
    } finally {
      marcarProcessando(dia.valor, false);
    }
  }

  if (carregandoServicos) return (
    <PageContainer size="lg" className="py-8">
      <Skeleton className="h-9 w-64 mb-2" />
      <Skeleton className="h-4 w-80 mb-6" />
      <Skeleton className="h-16 rounded-2xl mb-4" />
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-2xl mb-3" />
      ))}
    </PageContainer>
  );

  // Prestador sem nenhum serviço cadastrado ainda
  if (servicos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card padding="default" className="p-10 max-w-sm">
          <EmptyState
            icon={Briefcase}
            title="Nenhum serviço cadastrado"
            description="Cadastre um serviço primeiro para poder configurar a disponibilidade dele."
          />
        </Card>
      </div>
    );
  }

  const agora = new Date();
  const diaAtual = agora.getDay();

  const descricaoConfirmacao = confirmacao
    ? confirmacao.tipo === 'horario'
      ? `Remover o horário de ${confirmacao.range.horaInicio} às ${confirmacao.range.horaFim} em ${confirmacao.dia.nome}?`
      : `Isso vai remover ${confirmacao.ranges.length} horário${confirmacao.ranges.length > 1 ? 's' : ''} cadastrado${confirmacao.ranges.length > 1 ? 's' : ''} para ${confirmacao.dia.nome}.`
    : '';

  return (
    <PageContainer size="lg" className="py-8">

      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 h-9 -ml-2 px-2 rounded-full text-body-sm text-primary font-semibold mb-3 hover:bg-muted transition-colors duration-fast cursor-pointer"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar
        </button>
        <h1 className="text-h4 font-extrabold text-foreground">Minha disponibilidade</h1>
        <p className="text-body-sm text-muted-foreground mt-1.5">
          Ative os dias em que você atende e defina os horários de cada um.
        </p>
      </div>

      {erro && (
        <div role="alert" className="mb-4 bg-destructive/10 border border-destructive/30 text-destructive text-body-sm font-semibold rounded-xl px-4 py-3 shadow-soft">{erro}</div>
      )}

      {/* Seletor de serviço — cada serviço tem sua própria agenda */}
      <Card padding="sm" className="mb-5">
        <label className="text-caption font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
          <Briefcase width={13} height={13} aria-hidden="true" /> Serviço
        </label>
        <div className="flex gap-2 flex-wrap">
          {servicos.map((s) => {
            const ativo = s.id === servicoSelecionadoId;
            return (
              <button
                key={s.id}
                onClick={() => setServicoSelecionadoId(s.id)}
                aria-pressed={ativo}
                className={`px-4 h-10 rounded-full text-body-sm font-bold transition-all duration-fast border-2 cursor-pointer ${
                  ativo
                    ? 'bg-primary border-primary text-primary-foreground shadow-soft'
                    : 'bg-background border-transparent text-foreground hover:border-primary/30'
                }`}
              >
                {s.nome}
              </button>
            );
          })}
        </div>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {DIAS.map((dia) => (
            <DiaDisponibilidadeCard
              key={dia.valor}
              dia={dia}
              ehHoje={dia.valor === diaAtual}
              ranges={blocosPorDia[dia.valor] || []}
              processando={diasProcessando.has(dia.valor)}
              erro={errosPorDia[dia.valor] || null}
              onToggleDia={onToggleDia}
              onAdicionarHorario={onAdicionarHorario}
              onAlterarHorario={onAlterarHorario}
              onPedirRemoverHorario={onPedirRemoverHorario}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmacao}
        onOpenChange={(v) => { if (!v) setConfirmacao(null); }}
        title={confirmacao?.tipo === 'horario' ? 'Remover horário?' : 'Desativar este dia?'}
        description={descricaoConfirmacao}
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={confirmarAcao}
      />
    </PageContainer>
  );
}
