'use client';

import { useEffect, useRef, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/lib/utils';
import { formatarPreco } from '@/app/components/ui/PriceTag';
import { formatarDuracao } from '@/app/components/ui/DurationTag';
import { formatarDiaCurto, formatarHora } from '@/lib/formatoData';

/**
 * A-07 / D-03 / F-03 / F-10 / G-03 / G-05: revisão do pedido.
 *
 * Celular: rodapé compacto preso à borda de baixo (BottomNav fica oculta
 * nesta rota), com dia, hora, serviço, preço, "Alterar" e o ÚNICO botão
 * laranja da tela. Entra por CSS (.barra-revisao em globals.css). A altura
 * é medida e vira --altura-barra: o html ganha scroll-padding-bottom (o
 * foco nunca fica atrás da barra) e o body ganha o mesmo espaço no fim.
 * Se a barra passar de 40% da altura da tela (fonte grande, tela baixa),
 * vira estática no fim da página.
 *
 * Desktop: painel lateral fixo ao rolar, sempre visível; sem horário
 * escolhido, o botão fica desativado DE VERDADE e neutro, com orientação.
 */
export default function BarraRevisao({
  servico,
  dia,
  hora,
  enviando,
  online,
  demorando,
  erro,
  onMarcar,
  onAlterar,
}) {
  const refBarra = useRef(null);
  const [estatica, setEstatica] = useState(false);
  const temSelecao = Boolean(dia && hora);

  useEffect(() => {
    const barra = refBarra.current;
    if (!barra || !temSelecao) return undefined;
    const raiz = document.documentElement;

    function medir() {
      const altura = barra.getBoundingClientRect().height;
      raiz.style.setProperty('--altura-barra', `${Math.ceil(altura)}px`);
      setEstatica(altura > window.innerHeight * 0.4);
    }

    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(barra);
    window.addEventListener('resize', medir);
    return () => {
      observador.disconnect();
      window.removeEventListener('resize', medir);
      raiz.style.removeProperty('--altura-barra');
    };
  }, [temSelecao]);

  const preco = formatarPreco(servico.preco);
  const quando = temSelecao ? `${formatarDiaCurto(dia)} · ${formatarHora(hora)}` : null;

  let rotuloBotao = 'Marcar horário';
  if (enviando) rotuloBotao = 'Marcando seu horário…';
  else if (!online) rotuloBotao = 'Sem internet';

  const podeMarcar = temSelecao && online && !enviando;

  return (
    <aside
      ref={refBarra}
      aria-labelledby="titulo-revisao"
      className={cn(
        // celular
        'bg-card border-t border-border shadow-elevated px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]',
        temSelecao ? 'barra-revisao' : 'max-md:hidden',
        estatica && 'barra-revisao--estatica max-md:mt-8 max-md:rounded-xl max-md:border max-md:shadow-none',
        // desktop: painel lateral
        'md:sticky md:top-24 md:rounded-xl md:border md:p-6 md:shadow-soft'
      )}
    >
      <h2 id="titulo-revisao" className="max-md:sr-only font-sans text-body-sm font-semibold text-muted-foreground tracking-normal">
        Seu pedido
      </h2>

      {temSelecao ? (
        <div className="flex items-start justify-between gap-3 md:mt-2">
          <div className="min-w-0">
            <p className="text-body-lg md:text-h5 font-bold text-foreground tabular-nums leading-snug">
              <span className="whitespace-nowrap">{formatarDiaCurto(dia)}</span>
              <span aria-hidden="true"> · </span>
              <span className="sr-only">, às </span>
              <span className="whitespace-nowrap">{formatarHora(hora)}</span>
            </p>
            <p className="flex min-w-0 gap-x-1.5 text-body-sm text-muted-foreground">
              <span className="truncate min-w-0">{servico.nome}</span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap shrink-0 tabular-nums">{preco}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onAlterar}
            aria-label={`Alterar dia e horário (${quando})`}
            className="md:hidden shrink-0 inline-flex items-center min-h-toque px-3 -mr-3 -mt-1 rounded-lg text-body font-semibold text-primary hover:bg-muted active:scale-[0.97] transition duracao-rapida cursor-pointer"
          >
            Alterar
          </button>
        </div>
      ) : (
        <p id="orientacao-revisao" className="mt-2 text-body text-foreground">
          Escolha um dia e um horário para continuar.
        </p>
      )}

      <dl className="max-md:hidden mt-4 border-t border-border pt-4 space-y-2 text-body-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Serviço</dt>
          <dd className="font-medium text-foreground text-right min-w-0 break-words">{servico.nome}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Profissional</dt>
          <dd className="font-medium text-foreground text-right min-w-0 break-words">{servico.prestadorNome}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Duração</dt>
          <dd className="font-medium text-foreground whitespace-nowrap">{formatarDuracao(servico.duracaoEstimada)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Preço</dt>
          <dd className="font-semibold text-foreground whitespace-nowrap tabular-nums">{preco}</dd>
        </div>
      </dl>

      {/* A-09: o erro aparece junto do botão que o causou, com saída clara. */}
      <div role="alert">
        {erro && (
          <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-body-sm text-foreground">
            {erro}
          </p>
        )}
      </div>

      <Button
        type="button"
        variant={temSelecao && online ? 'marcar' : 'secondary'}
        size="lg"
        onClick={onMarcar}
        disabled={!podeMarcar}
        aria-busy={enviando || undefined}
        aria-describedby={temSelecao ? 'nota-expectativa' : 'orientacao-revisao'}
        className={cn(
          'w-full mt-3 md:mt-5 min-h-14 h-auto py-3 text-body font-bold whitespace-normal',
          // desativado por estar enviando continua laranja (é o mesmo ato);
          // desativado por falta de escolha ou de rede fica neutro.
          enviando && 'disabled:opacity-80'
        )}
      >
        {rotuloBotao}
      </Button>

      <p className="sr-only" aria-live="polite">
        {enviando ? 'Marcando seu horário. Aguarde.' : ''}
      </p>

      {demorando && (
        <p role="status" className="mt-2 text-body-sm text-foreground">
          Está demorando mais que o normal. Não feche esta tela.
        </p>
      )}

      {/* F-10: nota de expectativa junto do botão (texto igual ao da tela final, A-06). */}
      <p id="nota-expectativa" className="mt-2 md:mt-3 flex gap-2 text-caption md:text-body-sm text-muted-foreground">
        <Clock3 size={16} className="mt-0.5 shrink-0 max-md:hidden" aria-hidden="true" />
        <span className="md:hidden">O profissional confirma e você recebe o aviso no app e por e-mail.</span>
        <span className="max-md:hidden">
          {servico.prestadorNome} confirma o pedido e você recebe o aviso aqui no app e por e-mail.
        </span>
      </p>
    </aside>
  );
}
