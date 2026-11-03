import CarregandoRelogio from "@/app/components/ui/CarregandoRelogio";

// Com A-02 os dados vêm do servidor: este é o único momento de espera da
// tela de agendar. Diz o que está acontecendo (C-06), sem esqueleto genérico.
export default function LoadingAgendarHorario() {
  return (
    <div className="min-h-[60dvh] flex items-center justify-center px-4 py-16">
      <CarregandoRelogio texto="Buscando horários livres…" />
    </div>
  );
}
