import Skeleton from "@/app/components/ui/Skeleton";
import ProgressBar from "@/app/components/ui/ProgressBar";

export default function AdminTableSkeleton({ colunas = 3, linhas = 6, maxWidthClass = "max-w-3xl" }) {
  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6">
      <ProgressBar />
      <div className={`${maxWidthClass} mx-auto flex flex-col gap-6`}>
        <Skeleton className="h-9 w-40" />

        <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {Array.from({ length: colunas }).map((_, indice) => (
                  <th key={indice} className="p-4">
                    <Skeleton className="h-3 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: linhas }).map((_, linha) => (
                <tr key={linha} className="border-b border-border last:border-0">
                  {Array.from({ length: colunas }).map((_, coluna) => (
                    <td key={coluna} className="p-4">
                      <Skeleton className="h-4 w-full max-w-[10rem]" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
