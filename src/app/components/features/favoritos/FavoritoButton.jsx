"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { alternarFavoritoServico, alternarFavoritoPrestador } from "@/app/actions/favoritos.actions";
import { useToast } from "@/app/components/ui/ToastProvider";

/**
 * Coração de favoritar, usado tanto sobreposto num card (`variant="overlay"`)
 * quanto como botão avulso num cabeçalho de perfil (`variant="standalone"`).
 * Atualização otimista; se o usuário não estiver logado, manda pro login.
 */
export default function FavoritoButton({ tipo, alvoId, favoritoInicial = false, variant = "overlay", className }) {
  const [favorito, setFavorito] = useState(favoritoInicial);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function alternar(event) {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;

    const proximo = !favorito;
    setFavorito(proximo);

    startTransition(async () => {
      const acao = tipo === "servico" ? alternarFavoritoServico : alternarFavoritoPrestador;
      const resultado = await acao(alvoId);

      if (resultado?.erro === "nao_autenticado") {
        setFavorito(!proximo);
        router.push("/login");
        return;
      }
      if (resultado?.erro) {
        setFavorito(!proximo);
        toast.error("Não foi possível atualizar seus favoritos.");
        return;
      }
      setFavorito(resultado.favoritado);
    });
  }

  const estiloBase =
    variant === "overlay"
      ? "absolute top-3 right-3 z-10 size-9 rounded-full bg-card/90 backdrop-blur-sm shadow-soft flex items-center justify-center hover:scale-105 transition-transform"
      : "size-12 shrink-0 rounded-lg border border-input bg-card hover:bg-muted flex items-center justify-center transition-colors";

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={favorito}
      aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={cn(estiloBase, "cursor-pointer disabled:cursor-wait", className)}
    >
      <Heart
        size={variant === "overlay" ? 18 : 20}
        className={favorito ? "fill-destructive text-destructive" : "text-foreground"}
        aria-hidden="true"
      />
    </button>
  );
}
