'use client';

import { useEffect, useRef } from 'react';
import { Check, CalendarDays, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { diaRelativo, nomeDiaCurto, partesDaChave, formatarDiaExtenso, rotuloVagas } from '@/lib/formatoData';

function prefereMovimentoReduzido() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * A-04 / F-02 / C-08 / C-07 / G-06: os próximos 14 dias numa faixa.
 *
 * - Rádio NATIVO (padrão APG Radio Group de graça): um ponto de Tab para o
 *   grupo, setas mudam a seleção, dias sem vaga ficam `disabled` e o leitor
 *   de tela anuncia "Sexta, 30 de outubro, 9 vagas, 3 de 14".
 * - Dia sem vaga continua visível e ESCRITO ("Sem vagas"), não some.
 * - Selecionado = cor + borda + check, sem mudar de tamanho.
 * - Rolagem horizontal visível + "Mais dias ›" (quem não percebe que dá
 *   para arrastar tem um botão) + "Ver outro mês" para além de 14 dias.
 */
export default function FaixaDias({
  dias,
  diaSelecionado,
  onSelecionar,
  onVerOutroMes,
  calendarioAberto = false,
  idCalendario,
  refGrupo,
}) {
  const faixaRef = useRef(null);
  const jaRolou = useRef(false);

  // Leva o dia escolhido para o centro da faixa SEM rolar a página na vertical
  // (scrollIntoView rolaria as duas direções). Primeira vez: sem animação.
  useEffect(() => {
    const faixa = faixaRef.current;
    if (!faixa || !diaSelecionado) return;
    const item = faixa.querySelector(`[data-dia="${diaSelecionado}"]`);
    if (!item) return;
    const alvo = item.offsetLeft - faixa.clientWidth / 2 + item.offsetWidth / 2;
    faixa.scrollTo({
      left: Math.max(0, alvo),
      behavior: jaRolou.current && !prefereMovimentoReduzido() ? 'smooth' : 'auto',
    });
    jaRolou.current = true;
  }, [diaSelecionado]);

  function maisDias() {
    const faixa = faixaRef.current;
    if (!faixa) return;
    const noFim = faixa.scrollLeft + faixa.clientWidth >= faixa.scrollWidth - 8;
    if (noFim) {
      onVerOutroMes?.();
      return;
    }
    faixa.scrollBy({ left: faixa.clientWidth * 0.8, behavior: prefereMovimentoReduzido() ? 'auto' : 'smooth' });
  }

  return (
    <fieldset ref={refGrupo} tabIndex={-1} className="min-w-0 focus:outline-none">
      {/* legend precisa ser o 1º filho do fieldset para nomear o grupo;
          o float põe o botão "Mais dias" na mesma linha. */}
      <legend className="float-left min-h-toque flex items-center text-body-sm font-semibold text-muted-foreground">
        Próximos 14 dias
      </legend>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={maisDias}
          className="inline-flex items-center gap-0.5 min-h-toque px-2 -mr-2 rounded-lg text-body-sm font-semibold text-primary hover:bg-muted active:scale-[0.97] transition duracao-rapida cursor-pointer"
        >
          Mais dias
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div
        ref={faixaRef}
        className="faixa-rolagem relative clear-both mt-1 -mx-4 px-4 scroll-px-4 sm:-mx-6 sm:px-6 sm:scroll-px-6 md:mx-0 md:px-0 md:scroll-px-0 flex gap-2 pb-3 pt-1"
      >
        {dias.map(({ dia, slots }) => {
          const vagas = slots.length;
          const vazio = vagas === 0;
          const selecionado = dia === diaSelecionado;
          const relativo = diaRelativo(dia);
          const { dia: numero } = partesDaChave(dia);
          return (
            <label
              key={dia}
              data-dia={dia}
              className={cn(
                'relative shrink-0 min-w-[5rem] min-h-[5.5rem] px-2 py-2 rounded-lg border flex flex-col items-center justify-center gap-0.5 text-center whitespace-nowrap select-none transition duracao-rapida',
                'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                selecionado
                  ? 'bg-primary border-primary text-primary-foreground'
                  : vazio
                    ? 'bg-muted border-transparent text-muted-foreground cursor-not-allowed'
                    : 'bg-card border-input text-foreground hover:bg-secondary cursor-pointer active:scale-[0.97]'
              )}
            >
              <input
                type="radio"
                name="dia"
                value={dia}
                checked={selecionado}
                disabled={vazio}
                onChange={() => onSelecionar(dia)}
                aria-label={`${formatarDiaExtenso(dia, { relativo: true })}, ${rotuloVagas(vagas).toLowerCase()}`}
                className="sr-only"
              />
              {selecionado && (
                <Check size={14} strokeWidth={3} className="absolute top-1.5 right-1.5" aria-hidden="true" />
              )}
              <span aria-hidden="true" className={cn('text-caption', !selecionado && !vazio && 'text-muted-foreground')}>
                {relativo ?? nomeDiaCurto(dia)}
              </span>
              <span aria-hidden="true" className="text-h6 font-bold leading-none tabular-nums">
                {numero}
              </span>
              <span aria-hidden="true" className={cn('text-caption', !selecionado && !vazio && 'text-muted-foreground')}>
                {rotuloVagas(vagas)}
              </span>
            </label>
          );
        })}

        <button
          type="button"
          onClick={onVerOutroMes}
          aria-expanded={calendarioAberto}
          aria-controls={idCalendario}
          className="shrink-0 min-w-[5rem] min-h-[5.5rem] px-2 py-2 rounded-lg border border-input bg-card text-primary flex flex-col items-center justify-center gap-1 text-center text-caption font-semibold hover:bg-secondary active:scale-[0.97] transition duracao-rapida cursor-pointer"
        >
          <CalendarDays size={20} aria-hidden="true" />
          <span>
            Ver outro
            <br />
            mês
          </span>
        </button>
      </div>
    </fieldset>
  );
}
