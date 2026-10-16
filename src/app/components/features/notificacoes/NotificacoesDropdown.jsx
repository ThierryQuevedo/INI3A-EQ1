"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatarTempoRelativo } from "@/lib/tempo";
import {
  listarMinhasNotificacoes,
  contarNotificacoesNaoLidas,
  marcarNotificacaoLida,
  marcarTodasNotificacoesLidas,
} from "@/app/actions/notificacoes.actions";

const INTERVALO_MS = 20000;
const LIMITE_DROPDOWN = 8;

export default function NotificacoesDropdown() {
  const [aberto, setAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [carregado, setCarregado] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let ativo = true;

    async function atualizarContagem() {
      const total = await contarNotificacoesNaoLidas();
      if (ativo) setNaoLidas(total);
    }

    atualizarContagem();
    const id = setInterval(atualizarContagem, INTERVALO_MS);
    return () => {
      ativo = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    function handleClickFora(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setAberto(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", handleClickFora);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickFora);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function alternarAberto() {
    const proximo = !aberto;
    setAberto(proximo);
    if (proximo && !carregado) {
      const lista = await listarMinhasNotificacoes(LIMITE_DROPDOWN);
      setNotificacoes(lista);
      setCarregado(true);
    }
  }

  function marcarComoLidaLocal(id) {
    setNotificacoes((lista) =>
      lista.map((n) => (n.id === id && !n.lidaEm ? { ...n, lidaEm: new Date().toISOString() } : n))
    );
    setNaoLidas((n) => Math.max(0, n - 1));
  }

  async function clicarNotificacao(notificacao) {
    if (!notificacao.lidaEm) {
      marcarComoLidaLocal(notificacao.id);
      await marcarNotificacaoLida(notificacao.id);
    }
    setAberto(false);
  }

  async function marcarTodas() {
    setNotificacoes((lista) => lista.map((n) => ({ ...n, lidaEm: n.lidaEm ?? new Date().toISOString() })));
    setNaoLidas(0);
    await marcarTodasNotificacoesLidas();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={alternarAberto}
        className="relative h-11 w-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer"
        aria-label="Notificações"
        aria-haspopup="menu"
        aria-expanded={aberto}
      >
        <Bell size={20} className="text-foreground" aria-hidden="true" />
        {naoLidas > 0 && (
          <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-3 w-80 max-w-[90vw] bg-card rounded-2xl shadow-elevated border border-border overflow-hidden z-50"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <h2 className="text-body-sm font-bold text-foreground">Notificações</h2>
            {naoLidas > 0 && (
              <button
                type="button"
                onClick={marcarTodas}
                className="flex items-center gap-1 text-caption font-semibold text-primary hover:underline cursor-pointer"
              >
                <CheckCheck size={13} aria-hidden="true" />
                Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!carregado ? (
              <p className="px-5 py-8 text-center text-body-sm text-muted-foreground">Carregando...</p>
            ) : notificacoes.length === 0 ? (
              <p className="px-5 py-8 text-center text-body-sm text-muted-foreground">Nenhuma notificação por aqui.</p>
            ) : (
              notificacoes.map((notificacao) => {
                const naoLida = !notificacao.lidaEm;
                const conteudo = (
                  <div className={cn("flex gap-3 px-5 py-3.5 hover:bg-muted transition-colors", naoLida && "bg-primary/5")}>
                    <span
                      className={cn("mt-1.5 size-2 rounded-full shrink-0", naoLida ? "bg-accent" : "bg-transparent")}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-body-sm font-semibold text-foreground truncate">{notificacao.titulo}</p>
                      <p className="text-caption text-muted-foreground mt-0.5 line-clamp-2">{notificacao.mensagem}</p>
                      <p className="text-caption text-muted-foreground mt-1">{formatarTempoRelativo(notificacao.criadoEm)}</p>
                    </div>
                  </div>
                );

                return notificacao.link ? (
                  <Link
                    key={notificacao.id}
                    href={notificacao.link}
                    role="menuitem"
                    onClick={() => clicarNotificacao(notificacao)}
                    className="block"
                  >
                    {conteudo}
                  </Link>
                ) : (
                  <button
                    key={notificacao.id}
                    type="button"
                    role="menuitem"
                    onClick={() => clicarNotificacao(notificacao)}
                    className="block w-full text-left cursor-pointer"
                  >
                    {conteudo}
                  </button>
                );
              })
            )}
          </div>

          <Link
            href="/notificacoes"
            onClick={() => setAberto(false)}
            className="block text-center py-3 text-body-sm font-semibold text-primary hover:bg-muted transition-colors border-t border-border"
          >
            Ver todas
          </Link>
        </div>
      )}
    </div>
  );
}
