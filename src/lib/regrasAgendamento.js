// regras de horario das acoes do agendamento usadas na tela e na action

// confirmado so cancela ate 30 min antes do inicio
export const ANTECEDENCIA_CANCELAMENTO_MIN = 30;

const ANTECEDENCIA_MS = ANTECEDENCIA_CANCELAMENTO_MIN * 60 * 1000;

export function horarioComecou(dataHora, agora = new Date()) {
  return new Date(dataHora).getTime() <= agora.getTime();
}

export function prazoCancelamentoEncerrado(dataHora, agora = new Date()) {
  return agora.getTime() >= new Date(dataHora).getTime() - ANTECEDENCIA_MS;
}

// pendente segue cancelavel pois e assim que o prestador recusa
export function podeCancelar({ status, dataHora }, agora = new Date()) {
  if (status === 'pendente') return true;
  if (status === 'confirmado') return !prazoCancelamentoEncerrado(dataHora, agora);
  return false;
}

// concluir e nao compareceu so a partir do inicio
export function podeEncerrarAtendimento({ status, dataHora }, agora = new Date()) {
  return status === 'confirmado' && horarioComecou(dataHora, agora);
}

// entre o fim do prazo de cancelamento e o inicio
export function aguardandoInicio({ status, dataHora }, agora = new Date()) {
  return status === 'confirmado' && prazoCancelamentoEncerrado(dataHora, agora) && !horarioComecou(dataHora, agora);
}

// status em que o atendimento aconteceu para fins de valor e avaliacao do cliente
export const STATUS_ATENDIMENTO_ENCERRADO = ['concluido', 'nao_compareceu'];
