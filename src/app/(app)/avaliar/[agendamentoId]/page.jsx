import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { CalendarClock, Lock, Clock3 } from 'lucide-react';

import { getSession } from '@/app/actions/auth.actions';
import { verificarPodeAvaliar } from '@/lib/avaliacoes';
import AvaliacaoServico from '@/app/components/features/agendamentos/AvaliacaoServico';
import BotaoVoltar from '@/app/components/ui/BotaoVoltar';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Avaliar serviço' };

// Destino do link "Avaliar serviço" do e-mail de serviço concluído.
export default async function AvaliarServicoPage({ params }) {
  const { agendamentoId } = await params;

  const usuario = await getSession();
  if (!usuario) {
    // O destino vai para um cookie no route handler; o /login fica sem query string.
    redirect(`/api/auth/entrar/?proximo=${encodeURIComponent(`/avaliar/${agendamentoId}/`)}`);
  }

  const { motivo, agendamento, avaliacaoExistente } = await verificarPodeAvaliar(agendamentoId, usuario.id);

  if (motivo === 'nao_encontrado') return notFound();

  if (motivo === 'nao_autorizado' || motivo === 'nao_concluido') {
    const bloqueio =
      motivo === 'nao_autorizado'
        ? {
            Icon: Lock,
            titulo: 'Você não pode avaliar este serviço',
            texto: 'Este agendamento pertence a outra conta. Confira se você entrou com o mesmo e-mail que recebeu o convite.',
          }
        : {
            Icon: Clock3,
            titulo: 'Este serviço ainda não foi concluído',
            texto: 'Assim que o profissional marcar o atendimento como concluído, a avaliação fica disponível aqui.',
          };

    return (
      <LayoutAvaliacao>
        <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-card">
          <div className="mx-auto mb-4 size-12 rounded-full bg-muted flex items-center justify-center">
            <bloqueio.Icon size={22} className="text-muted-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-h5 font-bold font-display text-foreground mb-2">{bloqueio.titulo}</h1>
          <p className="text-body text-muted-foreground mb-6">{bloqueio.texto}</p>
          <Link
            href="/agendamentos"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:opacity-90 text-body-sm font-bold px-6 h-11 rounded-full transition-opacity duration-200"
          >
            Ver meus agendamentos
          </Link>
        </div>
      </LayoutAvaliacao>
    );
  }

  const quando = new Date(agendamento.dataHora).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <LayoutAvaliacao>
      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center gap-4 p-6 border-b border-border">
          <div className="relative size-16 rounded-xl overflow-hidden bg-muted shrink-0">
            <Image
              src={agendamento.servicoImagem || `https://picsum.photos/200/200?random=${agendamento.servicoId}`}
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-h5 font-bold font-display text-foreground truncate">
              {agendamento.servicoSlug ? (
                <Link href={`/servicos/${agendamento.servicoSlug}`} className="hover:underline">
                  {agendamento.servicoNome}
                </Link>
              ) : (
                agendamento.servicoNome
              )}
            </h1>
            <p className="text-body-sm text-muted-foreground truncate">com {agendamento.prestadorNome}</p>
            <p className="text-caption text-muted-foreground flex items-center gap-1.5 mt-1">
              <CalendarClock size={14} aria-hidden="true" /> {quando}
            </p>
          </div>
        </div>

        <div className="p-6">
          <AvaliacaoServico
            agendamentoId={agendamento.id}
            avaliacaoExistente={avaliacaoExistente}
            variante="pagina"
          />
        </div>
      </div>
    </LayoutAvaliacao>
  );
}

function LayoutAvaliacao({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 font-sans">
        <BotaoVoltar fallbackHref="/agendamentos" className="mb-6" />
        {children}
      </div>
    </div>
  );
}
