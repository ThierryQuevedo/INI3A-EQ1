import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";
import PageContainer from "@/app/components/ui/PageContainer";
import CatalogoCardSkeleton from "@/app/components/features/servicos/CatalogoCardSkeleton";

function FaixaCarrossel() {
  return (
    <section>
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, indice) => (
          <div key={indice} className="shrink-0 w-[11.5rem] sm:w-[13.5rem]">
            <CatalogoCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function LoadingHome() {
  return (
    <PageContainer size="xl" className="pt-6 sm:pt-8 pb-12 space-y-10">
      <ProgressBar />

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-80 max-w-full" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-11 w-full md:max-w-sm rounded-lg" />
      </div>

      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, indice) => (
          <div key={indice} className="shrink-0 w-24 sm:w-28 flex flex-col items-center gap-2 p-2">
            <Skeleton className="size-12 rounded-xl" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      <FaixaCarrossel />
      <FaixaCarrossel />
    </PageContainer>
  );
}
