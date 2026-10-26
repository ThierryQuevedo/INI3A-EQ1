import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";
import PageContainer from "@/app/components/ui/PageContainer";

export default function LoadingDetalheServico() {
  return (
    <PageContainer size="lg" className="py-6 sm:py-8">
      <ProgressBar />
      <Skeleton className="h-10 w-24 mb-4" />

      <div className="flex items-start gap-4 sm:gap-6">
        <Skeleton className="w-28 sm:w-44 lg:w-52 aspect-square rounded-2xl shrink-0" />
        <div className="flex-1 space-y-3 pt-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-6 lg:gap-8 mt-8 items-start">
        <div className="order-first lg:order-none lg:col-start-2 lg:row-start-1 space-y-4">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
        </div>
        <div className="lg:col-start-1 lg:row-start-1 space-y-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    </PageContainer>
  );
}
