import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";
import CatalogoCardSkeleton from "@/app/components/features/servicos/CatalogoCardSkeleton";

export default function LoadingServicos() {
  return (
    <div className="bg-background min-h-screen">
      <ProgressBar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <Skeleton className="h-9 w-72 mb-3" />
        <Skeleton className="h-5 w-96 max-w-full mb-6" />
        <Skeleton className="h-12 w-full rounded-xl mb-6" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 10 }).map((_, indice) => (
            <CatalogoCardSkeleton key={indice} />
          ))}
        </div>
      </div>
    </div>
  );
}
