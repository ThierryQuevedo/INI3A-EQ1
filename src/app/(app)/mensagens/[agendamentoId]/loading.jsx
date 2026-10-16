import Skeleton from "@/app/components/ui/Skeleton";

export default function LoadingConversa() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex-1 px-4 py-4 space-y-3">
        <Skeleton className="h-10 w-2/3 rounded-2xl" />
        <Skeleton className="h-10 w-1/2 rounded-2xl ml-auto" />
        <Skeleton className="h-10 w-3/5 rounded-2xl" />
      </div>
    </div>
  );
}
