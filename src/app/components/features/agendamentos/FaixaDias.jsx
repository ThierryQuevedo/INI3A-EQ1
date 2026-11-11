'use client';

import { useEffect, useRef } from 'react';
import { Check, CalendarDays, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { diaRelativo, nomeDiaCurto, partesDaChave, formatarDiaExtenso, rotuloVagas } from '@/lib/formatoData';

function prefereMovimentoReduzido() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

// faixa dos proximos 14 dias com radios nativos
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

  // centraliza o dia sem rolar na vertical
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
      {/* legend precisa ser o primeiro filho do fieldset */}
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
