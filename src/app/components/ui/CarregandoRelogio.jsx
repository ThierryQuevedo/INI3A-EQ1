import { cn } from '@/lib/utils';

const TRACINHOS = Array.from({ length: 12 }, (_, i) => i);

// carregamento com os tracinhos do relogio
export default function CarregandoRelogio({ texto = 'Carregando…', className }) {
  return (
    <div role="status" className={cn('flex flex-col items-center gap-4 text-center', className)}>
      <div className="relogio-carregando" aria-hidden="true">
        {TRACINHOS.map((i) => (
          <span key={i} style={{ '--i': i }} />
        ))}
      </div>
      <p className="text-body font-medium text-muted-foreground">{texto}</p>
    </div>
  );
}
