import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";

export default function InfoPageSkeleton() {
  return (
    <div className="min-h-screen bg-tcc-azul-deep font-sans antialiased">
      <ProgressBar />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Skeleton className="h-4 w-28 mb-3 bg-white/10" />
        <Skeleton className="h-9 w-2/3 mb-6 bg-white/10" />

        <div className="bg-tcc-azul-darker/40 p-8 rounded-2xl border border-white/10 space-y-4">
          <Skeleton className="h-4 w-full bg-white/10" />
          <Skeleton className="h-4 w-11/12 bg-white/10" />
          <Skeleton className="h-4 w-2/3 bg-white/10" />
        </div>
      </div>
    </div>
  );
}
