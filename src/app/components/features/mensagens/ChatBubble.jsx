import { cn } from "@/lib/utils";

function formatarHora(data) {
  return new Date(data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
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
            "text-[11px] mt-1",
            deMim ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {formatarHora(mensagem.criadoEm)}
        </p>
      </div>
    </div>
  );
}
