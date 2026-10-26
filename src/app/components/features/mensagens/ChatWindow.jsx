"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Avatar from "@/app/components/ui/Avatar";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import { listarMensagens, enviarMensagem, marcarComoLidas } from "@/app/actions/mensagens.actions";
import { useToast } from "@/app/components/ui/ToastProvider";

const INTERVALO_POLLING_MS = 3000;

/**
 * Janela de uma conversa. Busca mensagens novas por polling (não há
 * WebSocket/SSE no projeto) e envia mensagens de forma otimista.
 */
export default function ChatWindow({
  agendamentoId,
  usuarioLogadoId,
  outroUsuario,
  servicoNome,
  mensagensIniciais,
  podeEnviarInicial,
}) {
  const [mensagens, setMensagens] = useState(mensagensIniciais);
  const [podeEnviar, setPodeEnviar] = useState(podeEnviarInicial);
  const listaRef = useRef(null);
  const ultimoIdRef = useRef(mensagensIniciais.at(-1)?.id ?? 0);
  const toast = useToast();

  useEffect(() => {
    marcarComoLidas(agendamentoId);
  }, [agendamentoId]);

  useEffect(() => {
    const el = listaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensagens]);

  useEffect(() => {
    let cancelado = false;

    const id = setInterval(async () => {
      const resultado = await listarMensagens(agendamentoId, ultimoIdRef.current);
      if (cancelado || resultado.erro) return;

      if (typeof resultado.podeEnviar === "boolean") setPodeEnviar(resultado.podeEnviar);

      if (resultado.mensagens.length > 0) {
        ultimoIdRef.current = resultado.mensagens.at(-1).id;
        setMensagens((atuais) => [...atuais, ...resultado.mensagens]);

        if (resultado.mensagens.some((m) => m.remetenteId !== usuarioLogadoId)) {
          marcarComoLidas(agendamentoId);
        }
      }
    }, INTERVALO_POLLING_MS);

    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, [agendamentoId, usuarioLogadoId]);

  async function handleEnviar(texto) {
    const resultado = await enviarMensagem({ agendamentoId, texto });
    if (resultado.erro) {
      toast.error(resultado.erro);
      return;
    }
    ultimoIdRef.current = resultado.mensagem.id;
    setMensagens((atuais) => [...atuais, resultado.mensagem]);
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem-env(safe-area-inset-bottom,0px))] md:h-[calc(100dvh-4rem)]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        <Link
          href="/mensagens"
          className="md:hidden h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted shrink-0 -ml-1"
          aria-label="Voltar para conversas"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </Link>
        <Avatar nome={outroUsuario.nome} urlImagem={outroUsuario.urlImagem} />
        <div className="min-w-0">
          <h2 className="text-body font-bold text-foreground truncate">{outroUsuario.nome}</h2>
          <p className="text-caption text-muted-foreground truncate">{servicoNome}</p>
        </div>
      </div>

      <div ref={listaRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
        {mensagens.length === 0 ? (
          <p className="text-center text-body-sm text-muted-foreground mt-8">
            Nenhuma mensagem ainda. Diga olá!
          </p>
        ) : (
          mensagens.map((mensagem) => (
            <ChatBubble
              key={mensagem.id}
              mensagem={mensagem}
              deMim={mensagem.remetenteId === usuarioLogadoId}
            />
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t border-border bg-card shrink-0">
        <ChatInput onEnviar={handleEnviar} disabled={!podeEnviar} />
      </div>
    </div>
  );
}
