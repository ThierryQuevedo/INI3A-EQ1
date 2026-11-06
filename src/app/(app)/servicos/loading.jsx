import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";
import PageContainer from "@/app/components/ui/PageContainer";
import CatalogoCardSkeleton from "@/app/components/features/servicos/CatalogoCardSkeleton";

export default function LoadingServicos() {
  return (
    <PageContainer size="2xl" className="py-8 sm:py-10">
      <ProgressBar />
      <Skeleton className="h-9 w-72 max-w-full mb-2" />
      <Skeleton className="h-5 w-96 max-w-full mb-6" />
      <Skeleton className="h-12 w-full rounded-lg mb-6" />

      <div className="flex max-lg:flex-col lg:flex-row max-lg:gap-6 lg:gap-8 items-start">
        <Skeleton className="max-lg:h-11 max-lg:w-28 lg:w-72 lg:h-[32rem] shrink-0 rounded-xl" />
        <div className="flex-1 min-w-0 w-full">
          <Skeleton className="h-4 w-24 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, indice) => (
              <CatalogoCardSkeleton key={indice} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
