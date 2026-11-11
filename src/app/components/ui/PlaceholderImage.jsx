import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TRACINHOS = Array.from({ length: 12 }, (_, i) => i);

// placeholder sem foto com icone da categoria
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
