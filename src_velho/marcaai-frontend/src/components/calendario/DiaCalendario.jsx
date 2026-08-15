export default function DiaCalendario({
  numero,
  disponivel = false,
  vagas = 0,
  selecionado = false,
  hoje = false,
  passado = false,
  onClick,
}) {
  const desabilitado = passado || !disponivel;

  let classes = "relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center text-lg sm:text-xl font-bold transition-all duration-150 ";

  if (selecionado) {
    classes += "bg-[#0B4F98] text-white shadow-md shadow-[#0B4F98]/30 scale-105";
  } else if (desabilitado) {
    classes += "text-gray-300 cursor-not-allowed";
  } else {
    classes += "bg-[#F7F8FC] text-[#1a1a2e] hover:bg-[#0B4F98]/10 hover:text-[#0B4F98] cursor-pointer";
  }

  if (hoje && !selecionado) {
    classes += " ring-2 ring-[#FD953A] ring-offset-1";
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
      className={classes}
    >
      <span>{numero}</span>
      {!desabilitado && (
        <span className={`w-2 h-2 rounded-full mt-1 ${selecionado ? "bg-white" : "bg-[#FD953A]"}`} />
      )}
    </button>
  );
}