import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";

export default function LoadingFavoritos() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <ProgressBar />
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, indice) => (
          <Skeleton key={indice} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
