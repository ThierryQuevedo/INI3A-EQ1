"use client";

import DiaCalendario from "./DiaCalendario";

const NOMES_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const DIAS_SEMANA_LABEL = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Calendario({
  mes,
  ano,
  diasInfo = {},       // { [numeroDoDia]: { disponivel: bool, vagas: number } }
  diaSelecionado,       // Date | null
  onSelectDia,          // (data: Date) => void
  onMesChange,          // (novoMes: number, novoAno: number) => void
}) {
  const hoje = new Date();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1);
  const espacosVazios = Array.from({ length: primeiroDiaSemana }, (_, i) => i);

  const bloqueiaMesAnterior = ano === hoje.getFullYear() && mes === hoje.getMonth();

  function irParaMesAnterior() {
    if (mes === 0) onMesChange(11, ano - 1);
    else onMesChange(mes - 1, ano);
  }
  function irParaProximoMes() {
    if (mes === 11) onMesChange(0, ano + 1);
    else onMesChange(mes + 1, ano);
  }

  function ehPassado(dia) {
    const data = new Date(ano, mes, dia);
    data.setHours(0, 0, 0, 0);
    const hojeZerado = new Date(hoje);
    hojeZerado.setHours(0, 0, 0, 0);
    return data < hojeZerado;
  }

  function ehHoje(dia) {
    return dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
  }

  function ehSelecionado(dia) {
    return (
      diaSelecionado &&
      diaSelecionado.getDate() === dia &&
      diaSelecionado.getMonth() === mes &&
      diaSelecionado.getFullYear() === ano
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={irParaMesAnterior}
          disabled={bloqueiaMesAnterior}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#0B4F98] hover:bg-[#0B4F98]/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <h2 className="text-center text-xl sm:text-2xl font-extrabold text-[#1a1a2e]">
          {NOMES_MESES[mes]} {ano}
        </h2>

        <button
          type="button"
          onClick={irParaProximoMes}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#0B4F98] hover:bg-[#0B4F98]/10 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wide text-gray-400">
        {DIAS_SEMANA_LABEL.map((d) => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {espacosVazios.map((e) => (
          <div key={`vazio-${e}`} className="w-full aspect-square" />
        ))}

        {dias.map((dia) => {
          const info = diasInfo[dia] || { disponivel: false, vagas: 0 };
          return (
            <DiaCalendario
              key={dia}
              numero={dia}
              disponivel={info.disponivel}
              vagas={info.vagas}
              passado={ehPassado(dia)}
              hoje={ehHoje(dia)}
              selecionado={ehSelecionado(dia)}
              onClick={() => onSelectDia(new Date(ano, mes, dia))}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-5 mt-6 pt-5 border-t border-gray-100 text-xs text-gray-400 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FD953A]" /> Disponível
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded ring-2 ring-[#FD953A]" /> Hoje
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-gray-200" /> Indisponível
        </div>
      </div>
    </div>
  );
}
