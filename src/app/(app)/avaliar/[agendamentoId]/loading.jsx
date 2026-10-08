import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";

export default function LoadingAvaliar() {
  return (
    <div className="min-h-screen bg-background">
      <ProgressBar />
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 font-sans">
        <Skeleton className="h-10 w-24 rounded-full mb-6" />
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-4 p-6 border-b border-border">
            <Skeleton className="size-16 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="p-6 space-y-3">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-11 w-60" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
