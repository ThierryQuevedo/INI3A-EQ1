import CarregandoRelogio from "@/app/components/ui/CarregandoRelogio";

export default function LoadingAgendarHorario() {
  return (
    <div className="min-h-[60dvh] flex items-center justify-center px-4 py-16">
      <CarregandoRelogio texto="Buscando horários livres…" />
    </div>
  );
}
