import { notFound } from "next/navigation";
import { requireSession } from "@/app/actions/auth.actions";
import { listarMensagens } from "@/app/actions/mensagens.actions";
import ChatWindow from "@/app/components/features/mensagens/ChatWindow";

export const metadata = { title: 'Conversa' };

export const dynamic = "force-dynamic";

export default async function ConversaPage({ params }) {
  const usuarioLogado = await requireSession();
  const { agendamentoId } = await params;

  const resultado = await listarMensagens(Number(agendamentoId));
  // inexistente ou de outra pessoa da 404
  if (resultado.erro) {
    notFound();
  }

  return (
    <ChatWindow
      agendamentoId={Number(agendamentoId)}
      usuarioLogadoId={usuarioLogado.id}
      outroUsuario={resultado.outroUsuario}
      servicoNome={resultado.servicoNome}
      mensagensIniciais={resultado.mensagens}
      podeEnviarInicial={resultado.podeEnviar}
    />
  );
}
