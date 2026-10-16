import { Bell } from "lucide-react";
import { requireSession } from "@/app/actions/auth.actions";
import { listarMinhasNotificacoes } from "@/app/actions/notificacoes.actions";
import NotificacaoItem from "@/app/components/features/notificacoes/NotificacaoItem";
import MarcarTodasLidasButton from "@/app/components/features/notificacoes/MarcarTodasLidasButton";
import PageContainer, { PageHeader } from "@/app/components/ui/PageContainer";
import { Card } from "@/app/components/ui/card";
import EmptyState from "@/app/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function NotificacoesPage() {
  await requireSession();
  const notificacoes = await listarMinhasNotificacoes(100);
  const temNaoLidas = notificacoes.some((n) => !n.lidaEm);

  return (
    <PageContainer size="md" className="py-6 sm:py-8">
      <PageHeader
        title="Notificações"
        description="Tudo que aconteceu nos seus agendamentos e avaliações."
        actions={temNaoLidas && <MarcarTodasLidasButton />}
      />

      {notificacoes.length === 0 ? (
        <Card dashed padding="default" className="shadow-none">
          <EmptyState
            icon={Bell}
            title="Nenhuma notificação ainda"
            description="Quando algo acontecer nos seus agendamentos, você vê por aqui."
          />
        </Card>
      ) : (
        <div className="grid gap-2">
          {notificacoes.map((notificacao) => (
            <NotificacaoItem key={notificacao.id} notificacao={notificacao} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
