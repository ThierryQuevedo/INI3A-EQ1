import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Placeholder local para quando não há urlImagem/urlBanner — substitui o
 * fallback externo picsum.photos usado antes em várias telas. Usa um ícone
 * neutro de foto por padrão (não `ImageOff`, que com seu traço cruzado lê
 * como "erro ao carregar" em vez de "ainda sem foto"). Superfície lisa, sem
 * gradiente nem textura: a ausência de foto não deve chamar mais atenção
 * que um card com foto.
 */
export default function PlaceholderImage({ className, icon: Icon = ImageIcon, label = "Sem imagem" }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}
    >
      <Icon size={28} strokeWidth={1.5} className="shrink-0 opacity-70" aria-hidden="true" />
    </div>
  );
}
