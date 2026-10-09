export const STATUS_LABEL = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export function rotuloStatus(status) {
  return STATUS_LABEL[status] ?? status;
}
