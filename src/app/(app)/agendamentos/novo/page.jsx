import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarX2 } from 'lucide-react';
import { getSession } from '@/app/actions/auth.actions';
import { carregarAgendaDoServico } from '@/app/actions/agendamentos.actions';
import { ehChaveDiaValida, ehHoraValida } from '@/lib/formatoData';
import PageContainer from '@/app/components/ui/PageContainer';
import { Button } from '@/app/components/ui/button';
import AgendarCliente from './AgendarCliente';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Escolha o horário',
};

/** Só aceita um id inteiro positivo; qualquer outra coisa vira null. */
function lerServicoId(valor) {
  if (typeof valor !== 'string' || !/^\d+$/.test(valor)) return null;
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function ServicoIndisponivel() {
  return (
    <PageContainer size="sm" className="py-12 sm:py-16">
      <div className="flex flex-col items-center text-center gap-4">
        <span className="size-16 rounded-full bg-secondary text-secondary-foreground inline-flex items-center justify-center">
          <CalendarX2 size={28} aria-hidden="true" />
        </span>
        <h1 className="text-h5 font-bold text-foreground">Este serviço não está mais disponível</h1>
        <p className="text-body text-muted-foreground max-w-leitura">
          Pode ter sido removido pelo profissional. Veja outros serviços parecidos no catálogo.
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link href="/servicos">Ver outros serviços</Link>
        </Button>
      </div>
    </PageContainer>
  );
}

/**
 * A-01 + A-02: a sessão é conferida no servidor ANTES de desenhar qualquer
 * coisa (acabou a tela branca do redirecionamento no cliente) e os dados
 * chegam prontos, em paralelo, para o componente cliente.
 */
export default async function AgendarPage({ searchParams }) {
  const params = await searchParams;
  const servicoId = lerServicoId(params?.servico);

  // Sem ?servico= (ou com lixo), não há o que agendar: volta ao catálogo.
  if (!servicoId) redirect('/servicos');

  const data = ehChaveDiaValida(params?.data) ? params.data : null;
  const hora = data && ehHoraValida(params?.hora) ? params.hora : null;

  const usuario = await getSession();
  if (!usuario) {
    // O destino leva dia e hora: depois do login a pessoa volta com tudo marcado (A-08).
    const destino = new URLSearchParams({ servico: String(servicoId) });
    if (data) destino.set('data', data);
    if (hora) destino.set('hora', hora);
    redirect(`/api/auth/entrar/?proximo=${encodeURIComponent(`/agendamentos/novo/?${destino}`)}`);
  }

  const agenda = await carregarAgendaDoServico(servicoId);
  if (!agenda) return <ServicoIndisponivel />;

  return (
    <AgendarCliente
      servico={agenda.servico}
      disponibilidades={agenda.disponibilidades}
      agendadosIniciais={agenda.agendados}
      dataInicial={data}
      horaInicial={hora}
    />
  );
}
