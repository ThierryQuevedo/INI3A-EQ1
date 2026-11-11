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

  let classes = "relative w-full aspect-square rounded-lg flex flex-col items-center justify-center text-body-lg sm:text-h6 font-bold transition ";

  // selecionado muda cor e borda sem mudar tamanho
  if (selecionado) {
    classes += "bg-primary border border-primary text-primary-foreground";
  } else if (desabilitado) {
    classes += "border border-transparent text-muted-foreground/50 cursor-not-allowed";
  } else {
    classes += "bg-card border border-input text-foreground hover:bg-secondary cursor-pointer active:scale-[0.97]";
  }

  if (hoje && !selecionado) {
    classes += " ring-2 ring-primary ring-offset-1 ring-offset-card";
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
        <span className={`w-2 h-2 rounded-full mt-1 ${selecionado ? "bg-primary-foreground" : "bg-primary"}`} aria-hidden="true" />
      )}
    </button>
  );
}
