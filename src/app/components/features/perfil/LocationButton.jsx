"use client";

import { useState } from "react";
import { LocateFixed, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/components/ui/ToastProvider";
import { atualizarLocalizacaoPrestador } from "@/app/actions/prestadores.actions";

export default function LocationButton({ onSuccess, className }) {
  const [carregando, setCarregando] = useState(false);
  const toast = useToast();

  function capturar() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Seu navegador não permite compartilhar localização.");
      return;
    }

    setCarregando(true);
    navigator.geolocation.getCurrentPosition(
      async (posicao) => {
        const { latitude, longitude } = posicao.coords;
        const resultado = await atualizarLocalizacaoPrestador({ latitude, longitude });
        setCarregando(false);
        if (resultado?.erro) {
          toast.error(resultado.erro);
          return;
        }
        toast.success("Localização atualizada.");
        onSuccess?.({ latitude, longitude });
      },
      () => {
        setCarregando(false);
        toast.error("Não foi possível obter sua localização. Verifique a permissão do navegador.");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  return (
    <Button type="button" variant="outline" onClick={capturar} disabled={carregando} className={className}>
      {carregando ? (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      ) : (
        <LocateFixed size={16} aria-hidden="true" />
      )}
      {carregando ? "Obtendo localização..." : "Usar minha localização atual"}
    </Button>
  );
}
