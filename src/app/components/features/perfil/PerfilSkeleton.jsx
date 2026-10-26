import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";
import PageContainer from "@/app/components/ui/PageContainer";

/** Esqueleto dos perfis públicos: coluna de resumo + conteúdo em grid. */
export default function PerfilSkeleton({ comServicos = true }) {
  return (
    <PageContainer size="xl" className="py-6 sm:py-8">
      <ProgressBar />
      <Skeleton className="h-10 w-24 mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-4 lg:flex-col lg:items-start">
            <Skeleton className="size-16 lg:size-20 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 w-full">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-24 w-full" />
        </div>

        <div className="space-y-10 min-w-0">
          {comServicos && (
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: 3 }).map((_, indice) => (
                  <Skeleton key={indice} className="aspect-[3/4] rounded-xl" />
                ))}
              </div>
            </div>
          )}
          <div>
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, indice) => (
                <Skeleton key={indice} className="h-24 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
