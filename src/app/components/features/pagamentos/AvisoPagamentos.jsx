import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { formatarPreco } from '@/app/components/ui/PriceTag';
import { formatarQuando } from '@/lib/formatoData';

const MAXIMO_NA_LISTA = 3;

/**
 * Aviso do topo do Início, do painel e da Agenda: mostra o que falta pagar, com
 * o botão a um clique. Não aparece quando não há nada a pagar. Usa a cor
 * principal: na direção de design, o laranja é só do ato de marcar.
 */
export default function AvisoPagamentos({ pagamentos, className = '' }) {
  if (!pagamentos?.length) return null;

  const visiveis = pagamentos.slice(0, MAXIMO_NA_LISTA);
  const restantes = pagamentos.length - visiveis.length;
  const titulo = pagamentos.length === 1 ? 'Pagamento pendente' : `${pagamentos.length} pagamentos pendentes`;

  return (
    <section
      aria-labelledby="titulo-aviso-pagamentos"
      className={`rounded-xl border border-primary/40 bg-primary/10 p-4 sm:p-5 ${className}`}
    >
      <h2 id="titulo-aviso-pagamentos" className="flex items-center gap-2 text-body-lg font-bold text-foreground">
        <CreditCard size={20} className="shrink-0 text-primary" aria-hidden="true" />
        {titulo}
      </h2>

      <ul className="mt-3 grid gap-3">
        {visiveis.map((item) => (
          <li key={item.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
            <div className="min-w-0">
              <p className="text-body font-semibold text-foreground break-words">
                {item.servicoNome} · <span className="tabular-nums whitespace-nowrap">{formatarPreco(item.preco)}</span>
              </p>
              <p className="text-body-sm text-muted-foreground break-words">
                {item.prestadorNome} · {formatarQuando(item.dataHora)}
              </p>
            </div>
            <Button asChild size="lg" className="w-full sm:w-auto shrink-0">
              <Link href={`/agendamentos/${item.id}/pagamento`}>
                {item.cobrancaAberta ? 'Continuar pagamento' : 'Pagar agora'}
                <span className="sr-only"> {item.servicoNome}</span>
              </Link>
            </Button>
          </li>
        ))}
      </ul>

      {restantes > 0 && (
        <Link
          href="/agendamentos"
          className="mt-3 inline-flex items-center min-h-toque text-body-sm font-semibold text-primary underline underline-offset-4"
        >
          Ver {restantes === 1 ? 'o outro' : `os outros ${restantes}`} na agenda
        </Link>
      )}
    </section>
  );
}
