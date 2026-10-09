import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";

export default function LoadingDisponibilidades() {
  return (
    <div className="min-h-screen bg-background py-8 px-4 font-sans">
      <ProgressBar />
      <div className="max-w-3xl mx-auto">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-4 w-80 mb-6" />
        <Skeleton className="h-16 rounded-2xl mb-5" />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl mb-3" />
        ))}
      </div>
    </div>
  );
}
