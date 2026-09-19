import AdminTableSkeleton from "@/app/components/ui/AdminTableSkeleton";

export default function LoadingCategorias() {
  return <AdminTableSkeleton colunas={3} linhas={5} maxWidthClass="max-w-3xl" />;
}
