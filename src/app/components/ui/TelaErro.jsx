'use client';

import { startTransition, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RotateCcw, WifiOff, CircleAlert } from 'lucide-react';
import { Button } from './button';
import { useConexao } from '@/lib/useConexao';

/**
 * A-09: tela de erro com saída clara (Nielsen #9). Diz o que aconteceu sem
 * "Oops", oferece "Tentar de novo" (reset do error boundary + refresh dos
 * dados do servidor) e um caminho alternativo. Se o navegador sabe que está
 * offline, a mensagem fala da internet. O foco vai para o título.
 */
export default function TelaErro({ error, reset, titulo = 'Não conseguimos abrir esta página', hrefAlternativo = '/', rotuloAlternativo = 'Ir para o início' }) {
  const online = useConexao();
  const router = useRouter();
  const refTitulo = useRef(null);

  // Busca de novo os dados do servidor e remonta o trecho que falhou.
  function tentarDeNovo() {
    startTransition(() => {
      router.refresh();
      reset?.();
    });
  }

  useEffect(() => {
    // Registro para quem estiver depurando; o usuário vê só a mensagem abaixo.
    if (error) console.error(error);
    refTitulo.current?.focus();
  }, [error]);

  const Icone = online ? CircleAlert : WifiOff;

  return (
    <div className="min-h-[60dvh] flex items-center justify-center px-4 py-12">
      <section aria-labelledby="titulo-erro" className="w-full max-w-md text-center flex flex-col items-center gap-4">
        <span className="size-16 rounded-full bg-secondary text-secondary-foreground inline-flex items-center justify-center">
          <Icone size={28} aria-hidden="true" />
        </span>
        <h1 ref={refTitulo} id="titulo-erro" tabIndex={-1} className="text-h5 font-bold text-foreground focus:outline-none">
          {online ? titulo : 'Você está sem internet'}
        </h1>
        <p className="text-body text-muted-foreground">
          {online
            ? 'Pode ter sido a conexão ou uma falha nossa. Nada do que você já fez foi perdido.'
            : 'Confira o Wi-Fi ou os dados móveis. Quando a conexão voltar, toque em "Tentar de novo".'}
        </p>
        <div className="mt-2 flex w-full flex-col sm:flex-row sm:justify-center gap-2.5">
          <Button type="button" size="lg" onClick={tentarDeNovo}>
            <RotateCcw aria-hidden="true" />
            Tentar de novo
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={hrefAlternativo}>{rotuloAlternativo}</Link>
          </Button>
        </div>
        <Link href="/suporte" className="inline-flex items-center min-h-toque px-2 text-body-sm font-semibold text-primary hover:underline underline-offset-4">
          Precisa de ajuda?
        </Link>
      </section>
    </div>
  );
}
