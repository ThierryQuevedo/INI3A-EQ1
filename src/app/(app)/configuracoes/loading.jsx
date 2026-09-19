import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";

export default function LoadingConfiguracoes() {
  return (
    <div className="min-h-screen bg-tcc-azul-deep flex flex-col">
      <ProgressBar />
      <section className="bg-gradient-to-b from-tcc-azul-darker to-tcc-azul-deep pt-16 pb-28 flex flex-col items-center justify-center gap-3">
        <Skeleton className="size-24 rounded-full bg-white/10" />
        <Skeleton className="h-7 w-48 bg-white/10" />
        <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
      </section>

      <main className="flex-1 flex justify-center px-4 -mt-16 mb-16 z-10">
        <div className="bg-card rounded-3xl p-6 md:p-10 w-full max-w-2xl shadow-elevated border border-border space-y-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-24 w-full rounded-2xl" />

          <Skeleton className="h-6 w-32 mt-6 mb-2" />
          {Array.from({ length: 4 }).map((_, indice) => (
            <Skeleton key={indice} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  );
}
