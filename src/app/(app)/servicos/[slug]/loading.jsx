import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";

export default function LoadingDetalheServico() {
  return (
    <div className="bg-tcc-azul-deep min-h-screen text-white font-sans">
      <ProgressBar />
      <div className="relative h-60 w-full bg-gradient-to-b from-tcc-azul-darker to-tcc-azul-deep" />

      <div className="max-w-5xl mx-auto px-6 -mt-24 relative z-10 pb-20">
        <div className="flex flex-col items-center md:flex-row md:justify-between bg-tcc-azul-darker/60 p-6 rounded-3xl gap-6">
          <div className="flex flex-col items-center md:flex-row gap-6 w-full">
            <Skeleton className="size-32 rounded-2xl bg-white/10 shrink-0" />
            <div className="flex flex-col gap-2 flex-1 items-center md:items-start">
              <Skeleton className="h-3 w-24 bg-white/10" />
              <Skeleton className="h-7 w-56 bg-white/10" />
              <Skeleton className="h-4 w-40 bg-white/10" />
            </div>
          </div>
          <Skeleton className="h-14 w-full md:w-56 rounded-full bg-white/10 shrink-0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-40 rounded-3xl bg-white/10" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 rounded-2xl bg-white/10" />
              <Skeleton className="h-20 rounded-2xl bg-white/10" />
            </div>
          </div>
          <Skeleton className="h-64 rounded-3xl bg-white/10" />
        </div>
      </div>
    </div>
  );
}
