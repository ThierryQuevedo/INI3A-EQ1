import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";

export default function LoadingAgendamentos() {
  return (
    <div className="min-h-screen bg-background">
      <ProgressBar />
      <div className="max-w-5xl mx-auto p-6 sm:p-8 font-sans">
        <div className="border-b border-border pb-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-11 w-48 rounded-full" />
        </div>

        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, indice) => (
            <Skeleton key={indice} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
