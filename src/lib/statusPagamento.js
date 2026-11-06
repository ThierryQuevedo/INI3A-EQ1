import { Clock3, CheckCircle2, RotateCcw, AlertTriangle, XCircle } from 'lucide-react';

// Sem dependência de servidor: este arquivo também é usado por componentes cliente.
//
//  criando          tentativa reservada, esperando a resposta da AbacatePay
//  pendente         cobrança aberta, esperando o pagamento
//  pago             dinheiro recebido
//  expirado         o PIX ou o boleto venceu sem pagamento
//  falhou           recusada, ou não foi possível criar
//  cancelado        abandonada (troca de método ou agendamento cancelado)
//  reembolsando     devolução em andamento
//  reembolsado      dinheiro devolvido
//  reembolso_falhou a devolução não saiu e precisa de nova tentativa ou do suporte
//  em_disputa       chargeback aberto; a API não reembolsa neste estado
export const STATUS_PAGAMENTO = {
  criando: { label: 'Processando pagamento', badge: 'bg-warning/15 text-warning', Icon: Clock3 },
  pendente: { label: 'Aguardando pagamento', badge: 'bg-warning/15 text-warning', Icon: Clock3 },
  pago: { label: 'Pago', badge: 'bg-success/15 text-success', Icon: CheckCircle2 },
  expirado: { label: 'Pagamento expirado', badge: 'bg-muted text-muted-foreground', Icon: XCircle },
  falhou: { label: 'Pagamento recusado', badge: 'bg-destructive/10 text-destructive', Icon: XCircle },
  cancelado: { label: 'Cobrança cancelada', badge: 'bg-muted text-muted-foreground', Icon: XCircle },
  reembolsando: { label: 'Reembolso em andamento', badge: 'bg-warning/15 text-warning', Icon: RotateCcw },
  reembolsado: { label: 'Reembolsado', badge: 'bg-secondary text-secondary-foreground', Icon: RotateCcw },
  reembolso_falhou: { label: 'Reembolso pendente', badge: 'bg-destructive/10 text-destructive', Icon: AlertTriangle },
  em_disputa: { label: 'Pagamento em disputa', badge: 'bg-destructive/10 text-destructive', Icon: AlertTriangle },
};

export const ROTULO_METODO = { pix: 'PIX', boleto: 'Boleto', cartao: 'Cartão de crédito' };

/** Boleto leva dias para compensar: só aparece se o serviço estiver longe o bastante. */
export const DIAS_MINIMOS_PARA_BOLETO = 5;

export function boletoDisponivelPara(dataHora, agora = new Date()) {
  const dias = (new Date(dataHora).getTime() - agora.getTime()) / 86400000;
  return dias >= DIAS_MINIMOS_PARA_BOLETO;
}
