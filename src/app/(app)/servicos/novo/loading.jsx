import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";

export default function LoadingNovoServico() {
  return (
    <div className="min-h-screen bg-tcc-azul-deep flex items-center justify-center p-4">
      <ProgressBar />
      <div className="w-full max-w-xl bg-card rounded-2xl shadow-elevated border border-border p-8 md:p-10 space-y-5">
        <div className="text-center mb-4">
          <Skeleton className="h-6 w-40 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-13 w-full rounded-full" />
      </div>
    </div>
  );
}
