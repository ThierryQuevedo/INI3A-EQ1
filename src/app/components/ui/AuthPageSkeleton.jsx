import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";

export default function AuthPageSkeleton() {
  return (
    <div className="min-h-screen bg-tcc-azul-deep flex flex-col items-center justify-center p-4 font-sans">
      <ProgressBar />
      <Skeleton className="w-56 h-14 mb-10 bg-white/10" />

      <div className="bg-card rounded-2xl shadow-elevated max-w-xl w-full p-8 md:p-12 border border-border space-y-5">
        <Skeleton className="h-6 w-2/3 mx-auto mb-8" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-13 w-full rounded-full" />
        <Skeleton className="h-13 w-full rounded-2xl" />
      </div>
    </div>
  );
}
