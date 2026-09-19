import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";
import CatalogoCardSkeleton from "@/app/components/features/servicos/CatalogoCardSkeleton";

export default function LoadingHome() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <ProgressBar />

      <header className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-7">
          <Skeleton className="h-10 lg:h-14 w-4/5" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-2/3 max-w-xl" />
          <Skeleton className="h-14 w-64 rounded-full mt-2" />
        </div>
        <Skeleton className="lg:col-span-5 h-48 rounded-2xl" />
      </header>

      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-border">
        <Skeleton className="h-3 w-40 mb-2" />
        <Skeleton className="h-5 w-64 mb-6" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, indice) => (
            <Skeleton key={indice} className="h-11 w-32 rounded-full shrink-0" />
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-border">
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-5 w-56 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, indice) => (
            <CatalogoCardSkeleton key={indice} />
          ))}
        </div>
      </section>
    </div>
  );
}
