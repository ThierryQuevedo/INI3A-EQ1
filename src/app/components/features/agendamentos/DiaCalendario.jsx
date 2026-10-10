export default function DiaCalendario({
  numero,
  disponivel = false,
  vagas = 0,
  selecionado = false,
  hoje = false,
  passado = false,
  onClick,
}) {
  const desabilitado = passado || !disponivel || Number(vagas) <= 0;

  let classes = "relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center text-body-lg sm:text-h6 font-bold transition-all duration-200 ease-apple ";

  if (selecionado) {
    classes += "bg-primary text-primary-foreground shadow-card scale-105";
  } else if (desabilitado) {
    classes += "text-muted-foreground/50 cursor-not-allowed";
  } else {
    classes += "bg-background text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer";
  }

  if (hoje && !selecionado) {
    classes += " ring-2 ring-accent ring-offset-1 ring-offset-card";
  }

  const titulo = desabilitado
    ? (passado ? "Data passada" : "Sem horários disponíveis")
    : `${vagas} ${vagas === 1 ? "horário disponível" : "horários disponíveis"}`;

  return (
    <button
      type="button"
      disabled={desabilitado}
      onClick={onClick}
      title={titulo}
      aria-label={`Dia ${numero}, ${titulo}`}
      aria-pressed={selecionado}
      className={classes}
    >
      <span>{numero}</span>
      {!desabilitado && (
        <span className={`w-2 h-2 rounded-full mt-1 ${selecionado ? "bg-primary-foreground" : "bg-accent"}`} aria-hidden="true" />
      )}
    </button>
  );
}
