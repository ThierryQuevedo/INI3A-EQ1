import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarX2 } from 'lucide-react';
import { getSession } from '@/app/actions/auth.actions';
import { carregarTelaDePagamento } from '@/app/actions/pagamentos.actions';
import PageContainer from '@/app/components/ui/PageContainer';
import { Button } from '@/app/components/ui/button';
import PagamentoCliente from './PagamentoCliente';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pagamento',
};

// mesma tela para inexistente e de outra pessoa
function PagamentoNaoEncontrado() {
  return (
    <PageContainer size="sm" className="py-12 sm:py-16">
      <div className="flex flex-col items-center text-center gap-4">
        <span className="size-16 rounded-full bg-secondary text-secondary-foreground inline-flex items-center justify-center">
          <CalendarX2 size={28} aria-hidden="true" />
        </span>
        <h1 className="text-h5 font-bold text-foreground">Pagamento não encontrado</h1>
        <p className="text-body text-muted-foreground max-w-leitura">
          Este agendamento não existe ou não está na sua conta.
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link href="/agendamentos">Ver meus agendamentos</Link>
        </Button>
      </div>
    </PageContainer>
  );
}

export default async function PagamentoPage({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return <PagamentoNaoEncontrado />;

  const usuario = await getSession();
  if (!usuario) {
    // depois do login volta para ca
    redirect(`/api/auth/entrar/?proximo=${encodeURIComponent(`/agendamentos/${id}/pagamento/`)}`);
  }

  // null tambem quando e de outro cliente
  const dados = await carregarTelaDePagamento(id);
  if (!dados) return <PagamentoNaoEncontrado />;

  return <PagamentoCliente {...dados} />;
}
