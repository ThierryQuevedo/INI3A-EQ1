'use client';

import { WifiOff } from 'lucide-react';
import { useConexao } from '@/lib/useConexao';
import { cn } from '@/lib/utils';

/**
 * A-09: faixa de "sem internet". Só aparece quando o navegador TEM CERTEZA
 * de que está offline. A região role="status" fica sempre montada para o
 * leitor de tela anunciar a mudança.
 */
export default function AvisoConexao({ mensagem, className }) {
  const online = useConexao();

  return (
    <div role="status" aria-live="polite">
      {!online && (
        <p
          className={cn(
            'flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-body-sm text-foreground',
            className
          )}
        >
          <WifiOff size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
          <span>
            <strong className="font-semibold">Sem internet.</strong>{' '}
            {mensagem ?? 'Você pode continuar vendo esta tela; para enviar, precisamos de conexão.'}
          </span>
        </p>
      )}
    </div>
  );
}
