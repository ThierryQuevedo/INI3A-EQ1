'use client';

import { Check, Sun, CloudSun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { agruparPorPeriodo } from '@/lib/disponibilidade';
import { formatarHora, formatarHoraFalada, formatarDiaExtenso } from '@/lib/formatoData';

const PERIODOS = [
  { chave: 'manha', rotulo: 'Manhã', Icon: Sun },
  { chave: 'tarde', rotulo: 'Tarde', Icon: CloudSun },
  { chave: 'noite', rotulo: 'Noite', Icon: Moon },
];

// horarios do dia num grupo de radios
export default function GradeHorarios({ dia, slots, horarioSelecionado, onSelecionar, aviso, refGrupo }) {
  const grupos = agruparPorPeriodo(slots);

  return (
    <fieldset
      ref={refGrupo}
      tabIndex={-1}
      aria-describedby={aviso ? 'aviso-horarios' : undefined}
      className="entrada-suave min-w-0 focus:outline-none"
    >
      <legend className="w-full">
        <span className="block font-display text-h5 font-bold text-foreground">
          {formatarDiaExtenso(dia, { relativo: true })}
        </span>
      </legend>

      {aviso && (
        <p
          id="aviso-horarios"
          className="mt-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-body-sm text-foreground"
        >
          {aviso}
        </p>
      )}

      <div className="mt-2 space-y-5">
        {PERIODOS.map(({ chave, rotulo, Icon }) => {
          const doPeriodo = grupos[chave];
          if (doPeriodo.length === 0) return null;
          return (
            <div key={chave}>
              <h3 className="flex items-center gap-1.5 mb-2 font-sans text-body-sm font-semibold text-muted-foreground tracking-normal">
                <Icon size={16} aria-hidden="true" />
                {rotulo}
                <span className="font-normal">
                  · {doPeriodo.length} {doPeriodo.length === 1 ? 'horário' : 'horários'}
                </span>
              </h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2">
                {doPeriodo.map((slot) => {
                  const selecionado = slot === horarioSelecionado;
                  return (
                    <label
                      key={slot}
                      className={cn(
                        'relative min-h-12 px-2 py-2 rounded-lg border inline-flex items-center justify-center whitespace-nowrap select-none transition duracao-rapida',
                        'text-h6 font-sans font-bold tabular-nums tracking-normal',
                        'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                        selecionado
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-card border-input text-foreground hover:bg-secondary cursor-pointer active:scale-[0.97]'
                      )}
                    >
                      <input
                        type="radio"
                        name="horario"
                        value={slot}
                        checked={selecionado}
                        onChange={() => onSelecionar(slot)}
                        aria-label={formatarHoraFalada(slot)}
                        className="sr-only"
                      />
                      {selecionado && (
                        <Check size={14} strokeWidth={3} className="absolute top-1 right-1" aria-hidden="true" />
                      )}
                      <time dateTime={`${dia}T${slot}`} aria-hidden="true">
                        {formatarHora(slot)}
                      </time>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
