'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { ROTULO_METODO, STATUS_PAGAMENTO } from '@/lib/statusPagamento';
import BotaoRepetirReembolso from './BotaoRepetirReembolso';

const TEXTOS = {
  pago: 'Recebemos o seu pagamento. O profissional já foi avisado.',
  reembolsando: 'Estamos devolvendo o valor pela mesma forma usada no pagamento.',
  reembolsado: 'O valor total foi devolvido pela mesma forma usada no pagamento.',
  reembolso_falhou: 'O valor ainda não foi devolvido. Tente de novo ou fale com o suporte.',
  em_disputa: 'Este pagamento foi contestado junto ao banco. Fale com o suporte para acompanhar.',
};

// foco no resultado para o leitor de tela
export default function ResultadoPagamento({ pagamento, agendamentoId }) {
  const refTitulo = useRef(null);

  useEffect(() => {
    refTitulo.current?.focus();
  }, []);

  const { label, badge, Icon } = STATUS_PAGAMENTO[pagamento.status];
  const podeRepetir = pagamento.status === 'reembolso_falhou' && pagamento.metodo !== 'boleto';

  return (
    <div className="mt-5">
      <p
        ref={refTitulo}
        tabIndex={-1}
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-body-sm font-semibold focus:outline-none ${badge}`}
      >
        <Icon size={16} aria-hidden="true" />
        {label}
      </p>

      <p className="mt-3 text-body text-foreground">{TEXTOS[pagamento.status]}</p>
      <p className="mt-1 text-body-sm text-muted-foreground">
        Forma de pagamento: {ROTULO_METODO[pagamento.metodo]}
        {pagamento.cartaoFinal ? ` terminado em ${pagamento.cartaoFinal}` : ''}
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        {pagamento.comprovanteUrl && (
          <Button asChild variant="outline" size="lg" className="w-full">
            <a href={pagamento.comprovanteUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={18} aria-hidden="true" />
              Ver comprovante
            </a>
          </Button>
        )}
        {podeRepetir && <BotaoRepetirReembolso agendamentoId={agendamentoId} className="w-full" />}
        <Button asChild size="lg" className="w-full">
          <Link href="/agendamentos">Ver meus agendamentos</Link>
        </Button>
        {pagamento.status !== 'pago' && (
          <Button asChild variant="ghost" size="lg" className="w-full">
            <Link href="/suporte">Falar com o suporte</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
