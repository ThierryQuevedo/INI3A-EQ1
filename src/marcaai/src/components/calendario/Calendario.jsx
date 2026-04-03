import DiasCalendario from "./DiasCalendario";

export default function Calendario() {
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth(); 
  const anoAtual = dataAtual.getFullYear();
  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate(); 
  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();
  const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1);
  const espacosVazios = Array.from({ length: primeiroDiaSemana }, (_, i) => i);

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg w-fit">
      {/* Título do Mês */}
      <h2 className="text-center text-xl font-bold mb-4 text-gray-800">
        {nomesMeses[mesAtual]} {anoAtual}
      </h2>

      {/* Cabeçalho da Semana */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center font-semibold text-gray-500">
        <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
      </div>

      {/* Grade de Dias */}
      <div className="grid grid-cols-7 gap-2">
        {/* Renderiza espaços vazios antes do dia 1 */}
        {espacosVazios.map((e) => (
          <div key={`vazio-${e}`} className="w-10 h-10"></div>
        ))}

        {/* Renderiza os dias reais */}
        {dias.map((dia) => (
          <DiasCalendario key={dia} numero={dia} />
        ))}
      </div>
    </div>
  );
}