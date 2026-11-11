import { cn } from "@/lib/utils";
import { partesNoFuso } from "@/lib/formatoData";

// Fuso fixo de Brasília: com o fuso de cada máquina, o servidor (UTC) e o
// navegador formatavam horas diferentes e o React acusava erro de hidratação.
function formatarHora(data) {
  return partesNoFuso(data).hora;
}

export default function ChatBubble({ mensagem, deMim }) {
  return (
    <div className={cn("flex", deMim ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] sm:max-w-[65%] rounded-2xl px-4 py-2.5",
          deMim
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        <p className="text-body-sm whitespace-pre-wrap break-words">{mensagem.texto}</p>
        <p
          className={cn(
            "text-caption mt-1",
            // /85 e não /70: com 70% a hora ficava em 4,06:1 sobre o azul (mínimo 4,5:1).
            deMim ? "text-primary-foreground/85" : "text-muted-foreground"
          )}
        >
          {formatarHora(mensagem.criadoEm)}
        </p>
      </div>
    </div>
  );
}
