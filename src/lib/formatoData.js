// datas no fuso fixo de brasilia
// chave de dia aaaa mm dd e hora hh mm

export const FUSO = 'America/Sao_Paulo';

// brasilia e utc menos 3 o ano todo
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

// dia valido
export function ehChaveDiaValida(valor) {
  if (typeof valor !== 'string' || !REGEX_DIA.test(valor)) return false;
  const [a, m, d] = valor.split('-').map(Number);
  const data = new Date(Date.UTC(a, m - 1, d));
  return data.getUTCFullYear() === a && data.getUTCMonth() === m - 1 && data.getUTCDate() === d;
}

// hora valida
export function ehHoraValida(valor) {
  return typeof valor === 'string' && REGEX_HORA.test(valor);
}

// dia e hora em brasilia
export function partesNoFuso(instante = new Date()) {
  const data = instante instanceof Date ? instante : new Date(instante);
  const partes = {};
  for (const { type, value } of formatadorPartes.formatToParts(data)) partes[type] = value;
  return {
    dia: `${partes.year}-${partes.month}-${partes.day}`,
    hora: `${partes.hour}:${partes.minute}`,
  };
}

// hoje em brasilia
export function hojeNoFuso() {
  return partesNoFuso(new Date()).dia;
}

// soma dias
export function somarDias(diaChave, quantidade) {
  const [a, m, d] = diaChave.split('-').map(Number);
  const data = new Date(Date.UTC(a, m - 1, d + quantidade));
  return data.toISOString().slice(0, 10);
}

// 0 domingo a 6 sabado
export function diaDaSemana(diaChave) {
  const [a, m, d] = diaChave.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}

// instante de dia e hora de brasilia
export function instanteNoFuso(diaChave, hora) {
  return new Date(`${diaChave}T${hora}:00${DESLOCAMENTO}`);
}

// hora em minutos
export function minutosDaHora(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

// chave a partir de ano mes e dia
export function chaveDeDia(ano, mes, dia) {
  return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

// ano mes e dia da chave
export function partesDaChave(diaChave) {
  const [a, m, d] = diaChave.split('-').map(Number);
  return { ano: a, mes: m - 1, dia: d };
}

function normalizarHora(horaOuInstante) {
  if (typeof horaOuInstante === 'string' && ehHoraValida(horaOuInstante)) return horaOuInstante;
  return partesNoFuso(horaOuInstante).hora;
}

// hora curta
export function formatarHora(horaOuInstante) {
  const [h, m] = normalizarHora(horaOuInstante).split(':').map(Number);
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

// hora falada para leitor de tela
export function formatarHoraFalada(horaOuInstante) {
  const [h, m] = normalizarHora(horaOuInstante).split(':').map(Number);
  const horas = `${h} ${h === 1 ? 'hora' : 'horas'}`;
  if (m === 0) return horas;
  return `${horas} e ${m} ${m === 1 ? 'minuto' : 'minutos'}`;
}

// hoje amanha ou null
export function diaRelativo(diaChave) {
  const hoje = hojeNoFuso();
  if (diaChave === hoje) return 'Hoje';
  if (diaChave === somarDias(hoje, 1)) return 'Amanhã';
  return null;
}

// dia curto
export function formatarDiaCurto(diaChave) {
  const relativo = diaRelativo(diaChave);
  if (relativo) return relativo;
  const { mes, dia } = partesDaChave(diaChave);
  return `${DIAS_CURTOS[diaDaSemana(diaChave)]}, ${dia} de ${MESES_CURTOS[mes]}`;
}

// dia por extenso
export function formatarDiaExtenso(diaChave, { relativo = false } = {}) {
  const { mes, dia } = partesDaChave(diaChave);
  const nomeDia = DIAS_LONGOS[diaDaSemana(diaChave)];
  const texto = `${nomeDia}, ${dia} de ${MESES_LONGOS[mes]}`;
  const rel = relativo ? diaRelativo(diaChave) : null;
  return rel ? `${rel}, ${texto.charAt(0).toLowerCase()}${texto.slice(1)}` : texto;
}

// dia da semana abreviado
export function nomeDiaCurto(diaChave) {
  return DIAS_CURTOS[diaDaSemana(diaChave)];
}

// nome do mes
export function nomeMes(mes) {
  return MESES_LONGOS[mes];
}

// quando curto
export function formatarQuando(instante) {
  const { dia, hora } = partesNoFuso(instante);
  return `${formatarDiaCurto(dia)}, ${formatarHora(hora)}`;
}

// quando falado
export function formatarQuandoFalado(instante) {
  const { dia, hora } = partesNoFuso(instante);
  const rel = diaRelativo(dia);
  const quando = rel ? rel.toLowerCase() : formatarDiaExtenso(dia).toLowerCase();
  return `${quando} às ${formatarHoraFalada(hora)}`;
}

// texto de vagas
export function rotuloVagas(quantidade) {
  if (!quantidade) return 'Sem vagas';
  return `${quantidade} ${quantidade === 1 ? 'vaga' : 'vagas'}`;
}
