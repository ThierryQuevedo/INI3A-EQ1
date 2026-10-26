import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { statusBadgeClass } from "@/lib/statusAgendamento";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md font-semibold whitespace-nowrap shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        neutro: "bg-muted text-muted-foreground",
        secundario: "bg-secondary text-secondary-foreground",
        primario: "bg-primary/10 text-primary dark:text-primary-hover",
        sucesso: "bg-success/15 text-success",
        aviso: "bg-warning/15 text-warning",
        perigo: "bg-destructive/10 text-destructive",
      },
      size: {
        sm: "h-6 px-2 text-caption",
        default: "h-7 px-2.5 text-caption",
      },
    },
    defaultVariants: { variant: "neutro", size: "default" },
  }
);

/**
 * Etiqueta passiva (status, contagem, categoria). Não é botão: nunca
 * recebe onClick. Passe `status` para usar as cores de agendamento de
 * lib/statusAgendamento.js no lugar de `variant`.
 */
export function Badge({ className, variant, size, status, children, ...props }) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), status && statusBadgeClass(status), className)}
      {...props}
    >
      {children}
    </span>
  );
}

export { badgeVariants };
