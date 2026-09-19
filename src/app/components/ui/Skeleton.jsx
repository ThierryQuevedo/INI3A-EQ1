import { cn } from "@/lib/utils";

export default function Skeleton({ className, ...props }) {
  return (
    <div
      role="status"
      aria-label="Carregando conteúdo"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}
