'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useToast } from '@/app/components/ui/ToastProvider';

// boleto aberto
export default function BoletoAberto({ pagamento, onTrocarMetodo }) {
  const toast = useToast();
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(pagamento.boletoLinhaDigitavel);
      setCopiado(true);
      toast.success('Linha digitável copiada.');
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      toast.error('Não foi possível copiar. Selecione o código e copie manualmente.');
    }
  }

  return (
    <div className="mt-5">
      <p role="status" className="text-body font-semibold text-foreground">
        Boleto gerado
      </p>
      <p className="mt-1 text-body-sm text-muted-foreground">
        Pague pelo app do seu banco. A confirmação pode levar até 3 dias úteis e chega por e-mail.
      </p>

      {pagamento.boletoLinhaDigitavel && (
        <>
          <label htmlFor="boleto-linha" className="mt-4 block text-body-sm font-medium text-muted-foreground">
            Linha digitável
          </label>
          <textarea
            id="boleto-linha"
            readOnly
            rows={2}
            value={pagamento.boletoLinhaDigitavel}
            onFocus={(e) => e.target.select()}
            className="mt-1.5 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-body-sm tabular-nums text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="button" size="lg" className="mt-3 w-full" onClick={copiar}>
            {copiado ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
            {copiado ? 'Copiada' : 'Copiar linha digitável'}
          </Button>
        </>
      )}

      {pagamento.boletoUrl && (
        <Button asChild variant="outline" size="lg" className="mt-2.5 w-full">
          <a href={pagamento.boletoUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={18} aria-hidden="true" />
            Abrir boleto para imprimir
          </a>
        </Button>
      )}

      <Button type="button" variant="ghost" size="lg" className="mt-2 w-full" onClick={onTrocarMetodo}>
        Pagar de outra forma
      </Button>
    </div>
  );
}
