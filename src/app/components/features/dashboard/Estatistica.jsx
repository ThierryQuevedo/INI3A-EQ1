import { Card } from "@/app/components/ui/card";

/** Card compacto de métrica dos painéis: ícone centralizado + valor + rótulo. */
export default function Estatistica({ Icon, valor, rotulo }) {
  return (
    <Card padding="sm" className="flex items-center gap-3">
      <span className="max-sm:hidden size-10 shrink-0 inline-flex items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
        <Icon size={18} className="shrink-0" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-h6 font-bold text-foreground leading-tight whitespace-nowrap">{valor}</p>
        <p className="text-caption text-muted-foreground leading-snug">{rotulo}</p>
      </div>
    </Card>
  );
}
