import { cn } from "@/lib/utils";

/**
 * Bloco de carregamento puramente visual. Fica escondido de leitores de tela:
 * quem anuncia o carregamento é o <ProgressBar /> do loading.jsx (um aviso só,
 * em vez de um "carregando" por bloco).
 */
export default function Skeleton({ className, ...props }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}
