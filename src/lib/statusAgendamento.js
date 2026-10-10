import { Clock3, CalendarCheck2, CheckCircle2, XCircle } from 'lucide-react';

export const STATUS_AGENDAMENTO = {
  pendente: { label: 'Aguardando confirmação', badge: 'bg-warning/15 text-warning', Icon: Clock3 },
  confirmado: { label: 'Confirmado', badge: 'bg-success/15 text-success', Icon: CalendarCheck2 },
  concluido: { label: 'Concluído', badge: 'bg-primary/10 text-primary', Icon: CheckCircle2 },
  cancelado: { label: 'Cancelado', badge: 'bg-destructive/10 text-destructive', Icon: XCircle },
};

const FALLBACK = { label: null, badge: 'bg-muted text-muted-foreground', Icon: Clock3 };

function config(status) {
  return STATUS_AGENDAMENTO[status?.toLowerCase?.()] ?? { ...FALLBACK, label: status };
}

export function rotuloStatus(status) {
  return config(status).label;
}

export function statusBadgeClass(status) {
  return config(status).badge;
}

export function statusIcon(status) {
  return config(status).Icon;
}
