import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { requireSession } from '@/app/actions/auth.actions';
import { cadastrarServico, listarCategorias } from '@/app/actions/servicos.actions';
import PageContainer from '@/app/components/ui/PageContainer';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import ServicoForm from '../ServicoForm';

export const metadata = { title: 'Novo serviço' };

export default async function CadastroServicoPage() {
  const usuario = await requireSession();

  // cliente vira prestador antes de criar
  if (usuario.tipo !== 'prestador') {
    return (
      <PageContainer size="sm" className="py-12">
        <Card padding="default" className="p-8 flex flex-col items-center text-center gap-3">
          <span className="size-14 rounded-full bg-muted inline-flex items-center justify-center">
            <Briefcase size={26} className="text-muted-foreground" aria-hidden="true" />
          </span>
          <h1 className="text-h5 font-bold text-foreground">Sua conta ainda é de cliente</h1>
          <p className="text-body-sm text-muted-foreground max-w-sm">
            Para cadastrar serviços e receber agendamentos, transforme sua conta em prestador. Leva um clique, nas configurações.
          </p>
          <Button asChild size="lg" className="mt-3">
            <Link href="/configuracoes#virar-prestador">Virar prestador</Link>
          </Button>
        </Card>
      </PageContainer>
    );
  }

  const categorias = await listarCategorias();
  return <ServicoForm categorias={categorias} action={cadastrarServico} nomePrestador={usuario.nome} />;
}
