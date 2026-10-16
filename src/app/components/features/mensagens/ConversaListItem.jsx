import Link from "next/link";
import Avatar from "@/app/components/ui/Avatar";
import { cn } from "@/lib/utils";

function formatarHora(data) {
  return new Date(data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function ConversaListItem({ conversa }) {
  const { agendamentoId, servicoNome, outroUsuario, ultimaMensagem, naoLidas } = conversa;

  return (
    <Link
      href={`/mensagens/${agendamentoId}`}
      className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:bg-muted transition-colors duration-fast"
    >
      <Avatar nome={outroUsuario.nome} urlImagem={outroUsuario.urlImagem} size="lg" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-body font-bold text-foreground truncate">{outroUsuario.nome}</h3>
          {ultimaMensagem && (
            <span className="text-caption text-muted-foreground shrink-0">
              {formatarHora(ultimaMensagem.criadoEm)}
            </span>
          )}
        </div>
        <p className="text-body-sm text-muted-foreground truncate mt-0.5">{servicoNome}</p>
        {ultimaMensagem && (
          <p
            className={cn(
              "text-body-sm truncate mt-1",
              naoLidas > 0 ? "text-foreground font-semibold" : "text-muted-foreground"
            )}
          >
            {ultimaMensagem.deMim && "Você: "}
            {ultimaMensagem.texto}
          </p>
        )}
      </div>

      {naoLidas > 0 && (
        <span className="shrink-0 h-6 min-w-6 px-1.5 rounded-full bg-accent text-accent-foreground text-caption font-bold flex items-center justify-center">
          {naoLidas}
        </span>
      )}
    </Link>
  );
}
