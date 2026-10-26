import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";

export default function LoadingAgendarHorario() {
  return (
    <div className="py-10 px-4">
      <ProgressBar />
      <div className="max-w-2xl mx-auto">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-8" />
        <Skeleton className="h-80 rounded-xl mb-4" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  );
}
