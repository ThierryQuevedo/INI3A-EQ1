import Skeleton from "@/app/components/ui/Skeleton";

/** Espelha o ServiceCard: imagem 1:1, textos, preço e botão "Agendar". */
export default function CatalogoCardSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card flex flex-col h-full">
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-4 pb-2 flex flex-col gap-2">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-24 mt-1" />
      </div>
      <div className="mt-auto px-4 pb-4 pt-1 space-y-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
