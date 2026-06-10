"use client";

import { useState, useEffect } from "react";
// Importando o componente que acabamos de restaurar no Passo 1
import Calendar from "../../../../@/components/ui/Calendar"; 
import { Calendar as CalendarIcon, Clock, User } from "lucide-react";

const mockAgendamentos = [
  { id: 1, data: "2026-06-12", hora: "14:00", cliente: "Carlos Silva", servico: "Corte de Cabelo", preco: "50.00" },
  { id: 2, data: "2026-06-12", hora: "16:00", cliente: "Ana Souza", servico: "Barba Completa", preco: "35.00" },
];

export default function AgendaPage() {
  const [date, setDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [trabalhosDoDia, setTrabalhosDoDia] = useState([]);

  useEffect(() => {
    if (!date) return;
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    const dataFormatada = `${ano}-${mes}-${dia}`;

    const filtrados = mockAgendamentos.filter((a) => a.data === dataFormatada);
    setTrabalhosDoDia(filtrados);
  }, [date]);

  const dataFormatadaBR = date 
    ? date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "XX/XX/XXXX";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-lg shadow-sm max-w-3xl w-full p-6 md:p-8 border border-gray-200 flex flex-col gap-4">
        
        <div className="flex justify-center border-b border-gray-100 pb-6">
          {/* Aqui ele vai renderizar o componente do Passo 1 sem conflitos! */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
            <span className="text-lg font-bold text-orange-500">
              {dataFormatadaBR}
            </span>
            <span className="text-sm font-medium text-gray-400">
              {trabalhosDoDia.length === 0 
                ? "Nenhum trabalho agendado..." 
                : `${trabalhosDoDia.length} trabalho(s) agendado(s)...`}
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {trabalhosDoDia.length > 0 ? (
              trabalhosDoDia.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-50 text-orange-500 p-2 rounded-md">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-700">{item.hora} - {item.servico}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3" /> {item.cliente}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-extrabold text-gray-600">R$ {item.preco}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-sm text-gray-400 flex flex-col items-center gap-2">
                <CalendarIcon className="w-8 h-8 opacity-40 text-gray-400" />
                Dia livre ou sem compromissos marcados.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button type="button" className="bg-orange-500 hover:brightness-95 text-white font-bold py-3 px-6 rounded-md transition-all shadow-sm text-center text-sm md:text-base">
              Cadastrar
            </button>
            <button
              type="button"
              onClick={() => {
                const hoje = new Date();
                setDate(hoje);
                setCurrentMonth(hoje);
              }}
              className="bg-orange-500 hover:brightness-95 text-white font-bold py-3 px-6 rounded-md transition-all shadow-sm text-center text-sm md:text-base"
            >
              Cancelar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}