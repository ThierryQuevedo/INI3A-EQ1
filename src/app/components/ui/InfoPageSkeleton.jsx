import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";

export default function InfoPageSkeleton() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <ProgressBar />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Skeleton className="h-4 w-28 mb-3" />
        <Skeleton className="h-9 w-2/3 mb-6" />

        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
