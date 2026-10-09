"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import ServiceCard from "@/app/components/features/servicos/ServiceCard";
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
    <section className="max-w-6xl mx-auto px-6 py-10 border-t border-border">
      <div className="flex items-center gap-2 mb-6">
        <MapPin size={18} className="text-primary" aria-hidden="true" />
        <div>
          <h2 className="text-caption font-bold uppercase tracking-wide text-primary">Perto de você</h2>
          <p className="text-h6 font-bold text-foreground mt-1">Profissionais na sua região</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {comDistancia.map((servico) => (
          <ServiceCard key={servico.id} servico={servico} />
        ))}
      </div>
    </section>
  );
}
