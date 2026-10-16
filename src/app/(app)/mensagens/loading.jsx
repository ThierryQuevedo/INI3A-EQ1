import Skeleton from "@/app/components/ui/Skeleton";

export default function LoadingMensagens() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-3">
        {Array.from({ length: 5 }).map((_, indice) => (
          <Skeleton key={indice} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
