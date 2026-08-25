'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BotaoVoltar({ fallbackHref = '/servicos' }) {
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
      onClick={handleClick}
      className="inline-flex items-center gap-2 h-11 text-body-sm font-semibold text-foreground bg-card hover:bg-muted px-4 rounded-full border border-border shadow-soft transition-colors duration-200 ease-apple cursor-pointer"
    >
      <ArrowLeft size={16} />
      Voltar
    </button>
  );
}
