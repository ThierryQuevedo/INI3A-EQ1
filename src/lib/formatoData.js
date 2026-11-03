// Data e hora "do jeito que a gente fala" (C-01 / F-01 / G-09), sempre no
// fuso de Brasília. O fuso é FIXO de propósito: o servidor de produção pode
// rodar em UTC e o navegador do cliente pode estar em outro fuso; se cada um
// usasse o seu, o card prometeria "Hoje, 14h" e a tela de agendar mostraria
// outro horário (e o React acusaria diferença na hidratação).
//
// Dois tipos de valor circulam no app:
//   - "chave de dia": string 'AAAA-MM-DD' (um dia do calendário em Brasília);
//   - "hora": string 'HH:MM' (relógio de parede em Brasília).
// Instantes (Date / ISO) só aparecem na fronteira com o banco.

export const FUSO = 'America/Sao_Paulo';

// Brasília não tem horário de verão desde 2019: UTC-3 o ano inteiro.
const DESLOCAMENTO = '-03:00';

const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DIAS_LONGOS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_LONGOS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const formatadorPartes = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const REGEX_DIA = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

/** true para 'AAAA-MM-DD' de um dia que existe no calendário. */
export function ehChaveDiaValida(valor) {
  if (typeof valor !== 'string' || !REGEX_DIA.test(valor)) return false;
  const [a, m, d] = valor.split('-').map(Number);
  const data = new Date(Date.UTC(a, m - 1, d));
  return data.getUTCFullYear() === a && data.getUTCMonth() === m - 1 && data.getUTCDate() === d;
}

/** true para 'HH:MM' entre 00:00 e 23:59. */
export function ehHoraValida(valor) {
  return typeof valor === 'string' && REGEX_HORA.test(valor);
}

/** Dia ('AAAA-MM-DD') e hora ('HH:MM') de um instante, no fuso de Brasília. */
export function partesNoFuso(instante = new Date()) {
  const data = instante instanceof Date ? instante : new Date(instante);
  const partes = {};
  for (const { type, value } of formatadorPartes.formatToParts(data)) partes[type] = value;
  return {
    dia: `${partes.year}-${partes.month}-${partes.day}`,
    hora: `${partes.hour}:${partes.minute}`,
  };
}

/** Chave do dia de hoje em Brasília. */
export function hojeNoFuso() {
  return partesNoFuso(new Date()).dia;
}

/** Soma (ou subtrai) dias de uma chave de dia. */
export function somarDias(diaChave, quantidade) {
  const [a, m, d] = diaChave.split('-').map(Number);
  const data = new Date(Date.UTC(a, m - 1, d + quantidade));
  return data.toISOString().slice(0, 10);
}

/** 0 = domingo … 6 = sábado (mesma convenção de disponibilidades.diaSemana). */
export function diaDaSemana(diaChave) {
  const [a, m, d] = diaChave.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}

/** Instante (Date) correspondente a um dia + hora de Brasília. */
export function instanteNoFuso(diaChave, hora) {
  return new Date(`${diaChave}T${hora}:00${DESLOCAMENTO}`);
}

/** 'HH:MM' → minutos desde 00:00. */
export function minutosDaHora(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/** Chave de dia a partir de ano, mês (0–11) e dia — usado pelo calendário do mês. */
export function chaveDeDia(ano, mes, dia) {
  return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

/** { ano, mes (0–11), dia } de uma chave de dia. */
export function partesDaChave(diaChave) {
  const [a, m, d] = diaChave.split('-').map(Number);
  return { ano: a, mes: m - 1, dia: d };
}

function normalizarHora(horaOuInstante) {
  if (typeof horaOuInstante === 'string' && ehHoraValida(horaOuInstante)) return horaOuInstante;
  return partesNoFuso(horaOuInstante).hora;
}

/** "14h30", "9h". Aceita 'HH:MM' ou um instante. */
export function formatarHora(horaOuInstante) {
  const [h, m] = normalizarHora(horaOuInstante).split(':').map(Number);
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

/** "14 horas e 30 minutos": para aria-label (leitores de tela leem "14h30" de forma irregular). */
export function formatarHoraFalada(horaOuInstante) {
  const [h, m] = normalizarHora(horaOuInstante).split(':').map(Number);
  const horas = `${h} ${h === 1 ? 'hora' : 'horas'}`;
  if (m === 0) return horas;
  return `${horas} e ${m} ${m === 1 ? 'minuto' : 'minutos'}`;
}

/** 'Hoje', 'Amanhã' ou null. */
export function diaRelativo(diaChave) {
  const hoje = hojeNoFuso();
  if (diaChave === hoje) return 'Hoje';
  if (diaChave === somarDias(hoje, 1)) return 'Amanhã';
  return null;
}

/** "Hoje", "Amanhã" ou "Sex, 30 de out". */
export function formatarDiaCurto(diaChave) {
  const relativo = diaRelativo(diaChave);
  if (relativo) return relativo;
  const { mes, dia } = partesDaChave(diaChave);
  return `${DIAS_CURTOS[diaDaSemana(diaChave)]}, ${dia} de ${MESES_CURTOS[mes]}`;
}

/** "Sexta, 30 de outubro"; com `relativo`, "Hoje, sexta, 30 de outubro". */
export function formatarDiaExtenso(diaChave, { relativo = false } = {}) {
  const { mes, dia } = partesDaChave(diaChave);
  const nomeDia = DIAS_LONGOS[diaDaSemana(diaChave)];
  const texto = `${nomeDia}, ${dia} de ${MESES_LONGOS[mes]}`;
  const rel = relativo ? diaRelativo(diaChave) : null;
  return rel ? `${rel}, ${texto.charAt(0).toLowerCase()}${texto.slice(1)}` : texto;
}

/** Abreviação do dia da semana ("Sex") — para a faixa de dias. */
export function nomeDiaCurto(diaChave) {
  return DIAS_CURTOS[diaDaSemana(diaChave)];
}

/** Nome do mês por extenso ("outubro") a partir do índice 0–11. */
export function nomeMes(mes) {
  return MESES_LONGOS[mes];
}

/** "Hoje, 14h30" / "Sex, 30 de out, 9h" a partir de um instante (ISO ou Date). */
export function formatarQuando(instante) {
  const { dia, hora } = partesNoFuso(instante);
  return `${formatarDiaCurto(dia)}, ${formatarHora(hora)}`;
}

/** "hoje às 14 horas e 30 minutos" — versão falada de formatarQuando. */
export function formatarQuandoFalado(instante) {
  const { dia, hora } = partesNoFuso(instante);
  const rel = diaRelativo(dia);
  const quando = rel ? rel.toLowerCase() : formatarDiaExtenso(dia).toLowerCase();
  return `${quando} às ${formatarHoraFalada(hora)}`;
}

/** "1 vaga", "9 vagas", "Sem vagas". */
export function rotuloVagas(quantidade) {
  if (!quantidade) return 'Sem vagas';
  return `${quantidade} ${quantidade === 1 ? 'vaga' : 'vagas'}`;
}
