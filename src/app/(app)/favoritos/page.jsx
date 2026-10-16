import { Heart } from "lucide-react";
import { requireSession } from "@/app/actions/auth.actions";
import { listarFavoritos } from "@/app/actions/favoritos.actions";
import ServiceCard from "@/app/components/features/servicos/ServiceCard";
import PrestadorFavoritoCard from "@/app/components/features/favoritos/PrestadorFavoritoCard";
import PageContainer, { PageHeader } from "@/app/components/ui/PageContainer";
import { Card } from "@/app/components/ui/card";
import EmptyState from "@/app/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function FavoritosPage() {
  await requireSession();
  const { servicos, prestadores } = await listarFavoritos();
  const semFavoritos = servicos.length === 0 && prestadores.length === 0;

  return (
    <PageContainer size="2xl" className="py-8 sm:py-10">
      <PageHeader title="Favoritos" description="Serviços e profissionais que você salvou para encontrar rápido depois." />

      {semFavoritos ? (
        <Card dashed padding="default" className="shadow-none">
          <EmptyState
            icon={Heart}
            title="Nenhum favorito ainda"
            description="Toque no coração de um serviço ou do perfil de um profissional pra salvar aqui."
            actionLabel="Ver serviços disponíveis"
            actionHref="/servicos"
          />
        </Card>
      ) : (
        <div className="space-y-10">
          {prestadores.length > 0 && (
            <section>
              <h2 className="text-body-lg font-bold text-foreground mb-4">
                Profissionais
                <span className="text-caption font-medium text-muted-foreground ml-2">· {prestadores.length}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prestadores.map((prestador) => (
                  <PrestadorFavoritoCard key={prestador.id} prestador={prestador} />
                ))}
              </div>
            </section>
          )}

          {servicos.length > 0 && (
            <section>
              <h2 className="text-body-lg font-bold text-foreground mb-4">
                Serviços
                <span className="text-caption font-medium text-muted-foreground ml-2">· {servicos.length}</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {servicos.map((servico) => (
                  <ServiceCard key={servico.id} servico={servico} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}
