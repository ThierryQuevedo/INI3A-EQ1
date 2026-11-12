'use client';

import { WifiOff } from 'lucide-react';
import { useConexao } from '@/lib/useConexao';
import { cn } from '@/lib/utils';

// faixa de sem internet
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
