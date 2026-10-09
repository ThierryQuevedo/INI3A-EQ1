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
      className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}
    >
      <Icon size={28} aria-hidden="true" />
    </div>
  );
}
