import { cn } from "@/lib/utils";

// so visual e escondido do leitor de tela
export default function Skeleton({ className, ...props }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}
