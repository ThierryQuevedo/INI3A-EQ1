import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";
import PageContainer from "@/app/components/ui/PageContainer";

function ListaSkeleton({ linhas }) {
  return (
    <section>
      <Skeleton className="h-6 w-44 mb-3" />
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {Array.from({ length: linhas }).map((_, indice) => (
          <div key={indice} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-10 w-16 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
            <Skeleton className="max-sm:hidden h-9 w-40 rounded-lg" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function LoadingDashboard() {
  return (
    <PageContainer size="2xl" className="py-6 sm:py-8">
      <ProgressBar />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-44" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {Array.from({ length: 4 }).map((_, indice) => (
          <Skeleton key={indice} className="h-[4.5rem] rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-6 items-start">
        <ListaSkeleton linhas={2} />
        <ListaSkeleton linhas={4} />
      </div>
    </PageContainer>
  );
}
