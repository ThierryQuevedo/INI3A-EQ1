'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BotaoVoltar({ fallbackHref = '/catalogo' }) {
  const router = useRouter();

  function handleClick() {
    // Se existe histórico de navegação dentro do site (veio de / ou /catalogo),
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
      className="flex items-center gap-2 text-sm font-semibold text-tcc-azul-lightest hover:text-white bg-tcc-azul-darker/60 hover:bg-tcc-azul-darker px-4 py-2 rounded-xl border border-tcc-azul-dark/50 transition-all duration-200 cursor-pointer"
    >
      <ArrowLeft size={16} />
      Voltar
    </button>
  );
}