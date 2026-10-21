import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Placeholder local para quando não há urlImagem/urlBanner — substitui o
 * fallback externo picsum.photos usado antes em várias telas. Usa um ícone
 * neutro de foto por padrão (não `ImageOff`, que com seu traço cruzado lê
 * como "erro ao carregar" em vez de "ainda sem foto").
 */
export default function PlaceholderImage({ className, icon: Icon = ImageIcon, label = "Sem imagem" }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/15 via-secondary/20 to-accent/15",
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          color: "var(--color-primary)",
          maskImage: "radial-gradient(circle at center, black, transparent 75%)",
        }}
      />
      <div className="relative flex items-center justify-center rounded-full bg-card/70 ring-1 ring-border size-12 shadow-soft">
        <Icon size={22} className="text-primary/70" strokeWidth={1.75} aria-hidden="true" />
      </div>
    </div>
  );
}
