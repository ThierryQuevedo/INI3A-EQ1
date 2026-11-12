import { cn } from "@/lib/utils";

const WIDTHS = {
  sm: "max-w-2xl",    // formularios estreitos
  md: "max-w-3xl",    // conteudo de uma coluna
  lg: "max-w-5xl",    // formularios longos
  xl: "max-w-6xl",    // listagens
  "2xl": "max-w-7xl", // dashboards e tabelas largas
};

export default function PageContainer({ size = "xl", className, children, ...props }) {
  return (
    <div className={cn("w-full mx-auto px-4 sm:px-6 lg:px-8", WIDTHS[size], className)} {...props}>
      {children}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8", className)}>
      <div>
        {eyebrow && <p className="text-body-sm font-semibold text-primary mb-1">{eyebrow}</p>}
        <h1 className="text-h4 font-bold text-foreground">{title}</h1>
        {description && <p className="text-body-sm text-muted-foreground mt-1 max-w-prose">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
