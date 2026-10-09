export function gerarSlots(horaInicio, horaFim, duracaoMin) {
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

export function ehHoje(dataOuIso) {
  if (!dataOuIso) return false;
  const d = new Date(dataOuIso);
  const hoje = new Date();
  return d.toDateString() === hoje.toDateString();
}

export function ehDataPassada(data) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return d < hoje;
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
 * Slots livres de um dia, dado as disponibilidades (blocos recorrentes por dia da semana)
 * e os agendamentos já existentes do prestador. Extraído de agendamentos/novo/page.jsx
 * para ser reusável também no servidor (cálculo em lote de "próximo horário livre").
 */
export function calcularSlotsLivresDoDia({ data, duracaoEstimada, disponibilidades, agendados }) {
  if (ehDataPassada(data)) return [];

  const diaSemana = data.getDay();
  const dispsDoDia = disponibilidades.filter((d) => Number(d.diaSemana) === diaSemana);
  if (dispsDoDia.length === 0) return [];

  const todosSlots = [];
  for (const disp of dispsDoDia) {
    if (!disp.horaInicio || !disp.horaFim) continue;
    todosSlots.push(...gerarSlots(disp.horaInicio, disp.horaFim, duracaoEstimada));
  }

  const slotsUnicos = Array.from(new Set(todosSlots)).sort();
  const dataStr = data.toDateString();

  const ocupados = agendados
    .filter((ag) => ag.status !== 'cancelado' && new Date(ag.dataHora).toDateString() === dataStr)
    .map((ag) => {
      const d = new Date(ag.dataHora);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    });

  let livres = slotsUnicos.filter((s) => !ocupados.includes(s));

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

/**
 * Primeiro horário livre a partir de uma data, varrendo até `horizonteDias`.
 * Usado para calcular "próximo horário livre" em listagens (home/catálogo).
 */
export function proximoSlotLivre({ disponibilidades, agendados, duracaoEstimada, apartirDe = new Date(), horizonteDias = 14 }) {
  for (let i = 0; i <= horizonteDias; i++) {
    const data = new Date(apartirDe);
    data.setDate(data.getDate() + i);
    data.setHours(0, 0, 0, 0);

    const livres = calcularSlotsLivresDoDia({ data, duracaoEstimada, disponibilidades, agendados });
    if (livres.length > 0) {
      const [h, m] = livres[0].split(':').map(Number);
      const resultado = new Date(data);
      resultado.setHours(h, m, 0, 0);
      return resultado;
    }
  }
  return null;
}
