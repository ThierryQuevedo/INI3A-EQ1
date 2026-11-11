// Cálculo de horários livres. Roda igual no servidor (próximo horário dos
// cards) e no navegador (tela de agendar), porque tudo é feito no fuso de
// Brasília com chaves de dia 'AAAA-MM-DD' e horas 'HH:MM' — ver formatoData.js.
// Card e tela usam a MESMA função e o MESMO conjunto de agendamentos (todos os
// do prestador), para o card nunca prometer um horário que a tela não mostra.
import {
  ehChaveDiaValida,
  hojeNoFuso,
  partesNoFuso,
  somarDias,
  diaDaSemana,
  instanteNoFuso,
  minutosDaHora,
} from './formatoData.js';

export function gerarSlots(horaInicio, horaFim, duracaoMin) {
  const slots = [];
  const [hIni, mIni] = horaInicio.split(':').map(Number);
  const [hFim, mFim] = horaFim.split(':').map(Number);
  let atual = hIni * 60 + mIni;
  const fim = hFim * 60 + mFim;
  const passo = Number(duracaoMin) > 0 ? Number(duracaoMin) : 30;
  while (atual + passo <= fim) {
    const h = String(Math.floor(atual / 60)).padStart(2, '0');
    const m = String(atual % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
    atual += passo;
  }
  return slots;
}

/** true se o instante (ISO/Date) cai hoje, em Brasília. */
export function ehHoje(dataOuIso) {
  if (!dataOuIso) return false;
  const data = new Date(dataOuIso);
  if (Number.isNaN(data.getTime())) return false;
  return partesNoFuso(data).dia === hojeNoFuso();
}

/** Aceita chave 'AAAA-MM-DD' ou Date; devolve a chave do dia em Brasília. */
function paraChaveDia(dataOuChave) {
  if (typeof dataOuChave === 'string' && ehChaveDiaValida(dataOuChave)) return dataOuChave;
  return partesNoFuso(new Date(dataOuChave)).dia;
}

export function ehDataPassada(dataOuChave) {
  return paraChaveDia(dataOuChave) < hojeNoFuso();
}

export function agruparPorPeriodo(slots) {
  const grupos = { manha: [], tarde: [], noite: [] };
  for (const s of slots) {
    const hora = Number(s.split(':')[0]);
    if (hora < 12) grupos.manha.push(s);
    else if (hora < 18) grupos.tarde.push(s);
    else grupos.noite.push(s);
  }
  return grupos;
}

/**
 * Agendamentos ativos de um dia como intervalos [início, fim) em minutos.
 * Sem `duracao` no agendamento (dado antigo), conta só o minuto de início —
 * o mesmo critério da checagem de conflito no servidor.
 */
function intervalosOcupados(agendados, diaChave) {
  const intervalos = [];
  for (const ag of agendados) {
    if (ag.status === 'cancelado') continue;
    const { dia, hora } = partesNoFuso(new Date(ag.dataHora));
    if (dia !== diaChave) continue;
    const inicio = minutosDaHora(hora);
    const duracao = Number(ag.duracao) > 0 ? Number(ag.duracao) : 1;
    intervalos.push([inicio, inicio + duracao]);
  }
  return intervalos;
}

/**
 * Horários livres ('HH:MM', em ordem) de um dia, dado as disponibilidades
 * (blocos recorrentes por dia da semana) e os agendamentos do prestador.
 * `dia` é a chave 'AAAA-MM-DD'; `data` (Date) continua aceito por compatibilidade.
 * @param {{ dia?: string, data?: Date | string, duracaoEstimada: number | string,
 *   disponibilidades: Array<{ diaSemana: number, horaInicio: string, horaFim: string }>,
 *   agendados?: Array<{ dataHora: string | Date, status: string, duracao?: number }>,
 *   agora?: Date }} dados
 */
export function calcularSlotsLivresDoDia({ dia, data, duracaoEstimada, disponibilidades, agendados = [], agora = new Date() }) {
  const diaChave = paraChaveDia(dia ?? data);
  const { dia: hoje, hora: horaAgora } = partesNoFuso(agora);
  if (diaChave < hoje) return [];

  const semana = diaDaSemana(diaChave);
  const dispsDoDia = disponibilidades.filter((d) => Number(d.diaSemana) === semana);
  if (dispsDoDia.length === 0) return [];

  const todosSlots = [];
  for (const disp of dispsDoDia) {
    if (!disp.horaInicio || !disp.horaFim) continue;
    todosSlots.push(...gerarSlots(disp.horaInicio.slice(0, 5), disp.horaFim.slice(0, 5), duracaoEstimada));
  }

  const slotsUnicos = Array.from(new Set(todosSlots)).sort();
  const ocupados = intervalosOcupados(agendados, diaChave);
  const duracao = Number(duracaoEstimada) > 0 ? Number(duracaoEstimada) : 30;
  const minutosAgora = diaChave === hoje ? minutosDaHora(horaAgora) : -1;

  return slotsUnicos.filter((s) => {
    const inicio = minutosDaHora(s);
    if (inicio <= minutosAgora) return false;
    const fim = inicio + duracao;
    return !ocupados.some(([oIni, oFim]) => inicio < oFim && oIni < fim);
  });
}

/**
 * Vagas dos próximos `quantidade` dias a partir de `diaInicial`:
 * [{ dia: 'AAAA-MM-DD', slots: ['09:00', …] }].
 */
export function calcularVagasPorDia({ diaInicial = hojeNoFuso(), quantidade = 14, ...dados }) {
  const resultado = [];
  for (let i = 0; i < quantidade; i++) {
    const dia = somarDias(diaInicial, i);
    resultado.push({ dia, slots: calcularSlotsLivresDoDia({ dia, ...dados }) });
  }
  return resultado;
}

/**
 * Primeiro dia com vaga a partir de `apartirDe` (chave), varrendo até
 * `horizonteDias`. Devolve { dia, hora } ou null.
 */
export function primeiraVaga({ apartirDe = hojeNoFuso(), horizonteDias = 14, ...dados }) {
  for (let i = 0; i <= horizonteDias; i++) {
    const dia = somarDias(apartirDe, i);
    const livres = calcularSlotsLivresDoDia({ dia, ...dados });
    if (livres.length > 0) return { dia, hora: livres[0] };
  }
  return null;
}

/**
 * Primeiro horário livre como instante (Date), varrendo até `horizonteDias`.
 * Usado para o "próximo horário" das listagens (home, catálogo, perfil).
 */
export function proximoSlotLivre({ disponibilidades, agendados, duracaoEstimada, apartirDe = null, horizonteDias = 14 }) {
  const vaga = primeiraVaga({
    disponibilidades,
    agendados,
    duracaoEstimada,
    horizonteDias,
    ...(apartirDe ? { apartirDe: paraChaveDia(apartirDe) } : {}),
  });
  return vaga ? instanteNoFuso(vaga.dia, vaga.hora) : null;
}
