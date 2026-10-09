import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";

export default function LoadingDetalheServico() {
  return (
    <div className="bg-background min-h-screen">
      <ProgressBar />
      <div className="relative h-52 sm:h-60 w-full bg-muted" />

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-10 pb-20">
        <div className="flex flex-col items-center md:flex-row md:justify-between bg-card border border-border p-6 rounded-3xl gap-6 shadow-elevated">
          <div className="flex flex-col items-center md:flex-row gap-6 w-full">
            <Skeleton className="size-28 sm:size-32 rounded-2xl shrink-0" />
            <div className="flex flex-col gap-2 flex-1 items-center md:items-start">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-14 w-full md:w-56 rounded-full shrink-0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-40 rounded-3xl" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
          </div>
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
