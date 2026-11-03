import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TRACINHOS = Array.from({ length: 12 }, (_, i) => i);

/**
 * C-09 / F-07: placeholder para quando não há foto. Em vez do bloco cinza
 * "morto", usa o azul claro da marca (bg-secondary, que no escuro vira
 * azul-900) com o ícone da categoria no centro de um mostrador com os
 * tracinhos do relógio da logo — discreto, sem gradiente nem peso de
 * imagem. O ícone padrão é uma foto neutra (não `ImageOff`, que lê como
 * "erro ao carregar").
 */
export default function PlaceholderImage({ className, icon: Icon = ImageIcon, label = "Sem imagem" }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("flex items-center justify-center bg-secondary text-secondary-foreground", className)}
    >
      <div className="relative size-[min(60%,7.5rem)] aspect-square" aria-hidden="true">
        {TRACINHOS.map((i) => (
          <span
            key={i}
            className="absolute inset-0 flex justify-center"
            style={{ transform: `rotate(${i * 30}deg)` }}
          >
            <span className={cn("mt-0 w-[2px] rounded-full bg-current", i % 3 === 0 ? "h-[9%] opacity-50" : "h-[6%] opacity-30")} />
          </span>
        ))}
        <span className="absolute inset-[22%] rounded-full bg-card/70 flex items-center justify-center text-primary">
          <Icon strokeWidth={1.75} className="size-1/2 shrink-0" />
        </span>
      </div>
    </div>
  );
}
