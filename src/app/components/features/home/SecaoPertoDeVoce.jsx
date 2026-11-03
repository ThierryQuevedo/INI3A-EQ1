"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import CarrosselServicos from "./CarrosselServicos";
import { haversineKm } from "@/lib/geo";

/**
 * Pede permissão de localização ao navegador; se negada/indisponível, a seção
 * simplesmente não aparece (degrada graciosamente, sem erro visível ao usuário).
 */
function temGeolocalizacao() {
  return typeof navigator !== "undefined" && !!navigator.geolocation;
}

export default function SecaoPertoDeVoce({ catalogo }) {
  const [posicao, setPosicao] = useState(null);
  // já resolvido sincronamente quando o navegador nem suporta geolocalização
  const [pronto, setPronto] = useState(() => !temGeolocalizacao());

  useEffect(() => {
    if (!temGeolocalizacao()) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosicao({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setPronto(true);
      },
      () => setPronto(true),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  if (!pronto || !posicao) return null;

  const comDistancia = catalogo
    .filter((s) => s.prestadorLatitude != null && s.prestadorLongitude != null)
    .map((s) => ({
      ...s,
      distanciaKm: haversineKm(posicao.lat, posicao.lng, s.prestadorLatitude, s.prestadorLongitude),
    }))
    .sort((a, b) => a.distanciaKm - b.distanciaKm)
    .slice(0, 10);

  if (comDistancia.length === 0) return null;

  return (
    <section>
      <h2 className="flex items-center gap-2 text-h6 font-bold text-foreground mb-4">
        <MapPin size={18} className="shrink-0 text-primary" aria-hidden="true" />
        Perto de você
      </h2>
      <CarrosselServicos servicos={comDistancia} rotulo="Serviços perto de você" />
    </section>
  );
}
