import ProgressBar from "@/app/components/ui/ProgressBar";
import Skeleton from "@/app/components/ui/Skeleton";
import PageContainer from "@/app/components/ui/PageContainer";

export default function LoadingAvaliacoesServico() {
  return (
    <div className="min-h-screen">
      <ProgressBar />
      <PageContainer size="md" className="pt-8 pb-20">
        <Skeleton className="h-9 w-9 rounded-full mb-6" />
        <Skeleton className="h-4 w-28 mb-2" />
        <Skeleton className="h-8 w-64 mb-3" />
        <Skeleton className="h-8 w-40 rounded-md mb-8" />

        <div className="space-y-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </PageContainer>
    </div>
  );
}
