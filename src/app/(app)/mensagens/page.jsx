import { MessageCircle } from "lucide-react";
import { requireSession } from "@/app/actions/auth.actions";
import { listarConversas } from "@/app/actions/mensagens.actions";
import ConversaListItem from "@/app/components/features/mensagens/ConversaListItem";
import PageContainer, { PageHeader } from "@/app/components/ui/PageContainer";
import { Card } from "@/app/components/ui/card";
import EmptyState from "@/app/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function MensagensPage() {
  const usuarioLogado = await requireSession();
  const conversas = await listarConversas();

  return (
    <PageContainer size="md" className="py-6 sm:py-8">
      <PageHeader
        title="Mensagens"
        description="Converse com quem está do outro lado do seu agendamento."
      />

      {conversas.length === 0 ? (
        <Card dashed padding="default" className="shadow-none">
          <EmptyState
            icon={MessageCircle}
            title="Nenhuma conversa por aqui ainda"
            description={
              usuarioLogado.tipo === "cliente"
                ? "Quando você agendar um serviço, pode conversar direto com o prestador aqui."
                : "Quando um cliente agendar com você, a conversa aparece aqui."
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3">
          {conversas.map((conversa) => (
            <ConversaListItem key={conversa.agendamentoId} conversa={conversa} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
