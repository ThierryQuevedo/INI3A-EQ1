import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";

export default function LoadingNovoServico() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <ProgressBar />
      <div className="max-w-5xl mx-auto">
        <Skeleton className="h-5 w-20 mb-3" />
        <Skeleton className="h-9 w-56 mb-2" />
        <Skeleton className="h-4 w-80 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">
          <div className="bg-card rounded-2xl shadow-soft border border-border p-6 md:p-8 space-y-5">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-13 w-full rounded-full" />
          </div>
          <div className="hidden lg:block">
            <Skeleton className="h-4 w-28 mb-3" />
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
