"use client";

export default function BotaoCancelarAgendamento({ action }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        const confirmado = window.confirm("Tem certeza que deseja cancelar este agendamento?");
        if (!confirmado) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
      >
        Cancelar
      </button>
    </form>
  );
}