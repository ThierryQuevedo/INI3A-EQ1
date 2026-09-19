import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";

export default function LoadingDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <ProgressBar />
      <main className="p-6 sm:p-8 max-w-7xl mx-auto">

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-40 rounded-full" />
            <Skeleton className="h-11 w-40 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {Array.from({ length: 4 }).map((_, indice) => (
            <Skeleton key={indice} className="h-24 rounded-2xl" />
          ))}
        </div>

        <section className="mb-10 space-y-3">
          <Skeleton className="h-5 w-40 mb-1" />
          {Array.from({ length: 2 }).map((_, indice) => (
            <Skeleton key={indice} className="h-20 rounded-2xl" />
          ))}
        </section>

        <section className="mb-10 space-y-3">
          <Skeleton className="h-5 w-52 mb-1" />
          {Array.from({ length: 2 }).map((_, indice) => (
            <Skeleton key={indice} className="h-20 rounded-2xl" />
          ))}
        </section>

        <section>
          <Skeleton className="h-5 w-56 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, indice) => (
              <Skeleton key={indice} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
