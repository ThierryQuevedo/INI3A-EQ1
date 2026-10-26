'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const VARIANTES = {
  // dentro do fluxo da página: discreto, sem cara de card
  padrao: 'h-10 px-3 -ml-3 text-muted-foreground hover:text-foreground hover:bg-muted',
  // sobre banner/imagem: precisa de fundo próprio para manter contraste
  sobreposto: 'h-10 px-3.5 text-foreground bg-card/95 hover:bg-card border border-border shadow-soft',
};

export default function BotaoVoltar({ fallbackHref = '/servicos', variant = 'padrao', className = '' }) {
  const router = useRouter();

  function handleClick() {
    // Se existe histórico de navegação dentro do site (veio de / ou /servicos),
    // window.history.state.idx > 0 indica que há uma entrada anterior.
    if (window.history.state && window.history.state.idx > 0) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn('inline-flex items-center gap-2 rounded-lg text-body-sm font-semibold transition-colors cursor-pointer', VARIANTES[variant], className)}
    >
      <ArrowLeft size={16} className="shrink-0" aria-hidden="true" />
      Voltar
    </button>
  );
}
