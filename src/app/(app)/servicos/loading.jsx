import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";
import CatalogoCardSkeleton from "@/app/components/features/servicos/CatalogoCardSkeleton";

export default function LoadingServicos() {
  return (
    <div className="bg-tcc-azul-deep min-h-screen">
      <ProgressBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Skeleton className="h-9 w-72 mb-3 bg-white/10" />
        <Skeleton className="h-5 w-96 max-w-full mb-8 sm:mb-10 bg-white/10" />

        <div className="flex flex-col sm:flex-row gap-3 mb-8 sm:mb-10">
          <Skeleton className="h-12 flex-1 rounded-xl bg-white/10" />
          <Skeleton className="h-11 w-full sm:w-32 rounded-full bg-white/10" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, indice) => (
            <CatalogoCardSkeleton key={indice} />
          ))}
        </div>
      </div>
    </div>
  );
}
