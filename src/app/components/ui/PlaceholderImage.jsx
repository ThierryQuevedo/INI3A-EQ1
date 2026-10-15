import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Placeholder local para quando não há urlImagem/urlBanner — substitui o
 * fallback externo picsum.photos usado antes em várias telas.
 */
export default function PlaceholderImage({ className, icon: Icon = ImageOff, label = "Sem imagem" }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/15",
        className
      )}
    >
      <div className="flex items-center justify-center rounded-full bg-background/50 size-11 shadow-sm">
        <Icon size={20} className="text-primary/60" aria-hidden="true" />
      </div>
    </div>
  );
}
